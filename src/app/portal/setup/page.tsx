"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AccountSetup() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [company, setCompany] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function initFromUser(user: { user_metadata?: Record<string, string> }) {
      const uc = user.user_metadata?.company ?? "";
      setCompany(uc === "all" ? "unhinged-development" : uc);
      setFullName(user.user_metadata?.full_name ?? "");
      setReady(true);
    }

    // createBrowserClient automatically exchanges the invite token from the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) initFromUser(session.user as Parameters<typeof initFromUser>[0]);
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) initFromUser(user as Parameters<typeof initFromUser>[0]);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
      data: { full_name: fullName || null },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(`/portal/${company}`);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-unhinged-green" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="text-xs font-semibold tracking-widest text-zinc-600 uppercase">UDG Team Portal</span>
      </nav>

      <div className="flex flex-1 items-center justify-center px-4 pb-20">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-6 bg-unhinged-green" />
              <span className="text-xs font-medium tracking-[0.2em] text-unhinged-green uppercase">Welcome</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Set up your account</h1>
            <p className="mt-1 text-sm text-zinc-500">Confirm your name and choose a password to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
                placeholder="Repeat password"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-unhinged-green to-ember py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving…" : "Set up account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
