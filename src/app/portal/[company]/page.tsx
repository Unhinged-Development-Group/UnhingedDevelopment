"use client";

import { useParams } from "next/navigation";
import { type CompanyKey } from "@/lib/supabase";

const UDG_ICON_FILTER =
  "invert(1) brightness(0.6) sepia(1) saturate(3000%) hue-rotate(35deg) brightness(1.3)";

const GROOMR = {
  gold: "#EAE45C",
  sage: "#88A096",
  terracotta: "#C87964",
} as const;

const GROOMR_VALUES = [
  { name: "Trust first.", description: "We only feature groomers we'd trust with our own dogs." },
  { name: "Community over competition.", description: "We champion independent groomers, not corporate chains." },
  { name: "Simple by design.", description: "Booking a groom should take seconds, not a Sunday afternoon." },
  { name: "Dogs at the centre.", description: "Every decision we make starts with what's best for the dog." },
];

type CompanyContent = {
  tagline: string;
  mission: string;
  vision: string;
  values: { name: string; description: string }[];
  accent: string;
};

const CONTENT: Record<CompanyKey, CompanyContent> = {
  "unhinged-development": {
    tagline: "Building things worth talking about.",
    accent: "#d2ff14",
    mission:
      "To build a portfolio of companies that solve real problems with thoughtful design, bold technology, and a relentless focus on the people who use them.",
    vision:
      "A group of companies known for moving fast, building things that last, and proving that small teams can punch well above their weight.",
    values: [
      { name: "Build boldly", description: "Ship things worth talking about. Avoid the safe, forgettable middle." },
      { name: "Own it", description: "Every person takes full responsibility for their work, start to finish." },
      { name: "Keep it real", description: "Honest communication, no politics, no bullshit." },
    ],
  },
  groomr: {
    tagline: "Your dog deserves a regular.",
    accent: GROOMR.gold,
    mission:
      "To make dog grooming effortless for owners and rewarding for groomers — by connecting local communities through a platform built on trust, simplicity, and a genuine love of dogs.",
    vision:
      "A world where every dog has a groomer they love, and every groomer has a business they're proud of.",
    values: GROOMR_VALUES,
  },
  "paper-and-ponder": {
    tagline: "Where ideas become beautifully bound.",
    accent: "#fb923c",
    mission:
      "To create stationery and paper goods that inspire thoughtful reflection and meaningful creativity.",
    vision:
      "A brand synonymous with quality craftsmanship and the quiet joy of putting pen to paper.",
    values: [
      { name: "Crafted with care", description: "Every product is considered from concept through to production." },
      { name: "Inspire reflection", description: "We believe in the power of analogue in a digital world." },
      { name: "Quality over quantity", description: "We'd rather do fewer things exceptionally well." },
    ],
  },
};

export default function CompanyDashboard() {
  const params = useParams();
  const company = params.company as CompanyKey;
  const content = CONTENT[company];

  if (!content) return null;

  // Groomr: brand-specific dashboard using Brand Guidelines 2026 v2
  if (company === "groomr") {
    return (
      <div className="max-w-3xl px-6 py-10 sm:px-10">
        {/* Logo + tagline */}
        <div className="mb-12">
          <img
            src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1774753252/Horizontal_Lockup_-_DEEP_SLATE_lg5q91.png"
            alt="Groomr"
            className="mb-5 h-10 w-auto"
            style={{ filter: "brightness(0) invert(1)", mixBlendMode: "screen" }}
          />
          <p className="text-base italic" style={{ color: GROOMR.gold }}>
            &ldquo;Your dog deserves a regular.&rdquo;
          </p>
        </div>

        {/* Mission */}
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px w-6" style={{ backgroundColor: GROOMR.gold }} />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: GROOMR.sage }}>Mission</span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            To make dog grooming effortless for owners and rewarding for groomers — by connecting local communities through a platform built on trust, simplicity, and a genuine love of dogs.
          </p>
        </section>

        {/* Vision */}
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px w-6" style={{ backgroundColor: GROOMR.gold }} />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: GROOMR.sage }}>Vision</span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            A world where every dog has a groomer they love, and every groomer has a business they&rsquo;re proud of.
          </p>
        </section>

        {/* Values */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-6" style={{ backgroundColor: GROOMR.gold }} />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: GROOMR.sage }}>Values</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {GROOMR_VALUES.map((v, i) => (
              <div
                key={v.name}
                className="rounded-xl border border-zinc-900 bg-ink-800/40 px-4 py-4"
                style={{ borderTopColor: i % 2 === 0 ? GROOMR.gold : GROOMR.terracotta, borderTopWidth: "2px" }}
              >
                <p className="text-sm font-semibold text-zinc-200">{v.name}</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: GROOMR.sage }}>{v.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const accent = content.accent;

  return (
    <div className="max-w-3xl px-6 py-10 sm:px-10">
      {/* Logo header */}
      {company === "unhinged-development" && (
        <div className="mb-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
          <img
            src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png"
            alt=""
            aria-hidden="true"
            className="h-14 w-auto"
            style={{ filter: UDG_ICON_FILTER, mixBlendMode: "screen" }}
          />
          <img
            src="https://res.cloudinary.com/dr8adq7nl/image/upload/e_trim:10/v1778965083/IMG_0771_a3c6az.png"
            alt="Unhinged Development Group"
            className="h-auto w-52 sm:w-64"
            style={{ filter: "invert(1)", mixBlendMode: "screen" }}
          />
        </div>
      )}

      {company === "paper-and-ponder" && (
        <div className="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <img
            src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778999178/monogram_pdyhij.svg"
            alt=""
            aria-hidden="true"
            className="h-16 w-auto flex-shrink-0"
          />
          <img
            src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778999177/Logo_jx500w.svg"
            alt="Paper & Ponder"
            className="h-auto w-52 sm:w-64"
          />
        </div>
      )}

      {/* Tagline */}
      <div className="mb-10">
        <p className="text-xs font-medium tracking-[0.2em] uppercase mb-1" style={{ color: accent }}>
          {content.tagline}
        </p>
      </div>

      {/* Mission */}
      <section className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px w-6" style={{ backgroundColor: accent }} />
          <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: accent }}>Mission</span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">{content.mission}</p>
      </section>

      {/* Vision */}
      <section className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px w-6" style={{ backgroundColor: accent }} />
          <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: accent }}>Vision</span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">{content.vision}</p>
      </section>

      {/* Values */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-6" style={{ backgroundColor: accent }} />
          <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: accent }}>Values</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {content.values.map((v) => (
            <div key={v.name} className="rounded-xl border border-zinc-900 bg-ink-800/40 px-4 py-4">
              <p className="text-sm font-semibold text-zinc-200">{v.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{v.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
