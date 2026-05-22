import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageFooter from "@/components/PageFooter";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Unhinged Development Group",
  description: "Get in touch with Unhinged Development Group.",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <Navbar />

      <section className="relative z-10 flex-1 px-6 py-10 sm:px-10 lg:px-16">
        <div className="max-w-xl mx-auto">
          <p className="font-bitcount font-light text-unhinged-green text-sm tracking-widest uppercase mb-6">
            Contact us
          </p>

          <h1 className="font-bitcount text-5xl sm:text-6xl font-light text-white leading-tight mb-4">
            Let&apos;s talk<span className="text-unhinged-green">.</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mb-10">
            Got a project in mind, a question, or just want to say hello? Drop us a message.
          </p>

          <ContactForm />
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
