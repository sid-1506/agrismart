import { useState, useEffect } from "react";
import client from "../api/client";
import useLocationStore from "../stores/useLocationStore";

/* ──────────────────────────────────────────────
   useWeather — driven by the unified location store.

   • Live mode: uses GPS coords (most accurate).
   • Custom mode: uses the active place's city.
   • If the active place changes (user moves cities,
     switches Live↔Custom, picks a new city) the
     hook re-fetches automatically.
   ────────────────────────────────────────────── */

export function useWeather() {
  const useLive    = useLocationStore((s) => s.useLive);
  const coords     = useLocationStore((s) => s.coords);
  const livePlace  = useLocationStore((s) => s.livePlace);
  const customPlace= useLocationStore((s) => s.customPlace);

  // Pick the city we should query for in custom/fallback mode.
  const activeCity =
    useLive && livePlace ? livePlace.city
    : customPlace        ? customPlace.city
    : livePlace          ? livePlace.city
    : "";

  // The cache key for re-fetch decisions: coords if live, else city name.
  const queryKey = useLive && coords
    ? `${coords.lat.toFixed(2)},${coords.lon.toFixed(2)}`
    : `c:${activeCity}`;

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Wait until we have something to query with.
      if (useLive && !coords && !activeCity) return;
      if (!useLive && !activeCity) return;

      setLoading(true);
      setError(null);

      try {
        const params = useLive && coords
          ? { lat: coords.lat, lon: coords.lon }
          : { city: activeCity || "Mumbai" };

        const { data } = await client.get("/api/weather", { params });
        if (cancelled) return;

        if (data.success) setWeather(data.weather);
        else              setError(data.message || "Weather fetch failed");
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || "Weather unavailable");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [queryKey, useLive, coords, activeCity]);

  return { weather, loading, error };
}
