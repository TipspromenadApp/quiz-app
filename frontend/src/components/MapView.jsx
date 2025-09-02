import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DefaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function FitTo({ current, target }) {
  const map = useMap();
  useEffect(() => {
    if (current && target) {
      const b = L.latLngBounds(
        L.latLng(current.lat, current.lon),
        L.latLng(target.lat, target.lon)
      ).pad(0.35);
      map.fitBounds(b, { animate: true });
    } else if (current) {
      map.setView([current.lat, current.lon], 17, { animate: true });
    } else if (target) {
      map.setView([target.lat, target.lon], 17, { animate: true });
    }
  }, [current, target, map]);
  return null;
}
const fmt = (n, d = 1) => (n == null ? "?" : Number(n).toFixed(d));

export default function MapView({
  current,
  target,
  distance,     
  moved,        
  totalMoved,   
  accuracy,
  mode,         
  targetMeters, 
}) {
  const fallback = useMemo(() => ({ lat: 56.8333, lon: 13.9333 }), []);
  const center = current ?? target ?? fallback;
  
  const [trail, setTrail] = useState([]);
  useEffect(() => {
    if (current?.lat && current?.lon) {
      setTrail((t) => [...t, [current.lat, current.lon]].slice(-200));
    }
  }, [current?.lat, current?.lon]);

  const circleStyle = useMemo(() => {
    if (!target || distance == null) {
      return { color: "#3399ff", fillColor: "#3399ff", fillOpacity: 0.15 };
    }
    const r = Number(target?.radius ?? 5);
    const ratio = distance / Math.max(1, r);
    let color = "#ff6666";
    if (ratio <= 1) color = "#3ddc97";
    else if (ratio <= 2) color = "#ffb347";
    return { color, fillColor: color, fillOpacity: 0.2 };
  }, [target, distance]);

  const remaining = useMemo(() => {
    if (mode !== "distance") return null;
    const goal = Number(targetMeters ?? 0);
    const m = Number(moved ?? 0);
    return Math.max(0, goal - m);
  }, [mode, targetMeters, moved]);

  const path = useMemo(() => {
    if (current && target) {
      return [
        [current.lat, current.lon],
        [target.lat, target.lon],
      ];
    }
    return null;
  }, [current, target]);

  return (
    <div style={{ margin: "12px auto", maxWidth: 820, width: "100%" }}>
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 12,
          background: "rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "8px 10px",
            fontSize: 12,
            justifyContent: "center",
            background: "rgba(0,0,0,0.35)",
            flexWrap: "wrap",
          }}
        >
          {mode === "distance" ? (
            <>
              <Badge label="Förflyttning" value={`${fmt(moved)} / ${fmt(targetMeters)} m`} />
              <Badge label="Totalt" value={`${fmt(totalMoved)} m`} />
              <Badge label="Noggrannhet" value={`±${accuracy ? Math.round(accuracy) : "?"} m`} />
            </>
          ) : (
            <>
              <Badge label="Avstånd till mål" value={distance != null ? `${fmt(distance)} m` : "?"} />
              <Badge label="Radie" value={target?.radius != null ? `${target.radius} m` : "?"} />
              <Badge label="Noggrannhet" value={`±${accuracy ? Math.round(accuracy) : "?"} m`} />
            </>
          )}
        </div>      
        <div style={{ height: 320, width: "100%" }}>
          <MapContainer
            center={[center.lat, center.lon]}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FitTo current={current} target={target} />

            {trail.length >= 2 && (
              <Polyline positions={trail} pathOptions={{ color: "#88c", weight: 3, opacity: 0.8 }} />
            )}

            {current && <Marker position={[current.lat, current.lon]} />}

            {target && (
              <>
                <Marker position={[target.lat, target.lon]} />
                <Circle
                  center={[target.lat, target.lon]}
                  radius={Math.max(1, Number(target.radius || 0))}
                  pathOptions={circleStyle}
                />
              </>
            )}

            {path && <Polyline positions={path} pathOptions={{ color: "#08c", dashArray: "6 6" }} />}
          </MapContainer>
        </div>

        <div style={{ padding: 10, display: "grid", gap: 6 }}>
          <p style={{ fontSize: 12, margin: 0 }}>
            <strong>Din position:</strong>{" "}
            {current ? `${current.lat.toFixed(5)}, ${current.lon.toFixed(5)}` : "okänd"}
          </p>
          {mode === "point" ? (
            <p style={{ fontSize: 12, margin: 0 }}>
              <strong>Avstånd:</strong> {distance != null ? `${fmt(distance)} m` : "?"}
            </p>
          ) : (
            <p style={{ fontSize: 12, margin: 0 }}>
              <strong>Återstår denna fråga:</strong> {remaining != null ? `${fmt(remaining)} m` : "?"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <span
      style={{
        border: "1px solid rgba(255,255,255,.25)",
        borderRadius: 999,
        padding: "4px 10px",
        opacity: 0.95,
      }}
    >
      <strong>{label}:</strong> {value}
    </span>
  );
}
