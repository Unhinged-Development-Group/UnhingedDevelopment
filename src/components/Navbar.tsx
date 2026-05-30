"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import UDGIcon from "@/components/UDGIcon";

const LOGO_URL       = "/unhinged/logo-zinc-50.png";
const LOGO_GREEN_URL = "/unhinged/logo-unhinged-green.png";

const DRAWER_WIDTH = 288;     // matches w-72
const EDGE_HIT = 24;          // px from left edge that arms the open gesture
const ACTIVATION = 8;         // horizontal px before we hijack the touch
const VERT_SLOP = 10;         // vertical px that releases the gesture as a scroll
const OPEN_FRAC = 0.4;        // dragged past this fraction = snap open
const FLING = 0.5;            // px/ms past this velocity = snap in fling direction
const SM_BREAKPOINT = 640;

export default function Navbar({ isHome = false }: { isHome?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGreen, setShowGreen] = useState(false);
  const [dragX, setDragX] = useState<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setShowGreen(menuOpen), 150);
    return () => clearTimeout(timer);
  }, [menuOpen]);

  useEffect(() => {
    let mode: "edge" | "drawer" | null = null;
    let startX = 0, startY = 0, startT = 0;
    let lastX = 0, lastT = 0;
    let activated = false;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if (window.innerWidth >= SM_BREAKPOINT) return;
      const t = e.touches[0];
      const drawer = drawerRef.current;
      const onDrawer = !!(drawer && drawer.contains(e.target as Node));
      if (!menuOpen && t.clientX <= EDGE_HIT) mode = "edge";
      else if (menuOpen && onDrawer) mode = "drawer";
      else { mode = null; return; }
      startX = t.clientX; startY = t.clientY; startT = e.timeStamp;
      lastX = startX; lastT = startT;
      activated = false;
    };

    const onMove = (e: TouchEvent) => {
      if (mode === null) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (!activated) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > VERT_SLOP) { mode = null; return; }
        if (Math.abs(dx) < ACTIVATION) return;
        activated = true;
      }
      // Steal the gesture from the browser's edge-swipe back navigation
      e.preventDefault();
      const next = mode === "edge"
        ? Math.max(-DRAWER_WIDTH, Math.min(0, -DRAWER_WIDTH + dx))
        : Math.max(-DRAWER_WIDTH, Math.min(0, dx));
      setDragX(next);
      lastX = t.clientX; lastT = e.timeStamp;
    };

    const onEnd = () => {
      if (mode !== null && activated) {
        const dx = lastX - startX;
        const dt = lastT - startT;
        const v = dt > 0 ? dx / dt : 0;
        const shouldOpen = mode === "edge"
          ? (dx > DRAWER_WIDTH * OPEN_FRAC || v > FLING)
          : (dx > -DRAWER_WIDTH * (1 - OPEN_FRAC) && v > -FLING);
        setMenuOpen(shouldOpen);
      }
      mode = null;
      activated = false;
      setDragX(null);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [menuOpen]);

  const dragging = dragX !== null;
  const drawerStyle: CSSProperties | undefined = dragging
    ? { transform: `translateX(${dragX}px)`, transition: "none" }
    : undefined;
  const backdropProgress = dragging
    ? Math.max(0, Math.min(1, (DRAWER_WIDTH + (dragX ?? 0)) / DRAWER_WIDTH))
    : (menuOpen ? 1 : 0);

  return (
    <>
      {/* Edge-swipe absorber: 24px transparent strip with touch-action:none
         so iOS Safari cannot start its system back-swipe. Sits at z-[50]
         (above the navbar at z-40) so it owns the entire left edge — the
         navbar's inherited pan-y was not enough on iOS to veto the gesture
         on its own. Width matches the EDGE_HIT constant in the drag handler
         so there is no dead zone between "strip catches the touch" and
         "JS recognises an edge swipe". Disabled while the drawer is open so
         close-drag touches fall through to the drawer underneath. */}
      <div
        aria-hidden
        className="fixed top-0 left-0 h-full w-6 z-[50] sm:hidden"
        style={{
          touchAction: "none",
          pointerEvents: menuOpen ? "none" : "auto",
          background: "transparent",
        }}
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm sm:hidden"
        style={{
          opacity: backdropProgress,
          pointerEvents: backdropProgress > 0 ? "auto" : "none",
          transition: dragging ? "none" : "opacity 300ms",
        }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Left drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full z-30 w-72 bg-ink-900 border-r border-zinc-800 flex flex-col px-8 pt-28 pb-10 gap-6 transition-transform duration-300 ease-in-out sm:hidden ${
          dragging ? "" : (menuOpen ? "translate-x-0" : "-translate-x-full")
        }`}
        style={drawerStyle}
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
        <Link href="/who-we-are" onClick={() => setMenuOpen(false)} className={`font-bitcount text-3xl font-light ${isActive("/who-we-are") ? "text-white" : "text-unhinged-green"}`}>Who we are</Link>
        <Link href="/projects" onClick={() => setMenuOpen(false)} className={`font-bitcount text-3xl font-light ${isActive("/projects") ? "text-white" : "text-unhinged-green"}`}>Projects</Link>
        <Link href="/contact" onClick={() => setMenuOpen(false)} className={`font-bitcount text-3xl font-light ${isActive("/contact") ? "text-white" : "text-unhinged-green"}`}>Contact us</Link>
        <div className="mt-4 border-t border-zinc-800 pt-6">
          <Link
            href="/portal"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center gap-2 rounded-full border border-zinc-800 bg-ink-800 px-4 py-2.5 text-sm text-zinc-300 transition-all duration-200 hover:border-unhinged-green/50 hover:text-white w-fit"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-unhinged-green animate-pulse" />
            UDG Team Portal
            <UDGIcon name="chevron-right" className="h-3 w-3 text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5" accentColor="#D2FF14" />
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
              src={showGreen ? LOGO_GREEN_URL : LOGO_URL}
              alt="Unhinged Development Group"
              className="h-10 w-10 object-contain"
              style={{
                transform: menuOpen ? "scaleX(-1)" : "scaleX(1)",
                transition: "transform 300ms ease-in-out",
              }}
            />
          </button>

          {/* Desktop: non-interactive on home, links home on inner pages */}
          {isHome ? (
            <img
              src={LOGO_URL}
              alt="Unhinged Development Group"
              className="hidden sm:block h-10 w-auto"
            />
          ) : (
            <Link href="/" className="hidden sm:block">
              <img
                src={LOGO_URL}
                alt="Unhinged Development Group"
                className="h-10 w-auto"
              />
            </Link>
          )}

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-7">
            <Link href="/who-we-are" className={`font-bitcount text-[22px] font-light ${isActive("/who-we-are") ? "text-white" : "text-unhinged-green"}`}>Who we are</Link>
            <Link href="/projects" className={`font-bitcount text-[22px] font-light ${isActive("/projects") ? "text-white" : "text-unhinged-green"}`}>Projects</Link>
            <Link href="/contact" className={`font-bitcount text-[22px] font-light ${isActive("/contact") ? "text-white" : "text-unhinged-green"}`}>Contact us</Link>
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
