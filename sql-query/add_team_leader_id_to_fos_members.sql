-- Add team_leader_id column to fos_members to classify members by their Team Lead's Employee ID
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'fos_members' and column_name = 'team_leader_id') then
    alter table public.fos_members 
    add column team_leader_id text;
    
    -- Add foreign key constraint to fos_team_leads(employee_id)
    -- This assumes employee_id in fos_team_leads is unique (which it is)
    alter table public.fos_members
    add constraint fk_fos_members_team_leader
    foreign key (team_leader_id) references public.fos_team_leads(employee_id);

    comment on column public.fos_members.team_leader_id is 'Reference to the Employee ID of the Team Lead who manages this member';
  end if;
end $$;
