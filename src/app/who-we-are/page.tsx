import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageFooter from "@/components/PageFooter";

export const metadata: Metadata = {
  title: "Who We Are — Unhinged Development Group",
  description: "A Scottish venture studio building products differently. Parent company to Groomr Ltd and Paper & Ponder Ltd.",
};

export default function WhoWeArePage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <Navbar />

      <section className="relative z-10 flex-1 px-6 py-10 sm:px-10 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <p className="font-bitcount text-unhinged-green text-sm tracking-widest uppercase mb-6">
            Who we are
          </p>

          <h1 className="font-bitcount text-5xl sm:text-7xl font-medium text-white leading-tight mb-10">
            Built<br />differently.
          </h1>

          <div className="space-y-5 text-zinc-300 text-base sm:text-lg leading-relaxed">
            <p>
              Unhinged Development Group is a Scottish venture studio and holding company.
              We build products that move fast, cut waste, and actually solve real problems —
              no corporate overhead, no design-by-committee.
            </p>
            <p>
              We operate as a lean group of companies, each focused on a specific market.
              Direct ownership, fast iteration, and an uncompromising focus on shipping things
              that matter to the people who use them.
            </p>
            <p>
              Registered in Scotland, built everywhere.
            </p>
          </div>

          <div className="mt-16 pt-10 border-t border-zinc-900">
            <p className="font-bitcount text-zinc-500 text-sm tracking-widest uppercase mb-8">
              Our companies
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-ink-900 p-6 hover:border-zinc-700 transition-colors">
                <h3 className="font-bitcount text-2xl text-white mb-2">Groomr Ltd</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  A modern platform redefining the grooming experience.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-ink-900 p-6 hover:border-zinc-700 transition-colors">
                <h3 className="font-bitcount text-2xl text-white mb-2">Paper & Ponder Ltd</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Thoughtful products for people who still believe in putting pen to paper.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
