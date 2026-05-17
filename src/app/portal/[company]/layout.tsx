"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { createClient, COMPANY_LABELS, type CompanyKey } from "@/lib/supabase";

const NAV = [
  {
    key: "documents",
    label: "Documents",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
  },
  {
    key: "policies",
    label: "Policies",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    key: "designs",
    label: "Designs",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    key: "projects",
    label: "Projects",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    key: "team",
    label: "Team",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const COMPANIES: { key: CompanyKey; short: string }[] = [
  { key: "unhinged-development", short: "Unhinged Dev" },
  { key: "groomr", short: "Groomr" },
  { key: "paper-and-ponder", short: "Paper & Ponder" },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const company = params.company as string;

  const [user, setUser] = useState<{ email?: string; avatarUrl?: string; initials?: string; isAdmin: boolean } | null>(null);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-unhinged-green" />
      </div>
    );
  }

  const companyLabel = COMPANY_LABELS[company as CompanyKey] ?? company;
  const activeSection = pathname.split("/")[3] ?? "";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-900 bg-ink-950/90 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs font-semibold tracking-widest text-zinc-600 uppercase hover:text-zinc-400 transition-colors">
            UDG
          </Link>
          <span className="h-4 w-px bg-zinc-800" />
          <Link href={`/portal/${company}`} className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
            {companyLabel}
          </Link>
        </div>
        <Link
          href={`/portal/${company}/account`}
          className="flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-unhinged-green text-[10px] font-bold text-ink-950">
              {user?.initials}
            </span>
          )}
          <span className="hidden sm:block">{user?.email}</span>
        </Link>
      </header>

      {/* Admin company switcher — mobile strip */}
      {user?.isAdmin && (
        <div className="border-b border-zinc-900 bg-ink-950 px-4 py-2 sm:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {COMPANIES.map(({ key, short }) => (
              <Link
                key={key}
                href={`/portal/${key}`}
                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  company === key
                    ? "bg-unhinged-green text-ink-950"
                    : "border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {short}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-zinc-900 pt-4 sm:flex">
          {/* Admin company switcher */}
          {user?.isAdmin && (
            <div className="mb-2 px-3">
              <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-[0.15em] text-zinc-600 uppercase">Company</p>
              <nav className="flex flex-col gap-0.5">
                {COMPANIES.map(({ key, short }) => (
                  <Link
                    key={key}
                    href={`/portal/${key}`}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      company === key
                        ? "bg-ink-800 text-white"
                        : "text-zinc-500 hover:bg-ink-800/50 hover:text-zinc-300"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${company === key ? "bg-unhinged-green" : "bg-zinc-700"}`} />
                    {short}
                  </Link>
                ))}
              </nav>
              <div className="mt-3 h-px bg-zinc-900" />
            </div>
          )}

          {/* Section nav */}
          <nav className="flex flex-col gap-1 px-3">
            <Link
              href={`/portal/${company}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                activeSection === "" ? "bg-ink-800 text-white" : "text-zinc-500 hover:bg-ink-800/50 hover:text-zinc-300"
              }`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`h-5 w-5 ${activeSection === "" ? "text-unhinged-green" : ""}`}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Overview
            </Link>
            {NAV.map((item) => {
              const active = activeSection === item.key;
              return (
                <Link
                  key={item.key}
                  href={`/portal/${company}/${item.key}`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active ? "bg-ink-800 text-white" : "text-zinc-500 hover:bg-ink-800/50 hover:text-zinc-300"
                  }`}
                >
                  <span className={active ? "text-unhinged-green" : ""}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Account */}
          <div className="mt-auto border-t border-zinc-900 p-3">
            <Link
              href={`/portal/${company}/account`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                activeSection === "account"
                  ? "bg-ink-800 text-white"
                  : "text-zinc-500 hover:bg-ink-800/50 hover:text-zinc-300"
              }`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`h-5 w-5 ${activeSection === "account" ? "text-unhinged-green" : ""}`}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto pb-20 sm:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
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
              {item.icon}
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
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Account
        </Link>
      </nav>
    </div>
  );
}
