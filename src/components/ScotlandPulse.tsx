'use client';

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SCOTLAND_PATH, SCOTLAND_VIEWBOX } from "./scotland-path";

// Stroke width is in the same user-units as the path (viewBox is ~114x180),
// so values are much smaller than they would be on a 1000-unit-wide path.
const BASE_STROKE = 0.6;
const PULSE_STROKE = 0.9;
// Pulse trail length expressed as a fraction of the total measured path
// length, so it stays visually consistent if the source SVG is swapped again.
const PULSE_FRACTION = 0.025;
const TRAVERSAL_S = 8;
const PAUSE_S = 0.8;

export default function ScotlandPulse() {
  const pulseRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState<number | null>(null);

  useEffect(() => {
    if (pulseRef.current) {
      setLength(pulseRef.current.getTotalLength());
    }
  }, []);

  const dashLen = length ? length * PULSE_FRACTION : 0;
  const totalS = TRAVERSAL_S + PAUSE_S;
  const movePct = (TRAVERSAL_S / totalS) * 100;

  // Keyframes have to be re-emitted whenever length changes because @keyframes
  // can't pick up CSS custom properties for offset values.
  const styleBlock = length
    ? `
        @keyframes scot-trace {
          0%   { stroke-dashoffset: 0; }
          ${movePct}% { stroke-dashoffset: -${length + dashLen}; }
          100% { stroke-dashoffset: -${length + dashLen}; }
        }
      `
    : "";

  const pulseStyle: CSSProperties | undefined = length
    ? {
        strokeDasharray: `${dashLen} ${length}`,
        animation: `scot-trace ${totalS}s linear infinite`,
      }
    : { strokeDasharray: "0 999999" }; // invisible until measured

  return (
    <svg
      viewBox={SCOTLAND_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-auto"
      aria-hidden="true"
    >
      <style>{styleBlock}</style>
      <g style={{ filter: "drop-shadow(0 0 1.5px rgba(210,255,20,0.5))" }}>
        <path
          d={SCOTLAND_PATH}
          fill="none"
          stroke="rgba(210,255,20,0.12)"
          strokeWidth={BASE_STROKE}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>
      <g style={{ filter: "drop-shadow(0 0 1.2px #D2FF14)" }}>
        <path
          ref={pulseRef}
          d={SCOTLAND_PATH}
          fill="none"
          stroke="#D2FF14"
          strokeWidth={PULSE_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={pulseStyle}
        />
      </g>
    </svg>
  );
}
