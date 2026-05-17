"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function CompanyDashboard() {
  const params = useParams();
  const company = params.company as string;
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/portal"); return; }
      const uc = user.user_metadata?.company as string;
      if (uc !== "all") {
        router.replace(`/portal/${company}/documents`);
        return;
      }
      setReady(true);
    })();
  }, [company, router]);

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
      {/* Logo + Wordmark */}
      <div className="mb-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
        <img
          src="https://res.cloudinary.com/dr8adq7nl/image/upload/v1778965077/IMG_0772_l4ddjj.png"
          alt=""
          aria-hidden="true"
          className="h-14 w-auto"
          style={{
            filter: "invert(1) brightness(0.6) sepia(1) saturate(3000%) hue-rotate(35deg) brightness(1.3)",
            mixBlendMode: "screen",
          }}
        />
        <img
          src="https://res.cloudinary.com/dr8adq7nl/image/upload/e_trim:10/v1778965083/IMG_0771_a3c6az.png"
          alt="Unhinged Development Group"
          className="h-auto w-52 sm:w-64"
          style={{ filter: "invert(1)", mixBlendMode: "screen" }}
        />
      </div>

      {/* Mission */}
      <section className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px w-6 bg-unhinged-green" />
          <span className="text-xs font-medium tracking-[0.2em] text-unhinged-green uppercase">Mission</span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          To build a portfolio of companies that solve real problems with thoughtful design, bold technology, and a relentless focus on the people who use them.
        </p>
      </section>

      {/* Vision */}
      <section className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px w-6 bg-unhinged-green" />
          <span className="text-xs font-medium tracking-[0.2em] text-unhinged-green uppercase">Vision</span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          A group of companies known for moving fast, building things that last, and proving that small teams can punch well above their weight.
        </p>
      </section>

      {/* Values */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-6 bg-unhinged-green" />
          <span className="text-xs font-medium tracking-[0.2em] text-unhinged-green uppercase">Values</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { name: "Build boldly", description: "Ship things worth talking about. Avoid the safe, forgettable middle." },
            { name: "Own it", description: "Every person takes full responsibility for their work, start to finish." },
            { name: "Keep it real", description: "Honest communication, no politics, no bullshit." },
          ].map((v) => (
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
