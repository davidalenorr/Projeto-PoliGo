# PoliGo — painel do professor

Item 5, Fase 3: painel web para o professor acompanhar turmas. Next.js
(App Router) + `@supabase/supabase-js` — a única parte do projeto que
fala com o Supabase client-side completo (o app em `bext-mobile/` só usa
`fetch` puro contra as Edge Functions).

## Desenvolvimento local

Precisa do stack do `supabase/` (Fase 0) rodando:

```bash
cd ..                      # raiz do repo
supabase start              # imprime API_URL e ANON_KEY
```

```bash
cd packages/dashboard
cp .env.local.example .env.local   # preencha NEXT_PUBLIC_SUPABASE_ANON_KEY com o valor acima
npm install
npm run dev                 # http://localhost:3000
```

Login é por magic link (sem senha). No stack local, o e-mail cai no
Mailpit (`http://127.0.0.1:54324`) em vez de uma caixa real — abra o
link de lá.

Comandos:

```bash
npm run dev         # servidor de desenvolvimento
npm run typecheck   # tsc --noEmit
npm test            # node --test, funções puras de lib/format.ts
npm run build       # build de produção
```

## O que tem aqui

- `/login` — pede e-mail, envia magic link (`supabase.auth.signInWithOtp`).
- `/auth/callback` — troca o link pela sessão e manda para `/turmas`.
- `/turmas` — turmas do professor logado (RLS: `owner = auth.uid()`, ou
  todas se `admin` — já resolvido pelas policies da Fase 0, sem lógica
  extra aqui).
- `/turmas/[classId]` — tabela ordenável vinda de `public.student_progress`
  (% da trilha, missões, chefões, precisão, tempo médio, último acesso) +
  exportar CSV.
- `/turmas/[classId]/alunos/[studentId]` — gráfico de precisão por fase e
  linha do tempo, direto de `public.events`, + exportar CSV.

Sem gráfico de terceiros — o gráfico de barras é SVG simples em
`app/turmas/[classId]/alunos/[studentId]/page.tsx`.

## Deploy

No ar: <https://dashboard-six-beige-61.vercel.app> (projeto Vercel
`davidalenorrs-projects/dashboard`), apontando para o projeto Supabase
remoto dedicado `PoliGo` (ref `qhhfcplozilwzrwztwpx`, região `sa-east-1`
— migrations e as duas Edge Functions já aplicadas/deployadas nele).
`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` desse projeto
já estão configuradas como env var de Production na Vercel.

Falta, manual (ação de conta, não automatizável):
- **Auto-deploy no push:** `vercel git connect` falhou — o GitHub App da
  Vercel precisa ser autorizado para este repo primeiro. Em
  vercel.com → projeto `dashboard` → Settings → Git → conectar
  `davidalenorr/Projeto-PoliGo`.
- **E-mail de magic link em produção:** o projeto Supabase remoto usa o
  provedor de e-mail padrão (baixo limite, só para teste). Para o piloto
  valendo, configurar SMTP próprio em Project Settings → Auth → SMTP
  Settings.
- **Primeira turma real:** rodar `supabase/snippets.sql` (blocos 1 e 2)
  no SQL Editor do projeto remoto — virar admin e criar a turma.

## Fora do escopo desta fase

Criar/arquivar/excluir turma (ainda é só via `supabase/snippets.sql`),
rate limiting — isso é Fase 4 ("Endurecimento").
