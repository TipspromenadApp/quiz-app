import { useEffect, useRef, useState } from "react";

// meters between two lat/lon points
function haversine(a, b) {
  if (!a || !b) return 0;
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// move lat/lon by dx east, dy north (meters)
function offsetLatLon({ lat, lon }, dxMeters, dyMeters) {
  const R = 6371000;
  const dLat = (dyMeters / R) * (180 / Math.PI);
  const dLon = (dxMeters / (R * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);
  return { lat: lat + dLat, lon: lon + dLon };
}

/**
 * useGeoProgress
 *  - mode: "idle" | "distance" | "point"
 *  - moved: meters progressed for the *current gate* (resets when a new question locks)
 *  - totalMoved: running total meters since the quiz started (doesn't reset)
 *  - startDistance(thresholdMeters)
 *  - startToPoint({lat, lon, radius})
 *  - simulate(deltaMeters)  -> also shifts the marker so you see motion on map
 */
export function useGeoProgress() {
  const [position, setPosition] = useState(null);     // {lat, lon}
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState("idle");
  const [targetMeters, setTargetMeters] = useState(null);

  const [moved, setMoved] = useState(0);              // per-question
  const [totalMoved, setTotalMoved] = useState(0);    // running total

  const startRef = useRef(null);                      // start point for this gate
  const prevPosRef = useRef(null);                    // last known pos for delta accumulation

  const pointTargetRef = useRef(null);                // {lat, lon, radius}
  const [distanceToTarget, setDistanceToTarget] = useState(null);

  const [ready, setReady] = useState(false);
  const watchIdRef = useRef(null);

  function clearWatch() {
    if (watchIdRef.current != null && navigator.geolocation?.clearWatch) {
      try { navigator.geolocation.clearWatch(watchIdRef.current); } catch {}
      watchIdRef.current = null;
    }
  }

  function startWatch() {
    if (!navigator.geolocation?.watchPosition) return;
    clearWatch();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const cur = { lat, lon };

        // accumulate total distance by step deltas
        if (prevPosRef.current) {
          const step = haversine(prevPosRef.current, cur);
          if (Number.isFinite(step)) setTotalMoved((t) => t + step);
        }
        prevPosRef.current = cur;

        setPosition(cur);
        setAccuracy(pos.coords.accuracy ?? null);
        setError(null);

        if (mode === "distance") {
          if (!startRef.current) startRef.current = cur;
          const dist = haversine(startRef.current, cur);
          setMoved((prev) => {
            const v = Math.max(prev, dist); // avoid jitter decreasing value
            if (targetMeters != null) setReady(v >= targetMeters);
            return v;
          });
        } else if (mode === "point") {
          const tgt = pointTargetRef.current;
          if (tgt) {
            const d = haversine(cur, tgt);
            setDistanceToTarget(d);
            setReady(d <= (tgt.radius ?? 5));
          }
        }
      },
      (err) => {
        setError(err?.message || "Geolocation error");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }

  function startDistance(thresholdMeters) {
    setMode("distance");
    setTargetMeters(Number(thresholdMeters) || 5);
    setMoved(0);
    setReady(false);
    setDistanceToTarget(null);
    startRef.current = null;
    pointTargetRef.current = null;
    startWatch();
  }

  function startToPoint(target, radius) {
    const t = {
      lat: Number(target?.lat),
      lon: Number(target?.lon),
      radius: Number(target?.radius ?? radius ?? 5),
    };
    pointTargetRef.current = t;
    setMode("point");
    setTargetMeters(null);
    setMoved(0);
    setReady(false);
    startRef.current = null;
    startWatch();
  }

  function stopTracking() {
    clearWatch();
  }

  // soft reset between questions; keep position & totalMoved
  function reset() {
    clearWatch();
    setMode("idle");
    setMoved(0);
    setReady(false);
    setAccuracy(null);
    setDistanceToTarget(null);
    startRef.current = null;
    pointTargetRef.current = null;
    // note: we DO NOT reset totalMoved or position here
  }

  // one-shot fix to center the map quickly
  function forceGetCurrent() {
    if (!navigator.geolocation?.getCurrentPosition) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cur = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        // accumulate total from previous to this fix
        if (prevPosRef.current) {
          const step = haversine(prevPosRef.current, cur);
          if (Number.isFinite(step)) setTotalMoved((t) => t + step);
        }
        prevPosRef.current = cur;

        setPosition(cur);
        setAccuracy(pos.coords.accuracy ?? null);
        setError(null);
      },
      (err) => setError(err?.message || "Geolocation error"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }

  // simulate meters and visibly move marker east
  function simulate(deltaMeters) {
    const delta = Number(deltaMeters) || 0;
    const base = position ?? { lat: 56.8333, lon: 13.9333 }; // Ljungby fallback
    const next = offsetLatLon(base, delta, 0);
    setPosition(next);

    // accumulate totals
    setTotalMoved((t) => t + delta);

    if (mode === "distance") {
      if (!startRef.current) startRef.current = base;
      setMoved((prev) => {
        const v = prev + delta;
        if (targetMeters != null) setReady(v >= targetMeters);
        return v;
      });
    } else if (mode === "point") {
      const tgt = pointTargetRef.current;
      if (tgt) {
        const d = haversine(next, tgt);
        setDistanceToTarget(d);
        setReady(d <= (tgt.radius ?? 5));
      }
    }
  }

  useEffect(() => () => clearWatch(), []);

  return {
    moved,
    totalMoved,
    ready,
    accuracy,
    error,
    distanceToTarget,
    position,
    startDistance,
    startToPoint,
    stopTracking,
    reset,
    simulate,
    forceGetCurrent,
    mode,
    targetMeters,
  };
}
