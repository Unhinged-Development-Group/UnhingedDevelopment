"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient, type CompanyKey } from "@/lib/supabase";

// ── Brand tokens ────────────────────────────────────────────────────────────

const G = {
  cream: "#F9F8F4", deepSlate: "#2C3E50", gold: "#EAE45C",
  sage: "#88A096", pebble: "#95A5A6", terracotta: "#C87964",
};
const PP = {
  alabaster: "#fafaf9", charcoal: "#1c1917", deepClay: "#7c2d12",
  terracotta: "#fb923c", stone200: "#e7e5e4", stone500: "#78716c",
};

type BrandTheme = {
  bg: string; font: string; textH: string; textMuted: string;
  cardBg: string; border: string;
  uploadBg: string; uploadBorder: string; uploadText: string;
  actionBorder: string; actionText: string; openText: string;
  skeletonBg: string; emptyCircleBg: string; emptyIconColor: string;
  pdfColor: string; imgColor: string; fileColor: string;
  accent: string;
};

const GROOMR_THEME: BrandTheme = {
  bg: G.cream, font: "'Nunito', sans-serif",
  textH: G.deepSlate, textMuted: G.sage,
  cardBg: "white", border: "rgba(149,165,166,0.2)",
  uploadBg: "white", uploadBorder: "rgba(149,165,166,0.4)", uploadText: G.deepSlate,
  actionBorder: "rgba(149,165,166,0.35)", actionText: G.pebble, openText: G.deepSlate,
  skeletonBg: "rgba(44,62,80,0.06)", emptyCircleBg: "rgba(149,165,166,0.12)", emptyIconColor: G.pebble,
  pdfColor: G.terracotta, imgColor: G.sage, fileColor: G.pebble,
  accent: G.gold,
};
const PP_THEME: BrandTheme = {
  bg: PP.alabaster, font: "'Montserrat', sans-serif",
  textH: PP.charcoal, textMuted: PP.stone500,
  cardBg: "white", border: "rgba(231,229,228,0.8)",
  uploadBg: "white", uploadBorder: PP.stone200, uploadText: PP.charcoal,
  actionBorder: PP.stone200, actionText: PP.stone500, openText: PP.charcoal,
  skeletonBg: "rgba(28,25,23,0.04)", emptyCircleBg: "rgba(231,229,228,0.6)", emptyIconColor: PP.stone500,
  pdfColor: PP.terracotta, imgColor: PP.deepClay, fileColor: PP.stone500,
  accent: PP.terracotta,
};

// ── Types ────────────────────────────────────────────────────────────────────

type StorageItem = {
  name: string;
  id: string | null; // null = pseudo-folder
  metadata: { size: number; mimetype: string } | null;
};

type FolderMeta = Record<string, string | null>; // relPath → passwordHash | null

// ── Constants ────────────────────────────────────────────────────────────────

const BUCKET = "documents";
const MIME_MAP: Record<string, string> = {
  html: "text/html", htm: "text/html", pdf: "application/pdf",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
  mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm",
  mp3: "audio/mpeg", wav: "audio/wav", txt: "text/plain",
  csv: "text/csv", json: "application/json", zip: "application/zip",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

// ── Utility functions ────────────────────────────────────────────────────────

function mimeFromName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return MIME_MAP[ext] ?? "application/octet-stream";
}
function displayName(s: string) { return s.replace(/^\d+_/, ""); }
function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function sanitizeFolderName(s: string) { return s.trim().replace(/[/\\?%*:|"<>]/g, ""); }

// ── Sub-components ───────────────────────────────────────────────────────────

function FileIcon({ mime, theme }: { mime: string; theme: BrandTheme | null }) {
  const pdf = theme ? theme.pdfColor : "rgb(248,113,113)";
  const img = theme ? theme.imgColor : "rgb(96,165,250)";
  const file = theme ? theme.fileColor : "rgb(161,161,170)";
  if (mime?.includes("pdf"))
    return <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: pdf }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
  if (mime?.includes("image"))
    return <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: img }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  return <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: file }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
}
function FolderIcon({ theme }: { theme: BrandTheme | null }) {
  return <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme ? theme.textMuted : "rgb(161,161,170)" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>;
}

// ── Main component ───────────────────────────────────────────────────────────

export default function SectionFilesPage({ section, label }: { section: string; label: string }) {
  const params = useParams();
  const company = params.company as CompanyKey;
  const isGroomr = company === "groomr";
  const isPP = company === "paper-and-ponder";
  const theme: BrandTheme | null = isGroomr ? GROOMR_THEME : isPP ? PP_THEME : null;

  const supabase = createClient();
  const basePath = `${company}/${section}`;

  // ── Core state ─────────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(false);
  const [crumbs, setCrumbs] = useState<string[]>([]);
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  // New-folder UI
  const [folderMode, setFolderMode] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Folder metadata (password hashes) – keyed by path relative to basePath
  const [folderMeta, setFolderMeta] = useState<FolderMeta>({});
  // Folders unlocked this session – keyed by relative path
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  // Rename state
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);

  // Move state
  const [moveItem, setMoveItem] = useState<{ name: string; isFolder: boolean } | null>(null);
  const [moveNavCrumbs, setMoveNavCrumbs] = useState<string[]>([]);
  const [moveNavItems, setMoveNavItems] = useState<StorageItem[]>([]);
  const [moveNavLoading, setMoveNavLoading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);

  // Lock modal (set / change / remove password on a folder)
  const [lockFolder, setLockFolder] = useState<string | null>(null);
  const [lockStage, setLockStage] = useState<"verify" | "set" | "remove">("set");
  const [lockOld, setLockOld] = useState("");
  const [lockNew, setLockNew] = useState("");
  const [lockConfirm, setLockConfirm] = useState("");
  const [lockError, setLockError] = useState("");
  const [lockWorking, setLockWorking] = useState(false);

  // Unlock prompt (before navigating into a locked folder)
  const [unlockTarget, setUnlockTarget] = useState<string | null>(null); // folder name
  const [unlockInput, setUnlockInput] = useState("");
  const [unlockError, setUnlockError] = useState(false);

  // ── Computed paths ─────────────────────────────────────────────────────────
  const currentPath = crumbs.length > 0 ? `${basePath}/${crumbs.join("/")}` : basePath;
  const relPath = (name: string) => [...crumbs, name].join("/"); // relative to basePath
  const moveNavPath = moveNavCrumbs.length > 0 ? `${basePath}/${moveNavCrumbs.join("/")}` : basePath;

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadMeta = useCallback(async () => {
    const { data } = await supabase
      .from("portal_folder_meta")
      .select("folder_path, password_hash")
      .eq("company", company)
      .eq("section", section);
    if (data) {
      const map: FolderMeta = {};
      data.forEach((r: { folder_path: string; password_hash: string | null }) => {
        map[r.folder_path] = r.password_hash;
      });
      setFolderMeta(map);
    }
  }, [supabase, company, section]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.storage
      .from(BUCKET)
      .list(currentPath, { sortBy: { column: "created_at", order: "desc" } });
    const all = (data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder") as StorageItem[];
    all.sort((a, b) => {
      const af = a.id === null, bf = b.id === null;
      return af === bf ? 0 : af ? -1 : 1;
    });
    setItems(all);
    setLoading(false);
  }, [supabase, currentPath]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.user_metadata?.company === "all");
    })();
  }, [supabase]);

  useEffect(() => { loadItems(); }, [loadItems]);
  useEffect(() => { loadMeta(); }, [loadMeta]);
  useEffect(() => { if (folderMode) folderInputRef.current?.focus(); }, [folderMode]);
  useEffect(() => { if (renamingFolder) renameRef.current?.focus(); }, [renamingFolder]);

  // Load move-modal folder list whenever moveNavCrumbs changes
  useEffect(() => {
    if (!moveItem) return;
    setMoveNavLoading(true);
    supabase.storage.from(BUCKET)
      .list(moveNavPath, { sortBy: { column: "name", order: "asc" } })
      .then(({ data }) => {
        const folders = ((data ?? []) as StorageItem[])
          .filter((f) => f.id === null && f.name !== ".emptyFolderPlaceholder")
          // Hide the folder being moved at its own level
          .filter((f) => {
            if (!moveItem.isFolder) return true;
            const sameLevelAsMoveItem = moveNavCrumbs.join("/") === crumbs.join("/");
            return !(sameLevelAsMoveItem && f.name === moveItem.name);
          });
        setMoveNavItems(folders);
        setMoveNavLoading(false);
      });
  }, [moveItem, moveNavPath]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ─────────────────────────────────────────────────────────────

  function navigateTo(depth: number) {
    setCrumbs((c) => c.slice(0, depth));
    setFolderMode(false); setFolderName("");
    setRenamingFolder(null);
  }

  function tryOpenFolder(name: string) {
    const rel = relPath(name);
    const hash = folderMeta[rel];
    if (hash && !unlocked.has(rel)) {
      setUnlockTarget(name);
      setUnlockInput(""); setUnlockError(false);
    } else {
      setCrumbs((c) => [...c, name]);
      setFolderMode(false); setFolderName(""); setRenamingFolder(null);
    }
  }

  // ── File operations ────────────────────────────────────────────────────────

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${currentPath}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || mimeFromName(file.name),
    });
    if (!error) await loadItems();
    setUploading(false); e.target.value = "";
  }

  async function getSignedUrl(name: string) {
    const key = `${currentPath}/${name}`;
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
      const html = await fetch(url).then((r) => r.text());
      window.open(URL.createObjectURL(new Blob([html], { type: "text/html" })), "_blank");
    } else {
      window.open(url, "_blank");
    }
  }

  async function downloadFile(name: string, mime: string) {
    const url = await getSignedUrl(name);
    if (!url) return;
    const blob = await fetch(url).then((r) => r.blob());
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([blob], { type: mime || mimeFromName(name) }));
    a.download = displayName(name); a.click();
    URL.revokeObjectURL(a.href);
  }

  async function deleteFile(name: string) {
    await supabase.storage.from(BUCKET).remove([`${currentPath}/${name}`]);
    await loadItems();
  }

  // ── Folder operations ──────────────────────────────────────────────────────

  async function createFolder() {
    const name = sanitizeFolderName(folderName);
    if (!name) return;
    setCreatingFolder(true);
    await supabase.storage.from(BUCKET).upload(
      `${currentPath}/${name}/.emptyFolderPlaceholder`,
      new Blob([""], { type: "text/plain" }),
      { upsert: true }
    );
    setFolderName(""); setFolderMode(false); setCreatingFolder(false);
    await loadItems();
  }

  /** Recursively list all file paths under a storage path */
  async function listAllFiles(path: string): Promise<string[]> {
    const { data } = await supabase.storage.from(BUCKET).list(path);
    if (!data) return [];
    const results: string[] = [];
    for (const item of data as StorageItem[]) {
      const full = `${path}/${item.name}`;
      if (item.id === null) {
        results.push(...await listAllFiles(full));
      } else {
        results.push(full);
      }
    }
    return results;
  }

  async function deleteFolder(name: string) {
    const folderPath = `${currentPath}/${name}`;
    const files = await listAllFiles(folderPath);
    if (files.length > 0) await supabase.storage.from(BUCKET).remove(files);
    // Clean up meta
    const prefix = relPath(name);
    const keysToDelete = Object.keys(folderMeta).filter((k) => k === prefix || k.startsWith(prefix + "/"));
    if (keysToDelete.length > 0) {
      await supabase.from("portal_folder_meta").delete()
        .eq("company", company).eq("section", section)
        .in("folder_path", keysToDelete);
    }
    await loadItems(); await loadMeta();
  }

  async function commitRename() {
    const name = sanitizeFolderName(renameValue);
    if (!name || !renamingFolder || name === renamingFolder) {
      setRenamingFolder(null); return;
    }
    setRenaming(true);
    const oldStoragePath = `${currentPath}/${renamingFolder}`;
    const newStoragePath = `${currentPath}/${name}`;
    const files = await listAllFiles(oldStoragePath);
    for (const f of files) {
      const dest = newStoragePath + f.slice(oldStoragePath.length);
      await supabase.storage.from(BUCKET).move(f, dest);
    }
    // Update meta keys
    const oldRel = relPath(renamingFolder);
    const newRel = relPath(name);
    const affected = Object.entries(folderMeta).filter(
      ([k]) => k === oldRel || k.startsWith(oldRel + "/")
    );
    for (const [oldKey] of affected) {
      const newKey = newRel + oldKey.slice(oldRel.length);
      await supabase.from("portal_folder_meta")
        .update({ folder_path: newKey })
        .eq("company", company).eq("section", section).eq("folder_path", oldKey);
    }
    setRenamingFolder(null); setRenaming(false);
    await loadItems(); await loadMeta();
  }

  // ── Move operations ────────────────────────────────────────────────────────

  async function commitMove() {
    if (!moveItem) return;
    setMoving(true);
    setMoveError(null);
    try {
      const srcPath = `${currentPath}/${moveItem.name}`;
      const destPath = `${moveNavPath}/${moveItem.name}`;

      if (moveItem.isFolder) {
        const files = await listAllFiles(srcPath);
        for (const f of files) {
          const dest = destPath + f.slice(srcPath.length);
          const { error } = await supabase.storage.from(BUCKET).move(f, dest);
          if (error) throw new Error(error.message);
        }
        // Update meta keys if folder had password meta
        const oldRel = relPath(moveItem.name);
        const newRelBase = moveNavCrumbs.length > 0
          ? `${moveNavCrumbs.join("/")}/${moveItem.name}`
          : moveItem.name;
        const affected = Object.entries(folderMeta).filter(
          ([k]) => k === oldRel || k.startsWith(oldRel + "/")
        );
        for (const [oldKey] of affected) {
          const newKey = newRelBase + oldKey.slice(oldRel.length);
          await supabase.from("portal_folder_meta")
            .update({ folder_path: newKey })
            .eq("company", company).eq("section", section).eq("folder_path", oldKey);
        }
      } else {
        const { error } = await supabase.storage.from(BUCKET).move(srcPath, destPath);
        if (error) throw new Error(error.message);
      }
      setMoveItem(null);
      await loadItems(); await loadMeta();
    } catch (err) {
      setMoveError(err instanceof Error ? err.message : "Move failed — please try again.");
    } finally {
      setMoving(false);
    }
  }

  // ── Lock / unlock operations ───────────────────────────────────────────────

  async function handleUnlock() {
    if (!unlockTarget) return;
    const rel = relPath(unlockTarget);
    const hash = folderMeta[rel];
    if (!hash) { setUnlockTarget(null); return; }
    const inputHash = await sha256(unlockInput);
    if (inputHash !== hash) { setUnlockError(true); return; }
    setUnlocked((prev) => new Set([...prev, rel]));
    setUnlockTarget(null); setUnlockInput(""); setUnlockError(false);
    setCrumbs((c) => [...c, unlockTarget]);
    setFolderMode(false); setFolderName(""); setRenamingFolder(null);
  }

  function openLockModal(name: string) {
    const rel = relPath(name);
    const hasHash = !!folderMeta[rel];
    setLockFolder(name);
    setLockStage(hasHash ? "verify" : "set");
    setLockOld(""); setLockNew(""); setLockConfirm(""); setLockError(""); setLockWorking(false);
  }

  async function handleLockVerify() {
    if (!lockFolder) return;
    const rel = relPath(lockFolder);
    const stored = folderMeta[rel];
    if (!stored) return;
    const inputHash = await sha256(lockOld);
    if (inputHash !== stored) { setLockError("Incorrect password."); return; }
    setLockError(""); setLockStage("set");
  }

  async function handleLockSet() {
    if (!lockFolder) return;
    if (lockNew !== lockConfirm) { setLockError("Passwords don't match."); return; }
    if (lockNew.length < 1) { setLockError("Password can't be empty."); return; }
    setLockWorking(true);
    const hash = await sha256(lockNew);
    const rel = relPath(lockFolder);
    await supabase.from("portal_folder_meta").upsert(
      { company, section, folder_path: rel, password_hash: hash },
      { onConflict: "company,section,folder_path" }
    );
    setLockFolder(null); setLockWorking(false);
    await loadMeta();
  }

  async function handleLockRemove() {
    if (!lockFolder) return;
    setLockWorking(true);
    const rel = relPath(lockFolder);
    await supabase.from("portal_folder_meta").delete()
      .eq("company", company).eq("section", section).eq("folder_path", rel);
    // Also remove from unlocked set
    setUnlocked((prev) => { const s = new Set(prev); s.delete(rel); return s; });
    setLockFolder(null); setLockWorking(false);
    await loadMeta();
  }

  // ── Style helpers ──────────────────────────────────────────────────────────

  const actionBtn = (danger = false) =>
    theme
      ? "rounded-lg px-3 py-1.5 text-xs transition-colors"
      : `rounded-lg border border-zinc-800 px-3 py-1.5 text-xs transition-colors ${danger
          ? "text-zinc-400 hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400"
          : "text-zinc-400 hover:border-unhinged-green/50 hover:text-white"}`;

  const actionBtnStyle = (danger = false): React.CSSProperties =>
    theme ? { border: `1px solid ${theme.actionBorder}`, color: danger ? theme.actionText : theme.openText } : {};

  const iconBtn = (danger = false) =>
    theme
      ? "rounded-lg p-1.5 transition-colors"
      : `rounded-lg p-1.5 transition-colors ${danger
          ? "text-zinc-600 hover:text-red-400"
          : "text-zinc-600 hover:text-zinc-300"}`;

  const inputStyle: React.CSSProperties = theme
    ? { borderColor: theme.uploadBorder, backgroundColor: theme.uploadBg, color: theme.uploadText }
    : { borderColor: "rgb(39,39,42)", backgroundColor: "rgb(9,9,11)", color: "rgb(228,228,231)" };

  const modalBg = theme ? theme.cardBg : "rgb(14,14,14)";
  const modalBorder = theme ? theme.border : "rgb(39,39,42)";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="w-full px-6 py-8 sm:px-10"
      style={theme ? { backgroundColor: theme.bg, minHeight: "100vh", fontFamily: theme.font } : {}}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">

        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => navigateTo(0)} className={crumbs.length > 0 ? "transition-opacity hover:opacity-60" : "cursor-default"}>
            <span
              className={crumbs.length === 0 ? (theme ? "text-xl font-bold" : "text-xl font-bold text-white") : "text-sm font-medium"}
              style={{ color: crumbs.length === 0 ? (theme ? theme.textH : undefined) : (theme ? theme.textMuted : "rgb(113,113,122)") }}
            >
              {label}
            </span>
          </button>
          {crumbs.map((seg, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span style={{ color: theme ? theme.textMuted : "rgb(63,63,70)" }}>/</span>
              {i === crumbs.length - 1 ? (
                <span className={theme ? "text-xl font-bold" : "text-xl font-bold text-white"} style={theme ? { color: theme.textH } : {}}>
                  {seg}
                </span>
              ) : (
                <button onClick={() => navigateTo(i + 1)} className="text-sm font-medium transition-opacity hover:opacity-60"
                  style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>
                  {seg}
                </button>
              )}
            </span>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {folderMode ? (
            <div className="flex items-center gap-2">
              <input ref={folderInputRef} value={folderName} onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") { setFolderMode(false); setFolderName(""); } }}
                placeholder="Folder name" className="w-36 rounded-lg border px-3 py-1.5 text-sm outline-none"
                style={inputStyle} />
              <button onClick={createFolder} disabled={!folderName.trim() || creatingFolder}
                className="rounded-lg px-3 py-1.5 text-sm disabled:opacity-40"
                style={theme ? { border: `1px solid ${theme.uploadBorder}`, backgroundColor: theme.uploadBg, color: theme.textH } : { border: "1px solid rgb(39,39,42)", backgroundColor: "rgb(14,14,14)", color: "rgb(228,228,231)" }}>
                {creatingFolder ? "…" : "Create"}
              </button>
              <button onClick={() => { setFolderMode(false); setFolderName(""); }} className="px-1.5 text-sm transition-opacity hover:opacity-60"
                style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>✕</button>
            </div>
          ) : (
            <>
              <button onClick={() => setFolderMode(true)}
                className={theme ? "flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm" : "flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-800 bg-ink-800 px-4 py-2 text-sm text-zinc-300 hover:border-unhinged-green/40 hover:text-white"}
                style={theme ? { border: `1px solid ${theme.uploadBorder}`, backgroundColor: theme.uploadBg, color: theme.uploadText } : {}}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                New folder
              </button>
              <label
                className={theme ? "group flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm" : "group flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-800 bg-ink-800 px-4 py-2 text-sm text-zinc-300 hover:border-unhinged-green/40 hover:text-white"}
                style={theme ? { border: `1px solid ${theme.uploadBorder}`, backgroundColor: theme.uploadBg, color: theme.uploadText } : {}}>
                {uploading ? <span style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>Uploading…</span> : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload
                  </>
                )}
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </>
          )}
        </div>
      </div>

      {/* ── List ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl"
              style={theme ? { backgroundColor: theme.skeletonBg } : { backgroundColor: "rgba(39,39,42,0.4)" }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
            style={theme ? { backgroundColor: theme.emptyCircleBg } : { backgroundColor: "rgb(39,39,42)" }}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              style={{ color: theme ? theme.emptyIconColor : "rgb(82,82,91)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>
            {crumbs.length > 0 ? "This folder is empty." : "No files yet."}
          </p>
          <p className="mt-1 text-xs" style={{ color: theme ? theme.emptyIconColor : "rgb(82,82,91)" }}>
            Upload a file or create a folder to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isFolder = item.id === null;
            const rel = relPath(item.name);
            const isLocked = isFolder && !!folderMeta[rel];
            const isUnlocked = isFolder && unlocked.has(rel);

            return (
              <div key={item.name}
                className={theme
                  ? "group flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
                  : "group flex items-center gap-4 rounded-xl border border-zinc-900 bg-ink-800/40 px-4 py-3 transition-all hover:border-zinc-800 hover:bg-ink-800"}
                style={theme ? { backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` } : {}}>

                {isFolder ? <FolderIcon theme={theme} /> : <FileIcon mime={item.metadata?.mimetype || mimeFromName(item.name)} theme={theme} />}

                <div className="min-w-0 flex-1">
                  {isFolder ? (
                    renamingFolder === item.name ? (
                      <input ref={renameRef} value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingFolder(null); }}
                        onBlur={commitRename}
                        disabled={renaming}
                        className="w-full rounded border px-2 py-0.5 text-sm outline-none"
                        style={inputStyle} />
                    ) : (
                      <button onClick={() => tryOpenFolder(item.name)}
                        className="flex items-center gap-1.5 truncate text-left text-sm font-medium underline-offset-2 hover:underline">
                        <span style={{ color: theme ? theme.textH : "rgb(228,228,231)" }}>{item.name}</span>
                        {isLocked && (
                          <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            style={{ color: isUnlocked ? (theme ? theme.accent : "#D2FF14") : (theme ? theme.textMuted : "rgb(113,113,122)") }}>
                            {isUnlocked
                              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" />
                            }
                          </svg>
                        )}
                      </button>
                    )
                  ) : (
                    <button onClick={() => openFile(item.name, item.metadata?.mimetype ?? "")}
                      className="truncate text-left text-sm font-medium underline-offset-2 hover:underline"
                      style={{ color: theme ? theme.textH : "rgb(228,228,231)" }}>
                      {displayName(item.name)}
                    </button>
                  )}
                  <p className="text-xs" style={{ color: theme ? theme.textMuted : "rgb(82,82,91)" }}>
                    {isFolder ? "Folder" : item.metadata?.size ? formatBytes(item.metadata.size) : ""}
                  </p>
                </div>

                {/* Hover actions */}
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                  {isFolder ? (
                    <>
                      <button onClick={() => tryOpenFolder(item.name)} className={actionBtn()} style={actionBtnStyle()}>Open</button>
                      {/* Rename */}
                      <button title="Rename" onClick={() => { setRenamingFolder(item.name); setRenameValue(item.name); }} className={iconBtn()} style={{ color: theme ? theme.textMuted : undefined }}>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      {/* Lock */}
                      <button title={isLocked ? "Manage password" : "Set password"} onClick={() => openLockModal(item.name)} className={iconBtn()} style={{ color: theme ? theme.textMuted : undefined }}>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {isLocked
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          }
                        </svg>
                      </button>
                      {/* Move */}
                      <button title="Move" onClick={() => { setMoveItem({ name: item.name, isFolder: true }); setMoveNavCrumbs([]); setMoveError(null); }} className={iconBtn()} style={{ color: theme ? theme.textMuted : undefined }}>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                      </button>
                      {isAdmin && (
                        <button title="Delete folder" onClick={() => deleteFolder(item.name)} className={iconBtn(true)}>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button onClick={() => openFile(item.name, item.metadata?.mimetype ?? "")} className={actionBtn()} style={actionBtnStyle()}>Open</button>
                      <button title="Download" onClick={() => downloadFile(item.name, item.metadata?.mimetype ?? "")} className={iconBtn()} style={{ color: theme ? theme.textMuted : undefined }}>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </button>
                      {/* Move */}
                      <button title="Move" onClick={() => { setMoveItem({ name: item.name, isFolder: false }); setMoveNavCrumbs([]); setMoveError(null); }} className={iconBtn()} style={{ color: theme ? theme.textMuted : undefined }}>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                      </button>
                      {isAdmin && (
                        <button title="Delete" onClick={() => deleteFile(item.name)} className={iconBtn(true)}>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Move modal ───────────────────────────────────────────── */}
      {moveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: modalBg, border: `1px solid ${modalBorder}` }}>
            <h2 className="mb-1 text-base font-semibold" style={{ color: theme ? theme.textH : "rgb(228,228,231)" }}>
              Move "{moveItem.isFolder ? moveItem.name : displayName(moveItem.name)}"
            </h2>
            <p className="mb-4 text-xs" style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>
              Choose a destination folder.
            </p>

            {/* Move breadcrumb */}
            <div className="mb-3 flex items-center gap-1.5 text-xs flex-wrap">
              <button onClick={() => setMoveNavCrumbs([])} className="transition-opacity hover:opacity-60"
                style={{ color: moveNavCrumbs.length === 0 ? (theme ? theme.textH : "rgb(228,228,231)") : (theme ? theme.textMuted : "rgb(113,113,122)") }}>
                {label}
              </button>
              {moveNavCrumbs.map((seg, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span style={{ color: theme ? theme.textMuted : "rgb(63,63,70)" }}>/</span>
                  <button onClick={() => setMoveNavCrumbs((c) => c.slice(0, i + 1))} className="transition-opacity hover:opacity-60"
                    style={{ color: i === moveNavCrumbs.length - 1 ? (theme ? theme.textH : "rgb(228,228,231)") : (theme ? theme.textMuted : "rgb(113,113,122)") }}>
                    {seg}
                  </button>
                </span>
              ))}
            </div>

            {/* Folder list */}
            <div className="mb-4 max-h-48 overflow-y-auto rounded-xl border" style={{ borderColor: modalBorder }}>
              {moveNavLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
                </div>
              ) : moveNavItems.length === 0 ? (
                <p className="py-6 text-center text-xs" style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>No subfolders here.</p>
              ) : (
                moveNavItems.map((f) => (
                  <button key={f.name} onClick={() => setMoveNavCrumbs((c) => [...c, f.name])}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-black/5"
                    style={{ color: theme ? theme.textH : "rgb(228,228,231)" }}>
                    <FolderIcon theme={theme} />
                    {f.name}
                    <svg className="ml-auto h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))
              )}
            </div>

            {moveError && (
              <p className="mb-3 text-xs rounded-lg px-3 py-2 bg-red-500/10 text-red-400">{moveError}</p>
            )}
            <div className="flex gap-2">
              <button onClick={commitMove} disabled={moving || moveNavPath === currentPath}
                className="flex-1 rounded-xl py-2 text-sm font-medium transition-all disabled:opacity-40"
                style={theme
                  ? { backgroundColor: theme.accent, color: theme.textH }
                  : { backgroundColor: "#D2FF14", color: "#030303" }}>
                {moving ? "Moving…" : `Move here`}
              </button>
              <button onClick={() => { setMoveItem(null); setMoveError(null); }}
                className="rounded-xl px-4 py-2 text-sm transition-colors"
                style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Unlock modal ─────────────────────────────────────────── */}
      {unlockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: modalBg, border: `1px solid ${modalBorder}` }}>
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme ? theme.textMuted : "rgb(161,161,170)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" />
              </svg>
              <h2 className="text-base font-semibold" style={{ color: theme ? theme.textH : "rgb(228,228,231)" }}>
                "{unlockTarget}" is locked
              </h2>
            </div>
            <input
              autoFocus type="password" placeholder="Enter password" value={unlockInput}
              onChange={(e) => { setUnlockInput(e.target.value); setUnlockError(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleUnlock(); if (e.key === "Escape") setUnlockTarget(null); }}
              className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={inputStyle} />
            {unlockError && <p className="mb-3 text-xs text-red-400">Incorrect password.</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={handleUnlock}
                className="flex-1 rounded-xl py-2 text-sm font-medium"
                style={theme ? { backgroundColor: theme.accent, color: theme.textH } : { backgroundColor: "#D2FF14", color: "#030303" }}>
                Unlock
              </button>
              <button onClick={() => setUnlockTarget(null)} className="rounded-xl px-4 py-2 text-sm" style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lock modal ───────────────────────────────────────────── */}
      {lockFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: modalBg, border: `1px solid ${modalBorder}` }}>
            {lockStage === "verify" && (
              <>
                <h2 className="mb-1 text-base font-semibold" style={{ color: theme ? theme.textH : "rgb(228,228,231)" }}>Manage password</h2>
                <p className="mb-4 text-xs" style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>Enter the current password to continue.</p>
                <input autoFocus type="password" placeholder="Current password" value={lockOld}
                  onChange={(e) => { setLockOld(e.target.value); setLockError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleLockVerify(); if (e.key === "Escape") setLockFolder(null); }}
                  className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
                {lockError && <p className="mb-2 text-xs text-red-400">{lockError}</p>}
                <div className="mt-4 flex gap-2">
                  <button onClick={handleLockVerify}
                    className="flex-1 rounded-xl py-2 text-sm font-medium"
                    style={theme ? { backgroundColor: theme.accent, color: theme.textH } : { backgroundColor: "#D2FF14", color: "#030303" }}>
                    Continue
                  </button>
                  <button onClick={() => setLockFolder(null)} className="rounded-xl px-4 py-2 text-sm" style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>Cancel</button>
                </div>
                <button onClick={handleLockRemove} disabled={!lockOld}
                  className="mt-3 w-full rounded-xl py-2 text-xs text-red-400 transition-colors hover:text-red-300 disabled:opacity-40">
                  Remove password instead
                </button>
              </>
            )}
            {lockStage === "set" && (
              <>
                <h2 className="mb-1 text-base font-semibold" style={{ color: theme ? theme.textH : "rgb(228,228,231)" }}>
                  {folderMeta[relPath(lockFolder)] ? "Change password" : "Set a password"}
                </h2>
                <p className="mb-4 text-xs" style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>
                  Password-protect "{lockFolder}". Members will be prompted when they open it.
                </p>
                <input autoFocus type="password" placeholder="New password" value={lockNew}
                  onChange={(e) => { setLockNew(e.target.value); setLockError(""); }}
                  className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
                <input type="password" placeholder="Confirm password" value={lockConfirm}
                  onChange={(e) => { setLockConfirm(e.target.value); setLockError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleLockSet(); if (e.key === "Escape") setLockFolder(null); }}
                  className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
                {lockError && <p className="mb-2 text-xs text-red-400">{lockError}</p>}
                <div className="mt-4 flex gap-2">
                  <button onClick={handleLockSet} disabled={lockWorking}
                    className="flex-1 rounded-xl py-2 text-sm font-medium disabled:opacity-40"
                    style={theme ? { backgroundColor: theme.accent, color: theme.textH } : { backgroundColor: "#D2FF14", color: "#030303" }}>
                    {lockWorking ? "Saving…" : "Save password"}
                  </button>
                  <button onClick={() => setLockFolder(null)} className="rounded-xl px-4 py-2 text-sm" style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
