import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        syne: ["Syne", "system-ui", "sans-serif"],
      },
      colors: {
        // Unhinged brand palette
        ink: {
          950: "#030303",
          900: "#080808",
          800: "#0e0e0e",
          700: "#141414",
        },
        "unhinged-green": {
          DEFAULT: "#D2FF14",
          light: "#e4ff6b",
          dark: "#a8cc00",
        },
        ember: {
          DEFAULT: "#a8cc00",
          light: "#c8f000",
          dark: "#7a9600",
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.8s ease-out forwards",
        pulse: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
