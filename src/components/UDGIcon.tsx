// Unhinged Development Group icon system.
// Each icon renders 6 stacked layers with slight translate/rotate jitter,
// giving the hand-drawn "chaotic" aesthetic that defines the UDG brand.
// The final layer uses accentColor (default #D2FF14) for the signature green hit.

import type { CSSProperties } from "react";

const LAYERS = [
  { t: "translate(0.5 0.5) rotate(1.5 12 12)",   o: 0.3, sw: 1.2, accent: false },
  { t: "translate(-0.5 -0.5) rotate(-1.5 12 12)", o: 0.4, sw: 1,   accent: false },
  { t: "translate(1 -0.5) rotate(3 12 12)",        o: 0.3, sw: 0.8, accent: false },
  { t: "translate(-1 1) rotate(-2.5 12 12)",       o: 0.5, sw: 1,   accent: false },
  { t: "translate(0 0) rotate(0 12 12)",            o: 0.9, sw: 2,   accent: false },
  { t: "translate(1.5 1.5) rotate(-4 12 12)",      o: 0.8, sw: 1.5, accent: true  },
] as const;

export const ICON_PATHS = {
  // Navigation & UI
  home:            ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  "chevron-right": ["M9 18l6-6-6-6"],
  "chevron-left":  ["M15 18l-6-6 6-6"],
  "chevron-down":  ["M19 9l-7 7-7-7"],
  close:           ["M18 6L6 18", "M6 6l12 12"],
  check:           ["M20 6L9 17l-5-5"],
  plus:            ["M12 5v14", "M5 12h14"],
  search:          ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.35-4.35"],
  menu:            ["M3 12h18", "M3 6h18", "M3 18h18"],

  // Identity & brand
  lightning:       ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  shield:          ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  star:            ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  heart:           ["M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"],
  key:             ["M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"],

  // People & communication
  users:           ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  user:            ["M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z", "M12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"],
  mail:            ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  chat:            ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  share:           ["M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", "M16 6l-4-4-4 4", "M12 2v13"],

  // Files & system
  file:            ["M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z", "M13 2v7h7"],
  photo:           ["M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"],
  folder:          ["M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"],
  "folder-plus":   ["M9 13h6m-3-3v6m-9 1V7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
  trash:           ["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", "M10 11v6", "M14 11v6"],
  edit:            ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  download:        ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  upload:          ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  lock:            ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  unlock:          ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 9.9-1"],
  move:            ["M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"],
  eye:             ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  "eye-off":       ["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24", "M1 1l22 22"],
  camera:          ["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z", "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],

  // Projects & layout
  grid:            ["M4 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z", "M14 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6z", "M4 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z", "M14 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2z"],
  layers:          ["M12 2L2 7l10 5 10-5-10-5z", "M2 12l10 5 10-5", "M2 17l10 5 10-5"],
  chart:           ["M3 3v18h18", "M18 17V9", "M13 17V5", "M8 17v-3"],
  calendar:        ["M3 4h18v18H3z", "M16 2v4", "M8 2v4", "M3 10h18"],
  clock:           ["M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z", "M12 6v6l4 2"],

  // Tech & dev
  terminal:        ["M4 17l6-6-6-6", "M12 19h8"],
  code:            ["M16 18l6-6-6-6", "M8 6l-6 6 6 6"],
  database:        ["M21 12c0 1.66-4 3-9 3s-9-1.34-9-3", "M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5", "M21 5c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z"],
  cloud:           ["M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"],
  filter:          ["M22 3H2l8 9.46V19l4 2v-8.54L22 3z"],
  power:           ["M18.36 6.64a9 9 0 1 1-12.73 0", "M12 2v10"],
} as const;

export type IconName = keyof typeof ICON_PATHS;

export default function UDGIcon({
  name,
  className,
  style,
  mainColor = "currentColor",
  accentColor = "#D2FF14",
}: {
  name: IconName;
  className?: string;
  style?: CSSProperties;
  mainColor?: string;
  accentColor?: string;
}) {
  const paths = ICON_PATHS[name] as readonly string[];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {LAYERS.map((layer, i) => (
        <g key={i} transform={layer.t} opacity={layer.o}>
          {paths.map((d, j) => (
            <path
              key={j}
              d={d}
              stroke={layer.accent ? accentColor : mainColor}
              strokeWidth={layer.sw}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
