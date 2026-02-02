-- Create Loan Checklists table
create table if not exists public.loan_checklists (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  scheme_id text not null, -- e.g., 'KCC_LOW', 'KCC_HIGH', 'PMMY', 'SME', 'SHG', 'Recovery', 'PMEGP', 'PMFME', 'Swayamsidha', 'AEL'
  document_title text not null,
  document_description text,
  is_required boolean default true,
  display_order integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.loan_checklists enable row level security;

-- Create policies
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Enable read access for all users' and tablename = 'loan_checklists') then
    create policy "Enable read access for all users" on public.loan_checklists for select using (true);
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Enable all access for team leads' and tablename = 'loan_checklists') then
    create policy "Enable all access for team leads" on public.loan_checklists for all using (true);
  end if;
end $$;

-- Insert default data for KCC Low Value
insert into public.loan_checklists (scheme_id, document_title, document_description, display_order)
values 
('KCC_LOW', 'Identity Proof', 'Aadhar Card, Voter ID, or PAN Card', 1),
('KCC_LOW', 'Address Proof', 'Utility Bills, Ration Card, or Aadhar', 2),
('KCC_LOW', 'Land Ownership Records', '7/12 Extract, Mutation Entry, or Revenue Receipt', 3),
('KCC_LOW', 'Cropping Pattern', 'Certificate from Local Authority or Patwari', 4),
('KCC_LOW', 'Recent Photographs', '2x Recent passport-size color photos', 5),
('KCC_LOW', 'No Dues Certificate', 'From neighboring financial institutions', 6)
on conflict do nothing;

-- Insert default data for KCC High Value
insert into public.loan_checklists (scheme_id, document_title, document_description, display_order)
values 
('KCC_HIGH', 'Identity Proof', 'Aadhar Card, Voter ID, or PAN Card', 1),
('KCC_HIGH', 'Address Proof', 'Utility Bills, Ration Card, or Aadhar', 2),
('KCC_HIGH', 'Land Ownership Records', '7/12 Extract, Mutation Entry, or Revenue Receipt', 3),
('KCC_HIGH', 'Cropping Pattern', 'Certificate from Local Authority or Patwari', 4),
('KCC_HIGH', 'Recent Photographs', '2x Recent passport-size color photos', 5),
('KCC_HIGH', 'No Dues Certificate', 'From neighboring financial institutions', 6),
('KCC_HIGH', 'Collateral Documents', 'Property valuation and title deeds', 7)
on conflict do nothing;
