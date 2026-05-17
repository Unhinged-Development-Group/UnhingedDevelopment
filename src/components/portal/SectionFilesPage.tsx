"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient, type CompanyKey } from "@/lib/supabase";

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
  cardBg: string; border: string;
  uploadBg: string; uploadBorder: string; uploadText: string;
  actionBorder: string; actionText: string; openText: string;
  skeletonBg: string; emptyCircleBg: string; emptyIconColor: string;
  pdfColor: string; imgColor: string; fileColor: string;
};

const GROOMR_THEME: BrandTheme = {
  bg: G.cream, font: "'Nunito', sans-serif",
  textH: G.deepSlate, textMuted: G.sage,
  cardBg: "white", border: "rgba(149,165,166,0.2)",
  uploadBg: "white", uploadBorder: "rgba(149,165,166,0.4)", uploadText: G.deepSlate,
  actionBorder: "rgba(149,165,166,0.35)", actionText: G.pebble, openText: G.deepSlate,
  skeletonBg: "rgba(44,62,80,0.06)", emptyCircleBg: "rgba(149,165,166,0.12)", emptyIconColor: G.pebble,
  pdfColor: G.terracotta, imgColor: G.sage, fileColor: G.pebble,
};

const PP_THEME: BrandTheme = {
  bg: PP.alabaster, font: "'Montserrat', sans-serif",
  textH: PP.charcoal, textMuted: PP.stone500,
  cardBg: "white", border: "rgba(231,229,228,0.8)",
  uploadBg: "white", uploadBorder: PP.stone200, uploadText: PP.charcoal,
  actionBorder: PP.stone200, actionText: PP.stone500, openText: PP.charcoal,
  skeletonBg: "rgba(28,25,23,0.04)", emptyCircleBg: "rgba(231,229,228,0.6)", emptyIconColor: PP.stone500,
  pdfColor: PP.terracotta, imgColor: PP.deepClay, fileColor: PP.stone500,
};

type FileObject = {
  name: string;
  metadata: { size: number; mimetype: string } | null;
};

const BUCKET = "documents";

const MIME_MAP: Record<string, string> = {
  html: "text/html", htm: "text/html",
  pdf: "application/pdf",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
  mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm",
  mp3: "audio/mpeg", wav: "audio/wav",
  txt: "text/plain", csv: "text/csv", json: "application/json",
  zip: "application/zip",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function mimeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return MIME_MAP[ext] ?? "application/octet-stream";
}

function displayName(storageName: string): string {
  return storageName.replace(/^\d+_/, "");
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mime, theme }: { mime: string; theme: BrandTheme | null }) {
  const pdfColor = theme ? theme.pdfColor : "rgb(248,113,113)";
  const imgColor = theme ? theme.imgColor : "rgb(96,165,250)";
  const fileColor = theme ? theme.fileColor : "rgb(161,161,170)";

  if (mime?.includes("pdf"))
    return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: pdfColor }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
  if (mime?.includes("image"))
    return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: imgColor }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: fileColor }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
}

export default function SectionFilesPage({ section, label }: { section: string; label: string }) {
  const params = useParams();
  const company = params.company as CompanyKey;
  const isGroomr = company === "groomr";
  const isPP = company === "paper-and-ponder";
  const theme: BrandTheme | null = isGroomr ? GROOMR_THEME : isPP ? PP_THEME : null;
  const folder = `${company}/${section}`;

  const [isAdmin, setIsAdmin] = useState(false);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const supabase = createClient();

  const loadFiles = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.storage
      .from(BUCKET)
      .list(folder, { sortBy: { column: "created_at", order: "desc" } });
    setFiles(data ? data.filter((f) => f.name !== ".emptyFolderPlaceholder") : []);
    setLoading(false);
  }, [supabase, folder]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.user_metadata?.company === "all");
      await loadFiles();
    })();
  }, [supabase, loadFiles]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${folder}/${Date.now()}_${file.name}`;
    const contentType = file.type || mimeFromName(file.name);
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType });
    if (!error) await loadFiles();
    setUploading(false);
    e.target.value = "";
  }

  async function getSignedUrl(name: string) {
    const key = `${folder}/${name}`;
    if (signedUrls[key]) return signedUrls[key];
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(key, 300);
    if (data?.signedUrl) {
      setSignedUrls((p) => ({ ...p, [key]: data.signedUrl }));
      return data.signedUrl;
    }
    return null;
  }

  async function openFile(name: string, mime: string) {
    const url = await getSignedUrl(name);
    if (!url) return;
    const resolvedMime = mime || mimeFromName(name);
    if (resolvedMime === "text/html") {
      const resp = await fetch(url);
      const html = await resp.text();
      window.open(URL.createObjectURL(new Blob([html], { type: "text/html" })), "_blank");
    } else {
      window.open(url, "_blank");
    }
  }

  async function downloadFile(name: string, mime: string) {
    const url = await getSignedUrl(name);
    if (!url) return;
    const resp = await fetch(url);
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(new Blob([blob], { type: mime || mimeFromName(name) }));
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = displayName(name);
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  async function deleteFile(name: string) {
    await supabase.storage.from(BUCKET).remove([`${folder}/${name}`]);
    await loadFiles();
  }

  return (
    <div
      className="max-w-4xl px-6 py-8 sm:px-10"
      style={theme ? { backgroundColor: theme.bg, minHeight: "100vh", fontFamily: theme.font } : {}}
    >
      <div className="mb-8 flex items-center justify-between">
        <h1
          className={theme ? "text-xl font-bold" : "text-xl font-bold text-white"}
          style={theme ? { color: theme.textH } : {}}
        >
          {label}
        </h1>
        <label
          className={theme ? "group flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all" : "group flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-800 bg-ink-800 px-4 py-2 text-sm text-zinc-300 transition-all hover:border-unhinged-green/40 hover:text-white"}
          style={theme ? { border: `1px solid ${theme.uploadBorder}`, backgroundColor: theme.uploadBg, color: theme.uploadText } : {}}
        >
          {uploading ? (
            <span style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>Uploading…</span>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload
            </>
          )}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl"
              style={theme ? { backgroundColor: theme.skeletonBg } : { backgroundColor: "rgba(39,39,42,0.4)" }} />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
            style={theme ? { backgroundColor: theme.emptyCircleBg } : { backgroundColor: "rgb(39,39,42)" }}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              style={{ color: theme ? theme.emptyIconColor : "rgb(82,82,91)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>No files yet.</p>
          <p className="mt-1 text-xs" style={{ color: theme ? theme.emptyIconColor : "rgb(82,82,91)" }}>Upload a file to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.name}
              className={theme ? "group flex items-center gap-4 rounded-xl px-4 py-3 transition-all" : "group flex items-center gap-4 rounded-xl border border-zinc-900 bg-ink-800/40 px-4 py-3 transition-all hover:border-zinc-800 hover:bg-ink-800"}
              style={theme ? { backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` } : {}}>
              <FileIcon mime={file.metadata?.mimetype || mimeFromName(file.name)} theme={theme} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: theme ? theme.textH : "rgb(228,228,231)" }}>
                  {displayName(file.name)}
                </p>
                {file.metadata?.size ? (
                  <p className="text-xs" style={{ color: theme ? theme.textMuted : "rgb(82,82,91)" }}>
                    {formatBytes(file.metadata.size)}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5 opacity-0 transition-all group-hover:opacity-100">
                <button onClick={() => openFile(file.name, file.metadata?.mimetype ?? "")}
                  className={theme ? "rounded-lg px-3 py-1.5 text-xs transition-colors" : "rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-unhinged-green/50 hover:text-white transition-colors"}
                  style={theme ? { border: `1px solid ${theme.actionBorder}`, color: theme.openText } : {}}>
                  Open
                </button>
                <button onClick={() => downloadFile(file.name, file.metadata?.mimetype ?? "")}
                  className={theme ? "rounded-lg px-3 py-1.5 text-xs transition-colors" : "rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-unhinged-green/50 hover:text-white transition-colors"}
                  style={theme ? { border: `1px solid ${theme.actionBorder}`, color: theme.actionText } : {}}
                  title="Download">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                {isAdmin && (
                  <button onClick={() => deleteFile(file.name)}
                    className={theme ? "rounded-lg px-3 py-1.5 text-xs transition-colors" : "rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400 transition-colors"}
                    style={theme ? { border: `1px solid ${theme.actionBorder}`, color: theme.actionText } : {}}
                    title="Delete">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
