-- Fix team_leader_id column in fos_members to be text instead of uuid
do $$ 
begin
    -- 1. Drop the constraint if it exists (it might be named differently or not exist yet)
    alter table public.fos_members drop constraint if exists fk_fos_members_team_leader;
    alter table public.fos_members drop constraint if exists fos_members_team_leader_id_fkey;

    -- 2. Change the column type from uuid to text
    -- We use 'using team_leader_id::text' to cast existing values if any
    alter table public.fos_members 
    alter column team_leader_id type text using team_leader_id::text;

    -- 3. Re-add the foreign key constraint referencing employee_id (text)
    alter table public.fos_members
    add constraint fk_fos_members_team_leader
    foreign key (team_leader_id) references public.fos_team_leads(employee_id);

end $$;
