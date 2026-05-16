"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const companies = [
  {
    name: "Groomr Ltd",
    slug: "groomr",
    tagline: "A dog groomer marketplace for owners and a complete business hub for groomers.",
    status: "In Development",
  },
  {
    name: "Paper & Ponder Ltd",
    slug: "paper-and-ponder",
    tagline: "A journaling app designed to use your hand-written journals with AI sitting alongside to analyse and discuss.",
    status: "In Development",
  },
];

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
          style={{
            background:
              "radial-gradient(circle, #D2FF14 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-60 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.06]"
          style={{
            background:
              "radial-gradient(circle, #a8cc00 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center">
          <img
            src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png"
            alt="Unhinged Development Group"
            className="h-10 w-auto"
            style={{ filter: "invert(1)", mixBlendMode: "screen" }}
          />
        </div>
        <Link
          href="/portal"
          className="group flex items-center gap-2 rounded-full border border-zinc-800 bg-ink-800 px-4 py-2 text-sm text-zinc-300 transition-all duration-200 hover:border-unhinged-green/50 hover:text-white"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-unhinged-green animate-pulse" />
          Staff Portal
          <svg
            className="h-3 w-3 text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </nav>

      {/* Hero content */}
      <section className="relative z-10 flex flex-1 flex-col items-start justify-center px-6 sm:px-10 lg:px-16 pb-20">
        <div
          className={`max-w-4xl transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Logo + Wordmark */}
          <div className="mb-10 flex items-center gap-5">
            <img
              src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png"
              alt=""
              aria-hidden="true"
              className="h-24 w-auto sm:h-32 lg:h-40"
              style={{
                filter: "invert(1) brightness(0.6) sepia(1) saturate(3000%) hue-rotate(35deg) brightness(1.3)",
                mixBlendMode: "screen",
              }}
            />
            <img
              src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965083/IMG_0771_a3c6az.png"
              alt="Unhinged Development Group"
              className="h-24 w-auto sm:h-32 lg:h-40"
              style={{ filter: "invert(1)", mixBlendMode: "screen" }}
            />
          </div>

          {/* Active Projects */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-6 bg-zinc-700" />
              <span className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
                Active Projects
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              {companies.map((company, i) => (
                <div
                  key={company.slug}
                  className={`group relative flex-1 max-w-xs rounded-2xl border border-zinc-800 bg-ink-800/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-unhinged-green/30 hover:bg-ink-700/80`}
                  style={{
                    transitionDelay: mounted ? `${i * 100 + 200}ms` : "0ms",
                  }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span className="text-xs text-zinc-500">{company.status}</span>
                  </div>
                  <h2 className="mb-1 text-base font-semibold text-zinc-100 group-hover:text-white">
                    {company.name}
                  </h2>
                  <p className="text-sm text-zinc-500">{company.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-between border-t border-zinc-900 px-6 py-5 sm:px-10 lg:px-16">
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} Unhinged Development Group Ltd. All rights
          reserved.
        </p>
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-auto opacity-60" aria-hidden="true">
            <filter id="saltire-rough">
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="5" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
            <g filter="url(#saltire-rough)">
              <rect width="30" height="20" fill="#003893"/>
              <line x1="0" y1="0" x2="30" y2="20" stroke="white" strokeWidth="6.5"/>
              <line x1="30" y1="0" x2="0" y2="20" stroke="white" strokeWidth="6.5"/>
            </g>
          </svg>
          <span className="text-xs text-zinc-700">Registered in Scotland</span>
        </div>
      </footer>
    </main>
  );
}
