-- MARSWALK · Esquema de Supabase (notas de campo).
-- Cómo usarlo: Supabase → tu proyecto → SQL Editor → New query → pegar TODO esto → Run.
-- Se puede correr más de una vez sin romper nada.
--
-- Seguridad (solo hackathon): sin login; cualquiera con la llave anon puede leer y escribir
-- notas y fotos. Decirlo como limitación conocida. Ver CONTEXTO.md §7.

create extension if not exists pgcrypto;

-- ─── Tablas ───

create table if not exists evas (
  id uuid primary key default gen_random_uuid(),
  code text not null,              -- 'EVA 07'
  sol int not null,                -- 412
  objective text,
  created_at timestamptz default now()
);

create table if not exists annotations (   -- notas de campo (tiempo real)
  id uuid primary key default gen_random_uuid(),
  eva_id uuid references evas(id) on delete cascade,
  author text not null,            -- 'EVA 07'
  lat double precision not null,
  lon double precision not null,
  title text not null,
  note text,
  tags text[] default '{}',        -- MUESTRA | GEOLOGIA | REVISAR | PELIGRO
  photo_url text,                  -- URL pública del bucket 'field-photos'
  sample_code text,
  sol int,
  local_time text,
  created_at timestamptz default now()
);

-- ─── Acceso abierto para la llave anon (RLS activado, políticas abiertas) ───

alter table evas enable row level security;
alter table annotations enable row level security;

drop policy if exists "anon lee evas" on evas;
create policy "anon lee evas" on evas for select to anon using (true);

drop policy if exists "anon lee notas" on annotations;
create policy "anon lee notas" on annotations for select to anon using (true);

drop policy if exists "anon escribe notas" on annotations;
create policy "anon escribe notas" on annotations for insert to anon with check (true);

-- ─── Tiempo real en annotations ───

do $$
begin
  alter publication supabase_realtime add table annotations;
exception when duplicate_object then null;
end $$;

-- ─── Bucket público de fotos ───

insert into storage.buckets (id, name, public)
values ('field-photos', 'field-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "anon sube fotos" on storage.objects;
create policy "anon sube fotos" on storage.objects
  for insert to anon with check (bucket_id = 'field-photos');

drop policy if exists "anon actualiza fotos" on storage.objects;
create policy "anon actualiza fotos" on storage.objects
  for update to anon using (bucket_id = 'field-photos');

drop policy if exists "todos ven fotos" on storage.objects;
create policy "todos ven fotos" on storage.objects
  for select using (bucket_id = 'field-photos');

-- ─── La EVA de la demo ───

insert into evas (code, sol, objective)
select 'EVA 07', 412, 'Boxwork B-4'
where not exists (select 1 from evas where code = 'EVA 07');
