-- Ejecuta este script completo en Supabase: Dashboard -> SQL Editor -> New query -> pegar y "Run".

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Proyecto sin título',
  canvas_data jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ya tenías la tabla creada de antes: esto agrega la columna de "compartir" sin tocar tus datos.
alter table public.projects add column if not exists is_public boolean not null default false;

alter table public.projects enable row level security;

create policy "select_own_projects" on public.projects
  for select using (auth.uid() = owner_id);

-- Permite que cualquiera (sin sesión) lea un proyecto puntual si el dueño lo marcó como público.
-- Solo da acceso de lectura; insert/update/delete siguen restringidos al dueño más abajo.
drop policy if exists "select_public_projects" on public.projects;
create policy "select_public_projects" on public.projects
  for select using (is_public = true);

create policy "insert_own_projects" on public.projects
  for insert with check (auth.uid() = owner_id);

create policy "update_own_projects" on public.projects
  for update using (auth.uid() = owner_id);

create policy "delete_own_projects" on public.projects
  for delete using (auth.uid() = owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;

create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();
