"use client";

import { useEffect, useState } from "react";

const GREEN_FILTER =
  "invert(1) brightness(0.6) sepia(1) saturate(3000%) hue-rotate(35deg) brightness(1.3)";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[22%] sm:top-[32%] left-1/2 -translate-x-1/2 h-[500px] w-[700px] opacity-[0.28]"
          style={{ background: "radial-gradient(ellipse at 50% 70%, #D2FF14 0%, transparent 50%)" }}
        />
        <div
          className="absolute -bottom-60 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.12]"
          style={{ background: "radial-gradient(circle, #a8cc00 0%, transparent 70%)" }}
        />
      </div>

      {/* Hero content */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-start pt-8 sm:justify-center sm:pt-0 px-4 sm:px-8 lg:px-16">
        <div
          className={`flex w-full flex-col items-center transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="flex w-full max-w-3xl flex-col items-center gap-4 sm:flex-row sm:gap-0 sm:justify-center">
            <img
              src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png"
              alt=""
              aria-hidden="true"
              className="h-auto w-[60%] sm:w-[38%]"
              style={{ filter: GREEN_FILTER, mixBlendMode: "screen", transform: "rotate(-8deg)" }}
            />
            <img
              src="https://res.cloudinary.com/dr8adq7nl/image/upload/e_trim:10/v1778965083/IMG_0771_a3c6az.png"
              alt="Unhinged Development Group"
              className="h-auto w-[92%] sm:w-[58%]"
              style={{ filter: "invert(1) drop-shadow(0 0 6px rgba(255,255,255,0.5)) drop-shadow(0 0 32px rgba(210, 255, 20, 0.75))", mixBlendMode: "screen" }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
