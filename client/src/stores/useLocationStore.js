import { create } from "zustand";

/* ──────────────────────────────────────────────
   useLocationStore — ONE global location source

   Replaces the old pattern where weather pulled
   GPS directly while every other module read
   `user.location` from localStorage. That mismatch
   is what caused the dashboard weather and the
   profile badge to show different cities.

   State shape:
     livePlace   : reverse-geocoded GPS pick
     customPlace : user-typed/selected pick (or seeded from user.location)
     coords      : { lat, lon } — always the GPS coords (for weather/intel APIs)
     useLive     : true  → app reads livePlace
                   false → app reads customPlace
     permission  : "granted" | "denied" | "prompt" | "unsupported"

   Active place = useLive && livePlace ? livePlace : customPlace
   ────────────────────────────────────────────── */

const NOMINATIM = "https://nominatim.openstreetmap.org";

const LK_USE_LIVE   = "agri_use_live";
const LK_CUSTOM     = "agri_custom_loc";
const LK_LIVE_CACHE = "agri_live_loc";
const LK_GEO_STATUS = "agri_geo_status";

const safeParse = (k, fb) => {
  try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); }
  catch { return fb; }
};

const formatPlace = (a = {}) => {
  const city =
    a.city || a.town || a.village || a.hamlet ||
    a.suburb || a.municipality || a.county || a.state_district || "";
  const state   = a.state    || "";
  const pincode = a.postcode || "";
  const country = a.country  || "";
  const display = pincode && city
    ? `${city}, ${state || country}`.trim().replace(/^,\s*/, "")
    : [city, state].filter(Boolean).join(", ");
  return { city, state, pincode, country, display };
};

const haversineKm = (a, b) => {
  if (!a || !b) return Infinity;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const reverseGeocode = async (lat, lon) => {
  const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error("reverse-geocode failed");
  const data = await res.json();
  return formatPlace(data.address || {});
};

const getPosition = () => new Promise((resolve, reject) => {
  if (!("geolocation" in navigator)) {
    reject(new Error("unsupported"));
    return;
  }
  navigator.geolocation.getCurrentPosition(resolve, reject, {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 60 * 1000,
  });
});

const initialUseLive = (() => {
  const raw = localStorage.getItem(LK_USE_LIVE);
  if (raw === null) return true; // default ON
  return raw === "true";
})();

const useLocationStore = create((set, get) => ({
  livePlace:   safeParse(LK_LIVE_CACHE, null),
  customPlace: safeParse(LK_CUSTOM,     null),
  coords:      null,
  useLive:     initialUseLive,
  permission:  localStorage.getItem(LK_GEO_STATUS) || "prompt",
  loading:     false,
  error:       "",
  initialized: false,
  watcherId:   null,

  /* ─── Selectors ─── */
  getActive: () => {
    const { useLive, livePlace, customPlace } = get();
    if (useLive && livePlace) return { ...livePlace, source: "live" };
    if (customPlace)          return { ...customPlace, source: "custom" };
    if (livePlace)            return { ...livePlace, source: "live" };
    return null;
  },

  /* ─── Toggle live vs custom ─── */
  setUseLive: async (val) => {
    localStorage.setItem(LK_USE_LIVE, String(val));
    set({ useLive: !!val });
    if (val && !get().livePlace) {
      await get().refreshLive();
    }
  },

  /* ─── Manual location pick (Profile, LocationInput) ─── */
  setCustom: (place) => {
    if (!place || !place.display) return;
    const clean = {
      city:    place.city    || "",
      state:   place.state   || "",
      pincode: place.pincode || "",
      country: place.country || "",
      display: place.display,
    };
    localStorage.setItem(LK_CUSTOM, JSON.stringify(clean));
    // Manually picking a location flips off live mode, just like the spec asks.
    localStorage.setItem(LK_USE_LIVE, "false");
    set({ customPlace: clean, useLive: false });
  },

  clearCustom: () => {
    localStorage.removeItem(LK_CUSTOM);
    localStorage.setItem(LK_USE_LIVE, "true");
    set({ customPlace: null, useLive: true });
    get().refreshLive();
  },

  /* ─── Sync customPlace from server-side user.location string ─── */
  syncFromUser: (userLocationStr) => {
    if (!userLocationStr) return;
    const existing = get().customPlace;
    if (existing && existing.display === userLocationStr) return;
    // We only have a display string from the DB. Parse "City, State" loosely.
    const parts = userLocationStr.split(",").map((s) => s.trim()).filter(Boolean);
    const place = {
      city:    parts[0] || "",
      state:   parts[1] || "",
      pincode: "",
      country: "",
      display: userLocationStr,
    };
    localStorage.setItem(LK_CUSTOM, JSON.stringify(place));
    set({ customPlace: place });
  },

  /* ─── Refresh GPS coords + reverse-geocode ─── */
  refreshLive: async () => {
    set({ loading: true, error: "" });
    try {
      const pos = await getPosition();
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const newCoords = { lat, lon };

      const prev = get().coords;
      const prevPlace = get().livePlace;

      // Only re-geocode if we moved more than ~5km or have no place yet.
      let livePlace = prevPlace;
      if (!prevPlace || haversineKm(prev, newCoords) > 5) {
        try {
          livePlace = await reverseGeocode(lat, lon);
        } catch {
          livePlace = prevPlace; // keep last known city if reverse fails
        }
      }

      if (livePlace && livePlace.display) {
        localStorage.setItem(LK_LIVE_CACHE, JSON.stringify(livePlace));
      }
      localStorage.setItem(LK_GEO_STATUS, "granted");

      set({
        coords: newCoords,
        livePlace,
        permission: "granted",
        loading: false,
      });
      return livePlace;
    } catch (err) {
      const denied = err && (err.code === 1 || /denied|permission/i.test(err.message || ""));
      const unsupported = err?.message === "unsupported";
      const status = unsupported ? "unsupported" : denied ? "denied" : "prompt";
      localStorage.setItem(LK_GEO_STATUS, status);
      set({
        loading: false,
        permission: status,
        error: denied ? "Location permission denied"
             : unsupported ? "Geolocation not supported"
             : "Could not detect location",
      });
      return null;
    }
  },

  /* ─── App boot: hydrate, then refresh in background ─── */
  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    if (get().useLive) {
      // Don't await — let the rest of the app render with whatever is cached.
      get().refreshLive();
    }

    // When the user comes back to the tab, refresh live coords.
    if (typeof document !== "undefined") {
      const onVis = () => {
        if (document.visibilityState === "visible" && get().useLive) {
          get().refreshLive();
        }
      };
      document.addEventListener("visibilitychange", onVis);
    }
  },
}));

export default useLocationStore;

/* Selector hook: components subscribe to active place changes.
   Returning a freshly-spread object here ({...place, source}) breaks
   useSyncExternalStore's snapshot stability and causes an infinite
   re-render loop (white screen on every page that mounts <AppLayout/>).
   Return the underlying place reference instead — it's stable across
   renders unless the store actually swaps it. */
export const useActiveLocation = () =>
  useLocationStore((s) =>
    s.useLive && s.livePlace
      ? s.livePlace
      : s.customPlace
        ? s.customPlace
        : s.livePlace || null
  );

export const useActiveLocationSource = () =>
  useLocationStore((s) =>
    s.useLive && s.livePlace ? "live"
      : s.customPlace        ? "custom"
      : s.livePlace          ? "live"
      : null
  );

export const useLocationCoords = () => useLocationStore((s) => s.coords);
