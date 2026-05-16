import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Company identifiers that map to storage bucket folders
export const COMPANY_FOLDERS = {
  "unhinged-development": "unhinged-development",
  groomr: "groomr",
  "paper-and-ponder": "paper-and-ponder",
} as const;

export type CompanyKey = keyof typeof COMPANY_FOLDERS;

export const COMPANY_LABELS: Record<CompanyKey, string> = {
  "unhinged-development": "Unhinged Development Group",
  groomr: "Groomr Ltd",
  "paper-and-ponder": "Paper & Ponder Ltd",
};
