"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AccountPage() {
  const router = useRouter();
  const params = useParams();
  const company = params.company as string;
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<{ id: string; email: string; avatarUrl?: string; initials: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/portal"); return; }
      setUser({
        id: user.id,
        email: user.email ?? "",
        avatarUrl: user.user_metadata?.avatar_url,
        initials: (user.email ?? "").split("@")[0].slice(0, 2).toUpperCase(),
      });
    })();
  }, [router, supabase]);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus({ ok: false, message: "Passwords don't match." });
      return;
    }
    if (newPassword.length < 8) {
      setPwStatus({ ok: false, message: "Password must be at least 8 characters." });
      return;
    }
    setSavingPw(true);
    setPwStatus(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwStatus(error ? { ok: false, message: error.message } : { ok: true, message: "Password updated." });
    if (!error) { setNewPassword(""); setConfirmPassword(""); }
    setSavingPw(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { setUploadingAvatar(false); return; }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
    setUser(u => u ? { ...u, avatarUrl } : u);
    setUploadingAvatar(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/portal");
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-6 py-10 sm:px-10">
      <h1 className="mb-8 text-xl font-bold text-white">Account</h1>

      {/* Avatar */}
      <div className="mb-10 flex items-center gap-5">
        <button onClick={() => fileRef.current?.click()} className="relative flex-shrink-0 group" disabled={uploadingAvatar}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-800 group-hover:ring-unhinged-green/50 transition-all" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-unhinged-green ring-2 ring-zinc-800 group-hover:ring-unhinged-green/50 transition-all">
              <span className="text-2xl font-bold text-ink-950">{user.initials}</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          {uploadingAvatar && <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60"><div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-unhinged-green" /></div>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        <div>
          <p className="font-medium text-zinc-200">{user.email}</p>
          <p className="mt-0.5 text-xs text-zinc-600">Click your photo to update it</p>
        </div>
      </div>

      {/* Change password */}
      <div className="mb-10 rounded-2xl border border-zinc-900 bg-ink-800/40 p-6">
        <h2 className="mb-5 text-sm font-semibold text-zinc-300">Change password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">New password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8}
              className="w-full rounded-xl border border-zinc-800 bg-ink-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
              placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Confirm password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
              className="w-full rounded-xl border border-zinc-800 bg-ink-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
              placeholder="Repeat new password" />
          </div>
          {pwStatus && <p className={`text-xs ${pwStatus.ok ? "text-unhinged-green" : "text-red-400"}`}>{pwStatus.message}</p>}
          <button type="submit" disabled={savingPw}
            className="w-full rounded-xl bg-unhinged-green py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50">
            {savingPw ? "Saving…" : "Update password"}
          </button>
        </form>
      </div>

      {/* Sign out */}
      <button onClick={handleSignOut}
        className="w-full rounded-xl border border-zinc-800 py-3 text-sm font-medium text-zinc-400 transition-all hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400">
        Sign out
      </button>
    </div>
  );
}
