"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setStatus("success");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-unhinged-green/30 bg-unhinged-green/5 p-8 text-center">
        <p className="font-bitcount text-2xl font-light text-unhinged-green mb-2">Message sent.</p>
        <p className="text-zinc-400 text-sm">We&apos;ll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-xs text-zinc-500 uppercase tracking-widest mb-1.5">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          className="w-full rounded-xl border border-zinc-800 bg-ink-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-unhinged-green/50 focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs text-zinc-500 uppercase tracking-widest mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-xl border border-zinc-800 bg-ink-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-unhinged-green/50 focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs text-zinc-500 uppercase tracking-widest mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us what's on your mind…"
          className="w-full rounded-xl border border-zinc-800 bg-ink-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-unhinged-green/50 focus:outline-none transition-colors resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-unhinged-green px-6 py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
