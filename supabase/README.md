# PoliGo — backend (Supabase)

Infra do **Item 5**: sincronização do progresso do jogo + base para o painel do professor.
Fica **fora** do app Expo (`bext-mobile/`) de propósito — o app só é tocado na Fase 1.

```
supabase/
  config.toml              config da CLI (local + funções)
  migrations/0001_init.sql  esquema: classes, students, events, RLS, view student_progress
  migrations/0002_rate_limits.sql  tabela + função de rate limit por janela fixa
  functions/
    _shared/http.ts         utilidades (CORS, json, uuid, sha256, clamp)
    _shared/rateLimit.ts    checkRateLimit() — janela fixa via rate_limit_hit() no banco
    join-class/index.ts      aluno entra numa turma → { studentId, classId, className }
    ingest-events/index.ts   recebe lote de eventos de jogo (append-only, dedupe)
  seed.sql                 professor + turma de teste (SÓ no `supabase db reset` local)
  snippets.sql             operações manuais no painel (virar admin, criar turma, arquivar…)
```

## O modelo, em uma tela

- **`classes`** — turma: `name`, `join_code` (6 chars A-Z/0-9), `owner` (professor = `auth.users`).
- **`students`** — `class_id`, `display_name` (primeiro nome), `device_hash` (sha256 de um uuid anônimo do aparelho). **Sem PII além do nome.**
- **`events`** — log append-only: `type` (`mission_started` | `mission_attempt` | `mission_completed` | `boss_defeated` | `quiz_session`), `mission_id`, `phase_number`, `correct`, `duration_ms`, `occurred_at`. Dedupe por `(student_id, client_event_id)`.
- **`student_progress`** — view (roda com a RLS de quem consulta) que agrega tudo por aluno para o painel.

**RLS:** nenhuma policy para `anon`. O app do aluno **nunca** fala com as tabelas — só com as duas Edge Functions (que rodam com `service_role`). O professor lê só as suas turmas; `admin` lê todas.

**Rate limit:** as duas Edge Functions limitam por aparelho e por turma (janela fixa de 1 min — `join-class`: 20/aparelho, 60/turma; `ingest-events`: 30/aluno, 300/turma), guardado em `rate_limits` via `rate_limit_hit()`. Estoura o limite → `429 {"error":"rate_limited"}`.

## O que é coletado

Dado mínimo, documentado aqui para quem precisa explicar isso a uma escola:

- **Sai do aparelho do aluno:** primeiro nome, código da turma, um id anônimo do aparelho (gerado no app, nunca o id real), e eventos de jogo (missão, fase, acerto/erro, duração, horário).
- **Não sai:** sobrenome, e-mail, telefone, foto, localização ou qualquer identificador pessoal.
- **Quem vê:** só o professor dono da turma (ou `admin`), pelo painel — nunca outro aluno, nunca outra turma.
- **Apagar:** o professor pode arquivar (para novos alunos/eventos, mantém o histórico) ou excluir a turma inteira (apaga aluno e eventos em cascade, irreversível) direto pelo painel.

## Pré-requisitos

```bash
# CLI do Supabase (Homebrew no macOS)
brew install supabase/tap/supabase
supabase --version
# Docker Desktop aberto (para o stack local)
```

## Desenvolvimento local

```bash
cd Projeto-PoliGo            # raiz do repo (onde está a pasta supabase/)

supabase start              # sobe Postgres + Auth + Studio + Functions em Docker
# guarda o que ele imprime: API URL, anon key, service_role key, Studio URL

supabase db reset           # aplica migrations/0001_init.sql + roda seed.sql
supabase functions serve    # serve join-class e ingest-events localmente
```

Studio local: <http://localhost:54323> · login `professor@local.test` / `poligo123` (admin).
Turma de teste: código **`GEODEV`**.

Testar as funções (troque a porta/host se o `supabase start` indicar outro):

```bash
# entrar na turma de teste
curl -s -X POST http://localhost:54321/functions/v1/join-class \
  -H 'content-type: application/json' \
  -d '{"code":"GEODEV","displayName":"Ana","deviceId":"dev-device-0001"}'
# -> {"studentId":"...","classId":"...","className":"Turma de teste (local)"}

# mandar um evento (use os ids devolvidos acima e um uuid qualquer)
curl -s -X POST http://localhost:54321/functions/v1/ingest-events \
  -H 'content-type: application/json' \
  -d '{"studentId":"<studentId>","classId":"<classId>","events":[
        {"clientEventId":"11111111-1111-4111-8111-111111111111",
         "type":"mission_completed","missionId":"fase1_m1","phaseNumber":1,
         "durationMs":42000,"occurredAt":"2026-08-30T12:00:00.000Z"}]}'
# -> {"accepted":1}   (repetir o mesmo clientEventId -> {"accepted":0})
```

## Ir para o projeto remoto

1. Crie o projeto no <https://supabase.com/dashboard> (região **South America (São Paulo)** se disponível). Guarde a senha do banco.
2. Ligue o repo ao projeto e suba o esquema + as funções:

   ```bash
   supabase login
   supabase link --project-ref <ref-do-projeto>
   supabase db push                       # aplica migrations/ no remoto
   supabase functions deploy join-class
   supabase functions deploy ingest-events
   ```

   `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetados nas funções automaticamente — não precisa `secrets set`.

3. Assine com o seu e-mail (magic link) para criar seu `auth.users`, depois rode no **SQL Editor** os trechos de `snippets.sql`: **(1)** virar admin e **(2)** criar sua primeira turma real. **(3)** pega o `join_code`.

4. Anote para a **Fase 1** (config do app):
   - `SUPABASE_URL` → `https://<ref>.supabase.co`
   - `SUPABASE_ANON_KEY` → em *Project Settings → API* (pode ir embutida no bundle; a segurança é RLS + função-porteiro)
   - endpoints: `POST {SUPABASE_URL}/functions/v1/join-class` e `.../ingest-events`

## O que ainda não está aqui

- **Painel web** (`packages/dashboard`, Fase 3).
- **Instrumentação no app** — os `emit*` (Fase 2).
- Decisão pendente: manter Edge Functions (Deno) **ou** trocar por uma função serverless na Vercel. Para o piloto, ficar no Supabase é o mais simples.
