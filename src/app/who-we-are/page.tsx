import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageFooter from "@/components/PageFooter";

export const metadata: Metadata = {
  title: "Who We Are — Unhinged Development Group",
  description: "Founded in 2026 in Glasgow, Scotland. A small, independent software company building products rooted in problems we've lived ourselves.",
};

export default function WhoWeArePage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <Navbar />

      <section className="relative z-10 flex-1 px-6 py-10 sm:px-10 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <p className="font-bitcount font-light text-unhinged-green text-sm tracking-widest uppercase mb-6">
            Who we are
          </p>

          <h1 className="font-bitcount text-5xl sm:text-7xl font-light text-white leading-tight mb-10">
            Built<br />differently.
          </h1>

          <div className="space-y-5 text-zinc-300 text-base sm:text-lg leading-relaxed">
            <p>
              Founded in 2026 out of necessity — and a fair amount of spare time — Unhinged Development Group
              is a small, independent software company based in Glasgow, Scotland.
            </p>
            <p>
              We started building during a period of unemployment. No investors, no grand plan — just a genuine
              frustration with problems that hadn&apos;t been solved well, and the skills to do something about it.
            </p>
            <p>
              Everything we build is focused on a specific market and rooted in problems we&apos;ve lived ourselves.
              We care about the details and we&apos;re not interested in shipping something we wouldn&apos;t use.
            </p>
            <p>
              Registered in Scotland. Built for the world.
            </p>
          </div>

        </div>
      </section>

      <PageFooter />
    </main>
  );
}
