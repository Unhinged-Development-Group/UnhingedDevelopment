"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient, type CompanyKey } from "@/lib/supabase";
import UDGIcon from "@/components/UDGIcon";

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
function getPreviewColor(f: StorageItem, theme: BrandTheme | null): string {
  if (f.id === null) return theme ? theme.textMuted : "rgb(82,82,91)";
  const mime = f.metadata?.mimetype || mimeFromName(f.name);
  if (mime.includes("pdf"))   return theme ? theme.pdfColor  : "rgb(248,113,113)";
  if (mime.includes("image")) return theme ? theme.imgColor  : "rgb(96,165,250)";
  if (mime.includes("video")) return "rgb(167,139,250)";
  return theme ? theme.fileColor : "rgb(113,113,122)";
}

// ── Sub-components ───────────────────────────────────────────────────────────

function FileIcon({ mime, theme }: { mime: string; theme: BrandTheme | null }) {
  const pdf  = theme ? theme.pdfColor  : "rgb(248,113,113)";
  const img  = theme ? theme.imgColor  : "rgb(96,165,250)";
  const file = theme ? theme.fileColor : "rgb(161,161,170)";
  if (mime?.includes("pdf"))
    return <UDGIcon name="file"  className="h-5 w-5 shrink-0" mainColor={pdf}  accentColor={pdf}  />;
  if (mime?.includes("image"))
    return <UDGIcon name="photo" className="h-5 w-5 shrink-0" mainColor={img}  accentColor={img}  />;
  return   <UDGIcon name="file"  className="h-5 w-5 shrink-0" mainColor={file} accentColor={file} />;
}
function FolderIcon({ theme }: { theme: BrandTheme | null }) {
  const color = theme ? theme.textMuted : "rgb(161,161,170)";
  return <UDGIcon name="folder" className="h-5 w-5 shrink-0" mainColor={color} accentColor={theme?.accent ?? "#D2FF14"} />;
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

  // Folder content previews – shown as small coloured squares inside each folder card
  const [folderPreviews, setFolderPreviews] = useState<Record<string, StorageItem[]>>({});

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

  // Load file previews for all visible folders (shows as coloured squares inside folder cards)
  useEffect(() => {
    const folders = items.filter((i) => i.id === null);
    setFolderPreviews({});
    if (folders.length === 0) return;
    let cancelled = false;
    (async () => {
      const updates: Record<string, StorageItem[]> = {};
      await Promise.all(
        folders.map(async (f) => {
          const { data } = await supabase.storage
            .from(BUCKET)
            .list(`${currentPath}/${f.name}`, { limit: 9 });
          if (!cancelled && data) {
            updates[f.name] = (data as StorageItem[]).filter(
              (x) => x.name !== ".emptyFolderPlaceholder"
            );
          }
        })
      );
      if (!cancelled) setFolderPreviews(updates);
    })();
    return () => { cancelled = true; };
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

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
      className="w-full min-h-full px-6 py-8 sm:px-10"
      style={theme ? { backgroundColor: theme.bg, fontFamily: theme.font } : {}}
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
                <UDGIcon name="folder-plus" className="h-4 w-4" accentColor={theme?.accent ?? "#D2FF14"} />
                New folder
              </button>
              <label
                className={theme ? "group flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm" : "group flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-800 bg-ink-800 px-4 py-2 text-sm text-zinc-300 hover:border-unhinged-green/40 hover:text-white"}
                style={theme ? { border: `1px solid ${theme.uploadBorder}`, backgroundColor: theme.uploadBg, color: theme.uploadText } : {}}>
                {uploading ? <span style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }}>Uploading…</span> : (
                  <>
                    <UDGIcon name="upload" className="h-4 w-4" accentColor={theme?.accent ?? "#D2FF14"} />
                    Upload
                  </>
                )}
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </>
          )}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl"
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
        <>
          {/* ── Folder squares ───────────────────────────────────── */}
          {items.some((i) => i.id === null) && (
            <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
              {items.filter((i) => i.id === null).map((item) => {
                const rel = relPath(item.name);
                const isLocked = !!folderMeta[rel];
                const isUnlocked = unlocked.has(rel);
                const preview = folderPreviews[item.name] ?? [];

                return (
                  <div
                    key={item.name}
                    className="group relative flex aspect-square cursor-pointer flex-col overflow-hidden rounded-xl p-2.5 transition-all"
                    style={theme
                      ? { backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }
                      : { backgroundColor: "rgb(24,24,27)", border: "1px solid rgb(39,39,42)" }}
                    onClick={() => renamingFolder !== item.name && tryOpenFolder(item.name)}
                  >
                    {/* Hover actions – top-right corner */}
                    <div
                      className="absolute top-2 right-2 z-10 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button title="Rename" onClick={() => { setRenamingFolder(item.name); setRenameValue(item.name); }}
                        className={iconBtn()} style={{ color: theme ? theme.textMuted : undefined }}>
                        <UDGIcon name="edit" className="h-3.5 w-3.5" accentColor={theme?.accent ?? "#D2FF14"} />
                      </button>
                      <button title={isLocked ? "Manage password" : "Set password"} onClick={() => openLockModal(item.name)}
                        className={iconBtn()} style={{ color: theme ? theme.textMuted : undefined }}>
                        <UDGIcon name={isLocked ? "lock" : "unlock"} className="h-3.5 w-3.5" accentColor={theme?.accent ?? "#D2FF14"} />
                      </button>
                      <button title="Move" onClick={() => { setMoveItem({ name: item.name, isFolder: true }); setMoveNavCrumbs([]); setMoveError(null); }}
                        className={iconBtn()} style={{ color: theme ? theme.textMuted : undefined }}>
                        <UDGIcon name="move" className="h-3.5 w-3.5" accentColor={theme?.accent ?? "#D2FF14"} />
                      </button>
                      {isAdmin && (
                        <button title="Delete folder" onClick={() => deleteFolder(item.name)} className={iconBtn(true)}>
                          <UDGIcon name="trash" className="h-3.5 w-3.5" accentColor={theme?.accent ?? "#D2FF14"} />
                        </button>
                      )}
                    </div>

                    {/* File preview squares */}
                    <div className="mb-2 grid flex-1 grid-cols-4 content-start gap-1 pt-1">
                      {preview.length > 0
                        ? preview.slice(0, 8).map((f, i) => (
                            <div key={i} className="aspect-square rounded-sm opacity-60"
                              style={{ backgroundColor: getPreviewColor(f, theme) }} />
                          ))
                        : (
                            <div className="col-span-4 flex h-full items-center justify-center opacity-20">
                              <UDGIcon name="folder" className="h-5 w-5"
                                mainColor={theme ? theme.textMuted : "rgb(161,161,170)"}
                                accentColor={theme?.accent ?? "#D2FF14"} />
                            </div>
                          )
                      }
                    </div>

                    {/* Footer: name + lock indicator */}
                    <div className="border-t pt-1.5" style={{ borderColor: theme ? theme.border : "rgb(39,39,42)" }}>
                      {renamingFolder === item.name ? (
                        <input
                          ref={renameRef}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingFolder(null); }}
                          onBlur={commitRename}
                          disabled={renaming}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded border px-2 py-0.5 text-xs outline-none"
                          style={inputStyle}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-xs font-semibold" style={{ color: theme ? theme.textH : "rgb(228,228,231)" }}>
                            {item.name}
                          </p>
                          {isLocked && (
                            <UDGIcon
                              name={isUnlocked ? "unlock" : "lock"}
                              className="h-3 w-3 shrink-0"
                              mainColor={isUnlocked ? (theme ? theme.accent : "#D2FF14") : (theme ? theme.textMuted : "rgb(113,113,122)")}
                              accentColor={theme?.accent ?? "#D2FF14"}
                            />
                          )}
                        </div>
                      )}
                      <p className="mt-0.5 text-[10px]" style={{ color: theme ? theme.textMuted : "rgb(82,82,91)" }}>
                        {preview.length > 0 ? `${preview.length} item${preview.length !== 1 ? "s" : ""}` : "Folder"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── File squares ─────────────────────────────────────── */}
          {items.some((i) => i.id !== null) && (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {items.filter((i) => i.id !== null).map((item) => {
                const mime = item.metadata?.mimetype || mimeFromName(item.name);
                return (
                  <div
                    key={item.name}
                    className="group relative flex aspect-square cursor-pointer flex-col overflow-hidden rounded-lg p-2 transition-all"
                    style={theme
                      ? { backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }
                      : { backgroundColor: "rgb(24,24,27)", border: "1px solid rgb(39,39,42)" }}
                    onClick={() => openFile(item.name, mime)}
                  >
                    {/* Hover actions */}
                    <div
                      className="absolute top-1.5 right-1.5 z-10 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button title="Download" onClick={() => downloadFile(item.name, mime)} className={iconBtn()} style={{ color: theme ? theme.textMuted : undefined }}>
                        <UDGIcon name="download" className="h-3 w-3" accentColor={theme?.accent ?? "#D2FF14"} />
                      </button>
                      <button title="Move" onClick={() => { setMoveItem({ name: item.name, isFolder: false }); setMoveNavCrumbs([]); setMoveError(null); }} className={iconBtn()} style={{ color: theme ? theme.textMuted : undefined }}>
                        <UDGIcon name="move" className="h-3 w-3" accentColor={theme?.accent ?? "#D2FF14"} />
                      </button>
                      {isAdmin && (
                        <button title="Delete" onClick={() => deleteFile(item.name)} className={iconBtn(true)}>
                          <UDGIcon name="trash" className="h-3 w-3" accentColor={theme?.accent ?? "#D2FF14"} />
                        </button>
                      )}
                    </div>

                    {/* File type icon */}
                    <div className="flex flex-1 items-center justify-center">
                      {mime?.includes("pdf") ? (
                        <UDGIcon name="file" className="h-5 w-5"
                          mainColor={theme ? theme.pdfColor : "rgb(248,113,113)"}
                          accentColor={theme ? theme.pdfColor : "rgb(248,113,113)"} />
                      ) : mime?.includes("image") ? (
                        <UDGIcon name="photo" className="h-5 w-5"
                          mainColor={theme ? theme.imgColor : "rgb(96,165,250)"}
                          accentColor={theme ? theme.imgColor : "rgb(96,165,250)"} />
                      ) : (
                        <UDGIcon name="file" className="h-5 w-5"
                          mainColor={theme ? theme.fileColor : "rgb(161,161,170)"}
                          accentColor={theme ? theme.fileColor : "rgb(161,161,170)"} />
                      )}
                    </div>

                    {/* File name + size */}
                    <div className="w-full">
                      <p className="truncate text-center text-[10px] font-medium leading-tight" style={{ color: theme ? theme.textH : "rgb(228,228,231)" }}>
                        {displayName(item.name)}
                      </p>
                      <p className="text-center text-[9px] leading-tight" style={{ color: theme ? theme.textMuted : "rgb(82,82,91)" }}>
                        {item.metadata?.size ? formatBytes(item.metadata.size) : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
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
                    <UDGIcon name="chevron-right" className="ml-auto h-3.5 w-3.5 shrink-0" style={{ color: theme ? theme.textMuted : "rgb(113,113,122)" }} accentColor={theme?.accent ?? "#D2FF14"} />
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
