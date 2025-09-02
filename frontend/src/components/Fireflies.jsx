import React, { useMemo } from "react";

export default function Fireflies({ count = 10, zIndex = 1 }) {
  const flies = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      topVh: Math.random() * 100,
      leftVw: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 40 + Math.random() * 12, 
    }));
  }, [count]);

  return (
    <div
      className="fireflies-layer"
      style={{ zIndex, pointerEvents: "none" }}
      aria-hidden="true"
    >
      {flies.map(f => (
        <div
          key={f.id}
          className="firefly"
          style={{
            top: `${f.topVh}vh`,
            left: `${f.leftVw}vw`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
