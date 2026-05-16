"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, COMPANY_LABELS, type CompanyKey } from "@/lib/supabase";
import { DOMAIN_COMPANY_MAP } from "@/lib/auth";

type FileObject = {
  name: string;
  metadata: { size: number; mimetype: string; lastModified?: string } | null;
  created_at?: string;
};

const BUCKET = "documents";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mime }: { mime: string }) {
  if (mime?.includes("pdf"))
    return (
      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  if (mime?.includes("image"))
    return (
      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  return (
    <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [userCompany, setUserCompany] = useState<CompanyKey | "all">("all");
  const [activeCompany, setActiveCompany] = useState<CompanyKey | "all">("all");
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCompany, setInviteCompany] = useState<CompanyKey>("unhinged-development");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; message: string } | null>(null);

  const supabase = createClient();

  const loadFiles = useCallback(
    async (company: CompanyKey | "all") => {
      setLoading(true);
      setFiles([]);

      const folders =
        company === "all"
          ? (Object.keys(COMPANY_LABELS) as CompanyKey[])
          : [company];

      const allFiles: FileObject[] = [];
      for (const folder of folders) {
        const { data } = await supabase.storage.from(BUCKET).list(folder, {
          sortBy: { column: "created_at", order: "desc" },
        });
        if (data) {
          allFiles.push(
            ...data
              .filter((f) => f.name !== ".emptyFolderPlaceholder")
              .map((f) => ({ ...f, _folder: folder } as FileObject & { _folder: string }))
          );
        }
      }

      setFiles(allFiles);
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/portal");
        return;
      }

      setUser({ email: user.email });
      // company comes from user metadata set by admin
      const company = (user.user_metadata?.company as CompanyKey) ?? "all";
      setUserCompany(company);
      setActiveCompany(company);
      await loadFiles(company);
    })();
  }, [router, supabase, loadFiles]);

  async function getSignedUrl(folder: string, name: string) {
    const key = `${folder}/${name}`;
    if (signedUrls[key]) return signedUrls[key];

    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(key, 60 * 5); // 5 min expiry

    if (data?.signedUrl) {
      setSignedUrls((prev) => ({ ...prev, [key]: data.signedUrl }));
      return data.signedUrl;
    }
    return null;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || activeCompany === "all") return;
    setUploading(true);

    const path = `${activeCompany}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);

    if (!error) await loadFiles(activeCompany);
    setUploading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/portal");
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteResult(null);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ email: inviteEmail, company: inviteCompany }),
    });

    const json = await res.json();
    if (res.ok) {
      setInviteResult({ ok: true, message: `Invite sent to ${inviteEmail}.` });
      setInviteEmail("");
    } else {
      setInviteResult({ ok: false, message: json.error ?? "Something went wrong." });
    }
    setInviting(false);
  }

  const tabs =
    userCompany === "all"
      ? [{ key: "all" as const, label: "All Companies" }, ...(Object.keys(COMPANY_LABELS) as CompanyKey[]).map((k) => ({ key: k, label: COMPANY_LABELS[k] }))]
      : [{ key: userCompany as CompanyKey, label: COMPANY_LABELS[userCompany as CompanyKey] }];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-900 px-6 py-4 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-semibold tracking-widest text-zinc-600 uppercase hover:text-zinc-400 transition-colors">
              UDG
            </Link>
            <span className="h-4 w-px bg-zinc-800" />
            <span className="text-sm text-zinc-400">Staff Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-zinc-600 sm:block">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-4xl">
          {/* Page title */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Documents</h1>
            {activeCompany !== "all" && (
              <label className="group flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-800 bg-ink-800 px-4 py-2 text-sm text-zinc-300 transition-all hover:border-unhinged-green/40 hover:text-white">
                {uploading ? (
                  <span className="text-zinc-500">Uploading…</span>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload file
                  </>
                )}
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-zinc-900 bg-ink-800/40 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={async () => {
                  setActiveCompany(tab.key);
                  await loadFiles(tab.key);
                }}
                className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeCompany === tab.key
                    ? "bg-ink-700 text-white shadow"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* File list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-ink-800" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 h-12 w-12 rounded-full bg-ink-800 flex items-center justify-center">
                <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-500">No documents yet.</p>
              {activeCompany !== "all" && (
                <p className="mt-1 text-xs text-zinc-600">Upload a file to get started.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => {
                const f = file as FileObject & { _folder: string };
                return (
                  <div
                    key={`${f._folder}/${file.name}`}
                    className="group flex items-center gap-4 rounded-xl border border-zinc-900 bg-ink-800/40 px-4 py-3 transition-all hover:border-zinc-800 hover:bg-ink-800"
                  >
                    <FileIcon mime={file.metadata?.mimetype ?? ""} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-200">{file.name}</p>
                      <p className="text-xs text-zinc-600">
                        {COMPANY_LABELS[f._folder as CompanyKey]}
                        {file.metadata?.size
                          ? ` · ${formatBytes(file.metadata.size)}`
                          : ""}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        const url = await getSignedUrl(f._folder, file.name);
                        if (url) window.open(url, "_blank");
                      }}
                      className="flex-shrink-0 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 opacity-0 transition-all group-hover:opacity-100 hover:border-unhinged-green/50 hover:text-white"
                    >
                      Open
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {/* Admin: Invite users */}
          {userCompany === "all" && (
            <div className="mt-12 border-t border-zinc-900 pt-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px w-6 bg-zinc-800" />
                <span className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
                  Admin — Invite User
                </span>
              </div>
              <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Email address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="name@groomr.uk"
                    className="w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
                  />
                </div>
                <div className="sm:w-56">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Company access</label>
                  <select
                    value={inviteCompany}
                    onChange={(e) => setInviteCompany(e.target.value as CompanyKey)}
                    className="w-full rounded-xl border border-zinc-800 bg-ink-800 px-4 py-3 text-sm text-zinc-100 focus:border-unhinged-green/50 focus:outline-none focus:ring-1 focus:ring-unhinged-green/30 transition-colors"
                  >
                    {(Object.keys(COMPANY_LABELS) as CompanyKey[]).map((k) => (
                      <option key={k} value={k}>{COMPANY_LABELS[k]}</option>
                    ))}
                    <option value="all">All Companies (Admin)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={inviting}
                  className="rounded-xl bg-unhinged-green px-6 py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-50 sm:flex-shrink-0"
                >
                  {inviting ? "Sending…" : "Send invite"}
                </button>
              </form>
              {inviteResult && (
                <p className={`mt-3 text-xs ${inviteResult.ok ? "text-unhinged-green" : "text-red-400"}`}>
                  {inviteResult.message}
                </p>
              )}
              <p className="mt-3 text-xs text-zinc-700">
                Allowed domains: {Object.keys(DOMAIN_COMPANY_MAP).map(d => `@${d}`).join(", ")}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
