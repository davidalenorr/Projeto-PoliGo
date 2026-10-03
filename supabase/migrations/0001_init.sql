-- ===========================================================================
-- PoliGo · Item 5 · esquema inicial
--
-- Modelo: turmas (dono = professor), alunos (só primeiro nome + hash do
-- aparelho) e um log APPEND-ONLY de eventos de jogo.
--
-- Privacidade: nenhuma tabela tem policy para `anon`. O app do aluno NUNCA
-- fala com as tabelas — só com as Edge Functions (join-class / ingest-events),
-- que rodam com service_role. Professores/admin leem via RLS.
-- ===========================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- helper: o usuário autenticado atual é admin? (você, para ver todas as turmas)
-- defina com:
--   update auth.users
--   set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}'
--   where email = 'seu-email@exemplo.com';
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- classes
-- ---------------------------------------------------------------------------
create table public.classes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  join_code   text not null unique
                check (join_code ~ '^[A-Z0-9]{6}$'),
  owner       uuid not null references auth.users (id) on delete cascade,
  archived_at timestamptz,
  created_at  timestamptz not null default now()
);

create index classes_owner_idx on public.classes (owner);

comment on column public.classes.join_code is
  '6 caracteres A-Z/0-9, sem hífen no banco (a UI mostra GEO-4K2, o app envia GEO4K2).';

-- ---------------------------------------------------------------------------
-- students  (sem PII além do primeiro nome)
-- ---------------------------------------------------------------------------
create table public.students (
  id           uuid primary key default gen_random_uuid(),
  class_id     uuid not null references public.classes (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  device_hash  text not null,          -- sha256 do uuid anônimo do aparelho (nunca o id cru)
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (class_id, device_hash)
);

create index students_class_idx on public.students (class_id);

-- ---------------------------------------------------------------------------
-- events  (append-only)
-- ---------------------------------------------------------------------------
create type public.event_type as enum (
  'mission_started',
  'mission_attempt',
  'mission_completed',
  'boss_defeated',
  'quiz_session'
);

create table public.events (
  id              bigint generated always as identity primary key,
  client_event_id uuid not null,       -- chave de dedupe gerada no app
  student_id      uuid not null references public.students (id) on delete cascade,
  class_id        uuid not null references public.classes (id) on delete cascade,
  type            public.event_type not null,
  mission_id      text check (mission_id is null or char_length(mission_id) <= 40),
  phase_number    smallint check (phase_number is null or phase_number between 1 and 10),
  correct         boolean,
  duration_ms     integer check (duration_ms is null or (duration_ms >= 0 and duration_ms <= 3600000)),
  payload         jsonb not null default '{}'::jsonb,
  occurred_at     timestamptz not null,
  received_at     timestamptz not null default now(),
  unique (student_id, client_event_id)
);

create index events_class_time_idx on public.events (class_id, occurred_at desc);
create index events_student_idx    on public.events (student_id, occurred_at desc);
create index events_mission_idx    on public.events (class_id, mission_id);

-- ===========================================================================
-- Row-Level Security
-- ===========================================================================
alter table public.classes  enable row level security;
alter table public.students enable row level security;
alter table public.events   enable row level security;

-- classes: o dono (ou admin) faz tudo; mais ninguém enxerga.
create policy classes_owner_all on public.classes
  for all
  to authenticated
  using      (owner = auth.uid() or public.is_admin())
  with check (owner = auth.uid() or public.is_admin());

-- students: só acessível através da turma que pertence ao professor/admin.
create policy students_by_owning_class on public.students
  for all
  to authenticated
  using (exists (
    select 1 from public.classes c
    where c.id = students.class_id
      and (c.owner = auth.uid() or public.is_admin())
  ))
  with check (exists (
    select 1 from public.classes c
    where c.id = students.class_id
      and (c.owner = auth.uid() or public.is_admin())
  ));

-- events: SOMENTE LEITURA para o professor da turma / admin.
-- Nenhuma policy de INSERT/UPDATE/DELETE => escrita só via Edge Function (service_role).
create policy events_read_by_owning_class on public.events
  for select
  to authenticated
  using (exists (
    select 1 from public.classes c
    where c.id = events.class_id
      and (c.owner = auth.uid() or public.is_admin())
  ));

-- ===========================================================================
-- View para o painel — roda com a RLS de quem consulta (security_invoker).
-- ===========================================================================
create view public.student_progress
with (security_invoker = true)
as
with completed as (
  select
    student_id,
    count(*) filter (where type = 'mission_completed') as missions_completed,
    count(*) filter (where type = 'boss_defeated')     as bosses_defeated,
    count(*) filter (where type = 'quiz_session')      as quiz_sessions,
    max(occurred_at)                                   as last_activity
  from public.events
  group by student_id
),
attempts as (
  select
    student_id,
    count(*) filter (where type = 'mission_attempt')                     as attempts,
    count(*) filter (where type = 'mission_attempt' and correct)         as attempts_correct,
    round(avg(duration_ms) filter (where type = 'mission_completed'))    as avg_completion_ms
  from public.events
  group by student_id
)
select
  s.id                                as student_id,
  s.class_id,
  s.display_name,
  s.last_seen_at,
  coalesce(c.missions_completed, 0)   as missions_completed,
  coalesce(c.bosses_defeated, 0)      as bosses_defeated,
  coalesce(c.quiz_sessions, 0)        as quiz_sessions,
  c.last_activity,
  coalesce(a.attempts, 0)             as attempts,
  coalesce(a.attempts_correct, 0)     as attempts_correct,
  case when coalesce(a.attempts, 0) > 0
       then round(100.0 * a.attempts_correct / a.attempts)
       else 0
  end                                 as accuracy_pct,
  a.avg_completion_ms
from public.students s
left join completed c on c.student_id = s.id
left join attempts  a on a.student_id = s.id;

comment on view public.student_progress is
  'Progresso agregado por aluno. O percentual da trilha é calculado no painel (missions_completed / total de missões do app).';
