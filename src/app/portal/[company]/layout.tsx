"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { createClient, COMPANY_LABELS, type CompanyKey } from "@/lib/supabase";
import UDGIcon from "@/components/UDGIcon";

const NAV: { key: string; label: string; icon: import("@/components/UDGIcon").IconName }[] = [
  { key: "documents", label: "Documents", icon: "folder"  },
  { key: "policies",  label: "Policies",  icon: "shield"  },
  { key: "designs",   label: "Designs",   icon: "edit"    },
  { key: "projects",  label: "Projects",  icon: "grid"    },
  { key: "team",      label: "Team",      icon: "users"   },
];


const COMPANIES: { key: CompanyKey; short: string }[] = [
  { key: "unhinged-development", short: "Unhinged Development Group" },
  { key: "groomr", short: "Groomr" },
  { key: "paper-and-ponder", short: "Paper & Ponder" },
];

const G = {
  cream: "#F9F8F4",
  deepSlate: "#2C3E50",
  gold: "#EAE45C",
  sage: "#88A096",
  pebble: "rgba(149,165,166,0.25)",
  navActiveBg: "rgba(234,228,92,0.15)",
  navInactiveText: "rgba(44,62,80,0.55)",
} as const;

const PP = {
  alabaster: "#fafaf9",
  charcoal: "#1c1917",
  deepClay: "#7c2d12",
  terracotta: "#fb923c",
  stone200: "#e7e5e4",
  stone500: "#78716c",
  navActiveBg: "rgba(124,45,18,0.08)",
  navInactiveText: "rgba(28,25,23,0.45)",
} as const;

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const company = params.company as string;

  const [user, setUser] = useState<{
    email?: string;
    avatarUrl?: string;
    initials?: string;
    isAdmin: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/portal"); return; }

      const userCompany = user.user_metadata?.company as string;
      const validCompanies = Object.keys(COMPANY_LABELS);
      if (!validCompanies.includes(company)) { router.push("/portal"); return; }
      if (userCompany !== "all" && userCompany !== company) {
        router.push(`/portal/${userCompany}`);
        return;
      }

      const name = user.email ?? "";
      const initials = name.split("@")[0].slice(0, 2).toUpperCase();
      setUser({ email: user.email, avatarUrl: user.user_metadata?.avatar_url, initials, isAdmin: userCompany === "all" });
      setLoading(false);
    })();
  }, [company, router]);

  const isGroomr = company === "groomr";
  const isPP = company === "paper-and-ponder";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {isGroomr ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: "rgba(44,62,80,0.1)", borderTopColor: G.gold }} />
        ) : isPP ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: "rgba(28,25,23,0.08)", borderTopColor: PP.terracotta }} />
        ) : (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-unhinged-green" />
        )}
      </div>
    );
  }

  const companyLabel = COMPANY_LABELS[company as CompanyKey] ?? company;
  const activeSection = pathname.split("/")[3] ?? "";

  const isBranded = isGroomr || isPP;
  const accentColor = isGroomr ? G.gold : isPP ? PP.terracotta : "#D2FF14";

  const navLinkClass = (active: boolean) =>
    isBranded
      ? "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
      : `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
          active ? "bg-ink-800 text-white" : "text-zinc-500 hover:bg-ink-800/50 hover:text-zinc-300"
        }`;

  const navLinkStyle = (active: boolean): React.CSSProperties => {
    if (isGroomr) return active ? { backgroundColor: G.navActiveBg, color: G.deepSlate } : { color: G.navInactiveText };
    if (isPP) return active ? { backgroundColor: PP.navActiveBg, color: PP.deepClay } : { color: PP.navInactiveText };
    return {};
  };

  const navIconStyle = (active: boolean): React.CSSProperties => {
    if (isGroomr && active) return { color: G.gold };
    if (isPP && active) return { color: PP.terracotta };
    return {};
  };

  const navIconClass = (active: boolean) =>
    !isBranded && active ? "text-unhinged-green" : "";

  return (
    <div className="flex min-h-screen flex-col">
      {isGroomr && (
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&display=swap');`}</style>
      )}
      {isPP && (
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');`}</style>
      )}

      {/* Top bar — always dark */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-900 bg-ink-950/90 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs font-semibold tracking-widest text-zinc-600 uppercase hover:text-zinc-400 transition-colors">
            UDG
          </Link>
          <span className="h-4 w-px bg-zinc-800" />
          {user?.isAdmin ? (
            <div className="relative flex items-center">
              <select
                value={company}
                onChange={(e) => router.push(`/portal/${e.target.value}`)}
                className="appearance-none bg-transparent text-sm font-medium text-zinc-300 border-none outline-none cursor-pointer pr-5 hover:text-white transition-colors"
              >
                {COMPANIES.map(({ key, short }) => (
                  <option key={key} value={key} style={{ backgroundColor: "#09090b", color: "#d4d4d8" }}>
                    {short}
                  </option>
                ))}
              </select>
              <UDGIcon name="chevron-down" className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" accentColor="#D2FF14" />
            </div>
          ) : (
            <Link href={`/portal/${company}`} className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              {companyLabel}
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside
          className={`hidden w-52 shrink-0 flex-col border-r pt-4 sm:flex${isBranded ? "" : " border-zinc-900"}`}
          style={
            isGroomr ? { backgroundColor: G.cream, borderColor: G.pebble, fontFamily: "'Nunito', sans-serif" }
            : isPP ? { backgroundColor: PP.alabaster, borderColor: PP.stone200, fontFamily: "'Montserrat', sans-serif" }
            : undefined
          }
        >
          <nav className="flex flex-col gap-1 px-3">
            {(() => {
              const active = activeSection === "";
              return (
                <Link href={`/portal/${company}`} className={navLinkClass(active)} style={navLinkStyle(active)}>
                  <UDGIcon name="home" className={`h-5 w-5 ${navIconClass(active)}`} style={navIconStyle(active)} accentColor={accentColor} />
                  Overview
                </Link>
              );
            })()}
            {NAV.map((item) => {
              const active = activeSection === item.key;
              return (
                <Link key={item.key} href={`/portal/${company}/${item.key}`} className={navLinkClass(active)} style={navLinkStyle(active)}>
                  <UDGIcon name={item.icon} className={`h-5 w-5 ${navIconClass(active)}`} style={navIconStyle(active)} accentColor={accentColor} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto p-3" style={{ borderTop: `1px solid ${isGroomr ? G.pebble : isPP ? PP.stone200 : "rgb(24,24,27)"}` }}>
            {(() => {
              const active = activeSection === "account";
              return (
                <Link href={`/portal/${company}/account`} className={navLinkClass(active)} style={navLinkStyle(active)}>
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover shrink-0" />
                  ) : user?.initials ? (
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${!isBranded ? "bg-unhinged-green text-ink-950" : ""}`}
                      style={
                        isGroomr ? { backgroundColor: G.gold, color: G.deepSlate }
                        : isPP ? { backgroundColor: PP.terracotta, color: PP.alabaster }
                        : undefined
                      }
                    >
                      {user?.initials}
                    </span>
                  ) : (
                    <UDGIcon name="user" className={`h-5 w-5 ${navIconClass(active)}`} style={navIconStyle(active)} accentColor={accentColor} />
                  )}
                  Account
                </Link>
              );
            })()}
          </div>
        </aside>

        <main className="flex-1 overflow-auto pb-20 sm:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      {isBranded ? (
        <nav
          className="fixed bottom-0 left-0 right-0 z-20 flex border-t sm:hidden"
          style={
            isGroomr
              ? { backgroundColor: G.cream, borderColor: G.pebble, fontFamily: "'Nunito', sans-serif" }
              : { backgroundColor: PP.alabaster, borderColor: PP.stone200, fontFamily: "'Montserrat', sans-serif" }
          }
        >
          {NAV.map((item) => {
            const active = activeSection === item.key;
            const activeColor = isGroomr ? G.gold : PP.terracotta;
            const inactiveColor = isGroomr ? G.navInactiveText : PP.navInactiveText;
            return (
              <Link
                key={item.key}
                href={`/portal/${company}/${item.key}`}
                className="flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors"
                style={{ color: active ? activeColor : inactiveColor }}
              >
                <UDGIcon name={item.icon} className="h-5 w-5" accentColor={accentColor} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href={`/portal/${company}/account`}
            className="flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors"
            style={{ color: activeSection === "account" ? (isGroomr ? G.gold : PP.terracotta) : (isGroomr ? G.navInactiveText : PP.navInactiveText) }}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                style={isGroomr ? { backgroundColor: G.gold, color: G.deepSlate } : { backgroundColor: PP.terracotta, color: PP.alabaster }}
              >
                {user?.initials}
              </span>
            )}
            Account
          </Link>
        </nav>
      ) : (
        <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-zinc-900 bg-ink-950/95 backdrop-blur-sm sm:hidden">
          {NAV.map((item) => {
            const active = activeSection === item.key;
            return (
              <Link
                key={item.key}
                href={`/portal/${company}/${item.key}`}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                  active ? "text-unhinged-green" : "text-zinc-600"
                }`}
              >
                <UDGIcon name={item.icon} className="h-5 w-5" accentColor="#D2FF14" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href={`/portal/${company}/account`}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
              activeSection === "account" ? "text-unhinged-green" : "text-zinc-600"
            }`}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-unhinged-green text-[10px] font-bold text-ink-950">
                {user?.initials}
              </span>
            )}
            Account
          </Link>
        </nav>
      )}
    </div>
  );
}
