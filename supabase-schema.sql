-- À exécuter une seule fois dans Supabase : SQL Editor > New query > coller > Run

create table if not exists app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table app_state enable row level security;

create policy "Lecture pour utilisateurs connectés"
  on app_state for select
  using (auth.role() = 'authenticated');

create policy "Écriture pour utilisateurs connectés"
  on app_state for insert
  with check (auth.role() = 'authenticated');

create policy "Mise à jour pour utilisateurs connectés"
  on app_state for update
  using (auth.role() = 'authenticated');
