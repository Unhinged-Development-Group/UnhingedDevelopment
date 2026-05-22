'use client';

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SCOTLAND_PATH, SCOTLAND_PULSE_PATH, SCOTLAND_VIEWBOX } from "./scotland-path";

// Stroke widths are in the same user-units as the path (viewBox ~114x181).
const BASE_STROKE = 0.6;
const PULSE_STROKE = 0.9;
// Trail length as a fraction of total path length — stays consistent if the
// source SVG is swapped.
const PULSE_FRACTION = 0.025;
const TRAVERSAL_S = 5;

export default function ScotlandPulse() {
  const pulseRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState<number | null>(null);

  useEffect(() => {
    if (pulseRef.current) {
      setLength(pulseRef.current.getTotalLength());
    }
  }, []);

  const dashLen = length ? length * PULSE_FRACTION : 0;

  // Keyframes must be re-emitted as a <style> block because @keyframes
  // can't reference CSS custom properties for offset values.
  const styleBlock = length
    ? `
        @keyframes scot-trace {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -${length + dashLen}; }
        }
      `
    : "";

  const pulseStyle: CSSProperties = length
    ? {
        strokeDasharray: `${dashLen} ${length}`,
        animation: `scot-trace ${TRAVERSAL_S}s linear infinite`,
      }
    : { strokeDasharray: "0 999999" };

  const commonProps = {
    fill: "none" as const,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  return (
    <svg
      viewBox={SCOTLAND_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      {styleBlock && <style>{styleBlock}</style>}
      <g style={{ filter: "drop-shadow(0 0 1.5px rgba(210,255,20,0.5))" }}>
        <path
          {...commonProps}
          d={SCOTLAND_PATH}
          stroke="rgba(210,255,20,0.12)"
          strokeWidth={BASE_STROKE}
        />
      </g>
      <g style={{ filter: "drop-shadow(0 0 1.2px #D2FF14)" }}>
        <path
          ref={pulseRef}
          {...commonProps}
          d={SCOTLAND_PULSE_PATH}
          stroke="#D2FF14"
          strokeWidth={PULSE_STROKE}
          style={pulseStyle}
        />
      </g>
    </svg>
  );
}
