-- =====================================================================
-- LOCAL DEV ONLY — roda em `supabase db reset` (não afeta o remoto).
--
-- O essencial para exercitar as Edge Functions é: um usuário em auth.users
-- (dono da turma, por causa da FK) e uma linha em public.classes.
-- A linha em auth.identities é só para conseguir logar no Studio local como
-- esse professor (senha poligo123) — se der erro por diferença de versão da
-- CLI, pode remover esse bloco: o fluxo do aluno não precisa de auth.
--
--   turma "Turma de teste (local)"  ·  join_code: GEODEV
-- =====================================================================

insert into auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values (
  '00000000-0000-0000-0000-0000000000aa',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'professor@local.test',
  extensions.crypt('poligo123', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
  '{}'::jsonb,
  now(), now()
)
on conflict (id) do nothing;

-- opcional (login no Studio local) — remova este bloco se a CLI reclamar
insert into auth.identities (
  id, provider_id, user_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
)
values (
  '00000000-0000-0000-0000-0000000000ab',
  '00000000-0000-0000-0000-0000000000aa',
  '00000000-0000-0000-0000-0000000000aa',
  'email',
  '{"sub":"00000000-0000-0000-0000-0000000000aa","email":"professor@local.test"}'::jsonb,
  now(), now(), now()
)
on conflict (id) do nothing;

insert into public.classes (id, name, join_code, owner)
values (
  '00000000-0000-0000-0000-0000000000c1',
  'Turma de teste (local)',
  'GEODEV',
  '00000000-0000-0000-0000-0000000000aa'
)
on conflict (id) do nothing;
