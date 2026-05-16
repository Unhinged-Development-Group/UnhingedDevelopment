import { createClient } from "@supabase/supabase-js";
export { DOMAIN_COMPANY_MAP, isValidEmailForCompany } from "./auth";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
