-- Add avatar_url column to admin table if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'admin' and column_name = 'avatar_url') then
    alter table public.admin add column avatar_url text;
  end if;
end $$;

-- Enable RLS on storage.objects if not already enabled (it usually is)
-- insert into storage.buckets (id, name, public)
-- values ('avatars', 'avatars', true)
-- on conflict (id) do nothing;

-- Note: Creating buckets via SQL in Supabase sometimes requires specific permissions or is done via UI. 
-- However, we will try to insert if not exists.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage
-- We'll drop existing policies to avoid conflicts if re-running
DROP POLICY IF EXISTS "Public Access to Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;

-- Create policies
CREATE POLICY "Public Access to Avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allowing anon/public uploads for now since we are in a dev environment with mixed auth
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' );
