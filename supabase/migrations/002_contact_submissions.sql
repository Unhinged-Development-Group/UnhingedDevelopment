CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Service-role API inserts on behalf of visitors; no direct public access needed.
-- Uncomment the policy below only if you switch to anon-key inserts:
-- CREATE POLICY "public_insert" ON public.contact_submissions
--   FOR INSERT TO public WITH CHECK (true);
