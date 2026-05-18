import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageFooter from "@/components/PageFooter";

export const metadata: Metadata = {
  title: "Projects — Unhinged Development Group",
  description: "The companies and products built by Unhinged Development Group.",
};

const projects = [
  {
    name: "Groomr.",
    slug: "groomr",
    status: "In Development",
    launch: "August 2027",
    description:
      "A booking and service platform built for the grooming industry. Groomr connects clients with professionals and gives salons and independent groomers the tools to run their business without the faff.",
    tags: ["Platform", "B2C", "Service"],
  },
  {
    name: "Paper & Ponder",
    slug: "paper-and-ponder",
    status: "In Development",
    launch: "September 2027",
    description:
      "Stationery and creative tools for people who still reach for a pen. Paper & Ponder is built around the belief that analogue thinking deserves products made with the same care and intention.",
    tags: ["Consumer", "E-commerce", "Creative"],
  },
];

export default function ProjectsPage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <Navbar />

      <section className="relative z-10 flex-1 px-6 py-10 sm:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <p className="font-bitcount font-light text-unhinged-green text-sm tracking-widest uppercase mb-6">
            Projects
          </p>

          <h1 className="font-bitcount text-5xl sm:text-7xl font-light text-white leading-tight mb-12">
            What we&apos;re<br />building.
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {projects.map((project) => (
              <article
                key={project.slug}
                className="group rounded-2xl border border-zinc-800 bg-ink-900 p-7 flex flex-col gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bitcount text-2xl sm:text-3xl font-light text-white">
                    {project.name}
                  </h2>
                  <span className="mt-1 shrink-0 inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-1 text-xs text-zinc-400">
                    <span className="h-1 w-1 rounded-full bg-zinc-500" />
                    {project.status}
                  </span>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed flex-1">
                  {project.description}
                </p>

                <p className="text-xs text-zinc-600">
                  Expected launch — {project.launch}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs text-zinc-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
