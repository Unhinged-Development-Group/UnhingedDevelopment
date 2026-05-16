export const DOMAIN_COMPANY_MAP: Record<string, string[]> = {
  "unhingeddevelopment.uk": ["unhinged-development", "all"],
  "groomr.uk": ["groomr"],
  "paperandponder.uk": ["paper-and-ponder"],
};

export function isValidEmailForCompany(email: string, company: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  const allowed = DOMAIN_COMPANY_MAP[domain];
  if (!allowed) return false;
  return allowed.includes(company);
}
