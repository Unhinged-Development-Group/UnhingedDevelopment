"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const GREEN_FILTER =
  "invert(1) brightness(0.6) sepia(1) saturate(3000%) hue-rotate(35deg) brightness(1.3)";

const LOGO_URL =
  "https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png";

export default function Navbar({ isHome = false }: { isHome?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
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
        {!isHome && (
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="font-bitcount text-xl font-light text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Home
          </Link>
        )}
        <Link href="/who-we-are" onClick={() => setMenuOpen(false)} className="font-bitcount text-3xl font-light text-unhinged-green hover:opacity-70 transition-opacity">Who we are</Link>
        <Link href="/projects" onClick={() => setMenuOpen(false)} className="font-bitcount text-3xl font-light text-unhinged-green hover:opacity-70 transition-opacity">Projects</Link>
        <Link href="/contact" onClick={() => setMenuOpen(false)} className="font-bitcount text-3xl font-light text-unhinged-green hover:opacity-70 transition-opacity">Contact us</Link>
        <div className="mt-4 border-t border-zinc-800 pt-6">
          <Link
            href="/portal"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center gap-2 rounded-full border border-zinc-800 bg-ink-800 px-4 py-2.5 text-sm text-zinc-300 transition-all duration-200 hover:border-unhinged-green/50 hover:text-white w-fit"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-unhinged-green animate-pulse" />
            UDG Team Portal
            <svg className="h-3 w-3 text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Nav bar */}
      <nav className="relative z-40 flex items-center justify-between px-6 pt-3 pb-6 sm:py-6 sm:px-10 lg:px-16">
        <div className="flex items-center gap-10">
          {/* Mobile: logo toggles drawer */}
          <button
            className="sm:hidden focus:outline-none"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <img
              src={LOGO_URL}
              alt="Unhinged Development Group"
              className="h-10 w-auto transition-transform duration-300"
              style={{
                filter: menuOpen ? GREEN_FILTER : "invert(1)",
                transform: menuOpen ? "scaleX(-1)" : "scaleX(1)",
                mixBlendMode: "screen",
              }}
            />
          </button>

          {/* Desktop: non-interactive on home, links home on inner pages */}
          {isHome ? (
            <img
              src={LOGO_URL}
              alt="Unhinged Development Group"
              className="hidden sm:block h-10 w-auto"
              style={{ filter: "invert(1)", mixBlendMode: "screen" }}
            />
          ) : (
            <Link href="/" className="hidden sm:block">
              <img
                src={LOGO_URL}
                alt="Unhinged Development Group"
                className="h-10 w-auto"
                style={{ filter: "invert(1)", mixBlendMode: "screen" }}
              />
            </Link>
          )}

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-7">
            <Link href="/who-we-are" className="font-bitcount text-[22px] font-light text-unhinged-green hover:opacity-80 transition-opacity">Who we are</Link>
            <Link href="/projects" className="font-bitcount text-[22px] font-light text-unhinged-green hover:opacity-80 transition-opacity">Projects</Link>
            <Link href="/contact" className="font-bitcount text-[22px] font-light text-unhinged-green hover:opacity-80 transition-opacity">Contact us</Link>
          </div>
        </div>

        <Link
          href="/portal"
          className="group hidden sm:flex items-center gap-2 rounded-full border border-zinc-800 bg-ink-800 px-4 py-2 text-sm text-zinc-300 transition-all duration-200 hover:border-unhinged-green/50 hover:text-white"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-unhinged-green animate-pulse" />
          UDG Team Portal
          <svg className="h-3 w-3 text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </nav>
    </>
  );
}
