"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient, COMPANY_LABELS, type CompanyKey } from "@/lib/supabase";
import { DOMAIN_COMPANY_MAP } from "@/lib/auth";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  job_role: string | null;
  avatar_url: string | null;
};

function memberInitials(p: Profile) {
  if (p.full_name) return p.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return p.email.split("@")[0].slice(0, 2).toUpperCase();
}

function memberDisplayName(p: Profile) {
  return p.full_name || p.email.split("@")[0];
}

export default function TeamPage() {
  const params = useParams();
  const company = params.company as CompanyKey;

  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; message: string } | null>(null);

  const supabase = createClient();

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, job_role, avatar_url")
      .eq("company", company)
      .order("full_name", { ascending: true, nullsFirst: false });
    setMembers(data ?? []);
    setLoading(false);
  }, [supabase, company]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.user_metadata?.company === "all");
      setCurrentUserId(user?.id ?? null);
      await loadMembers();
    })();
  }, [supabase, loadMembers]);

  async function saveRole(id: string) {
    setSavingRole(true);
    await supabase.from("profiles").update({ job_role: editRole || null }).eq("id", id);
    setSavingRole(false);
    setEditingId(null);
    await loadMembers();
  }

  async function deleteMember(id: string) {
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/admin/team/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    setDeleting(false);
    setConfirmDeleteId(null);
    await loadMembers();
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteResult(null);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ email: inviteEmail, full_name: inviteName, job_role: inviteRole, company }),
    });
    const json = await res.json();
    if (res.ok) {
      setInviteResult({ ok: true, message: `Invite sent to ${inviteEmail}.` });
      setInviteName("");
      setInviteEmail("");
      setInviteRole("");
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteResult(null);
      }, 1500);
    } else {
      setInviteResult({ ok: false, message: json.error ?? "Something went wrong." });
    }
    setInviting(false);
  }

  function openInviteModal() {
    setInviteResult(null);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("");
    setShowInviteModal(true);
  }

  return (
    <div className="max-w-4xl px-6 py-8 sm:px-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Team</h1>
          <p className="mt-1 text-sm text-zinc-500">{COMPANY_LABELS[company]}</p>
        </div>
        {isAdmin && (
          <button
            onClick={openInviteModal}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-ink-800/50 px-3 py-2 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:bg-ink-800 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite
          </button>
        )}
      </div>

      {/* Member list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-ink-800" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-800">
            <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm text-zinc-500">No team members yet.</p>
          {isAdmin && <p className="mt-1 text-xs text-zinc-600">Use the Invite button to add someone.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="group flex items-center gap-4 rounded-xl border border-zinc-900 bg-ink-800/40 px-4 py-3 transition-all hover:border-zinc-800 hover:bg-ink-800"
            >
              <div className="flex-shrink-0">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-unhinged-green">
                    <span className="text-sm font-bold text-ink-950">{memberInitials(member)}</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-200">{memberDisplayName(member)}</p>
                <p className="truncate text-xs text-zinc-500">{member.email}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {editingId === member.id ? (
                  <>
                    <input
                      autoFocus
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveRole(member.id); if (e.key === "Escape") setEditingId(null); }}
                      placeholder="Job role"
                      className="w-32 rounded-lg border border-zinc-700 bg-ink-900 px-2 py-1 text-xs text-zinc-200 focus:border-unhinged-green/50 focus:outline-none"
                    />
                    <button onClick={() => saveRole(member.id)} disabled={savingRole}
                      className="rounded-lg bg-unhinged-green px-2.5 py-1 text-xs font-semibold text-ink-950 hover:opacity-90 disabled:opacity-50">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="rounded-lg border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200">
                      Cancel
                    </button>
                  </>
                ) : confirmDeleteId === member.id ? (
                  <>
                    <span className="text-xs text-zinc-400">Remove member?</span>
                    <button onClick={() => deleteMember(member.id)} disabled={deleting}
                      className="rounded-lg border border-red-900/50 bg-red-950/60 px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 disabled:opacity-50">
                      {deleting ? "Removing…" : "Yes, remove"}
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)}
                      className="rounded-lg border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {member.job_role ? (
                      <span className="rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                        {member.job_role}
                      </span>
                    ) : isAdmin ? (
                      <span className="text-xs text-zinc-700">No role</span>
                    ) : null}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => { setEditingId(member.id); setEditRole(member.job_role ?? ""); }}
                          className="rounded-lg border border-zinc-800 p-1.5 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:border-zinc-700 hover:text-zinc-300"
                          title="Edit role"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {member.id !== currentUserId && (
                          <button
                            onClick={() => setConfirmDeleteId(member.id)}
                            className="rounded-lg border border-zinc-800 p-1.5 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400"
                            title="Remove member"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite modal */}
      {showInviteModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-ink-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Invite team member</h2>
                <p className="mt-0.5 text-xs text-zinc-500">{COMPANY_LABELS[company]}</p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="rounded-lg p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Full name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Email address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Job role</label>
                <input
                  type="text"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  placeholder="e.g. Developer"
                  className="w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
                />
              </div>

              {inviteResult && (
                <p className={`text-xs ${inviteResult.ok ? "text-unhinged-green" : "text-red-400"}`}>
                  {inviteResult.message}
                </p>
              )}

              <button
                type="submit"
                disabled={inviting}
                className="w-full rounded-xl bg-unhinged-green px-6 py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {inviting ? "Sending…" : "Send invite"}
              </button>
            </form>

            <p className="mt-3 text-xs text-zinc-700">
              Allowed domains: {Object.keys(DOMAIN_COMPANY_MAP).map((d) => `@${d}`).join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
