"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import UDGIcon from "@/components/UDGIcon";

const G = {
  cream: "#F9F8F4",
  deepSlate: "#2C3E50",
  gold: "#EAE45C",
  sage: "#88A096",
  pebble: "#95A5A6",
  terracotta: "#C87964",
};

const PP = {
  alabaster: "#fafaf9",
  charcoal: "#1c1917",
  deepClay: "#7c2d12",
  terracotta: "#fb923c",
  stone200: "#e7e5e4",
  stone500: "#78716c",
};

type BrandTheme = {
  bg: string; font: string;
  textH: string; textMuted: string;
  cardBg: string; cardBorder: string;
  avatarBg: string; avatarText: string;
  spinnerBorder: string; spinnerTop: string;
  inputBg: string; inputBorder: string; inputText: string;
  labelColor: string;
  primaryBg: string; primaryText: string;
  signOutBorder: string; signOutText: string;
  successText: string; errorText: string;
};

const GROOMR_THEME: BrandTheme = {
  bg: G.cream, font: "'Nunito', sans-serif",
  textH: G.deepSlate, textMuted: G.sage,
  cardBg: "white", cardBorder: "rgba(149,165,166,0.25)",
  avatarBg: G.gold, avatarText: G.deepSlate,
  spinnerBorder: "rgba(44,62,80,0.15)", spinnerTop: G.gold,
  inputBg: G.cream, inputBorder: "rgba(149,165,166,0.4)", inputText: G.deepSlate,
  labelColor: G.sage,
  primaryBg: G.gold, primaryText: G.deepSlate,
  signOutBorder: "rgba(149,165,166,0.35)", signOutText: G.sage,
  successText: G.sage, errorText: G.terracotta,
};

const PP_THEME: BrandTheme = {
  bg: PP.alabaster, font: "'Montserrat', sans-serif",
  textH: PP.charcoal, textMuted: PP.stone500,
  cardBg: "white", cardBorder: PP.stone200,
  avatarBg: PP.terracotta, avatarText: "#ffffff",
  spinnerBorder: "rgba(28,25,23,0.08)", spinnerTop: PP.terracotta,
  inputBg: "white", inputBorder: PP.stone200, inputText: PP.charcoal,
  labelColor: PP.stone500,
  primaryBg: PP.deepClay, primaryText: "#ffffff",
  signOutBorder: PP.stone200, signOutText: PP.stone500,
  successText: PP.deepClay, errorText: PP.terracotta,
};

export default function AccountPage() {
  const router = useRouter();
  const params = useParams();
  const company = params.company as string;
  const isGroomr = company === "groomr";
  const isPP = company === "paper-and-ponder";
  const theme: BrandTheme | null = isGroomr ? GROOMR_THEME : isPP ? PP_THEME : null;
  const accentColor = isGroomr ? G.gold : isPP ? PP.terracotta : "#D2FF14";
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

  const inputStyle = theme ? { border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.inputText } : {};
  const inputClass = theme
    ? "w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
    : "w-full rounded-xl border border-zinc-800 bg-ink-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors";

  return (
    <div
      className="w-full px-6 py-10 sm:px-10"
      style={theme ? { backgroundColor: theme.bg, minHeight: "100vh", fontFamily: theme.font } : {}}
    >
      <h1
        className={theme ? "mb-8 text-xl font-bold" : "mb-8 text-xl font-bold text-white"}
        style={theme ? { color: theme.textH } : {}}
      >
        Account
      </h1>

      {/* Avatar */}
      <div className="mb-10 flex items-center gap-5">
        <button onClick={() => fileRef.current?.click()} className="relative flex-shrink-0 group" disabled={uploadingAvatar}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-800 transition-all" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full ring-2 ring-zinc-800 transition-all"
              style={theme ? { backgroundColor: theme.avatarBg } : { backgroundColor: "rgb(210,255,20)" }}>
              <span className="text-2xl font-bold"
                style={{ color: theme ? theme.avatarText : "#09090b" }}>
                {user.initials}
              </span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <UDGIcon name="camera" className="h-6 w-6 text-white" mainColor="white" accentColor={accentColor} />
          </div>
          {uploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
              <div className="h-5 w-5 animate-spin rounded-full border-2"
                style={theme
                  ? { borderColor: theme.spinnerBorder, borderTopColor: theme.spinnerTop }
                  : { borderColor: "rgb(82,82,91)", borderTopColor: "rgb(210,255,20)" }
                }
              />
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        <div>
          <p className="font-medium" style={{ color: theme ? theme.textH : "rgb(228,228,231)" }}>{user.email}</p>
          <p className="mt-0.5 text-xs" style={{ color: theme ? theme.textMuted : "rgb(82,82,91)" }}>Click your photo to update it</p>
        </div>
      </div>

      {/* Change password */}
      <div
        className="mb-10 rounded-2xl p-6"
        style={theme
          ? { backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }
          : { backgroundColor: "rgba(39,39,42,0.4)", border: "1px solid rgb(24,24,27)" }
        }
      >
        <h2 className="mb-5 text-sm font-semibold" style={{ color: theme ? theme.textH : "rgb(212,212,216)" }}>
          Change password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: theme ? theme.labelColor : "rgb(161,161,170)" }}>
              New password
            </label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8}
              className={inputClass} style={inputStyle} placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: theme ? theme.labelColor : "rgb(161,161,170)" }}>
              Confirm password
            </label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
              className={inputClass} style={inputStyle} placeholder="Repeat new password" />
          </div>
          {pwStatus && (
            <p className="text-xs" style={{ color: pwStatus.ok ? (theme ? theme.successText : "rgb(210,255,20)") : (theme ? theme.errorText : "rgb(248,113,113)") }}>
              {pwStatus.message}
            </p>
          )}
          <button type="submit" disabled={savingPw}
            className={theme ? "w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50" : "w-full rounded-xl bg-unhinged-green py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50"}
            style={theme ? { backgroundColor: theme.primaryBg, color: theme.primaryText } : {}}>
            {savingPw ? "Saving…" : "Update password"}
          </button>
        </form>
      </div>

      {/* Sign out */}
      <button onClick={handleSignOut}
        className={theme ? "w-full rounded-xl py-3 text-sm font-medium transition-all" : "w-full rounded-xl border border-zinc-800 py-3 text-sm font-medium text-zinc-400 transition-all hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400"}
        style={theme ? { border: `1px solid ${theme.signOutBorder}`, color: theme.signOutText } : {}}>
        Sign out
      </button>
    </div>
  );
}
