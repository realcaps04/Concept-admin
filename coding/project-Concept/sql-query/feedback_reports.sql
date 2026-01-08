-- Table for storing feedback, bugs, and suggestions
create table if not exists public.feedback_reports (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('bug', 'suggestion', 'other')),
  title text not null,
  description text not null,
  -- related_element text, -- Added via alter table below to ensure idempotency
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'rejected')),
  admin_id uuid references public.admin(id), 
  admin_email text, 
  admin_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add related_element column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'feedback_reports' and column_name = 'related_element') then
    alter table public.feedback_reports add column related_element text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'feedback_reports' and column_name = 'notes') then
    alter table public.feedback_reports add column notes text;
  end if;
end $$;

-- Enable RLS (idempotent, harmless if already enabled)
alter table public.feedback_reports enable row level security;

-- Drop existing policies to ensure clean state and avoid "already exists" errors
drop policy if exists "Admins can insert feedback" on public.feedback_reports;
drop policy if exists "Admins can view their own feedback" on public.feedback_reports;
drop policy if exists "Admins can view feedback" on public.feedback_reports;
drop policy if exists "Admins can update feedback" on public.feedback_reports;

-- Create policies

-- Allow INSERT
create policy "Admins can insert feedback"
on public.feedback_reports for insert
to anon, authenticated, public
with check (true);

-- Allow SELECT (Viewing)
create policy "Admins can view feedback"
on public.feedback_reports for select
to anon, authenticated, public
using (true);

-- Allow UPDATE (Updating status and notes)
create policy "Admins can update feedback"
on public.feedback_reports for update
to anon, authenticated, public
using (true)
with check (true);
