import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageFooter from "@/components/PageFooter";

export const metadata: Metadata = {
  title: "Who We Are — Unhinged Development Group",
  description: "A small, independent software development company based out of Glasgow, Scotland. We build products we genuinely believe in.",
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
              A small, independent software development company based out of Glasgow, Scotland.
              We build products we genuinely believe in and we put our heart &amp; soul into every one of them.
            </p>
            <p>
              Our products focus on specific markets and are created to solve problems we have experienced first hand.
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
