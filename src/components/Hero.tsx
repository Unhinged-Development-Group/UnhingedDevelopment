"use client";

import { useEffect, useState } from "react";

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
              src="/unhinged/logo-unhinged-green.png"
              alt=""
              aria-hidden="true"
              className="h-auto w-[60%] sm:w-[38%]"
            />
            <img
              src="/unhinged/wordmark-zinc-50.png"
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
