create table if not exists public.contact_submissions (
id uuid primary key default gen_random_uuid(),
created_at timestamp with time zone default now(),
name text not null,
company text,
email text not null,
message text not null,
source text default 'website',
status text default 'new'
);

alter table public.contact_submissions enable row level security;

create policy "Allow service role full access to contact submissions"
on public.contact_submissions
for all
to service_role
using (true)
with check (true);
