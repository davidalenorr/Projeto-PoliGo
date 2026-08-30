// Camada de som dos feedbacks das missões.
//
// Fachada estável: cada evento (tap / correct / wrong / complete) é chamado por
// `feedback.ts` em paralelo com o haptic. A reprodução em si vem de uma
// implementação registrada via `registerSoundImpl`.
//
// A implementação real está em `sound.expo-audio.ts` (usa expo-audio) e é
// ativada pelo `import '@/src/missions/sound.expo-audio'` no topo de
// `app/_layout.tsx`. Se esse import for removido, ou antes dele rodar, tudo
// aqui é no-op silencioso — o app funciona igual, só sem som.
//
// Assets em `assets/sounds/*.wav` (placeholders sintéticos — dá pra trocar por
// sons melhores mantendo os nomes; ver `assets/sounds/README.md`).

export type SoundEvent = 'tap' | 'correct' | 'wrong' | 'complete';

type SoundImpl = Partial<Record<SoundEvent, () => void>>;

let impl: SoundImpl = {};

/**
 * Registra a implementação real de áudio (ver `sound.expo-audio.example.ts`).
 * Chamar de novo substitui a anterior; chamar com `{}` desliga o som.
 */
export function registerSoundImpl(next: SoundImpl): void {
  impl = next ?? {};
}

/** `true` depois que alguma implementação de áudio foi registrada. */
export function isSoundEnabled(): boolean {
  return Object.keys(impl).length > 0;
}

function fire(event: SoundEvent): void {
  try {
    impl[event]?.();
  } catch {
    // som é enfeite: uma falha de áudio nunca pode derrubar o feedback da missão
  }
}

/** Disparado por `feedback.ts` junto com cada haptic. */
export const sounds: Record<SoundEvent, () => void> = {
  tap: () => fire('tap'),
  correct: () => fire('correct'),
  wrong: () => fire('wrong'),
  complete: () => fire('complete'),
};
