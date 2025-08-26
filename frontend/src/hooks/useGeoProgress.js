import { useEffect, useRef, useState } from "react";


function haversine(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export function useGeoProgress({ highAccuracy = true } = {}) {
  const [enabled, setEnabled] = useState(false);
  const [moved, setMoved] = useState(0);
  const [distanceToTarget, setDistanceToTarget] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [accuracy, setAccuracy] = useState(null);

  const watchIdRef = useRef(null);
  const modeRef = useRef("none"); 
  const targetMetersRef = useRef(0);
  const targetPointRef = useRef({ lat: 0, lon: 0, radius: 0 });

  const lastPosRef = useRef(null);

  const stopTracking = () => {
    if (watchIdRef.current != null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setEnabled(false);
  };

  const reset = () => {
    setMoved(0);
    setDistanceToTarget(null);
    setReady(false);
    setError("");
    setAccuracy(null);
    lastPosRef.current = null;
    modeRef.current = "none";
  };

  const start = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported.");
      return;
    }
    setEnabled(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        const p = { lat: latitude, lon: longitude };
        setAccuracy(acc);

       
        if (lastPosRef.current) {
          const inc = haversine(lastPosRef.current, p);
          if (!(acc != null && inc < Math.max(3, acc * 0.5))) {
            setMoved((prev) => {
              const next = prev + inc;
              if (modeRef.current === "distance" && next >= targetMetersRef.current) {
                setReady(true);
              }
              return next;
            });
          }
        }
        lastPosRef.current = p;

       
        if (modeRef.current === "point") {
          const t = targetPointRef.current;
          const d = haversine(p, { lat: t.lat, lon: t.lon });
          setDistanceToTarget(d);
          if (d <= t.radius) setReady(true);
        }
      },
      (err) => {
        setError(err.message || "Location error.");
        stopTracking();
      },
      {
        enableHighAccuracy: highAccuracy,
        maximumAge: 1000,
        timeout: 15000,
      }
    );
  };


  const startDistance = (targetMeters) => {
    reset();
    modeRef.current = "distance";
    targetMetersRef.current = targetMeters;
    start();
  };

  const startToPoint = ({ lat, lon }, radiusMeters) => {
    reset();
    modeRef.current = "point";
    targetPointRef.current = { lat, lon, radius: radiusMeters };
    start();
  };

 
  const simulate = (meters = 1) => {
    if (modeRef.current !== "distance") return;
    setMoved((prev) => {
      const next = prev + meters;
      if (next >= targetMetersRef.current) setReady(true);
      return next;
    });
  };

  useEffect(() => () => stopTracking(), []);

  return {
    enabled,
    moved,
    distanceToTarget,
    ready,
    accuracy,
    error,
    startDistance,
    startToPoint,
    stopTracking,
    reset,
    simulate,
  };
}

