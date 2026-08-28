Projeto PoliGo — app educativo de geometria

O que é
Um aplicativo para aprender geometria e álgebra de forma prática, por missões curtas e interativas. Cada fase reúne missões com objetivos claros (identificar formas, calcular áreas, resolver equações, etc.). O frontend é um app Expo em TypeScript pensado para ser fácil de estender com novos casos e missões.

Como o projeto foi pensado (arquitetura)
- App principal: pasta `bext-mobile/` — um app React Native usando Expo e `expo-router`.
- Dados dirigidos por conteúdo: `src/data/phases.ts`, `src/data/missions.ts` e `src/data/equationMissions.ts` descrevem fases, missões e missões algébricas; adicionar conteúdo não exige mexer na tela.
- Execução de missões: `app/mission-play.tsx` só orquestra (progresso, streak, navegação). O catálogo de componentes de missão vive em `src/missions/` (`practice.tsx`, `quiz.tsx`, `interactive.tsx`, `shared.tsx`), com o mapa id→componente em `src/missions/registry.tsx`.
- Geração procedural: `src/missions/procedural.ts` sorteia os números das missões de cálculo (sem decoreba).
- Retorno sensorial: `src/missions/feedback.ts` (haptics + animações de acerto/erro).
- Regras puras e testáveis: `src/domain/` (`progress.ts`, `streak.ts`, `missionRouting.ts`).
- Armazenamento local: `src/storage/*` guarda progresso, detectives e seleção usando `AsyncStorage`.
- Utilitários: `src/utils/equationValidation.ts` — parsing tolerante para respostas numéricas.

Como rodar (desenvolvimento)

1. Instale dependências e inicie o Metro/Expo:

```bash
cd bext-mobile
npm install
npx expo start
```

2. Abrir no emulador ou dispositivo físico via QR (Expo Dev Tools).

Opções rápidas:

```bash
# iOS simulator
npx expo run:ios

# Android emulator
npx expo run:android
```

Testes e checagens locais

- Suíte de testes unitários (validação numérica, progressão de fase, streaks, roteamento de missões, geradores procedurais e integridade dos dados). Usa o runner nativo do Node (`node --test`), sem dependências extras:

```bash
cd bext-mobile
npm test
```

Os testes ficam em `bext-mobile/tests/*.test.ts` e cobrem as funções puras de `src/domain/`, `src/utils/` e `src/missions/procedural.ts`.

- Checagem TypeScript:

```bash
npx tsc --noEmit
```
