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

      {/* Hero content */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-start pt-8 sm:justify-center sm:pt-0 px-4 sm:px-8 lg:px-16">
        <div
          className={`flex w-full flex-col items-center transition-transform duration-700 ${
            mounted ? "translate-y-0" : "translate-y-6"
          }`}
        >
          <div className="relative flex w-full max-w-3xl flex-col items-center gap-4 sm:flex-row sm:gap-0 sm:justify-center">
            <img
              src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png"
              alt=""
              aria-hidden="true"
              className="h-auto w-[60%] sm:w-[38%]"
              style={{ filter: GREEN_FILTER, mixBlendMode: "screen", transform: "rotate(-8deg)" }}
            />
            <img
              src="https://res.cloudinary.com/dr8adq7nl/image/upload/e_make_transparent:50/e_trim:10/c_pad,b_transparent,w_iw_add_40,h_ih_add_40/e_negate/f_png/v1778965083/IMG_0771_a3c6az.png"
              alt="Unhinged Development Group"
              className="h-auto w-[92%] sm:w-[58%]"
              style={{ filter: "drop-shadow(0 0 3px rgba(255,255,255,0.15))" }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
