'use client';

import { useEffect, useRef, useState, type CSSProperties } from "react";

const BASE_STROKE = 0.6;
const PULSE_STROKE = 0.9;
const PULSE_FRACTION = 0.025;
const TRAVERSAL_S = 8;
const PAUSE_S = 0.8;

interface SvgInfo {
  viewBox: string;
  pathD: string;
  gTransform: string;
  pathTransform: string;
}

export default function ScotlandPulse() {
  const pulseRef = useRef<SVGPathElement>(null);
  const [svgInfo, setSvgInfo] = useState<SvgInfo | null>(null);
  const [length, setLength] = useState<number | null>(null);

  useEffect(() => {
    fetch('/Scotland.svg')
      .then(r => r.text())
      .then(text => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        const pathEl = doc.querySelector('path');
        const gEl = doc.querySelector('g');
        if (!svgEl || !pathEl) return;
        setSvgInfo({
          viewBox: svgEl.getAttribute('viewBox') ?? '0 0 114 181',
          pathD: pathEl.getAttribute('d') ?? '',
          gTransform: gEl?.getAttribute('transform') ?? '',
          pathTransform: pathEl.getAttribute('transform') ?? '',
        });
      });
  }, []);

  useEffect(() => {
    if (pulseRef.current && svgInfo) {
      setLength(pulseRef.current.getTotalLength());
    }
  }, [svgInfo]);

  const dashLen = length ? length * PULSE_FRACTION : 0;
  const totalS = TRAVERSAL_S + PAUSE_S;
  const movePct = (TRAVERSAL_S / totalS) * 100;

  const styleBlock = length
    ? `
        @keyframes scot-trace {
          0%   { stroke-dashoffset: 0; }
          ${movePct.toFixed(2)}% { stroke-dashoffset: -${length + dashLen}; }
          100% { stroke-dashoffset: -${length + dashLen}; }
        }
      `
    : '';

  const pulseStyle: CSSProperties = length
    ? {
        strokeDasharray: `${dashLen} ${length}`,
        animation: `scot-trace ${totalS}s linear infinite`,
      }
    : { strokeDasharray: '0 999999' };

  if (!svgInfo) return null;

  const sharedPathProps = {
    d: svgInfo.pathD,
    ...(svgInfo.pathTransform ? { transform: svgInfo.pathTransform } : {}),
    fill: 'none' as const,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  };

  return (
    <svg
      viewBox={svgInfo.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      {styleBlock && <style>{styleBlock}</style>}
      <g {...(svgInfo.gTransform ? { transform: svgInfo.gTransform } : {})}>
        <g style={{ filter: 'drop-shadow(0 0 1.5px rgba(210,255,20,0.5))' }}>
          <path
            {...sharedPathProps}
            stroke="rgba(210,255,20,0.12)"
            strokeWidth={BASE_STROKE}
          />
        </g>
        <g style={{ filter: 'drop-shadow(0 0 1.2px #D2FF14)' }}>
          <path
            ref={pulseRef}
            {...sharedPathProps}
            stroke="#D2FF14"
            strokeWidth={PULSE_STROKE}
            style={pulseStyle}
          />
        </g>
      </g>
    </svg>
  );
}
