-- Create the documents storage bucket (private by default)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Helper: extract the company folder from a storage path (e.g. "groomr/file.pdf" -> "groomr")
create or replace function storage.company_from_path(path text)
returns text
language sql immutable
as $$
  select split_part(path, '/', 1);
$$;

-- Allow authenticated users to view files in their own company's folder.
-- Admin users (company = 'all') can see everything.
create policy "Users can view own company documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (
      auth.jwt() ->> 'company' = 'all'
      or storage.company_from_path(name) = (auth.jwt() ->> 'company')
    )
  );

-- Allow authenticated users to upload to their own company's folder only.
create policy "Users can upload to own company folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (
      auth.jwt() ->> 'company' = 'all'
      or storage.company_from_path(name) = (auth.jwt() ->> 'company')
    )
  );

-- Allow users to delete their own company's files (admin can delete any).
create policy "Users can delete own company documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (
      auth.jwt() ->> 'company' = 'all'
      or storage.company_from_path(name) = (auth.jwt() ->> 'company')
    )
  );
