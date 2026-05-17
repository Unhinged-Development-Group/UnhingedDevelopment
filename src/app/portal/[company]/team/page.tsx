"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient, COMPANY_LABELS, type CompanyKey } from "@/lib/supabase";
import { DOMAIN_COMPANY_MAP } from "@/lib/auth";

const G = {
  cream: "#F9F8F4",
  deepSlate: "#2C3E50",
  gold: "#EAE45C",
  sage: "#88A096",
  pebble: "#95A5A6",
  terracotta: "#C87964",
};

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  job_role: string | null;
  avatar_url: string | null;
};

type DisplayMember = {
  key: string;
  profileId: string;
  email: string;
  full_name: string | null;
  job_role: string | null;
  avatar_url: string | null;
  isAdminMember: boolean;
  membershipId: string | null;
};

function memberInitials(email: string, full_name: string | null) {
  if (full_name) return full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

function memberDisplayName(email: string, full_name: string | null) {
  return full_name || email.split("@")[0];
}

export default function TeamPage() {
  const params = useParams();
  const company = params.company as CompanyKey;
  const isGroomr = company === "groomr";

  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<DisplayMember[]>([]);
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

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminProfiles, setAdminProfiles] = useState<Profile[]>([]);
  const [adminPickId, setAdminPickId] = useState("");
  const [adminDisplayEmail, setAdminDisplayEmail] = useState("");
  const [adminDisplayName, setAdminDisplayName] = useState("");
  const [adminDisplayRole, setAdminDisplayRole] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminResult, setAdminResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [editingMembershipId, setEditingMembershipId] = useState<string | null>(null);
  const [editMembershipEmail, setEditMembershipEmail] = useState("");
  const [editMembershipName, setEditMembershipName] = useState("");
  const [editMembershipRole, setEditMembershipRole] = useState("");
  const [savingMembership, setSavingMembership] = useState(false);

  const [confirmRemoveMembershipId, setConfirmRemoveMembershipId] = useState<string | null>(null);
  const [removingMembership, setRemovingMembership] = useState(false);

  const supabase = createClient();

  const loadMembers = useCallback(async () => {
    setLoading(true);

    const [{ data: regularProfiles }, { data: memberships }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, job_role, avatar_url")
        .eq("company", company)
        .order("full_name", { ascending: true, nullsFirst: false }),
      supabase
        .from("company_memberships")
        .select("id, display_email, display_name, job_role, profile_id, profiles(id, email, full_name, avatar_url)")
        .eq("company", company),
    ]);

    const regular: DisplayMember[] = (regularProfiles ?? []).map((p) => ({
      key: `profile-${p.id}`,
      profileId: p.id,
      email: p.email,
      full_name: p.full_name,
      job_role: p.job_role,
      avatar_url: p.avatar_url,
      isAdminMember: false,
      membershipId: null,
    }));

    const adminMembers: DisplayMember[] = (memberships ?? []).map((m) => {
      const profile = (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) as Profile | null;
      return {
        key: `membership-${m.id}`,
        profileId: m.profile_id,
        email: m.display_email || profile?.email || "",
        full_name: m.display_name || profile?.full_name || null,
        job_role: m.job_role || null,
        avatar_url: profile?.avatar_url || null,
        isAdminMember: true,
        membershipId: m.id,
      };
    });

    const combined = [...regular, ...adminMembers].sort((a, b) =>
      (a.full_name || a.email).localeCompare(b.full_name || b.email)
    );

    setMembers(combined);
    setLoading(false);
  }, [supabase, company]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const admin = user?.user_metadata?.company === "all";
      setIsAdmin(admin);
      setCurrentUserId(user?.id ?? null);
      await loadMembers();
    })();
  }, [supabase, loadMembers]);

  async function saveRole(profileId: string) {
    setSavingRole(true);
    await supabase.from("profiles").update({ job_role: editRole || null }).eq("id", profileId);
    setSavingRole(false);
    setEditingId(null);
    await loadMembers();
  }

  async function deleteMember(profileId: string) {
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/admin/team/${profileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    setDeleting(false);
    setConfirmDeleteId(null);
    await loadMembers();
  }

  function openInviteModal() {
    setInviteResult(null);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("");
    setShowInviteModal(true);
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
      setInviteName(""); setInviteEmail(""); setInviteRole("");
      setTimeout(() => { setShowInviteModal(false); setInviteResult(null); }, 1500);
    } else {
      setInviteResult({ ok: false, message: json.error ?? "Something went wrong." });
    }
    setInviting(false);
  }

  async function openAdminModal() {
    setAdminResult(null);
    setAdminPickId("");
    setAdminDisplayEmail("");
    setAdminDisplayName("");
    setAdminDisplayRole("");
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, job_role, avatar_url")
      .eq("company", "all")
      .order("full_name", { ascending: true, nullsFirst: false });
    setAdminProfiles(data ?? []);
    setShowAdminModal(true);
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!adminPickId) return;
    setAddingAdmin(true);
    setAdminResult(null);
    const { error } = await supabase.from("company_memberships").upsert({
      profile_id: adminPickId,
      company,
      display_email: adminDisplayEmail || null,
      display_name: adminDisplayName || null,
      job_role: adminDisplayRole || null,
    }, { onConflict: "profile_id,company" });
    if (error) {
      setAdminResult({ ok: false, message: error.message });
    } else {
      setAdminResult({ ok: true, message: "Admin member added." });
      await loadMembers();
      setTimeout(() => { setShowAdminModal(false); setAdminResult(null); }, 1200);
    }
    setAddingAdmin(false);
  }

  function startEditMembership(member: DisplayMember) {
    setEditingMembershipId(member.membershipId);
    setEditMembershipEmail(member.email);
    setEditMembershipName(member.full_name ?? "");
    setEditMembershipRole(member.job_role ?? "");
  }

  async function saveEditMembership() {
    if (!editingMembershipId) return;
    setSavingMembership(true);
    await supabase.from("company_memberships").update({
      display_email: editMembershipEmail || null,
      display_name: editMembershipName || null,
      job_role: editMembershipRole || null,
    }).eq("id", editingMembershipId);
    setSavingMembership(false);
    setEditingMembershipId(null);
    await loadMembers();
  }

  async function removeAdminMembership(membershipId: string) {
    setRemovingMembership(true);
    await supabase.from("company_memberships").delete().eq("id", membershipId);
    setRemovingMembership(false);
    setConfirmRemoveMembershipId(null);
    await loadMembers();
  }

  // ── Shared style helpers ────────────────────────────────────────────────────

  const inputStyle = isGroomr ? {
    width: "100%", borderRadius: "12px",
    border: `1px solid rgba(149,165,166,0.45)`,
    backgroundColor: G.cream, padding: "12px 16px",
    fontSize: "14px", color: G.deepSlate,
  } : undefined;

  const saveButtonStyle = isGroomr ? {
    borderRadius: "12px", backgroundColor: G.gold,
    padding: "6px 10px", fontSize: "12px", fontWeight: 600, color: G.deepSlate,
  } : undefined;

  const cancelButtonStyle = isGroomr ? {
    borderRadius: "12px", border: `1px solid rgba(149,165,166,0.4)`,
    padding: "6px 10px", fontSize: "12px", color: G.deepSlate,
  } : undefined;

  return (
    <div
      className="max-w-4xl px-6 py-8 sm:px-10"
      style={isGroomr ? { backgroundColor: G.cream, minHeight: "100vh", fontFamily: "'Nunito', sans-serif" } : {}}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className={isGroomr ? "text-xl font-bold" : "text-xl font-bold text-white"}
            style={isGroomr ? { color: G.deepSlate } : {}}
          >
            Team
          </h1>
          <p
            className={isGroomr ? "mt-1 text-sm" : "mt-1 text-sm text-zinc-500"}
            style={isGroomr ? { color: G.sage } : {}}
          >
            {COMPANY_LABELS[company]}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={openAdminModal}
              className={isGroomr ? "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all" : "flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-ink-800/50 px-3 py-2 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:bg-ink-800 hover:text-zinc-200"}
              style={isGroomr ? { border: `1px solid rgba(149,165,166,0.4)`, backgroundColor: "white", color: G.deepSlate } : {}}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Add admin
            </button>
            <button
              onClick={openInviteModal}
              className={isGroomr ? "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all" : "flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-ink-800/50 px-3 py-2 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:bg-ink-800 hover:text-white"}
              style={isGroomr ? { border: `1px solid rgba(149,165,166,0.4)`, backgroundColor: G.gold, color: G.deepSlate } : {}}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Invite
            </button>
          </div>
        )}
      </div>

      {/* Member list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl"
              style={isGroomr ? { backgroundColor: "rgba(44,62,80,0.06)" } : { backgroundColor: "rgba(39,39,42,0.4)" }}
            />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
            style={isGroomr ? { backgroundColor: "rgba(149,165,166,0.12)" } : { backgroundColor: "rgb(39,39,42)" }}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: isGroomr ? G.pebble : "rgb(82,82,91)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: isGroomr ? G.sage : "rgb(113,113,122)" }}>No team members yet.</p>
          {isAdmin && <p className="mt-1 text-xs" style={{ color: isGroomr ? G.pebble : "rgb(82,82,91)" }}>Use the Invite button to add someone.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.key}
              className={isGroomr ? "group flex items-center gap-4 rounded-xl px-4 py-3 transition-all" : "group flex items-center gap-4 rounded-xl border border-zinc-900 bg-ink-800/40 px-4 py-3 transition-all hover:border-zinc-800 hover:bg-ink-800"}
              style={isGroomr ? { backgroundColor: "white", border: "1px solid rgba(149,165,166,0.2)" } : {}}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={isGroomr ? { backgroundColor: G.gold } : { backgroundColor: "rgb(210,255,20)" }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: G.deepSlate }}
                    >
                      {memberInitials(member.email, member.full_name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + email */}
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium"
                  style={{ color: isGroomr ? G.deepSlate : "rgb(228,228,231)" }}
                >
                  {memberDisplayName(member.email, member.full_name)}
                </p>
                <p
                  className="truncate text-xs"
                  style={{ color: isGroomr ? G.sage : "rgb(113,113,122)" }}
                >
                  {member.email}
                </p>
              </div>

              {/* Role + actions */}
              <div className="flex flex-shrink-0 items-center gap-2">
                {member.isAdminMember ? (
                  editingMembershipId === member.membershipId ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editMembershipRole}
                        onChange={(e) => setEditMembershipRole(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEditMembership(); if (e.key === "Escape") setEditingMembershipId(null); }}
                        placeholder="Job role"
                        className={isGroomr ? "w-32 rounded-lg px-2 py-1 text-xs focus:outline-none" : "w-32 rounded-lg border border-zinc-700 bg-ink-900 px-2 py-1 text-xs text-zinc-200 focus:border-unhinged-green/50 focus:outline-none"}
                        style={isGroomr ? { border: `1px solid rgba(149,165,166,0.45)`, backgroundColor: G.cream, color: G.deepSlate } : {}}
                      />
                      <button
                        onClick={saveEditMembership}
                        disabled={savingMembership}
                        className={isGroomr ? "rounded-lg px-2.5 py-1 text-xs font-semibold disabled:opacity-50" : "rounded-lg bg-unhinged-green px-2.5 py-1 text-xs font-semibold text-ink-950 hover:opacity-90 disabled:opacity-50"}
                        style={saveButtonStyle}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMembershipId(null)}
                        className={isGroomr ? "rounded-lg px-2.5 py-1 text-xs" : "rounded-lg border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"}
                        style={cancelButtonStyle}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : confirmRemoveMembershipId === member.membershipId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: isGroomr ? G.sage : "rgb(161,161,170)" }}>Remove from this team?</span>
                      <button
                        onClick={() => removeAdminMembership(member.membershipId!)}
                        disabled={removingMembership}
                        className={isGroomr ? "rounded-lg px-2.5 py-1 text-xs disabled:opacity-50" : "rounded-lg border border-red-900/50 bg-red-950/60 px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 disabled:opacity-50"}
                        style={isGroomr ? { border: `1px solid rgba(200,121,100,0.4)`, backgroundColor: "rgba(200,121,100,0.08)", color: G.terracotta } : {}}
                      >
                        {removingMembership ? "Removing…" : "Yes, remove"}
                      </button>
                      <button
                        onClick={() => setConfirmRemoveMembershipId(null)}
                        className={isGroomr ? "rounded-lg px-2.5 py-1 text-xs" : "rounded-lg border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"}
                        style={cancelButtonStyle}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      {member.job_role && (
                        <span
                          className={isGroomr ? "rounded-full px-2.5 py-0.5 text-xs" : "rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400"}
                          style={isGroomr ? { border: `1px solid rgba(149,165,166,0.35)`, color: G.sage } : {}}
                        >
                          {member.job_role}
                        </span>
                      )}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => startEditMembership(member)}
                            className={isGroomr ? "rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100" : "rounded-lg border border-zinc-800 p-1.5 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:border-zinc-700 hover:text-zinc-300"}
                            style={isGroomr ? { border: `1px solid rgba(149,165,166,0.35)`, color: G.pebble } : {}}
                            title="Edit membership"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmRemoveMembershipId(member.membershipId)}
                            className={isGroomr ? "rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100" : "rounded-lg border border-zinc-800 p-1.5 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400"}
                            style={isGroomr ? { border: `1px solid rgba(149,165,166,0.35)`, color: G.pebble } : {}}
                            title="Remove from team"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </>
                  )
                ) : (
                  editingId === member.profileId ? (
                    <>
                      <input
                        autoFocus
                        type="text"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveRole(member.profileId); if (e.key === "Escape") setEditingId(null); }}
                        placeholder="Job role"
                        className={isGroomr ? "w-32 rounded-lg px-2 py-1 text-xs focus:outline-none" : "w-32 rounded-lg border border-zinc-700 bg-ink-900 px-2 py-1 text-xs text-zinc-200 focus:border-unhinged-green/50 focus:outline-none"}
                        style={isGroomr ? { border: `1px solid rgba(149,165,166,0.45)`, backgroundColor: G.cream, color: G.deepSlate } : {}}
                      />
                      <button
                        onClick={() => saveRole(member.profileId)}
                        disabled={savingRole}
                        className={isGroomr ? "rounded-lg px-2.5 py-1 text-xs font-semibold disabled:opacity-50" : "rounded-lg bg-unhinged-green px-2.5 py-1 text-xs font-semibold text-ink-950 hover:opacity-90 disabled:opacity-50"}
                        style={saveButtonStyle}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={isGroomr ? "rounded-lg px-2.5 py-1 text-xs" : "rounded-lg border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"}
                        style={cancelButtonStyle}
                      >
                        Cancel
                      </button>
                    </>
                  ) : confirmDeleteId === member.profileId ? (
                    <>
                      <span className="text-xs" style={{ color: isGroomr ? G.sage : "rgb(161,161,170)" }}>Remove member?</span>
                      <button
                        onClick={() => deleteMember(member.profileId)}
                        disabled={deleting}
                        className={isGroomr ? "rounded-lg px-2.5 py-1 text-xs disabled:opacity-50" : "rounded-lg border border-red-900/50 bg-red-950/60 px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 disabled:opacity-50"}
                        style={isGroomr ? { border: `1px solid rgba(200,121,100,0.4)`, backgroundColor: "rgba(200,121,100,0.08)", color: G.terracotta } : {}}
                      >
                        {deleting ? "Removing…" : "Yes, remove"}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className={isGroomr ? "rounded-lg px-2.5 py-1 text-xs" : "rounded-lg border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"}
                        style={cancelButtonStyle}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {member.job_role ? (
                        <span
                          className={isGroomr ? "rounded-full px-2.5 py-0.5 text-xs" : "rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400"}
                          style={isGroomr ? { border: `1px solid rgba(149,165,166,0.35)`, color: G.sage } : {}}
                        >
                          {member.job_role}
                        </span>
                      ) : isAdmin ? (
                        <span className="text-xs" style={{ color: isGroomr ? "rgba(44,62,80,0.3)" : "rgb(63,63,70)" }}>No role</span>
                      ) : null}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => { setEditingId(member.profileId); setEditRole(member.job_role ?? ""); }}
                            className={isGroomr ? "rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100" : "rounded-lg border border-zinc-800 p-1.5 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:border-zinc-700 hover:text-zinc-300"}
                            style={isGroomr ? { border: `1px solid rgba(149,165,166,0.35)`, color: G.pebble } : {}}
                            title="Edit role"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          {member.profileId !== currentUserId && (
                            <button
                              onClick={() => setConfirmDeleteId(member.profileId)}
                              className={isGroomr ? "rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100" : "rounded-lg border border-zinc-800 p-1.5 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400"}
                              style={isGroomr ? { border: `1px solid rgba(149,165,166,0.35)`, color: G.pebble } : {}}
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
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite new member modal */}
      {showInviteModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={isGroomr
              ? { backgroundColor: "white", border: `1px solid rgba(149,165,166,0.3)`, fontFamily: "'Nunito', sans-serif" }
              : { backgroundColor: "rgb(9,9,11)", border: "1px solid rgb(39,39,42)" }
            }
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2
                  className="text-base font-semibold"
                  style={{ color: isGroomr ? G.deepSlate : "white" }}
                >
                  Invite team member
                </h2>
                <p className="mt-0.5 text-xs" style={{ color: isGroomr ? G.sage : "rgb(113,113,122)" }}>
                  {COMPANY_LABELS[company]}
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="rounded-lg p-1 transition-colors"
                style={{ color: isGroomr ? G.pebble : "rgb(113,113,122)" }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: isGroomr ? G.deepSlate : "rgb(161,161,170)" }}>Full name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jane Smith"
                  className={isGroomr ? "w-full rounded-xl px-4 py-3 text-sm focus:outline-none" : "w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"}
                  style={isGroomr ? { border: `1px solid rgba(149,165,166,0.4)`, backgroundColor: G.cream, color: G.deepSlate } : {}}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: isGroomr ? G.deepSlate : "rgb(161,161,170)" }}>Email address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className={isGroomr ? "w-full rounded-xl px-4 py-3 text-sm focus:outline-none" : "w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"}
                  style={isGroomr ? { border: `1px solid rgba(149,165,166,0.4)`, backgroundColor: G.cream, color: G.deepSlate } : {}}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: isGroomr ? G.deepSlate : "rgb(161,161,170)" }}>Job role</label>
                <input
                  type="text"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  placeholder="e.g. Developer"
                  className={isGroomr ? "w-full rounded-xl px-4 py-3 text-sm focus:outline-none" : "w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"}
                  style={isGroomr ? { border: `1px solid rgba(149,165,166,0.4)`, backgroundColor: G.cream, color: G.deepSlate } : {}}
                />
              </div>
              {inviteResult && (
                <p className="text-xs" style={{ color: inviteResult.ok ? (isGroomr ? G.sage : "rgb(210,255,20)") : (isGroomr ? G.terracotta : "rgb(248,113,113)") }}>
                  {inviteResult.message}
                </p>
              )}
              <button
                type="submit"
                disabled={inviting}
                className={isGroomr ? "w-full rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50" : "w-full rounded-xl bg-unhinged-green px-6 py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50"}
                style={isGroomr ? { backgroundColor: G.gold, color: G.deepSlate } : {}}
              >
                {inviting ? "Sending…" : "Send invite"}
              </button>
            </form>
            <p className="mt-3 text-xs" style={{ color: isGroomr ? "rgba(149,165,166,0.7)" : "rgb(63,63,70)" }}>
              Allowed domains: {Object.keys(DOMAIN_COMPANY_MAP).map((d) => `@${d}`).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Add admin member modal */}
      {showAdminModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdminModal(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={isGroomr
              ? { backgroundColor: "white", border: `1px solid rgba(149,165,166,0.3)`, fontFamily: "'Nunito', sans-serif" }
              : { backgroundColor: "rgb(9,9,11)", border: "1px solid rgb(39,39,42)" }
            }
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2
                  className="text-base font-semibold"
                  style={{ color: isGroomr ? G.deepSlate : "white" }}
                >
                  Add admin to team
                </h2>
                <p className="mt-0.5 text-xs" style={{ color: isGroomr ? G.sage : "rgb(113,113,122)" }}>
                  {COMPANY_LABELS[company]} — overrides show in this company only
                </p>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="rounded-lg p-1 transition-colors"
                style={{ color: isGroomr ? G.pebble : "rgb(113,113,122)" }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {adminProfiles.length === 0 ? (
              <p className="text-sm" style={{ color: isGroomr ? G.sage : "rgb(113,113,122)" }}>No admin profiles found.</p>
            ) : (
              <form onSubmit={handleAddAdmin} className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: isGroomr ? G.deepSlate : "rgb(161,161,170)" }}>Admin user</label>
                  <select
                    required
                    value={adminPickId}
                    onChange={(e) => setAdminPickId(e.target.value)}
                    className={isGroomr ? "w-full rounded-xl px-4 py-3 text-sm focus:outline-none" : "w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"}
                    style={isGroomr ? { border: `1px solid rgba(149,165,166,0.4)`, backgroundColor: G.cream, color: G.deepSlate } : {}}
                  >
                    <option value="">Select admin…</option>
                    {adminProfiles.map((p) => (
                      <option key={p.id} value={p.id}>{p.full_name || p.email} ({p.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: isGroomr ? G.deepSlate : "rgb(161,161,170)" }}>
                    Display email <span style={{ color: isGroomr ? G.pebble : "rgb(82,82,91)" }}>(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={adminDisplayEmail}
                    onChange={(e) => setAdminDisplayEmail(e.target.value)}
                    placeholder="andrew@groomr.uk"
                    className={isGroomr ? "w-full rounded-xl px-4 py-3 text-sm focus:outline-none" : "w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"}
                    style={isGroomr ? { border: `1px solid rgba(149,165,166,0.4)`, backgroundColor: G.cream, color: G.deepSlate } : {}}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: isGroomr ? G.deepSlate : "rgb(161,161,170)" }}>
                    Display name <span style={{ color: isGroomr ? G.pebble : "rgb(82,82,91)" }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={adminDisplayName}
                    onChange={(e) => setAdminDisplayName(e.target.value)}
                    placeholder="Andrew Hughes"
                    className={isGroomr ? "w-full rounded-xl px-4 py-3 text-sm focus:outline-none" : "w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"}
                    style={isGroomr ? { border: `1px solid rgba(149,165,166,0.4)`, backgroundColor: G.cream, color: G.deepSlate } : {}}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: isGroomr ? G.deepSlate : "rgb(161,161,170)" }}>Role at this company</label>
                  <input
                    type="text"
                    value={adminDisplayRole}
                    onChange={(e) => setAdminDisplayRole(e.target.value)}
                    placeholder="e.g. Founder"
                    className={isGroomr ? "w-full rounded-xl px-4 py-3 text-sm focus:outline-none" : "w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"}
                    style={isGroomr ? { border: `1px solid rgba(149,165,166,0.4)`, backgroundColor: G.cream, color: G.deepSlate } : {}}
                  />
                </div>
                {adminResult && (
                  <p className="text-xs" style={{ color: adminResult.ok ? (isGroomr ? G.sage : "rgb(210,255,20)") : (isGroomr ? G.terracotta : "rgb(248,113,113)") }}>
                    {adminResult.message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={addingAdmin || !adminPickId}
                  className={isGroomr ? "w-full rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50" : "w-full rounded-xl bg-unhinged-green px-6 py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50"}
                  style={isGroomr ? { backgroundColor: G.gold, color: G.deepSlate } : {}}
                >
                  {addingAdmin ? "Adding…" : "Add to team"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
