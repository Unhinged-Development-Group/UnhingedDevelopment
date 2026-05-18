"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const LINE_COUNT = 26;
const COVER_MS = 420;
const STAGGER_MS = 12;
const HOLD_MS = 60;
const UNCOVER_MS = 380;

type Phase = "idle" | "covering" | "uncovering";

export default function PageTransitionOverlay() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const router = useRouter();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    function clear() {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    }

    function handle(e: Event) {
      const { href, x, y } = (e as CustomEvent<{ href: string; x: number; y: number }>).detail;

      clear();
      setOrigin({
        x: (x / window.innerWidth) * 100,
        y: (y / window.innerHeight) * 100,
      });
      setPhase("covering");

      timers.current.push(
        setTimeout(() => router.push(href), COVER_MS + LINE_COUNT * STAGGER_MS / 2)
      );

      timers.current.push(
        setTimeout(() => setPhase("uncovering"), COVER_MS + LINE_COUNT * STAGGER_MS + HOLD_MS)
      );

      timers.current.push(
        setTimeout(
          () => setPhase("idle"),
          COVER_MS + LINE_COUNT * STAGGER_MS + HOLD_MS + UNCOVER_MS + LINE_COUNT * STAGGER_MS
        )
      );
    }

    window.addEventListener("udg-transition", handle);
    return () => {
      window.removeEventListener("udg-transition", handle);
      clear();
    };
  }, [router]);

  if (phase === "idle") return null;

  const lineHeight = 100 / LINE_COUNT;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {Array.from({ length: LINE_COUNT }).map((_, i) => {
        const lineY = (i / LINE_COUNT) * 100;
        const dist = Math.abs(lineY - origin.y);
        const maxDist = Math.max(origin.y, 100 - origin.y, 1);
        const delay = (dist / maxDist) * LINE_COUNT * STAGGER_MS;

        const covering = phase === "covering";
        const duration = covering ? COVER_MS : UNCOVER_MS;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${lineY}%`,
              left: 0,
              right: 0,
              height: `${lineHeight + 0.1}%`,
              transform: covering ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: `${origin.x}% 50%`,
              transition: `transform ${duration}ms cubic-bezier(0.76, 0, 0.24, 1) ${delay}ms`,
              background: "#080808",
              borderTop: "1px solid rgba(210,255,20,0.18)",
            }}
          />
        );
      })}
    </div>
  );
}
