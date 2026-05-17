"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const GREEN_FILTER =
  "invert(1) brightness(0.6) sepia(1) saturate(3000%) hue-rotate(35deg) brightness(1.3)";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-20 bg-black/60 backdrop-blur-sm transition-opacity duration-300 sm:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Left drawer */}
      <div
        className={`fixed top-0 left-0 h-full z-30 w-72 bg-ink-900 border-r border-zinc-800 flex flex-col px-8 pt-28 pb-10 gap-6 transition-transform duration-300 ease-in-out sm:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <a
          href="#who-we-are"
          onClick={() => setMenuOpen(false)}
          className="font-bitcount text-3xl font-medium text-unhinged-green hover:opacity-70 transition-opacity"
        >
          Who we are
        </a>
        <a
          href="#projects"
          onClick={() => setMenuOpen(false)}
          className="font-bitcount text-3xl font-medium text-unhinged-green hover:opacity-70 transition-opacity"
        >
          Projects
        </a>
        <a
          href="#contact"
          onClick={() => setMenuOpen(false)}
          className="font-bitcount text-3xl font-medium text-unhinged-green hover:opacity-70 transition-opacity"
        >
          Contact us
        </a>

        <div className="mt-4 border-t border-zinc-800 pt-6">
          <Link
            href="/portal"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center gap-2 rounded-full border border-zinc-800 bg-ink-800 px-4 py-2.5 text-sm text-zinc-300 transition-all duration-200 hover:border-unhinged-green/50 hover:text-white w-fit"
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
        </div>
      </div>

      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Subtle ambient halo behind the logo figure */}
        <div
          className="absolute top-[8%] sm:top-[26%] left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #D2FF14 0%, transparent 70%)" }}
        />
        {/* Cone beam — originates at logo base, fans down onto the wordmark */}
        <div
          className="absolute top-[30%] sm:top-[44%] left-1/2 -translate-x-1/2 h-[380px] w-[480px] opacity-[0.22] sm:opacity-[0.12]"
          style={{
            background: "conic-gradient(at 50% 0%, transparent 0deg, transparent 136deg, rgba(210,255,20,0) 145deg, rgba(210,255,20,1) 157deg, rgba(210,255,20,1) 203deg, rgba(210,255,20,0) 215deg, transparent 224deg, transparent 360deg)",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 88%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 88%)",
          }}
        />
        <div
          className="absolute -bottom-60 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #a8cc00 0%, transparent 70%)" }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-40 flex items-center justify-between px-6 pt-3 pb-6 sm:py-6 sm:px-10 lg:px-16">
        <div className="flex items-center gap-10">
          {/* Logo — tap to open/close mobile drawer */}
          <button
            className="focus:outline-none sm:pointer-events-none"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <img
              src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png"
              alt="Unhinged Development Group"
              className="h-10 w-auto transition-all duration-300"
              style={{
                filter: menuOpen ? GREEN_FILTER : "invert(1)",
                transform: menuOpen ? "scaleX(-1)" : "scaleX(1)",
                mixBlendMode: "screen",
              }}
            />
          </button>

          {/* Nav links — desktop only */}
          <div className="hidden sm:flex items-center gap-7">
            <a href="#who-we-are" className="font-bitcount text-[22px] font-normal text-unhinged-green hover:opacity-80 transition-opacity">Who we are</a>
            <a href="#projects" className="font-bitcount text-[22px] font-normal text-unhinged-green hover:opacity-80 transition-opacity">Projects</a>
            <a href="#contact" className="font-bitcount text-[22px] font-normal text-unhinged-green hover:opacity-80 transition-opacity">Contact us</a>
          </div>
        </div>

        <Link
          href="/portal"
          className="group hidden sm:flex items-center gap-2 rounded-full border border-zinc-800 bg-ink-800 px-4 py-2 text-sm text-zinc-300 transition-all duration-200 hover:border-unhinged-green/50 hover:text-white"
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
      <section className="relative z-10 flex flex-1 flex-col items-center justify-start pt-8 sm:justify-center sm:pt-0 px-4 sm:px-8 lg:px-16">
        <div
          className={`flex w-full flex-col items-center transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Logo + Wordmark */}
          <div className="flex w-full max-w-3xl flex-col items-center gap-4 sm:flex-row sm:gap-0 sm:justify-center">
            <img
              src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png"
              alt=""
              aria-hidden="true"
              className="h-auto w-[60%] sm:w-[38%]"
              style={{
                filter: GREEN_FILTER,
                mixBlendMode: "screen",
              }}
            />
            <img
              src="https://res.cloudinary.com/dr8adq7nl/image/upload/e_trim:10/v1778965083/IMG_0771_a3c6az.png"
              alt="Unhinged Development Group"
              className="h-auto w-[92%] sm:w-[58%]"
              style={{ filter: "invert(1) drop-shadow(0 0 16px rgba(210, 255, 20, 0.40))", mixBlendMode: "screen" }}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex items-start justify-between border-t border-zinc-900 px-6 py-5 sm:px-10 lg:px-16">
        <p className="text-xs leading-relaxed text-zinc-400">
          © {new Date().getFullYear()}<br />
          Unhinged Development Group Ltd.<br />
          All rights reserved.
        </p>
        <p className="text-xs leading-relaxed text-zinc-400">
          Registered in<br />
          <span className="inline-flex items-center gap-1.5">
            Scotland.
            <svg viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg" className="h-3 w-auto opacity-90" aria-label="Scotland">
              <rect width="18" height="12" rx="1" fill="#003893"/>
              <line x1="-1" y1="-1" x2="19" y2="13" stroke="white" strokeWidth="4" strokeLinecap="round"/>
              <line x1="19" y1="-1" x2="-1" y2="13" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </span>
        </p>
      </footer>
    </main>
  );
}
