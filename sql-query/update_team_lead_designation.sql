-- Update script to add designation column to fos_team_leads table
-- Run this in your Supabase SQL Editor

-- Add designation column to fos_team_leads if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'fos_team_leads' and column_name = 'designation') then
    alter table public.fos_team_leads add column designation text default 'Team Leader';
  end if;
end $$;

-- Update existing team leads to have the designation set to 'Team Leader'
update public.fos_team_leads 
set designation = 'Team Leader' 
where designation is null or designation = '';

-- Verify the update
select id, name, department, designation from public.fos_team_leads;
