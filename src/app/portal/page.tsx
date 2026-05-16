"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { isValidEmailForCompany } from "@/lib/auth";

export default function PortalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const company = data.user?.user_metadata?.company ?? "";
    if (!isValidEmailForCompany(email, company)) {
      await supabase.auth.signOut();
      setError("Your email address is not authorised for this account.");
      setLoading(false);
      return;
    }

    const destination = company === "all" ? "/portal/unhinged-development/documents" : `/portal/${company}/documents`;
    router.push(destination);
  }

  async function handleMagicLink() {
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/portal/dashboard` },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  }

  if (magicLinkSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-unhinged-green/10">
            <svg className="h-6 w-6 text-unhinged-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-white">Check your email</h2>
          <p className="text-sm text-zinc-400">
            We sent a secure sign-in link to <strong className="text-zinc-200">{email}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <span className="text-xs font-semibold tracking-widest text-zinc-600 uppercase">UDG Staff Portal</span>
      </nav>

      {/* Login form */}
      <div className="flex flex-1 items-center justify-center px-4 pb-20">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-6 bg-unhinged-green" />
              <span className="text-xs font-medium tracking-[0.2em] text-unhinged-green uppercase">Secure Access</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Staff Portal</h1>
            <p className="mt-1 text-sm text-zinc-500">Access company documents and resources.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-unhinged-green to-ember py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-xs text-zinc-600">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Magic link */}
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full rounded-xl border border-zinc-800 bg-ink-800 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:text-white disabled:opacity-50"
            >
              Send magic link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
