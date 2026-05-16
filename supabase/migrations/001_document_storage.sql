-- BEFORE running this SQL:
-- 1. Go to Storage in the Supabase dashboard
-- 2. Create a new bucket named exactly: documents
-- 3. Set it to Private (not public)
-- Then paste this entire file into the SQL Editor and run it.

-- Helper in public schema (storage schema is restricted in Supabase)
create or replace function public.doc_company(path text)
returns text
language sql immutable
as $$
  select split_part(path, '/', 1);
$$;

-- Users can view files in their own company's folder.
-- Users with company='all' can view everything.
create policy "Users can view own company documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (
      (auth.jwt() -> 'user_metadata' ->> 'company') = 'all'
      or public.doc_company(name) = (auth.jwt() -> 'user_metadata' ->> 'company')
    )
  );

-- Users can only upload into their own company's folder.
create policy "Users can upload to own company folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (
      (auth.jwt() -> 'user_metadata' ->> 'company') = 'all'
      or public.doc_company(name) = (auth.jwt() -> 'user_metadata' ->> 'company')
    )
  );

-- Users can delete files in their own company's folder.
create policy "Users can delete own company documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (
      (auth.jwt() -> 'user_metadata' ->> 'company') = 'all'
      or public.doc_company(name) = (auth.jwt() -> 'user_metadata' ->> 'company')
    )
  );
