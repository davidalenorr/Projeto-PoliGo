-- Trechos para rodar no SQL Editor do painel do Supabase (projeto remoto),
-- logado com a sua conta. Não são migrations — é operação manual.

-- ---------------------------------------------------------------------------
-- 1) Tornar-se admin (enxergar TODAS as turmas no painel)
-- ---------------------------------------------------------------------------
update auth.users
set raw_app_meta_data =
      coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'SEU_EMAIL_AQUI';
-- (faça logout/login no painel depois, para o novo JWT valer)

-- ---------------------------------------------------------------------------
-- 2) Criar uma turma sua
--    join_code: exatamente 6 caracteres A-Z / 0-9, SEM hífen.
--    (a UI pode exibir como "GEO-4K2"; o app envia "GEO4K2")
-- ---------------------------------------------------------------------------
insert into public.classes (name, join_code, owner)
select '9º ano B — Escola X', 'GEO4K2', id
from auth.users
where email = 'SEU_EMAIL_AQUI';

-- ---------------------------------------------------------------------------
-- 3) Ver os códigos das minhas turmas
-- ---------------------------------------------------------------------------
select c.name, c.join_code, c.archived_at, c.created_at
from public.classes c
join auth.users u on u.id = c.owner
where u.email = 'SEU_EMAIL_AQUI'
order by c.created_at desc;

-- ---------------------------------------------------------------------------
-- 4) Arquivar uma turma
--    Para de aceitar novos alunos/eventos; os dados existentes ficam.
-- ---------------------------------------------------------------------------
update public.classes set archived_at = now() where join_code = 'GEO4K2';

-- ---------------------------------------------------------------------------
-- 5) Excluir uma turma e TODOS os dados dela
--    Remove alunos + eventos em cascade. Irreversível.
-- ---------------------------------------------------------------------------
delete from public.classes where join_code = 'GEO4K2';

-- ---------------------------------------------------------------------------
-- 6) Conferir a chegada de eventos (sanity check durante o piloto)
-- ---------------------------------------------------------------------------
select c.name as turma, count(e.*) as eventos, max(e.occurred_at) as ultimo
from public.classes c
left join public.events e on e.class_id = c.id
group by c.name
order by ultimo desc nulls last;
