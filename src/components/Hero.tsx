"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #D2FF14 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-60 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #a8cc00 0%, transparent 70%)" }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center gap-10">
          <img
            src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png"
            alt="Unhinged Development Group"
            className="h-10 w-auto"
            style={{ filter: "invert(1)", mixBlendMode: "screen" }}
          />
          {/* Nav links — left-aligned, hidden on mobile */}
          <div className="hidden sm:flex items-center gap-7">
            <a href="#who-we-are" className="text-[15px] font-medium text-unhinged-green hover:opacity-80 transition-opacity">Who we are</a>
            <a href="#projects" className="text-[15px] font-medium text-unhinged-green hover:opacity-80 transition-opacity">Projects</a>
            <a href="#contact" className="text-[15px] font-medium text-unhinged-green hover:opacity-80 transition-opacity">Contact us</a>
          </div>
        </div>

        <Link
          href="/portal"
          className="group flex items-center gap-2 rounded-full border border-zinc-800 bg-ink-800 px-4 py-2 text-sm text-zinc-300 transition-all duration-200 hover:border-unhinged-green/50 hover:text-white"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-unhinged-green animate-pulse" />
          UDG Team Portal
          <svg
            className="h-3 w-3 text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </nav>

      {/* Hero content */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-8 lg:px-16">
        <div
          className={`flex w-full flex-col items-center transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Logo + Wordmark */}
          <div className="flex w-full max-w-3xl flex-col items-center gap-4 sm:flex-row sm:gap-0">
            <img
              src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png"
              alt=""
              aria-hidden="true"
              className="h-auto w-[60%] sm:w-[38%]"
              style={{
                filter: "invert(1) brightness(0.6) sepia(1) saturate(3000%) hue-rotate(35deg) brightness(1.3)",
                mixBlendMode: "screen",
              }}
            />
            <img
              src="https://res.cloudinary.com/dr8adq7nl/image/upload/e_trim:10/v1778965083/IMG_0771_a3c6az.png"
              alt="Unhinged Development Group"
              className="h-auto w-[92%] sm:w-[58%]"
              style={{ filter: "invert(1)", mixBlendMode: "screen" }}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-between border-t border-zinc-900 px-6 py-5 sm:px-10 lg:px-16">
        <p className="text-xs text-zinc-400">
          © {new Date().getFullYear()} Unhinged Development Group Ltd. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          {/* Detailed scribbled Saltire */}
          <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto opacity-80" aria-hidden="true">
            <defs>
              <filter id="scribble">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="12" result="noise"/>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.9" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
              <clipPath id="flag-clip">
                <rect width="36" height="24" rx="1"/>
              </clipPath>
            </defs>
            <g filter="url(#scribble)" clipPath="url(#flag-clip)">
              <rect width="36" height="24" fill="#003893"/>
              {/* White border bands of Saltire */}
              <line x1="-1" y1="-1" x2="37" y2="25" stroke="white" strokeWidth="9"/>
              <line x1="37" y1="-1" x2="-1" y2="25" stroke="white" strokeWidth="9"/>
              {/* Blue centre re-drawn on top */}
              <line x1="-1" y1="-1" x2="37" y2="25" stroke="#003893" strokeWidth="4"/>
              <line x1="37" y1="-1" x2="-1" y2="25" stroke="#003893" strokeWidth="4"/>
              {/* Final white cross arms */}
              <line x1="-1" y1="-1" x2="37" y2="25" stroke="white" strokeWidth="2.5"/>
              <line x1="37" y1="-1" x2="-1" y2="25" stroke="white" strokeWidth="2.5"/>
            </g>
          </svg>
          <span className="text-xs text-zinc-400">Registered in Scotland</span>
        </div>
      </footer>
    </main>
  );
}
