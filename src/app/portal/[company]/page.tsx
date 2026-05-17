"use client";

import { useParams } from "next/navigation";
import { type CompanyKey } from "@/lib/supabase";

const GREEN_FILTER =
  "invert(1) brightness(0.6) sepia(1) saturate(3000%) hue-rotate(35deg) brightness(1.3)";

type CompanyContent = {
  tagline: string;
  mission: string;
  vision: string;
  values: { name: string; description: string }[];
};

const CONTENT: Record<CompanyKey, CompanyContent> = {
  "unhinged-development": {
    tagline: "Building things worth talking about.",
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
    tagline: "Modern grooming management, simplified.",
    mission:
      "To make professional grooming management effortless for businesses and delightful for the clients they serve.",
    vision:
      "The go-to platform for every grooming business, from sole traders to enterprise salons.",
    values: [
      { name: "Simplicity first", description: "Complex problems deserve elegant solutions. We cut the noise." },
      { name: "Client obsessed", description: "Everything we build starts with the person using it." },
      { name: "Move fast", description: "Ship early, learn fast, iterate relentlessly." },
    ],
  },
  "paper-and-ponder": {
    tagline: "Where ideas become beautifully bound.",
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
      {company === "unhinged-development" && (
        <div className="mb-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
          <img
            src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png"
            alt=""
            aria-hidden="true"
            className="h-14 w-auto"
            style={{ filter: GREEN_FILTER, mixBlendMode: "screen" }}
          />
          <img
            src="https://res.cloudinary.com/dr8adq7nl/image/upload/e_trim:10/v1778965083/IMG_0771_a3c6az.png"
            alt="Unhinged Development Group"
            className="h-auto w-52 sm:w-64"
            style={{ filter: "invert(1)", mixBlendMode: "screen" }}
          />
        </div>
      )}

      {company !== "unhinged-development" && (
        <div className="mb-10">
          <p className="text-xs font-medium tracking-[0.2em] text-unhinged-green uppercase mb-1">{content.tagline}</p>
        </div>
      )}

      <section className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px w-6 bg-unhinged-green" />
          <span className="text-xs font-medium tracking-[0.2em] text-unhinged-green uppercase">Mission</span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">{content.mission}</p>
      </section>

      <section className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px w-6 bg-unhinged-green" />
          <span className="text-xs font-medium tracking-[0.2em] text-unhinged-green uppercase">Vision</span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">{content.vision}</p>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-6 bg-unhinged-green" />
          <span className="text-xs font-medium tracking-[0.2em] text-unhinged-green uppercase">Values</span>
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
