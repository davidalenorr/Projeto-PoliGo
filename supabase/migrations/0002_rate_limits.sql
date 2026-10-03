-- ===========================================================================
-- PoliGo · Item 5 · Fase 4 — rate limiting
--
-- Contador de janela fixa por (scope, key). Só as Edge Functions
-- (service_role) tocam esta tabela — sem policy, mesmo modelo de
-- "escrita só via service_role" já usado em `events`.
-- ===========================================================================

create table public.rate_limits (
  scope        text not null,
  key          text not null,
  window_start timestamptz not null default now(),
  count        int not null default 0,
  primary key (scope, key)
);

alter table public.rate_limits enable row level security;

-- Upsert atômico de janela fixa: reseta count=1 se a janela expirou,
-- senão incrementa. Uma única instrução (lock de linha do upsert cobre
-- concorrência) — devolve o count já atualizado para a função decidir
-- liberar ou bloquear.
create or replace function public.rate_limit_hit(p_scope text, p_key text, p_window_ms int)
returns int
language sql
as $$
  insert into public.rate_limits (scope, key, window_start, count)
  values (p_scope, p_key, now(), 1)
  on conflict (scope, key) do update
    set count = case
                   when now() - rate_limits.window_start > (p_window_ms::text || ' milliseconds')::interval
                   then 1
                   else rate_limits.count + 1
                 end,
        window_start = case
                   when now() - rate_limits.window_start > (p_window_ms::text || ' milliseconds')::interval
                   then now()
                   else rate_limits.window_start
                 end
  returning count;
$$;
