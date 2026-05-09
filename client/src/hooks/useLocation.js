import { useState, useRef, useEffect, useCallback } from "react";

/* ──────────────────────────────────────────────
   useLocation — shared location hook
   • Browser geolocation + reverse geocode
   • India-focused search with debounce + cache
   • Recent picks persisted in localStorage
   ────────────────────────────────────────────── */

const NOMINATIM = "https://nominatim.openstreetmap.org";
const CACHE_KEY  = "agri_loc_cache";
const RECENT_KEY = "agri_loc_recent";
export const GEO_STATUS_KEY = "agri_geo_status"; // "granted" | "denied"

const formatPlace = (a = {}) => {
  const city =
    a.city || a.town || a.village || a.hamlet ||
    a.suburb || a.municipality || a.county || a.state_district || "";
  const state   = a.state    || "";
  const pincode = a.postcode || "";
  const country = a.country  || "";
  const display = pincode && city
    ? `${city} ${pincode}`
    : [city, state].filter(Boolean).join(", ");
  return { city, state, pincode, country, display };
};

const safeParse = (k, fb) => {
  try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); }
  catch { return fb; }
};
const readCache  = () => safeParse(CACHE_KEY, {});
const writeCache = (c) => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch {} };
const readRecent = () => safeParse(RECENT_KEY, []);
const writeRecent = (r) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 6))); } catch {} };

export default function useLocation() {
  const [detecting,   setDetecting]   = useState(false);
  const [searching,   setSearching]   = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recent,      setRecent]      = useState(readRecent());
  const [error,       setError]       = useState("");

  const debounceRef = useRef(null);
  const abortRef    = useRef(null);

  /* Reverse-geocode current GPS coordinates */
  const detect = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported on this device");
      return null;
    }
    setError("");
    setDetecting(true);
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000,
        });
      });
      const { latitude: lat, longitude: lon } = pos.coords;

      const cacheKey = `r:${lat.toFixed(2)},${lon.toFixed(2)}`;
      const cache = readCache();
      if (cache[cacheKey]) {
        localStorage.setItem(GEO_STATUS_KEY, "granted");
        return cache[cacheKey];
      }

      const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (!res.ok) throw new Error("reverse-geocode failed");
      const data = await res.json();
      const place = formatPlace(data.address || {});
      if (!place.display) throw new Error("Could not determine city");

      cache[cacheKey] = place;
      writeCache(cache);
      localStorage.setItem(GEO_STATUS_KEY, "granted");
      return place;
    } catch (err) {
      const denied = err && (err.code === 1 || /denied/i.test(err.message || ""));
      if (denied) localStorage.setItem(GEO_STATUS_KEY, "denied");
      setError(denied ? "Permission denied" : "Could not detect location");
      return null;
    } finally {
      setDetecting(false);
    }
  }, []);

  /* Debounced India-focused search */
  const search = useCallback((rawQuery) => {
    const query = (rawQuery || "").trim();
    clearTimeout(debounceRef.current);
    if (abortRef.current) { try { abortRef.current.abort(); } catch {} }

    if (query.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const cacheKey = `q:${query.toLowerCase()}`;
    const cache = readCache();
    if (cache[cacheKey]) {
      setSuggestions(cache[cacheKey]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const url =
          `${NOMINATIM}/search?q=${encodeURIComponent(query)}` +
          `&format=json&addressdetails=1&countrycodes=in&limit=8`;
        const res = await fetch(url, {
          signal: ctrl.signal,
          headers: { "Accept-Language": "en" },
        });
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();

        const seen = new Set();
        const items = data
          .map((d) => {
            const p = formatPlace(d.address || {});
            const fallback = (d.display_name || "")
              .split(",").slice(0, 2).join(",").trim();
            const display = p.display || fallback;
            return { ...p, display, id: d.place_id };
          })
          .filter((x) => {
            if (!x.display) return false;
            const k = x.display.toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });

        cache[cacheKey] = items;
        writeCache(cache);
        setSuggestions(items);
      } catch (err) {
        if (err && err.name !== "AbortError") setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 320);
  }, []);

  const addRecent = useCallback((place) => {
    if (!place || !place.display) return;
    const next = [place, ...readRecent().filter((r) => r.display !== place.display)].slice(0, 6);
    writeRecent(next);
    setRecent(next);
  }, []);

  /* Cleanup on unmount */
  useEffect(() => () => {
    clearTimeout(debounceRef.current);
    if (abortRef.current) { try { abortRef.current.abort(); } catch {} }
  }, []);

  return {
    detect, search, addRecent,
    detecting, searching, suggestions, recent, error,
    clearSuggestions: () => setSuggestions([]),
  };
}
