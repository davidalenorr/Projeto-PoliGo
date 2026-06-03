Projeto PoliGo — app educativo de geometria

O que é
Um aplicativo para aprender geometria e álgebra de forma prática, por missões curtas e interativas. Cada fase reúne missões com objetivos claros (identificar formas, calcular áreas, resolver equações, etc.). O frontend é um app Expo em TypeScript pensado para ser fácil de estender com novos casos e missões.

Como o projeto foi pensado (arquitetura)
- App principal: pasta `bext-mobile/` — um app React Native usando Expo e `expo-router`.
- Dados dirigidos por conteúdo: `src/data/phases.ts` e `src/data/missions.ts` descrevem fases e missões; isso torna simples adicionar novas missões sem tocar em muita lógica.
- Execução de missões: `app/mission-play.tsx` contém o fluxo que carrega a missão correta e renderiza um componente específico ou um componente genérico (ex.: `GenericEquationMission`).
- Armazenamento local: `src/storage/*` guarda progresso, detectives e seleção usando `AsyncStorage`.
- Utilitários: `src/utils/` para validação e helpers (ex.: `equationValidation.ts` contém parsing tolerante para respostas numéricas).

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
- Verificação rápida da validação numérica:

```bash
node ./scripts/test-equation-validation.js
```

- Checagem TypeScript:

```bash
npx tsc --noEmit
```
