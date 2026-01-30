-- Create FOS Members table if it doesn't exist
create table if not exists public.fos_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text unique not null,
  phone text,
  password text not null, -- Store hashed passwords in production
  status text default 'active',
  profile_image_url text,
  last_login timestamp with time zone
);

-- Add employee_id column if it doesn't exist (Idempotent)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'fos_members' and column_name = 'employee_id') then
    alter table public.fos_members add column employee_id text unique;
  end if;
end $$;

-- Create FOS Team Leads table if it doesn't exist
create table if not exists public.fos_team_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text unique not null,
  phone text,
  password text not null, -- Store hashed passwords in production
  status text default 'active',
  profile_image_url text,
  last_login timestamp with time zone,
  department text
);

-- Enable Row Level Security (RLS)
alter table public.fos_members enable row level security;
alter table public.fos_team_leads enable row level security;

-- Create policies (safe to run, will error if exists but won't stop execution if run individually, 
-- or use DO block for safer policy creation, but for now simple checks usually suffice in dev)

-- Policy: Members
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Enable read access for all users' and tablename = 'fos_members') then
    create policy "Enable read access for all users" on public.fos_members for select using (true);
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Enable insert for all users' and tablename = 'fos_members') then
    create policy "Enable insert for all users" on public.fos_members for insert with check (true);
  end if;

   if not exists (select 1 from pg_policies where policyname = 'Enable update for users based on ID' and tablename = 'fos_members') then
    create policy "Enable update for users based on ID" on public.fos_members for update using (true);
  end if;
end $$;

-- Policy: Team Leads
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Enable read access for all users' and tablename = 'fos_team_leads') then
    create policy "Enable read access for all users" on public.fos_team_leads for select using (true);
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Enable insert for all users' and tablename = 'fos_team_leads') then
    create policy "Enable insert for all users" on public.fos_team_leads for insert with check (true);
  end if;

   if not exists (select 1 from pg_policies where policyname = 'Enable update for users based on ID' and tablename = 'fos_team_leads') then
    create policy "Enable update for users based on ID" on public.fos_team_leads for update using (true);
  end if;
end $$;

-- Add employee_id column to fos_team_leads if it doesn't exist (Idempotent)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'fos_team_leads' and column_name = 'employee_id') then
    alter table public.fos_team_leads add column employee_id text unique;
  end if;
end $$;

-- Add designation column to fos_team_leads if it doesn't exist (Idempotent)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'fos_team_leads' and column_name = 'designation') then
    alter table public.fos_team_leads add column designation text default 'Team Leader';
  end if;
end $$;

-- Update existing team leads to have the designation set
update public.fos_team_leads 
set designation = 'Team Leader' 
where designation is null or designation = '';

