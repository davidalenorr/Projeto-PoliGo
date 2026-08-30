// Implementação real de áudio para os feedbacks das missões (usa expo-audio).
//
// Ativação: importado uma vez no topo de app/_layout.tsx.
//
// IMPORTANTE: expo-audio é um MÓDULO NATIVO. Depois de `npx expo install
// expo-audio` é preciso recompilar o app (Expo Go do SDK 55, `npx expo
// run:ios/android` ou novo dev client). Se o binário estiver desatualizado,
// tudo aqui falha de forma controlada e o app segue sem som (só haptics).

import { registerSoundImpl, type SoundEvent } from './sound';

type ExpoAudioModule = {
  createAudioPlayer: (source: number) => { volume: number; play: () => void; seekTo: (s: number) => Promise<void> };
  setAudioModeAsync: (mode: Record<string, unknown>) => Promise<void>;
};

type Player = ReturnType<ExpoAudioModule['createAudioPlayer']>;

function loadExpoAudio(): ExpoAudioModule | null {
  try {
    // require (não import estático) para que a ausência do módulo nativo
    // seja capturável aqui em vez de derrubar o bundle.
    const mod = require('expo-audio') as ExpoAudioModule;
    if (mod && typeof mod.createAudioPlayer === 'function') {
      return mod;
    }
  } catch {
    // módulo nativo ausente — binário não recompilado
  }
  return null;
}

const expoAudio = loadExpoAudio();

if (expoAudio) {
  const SOURCES: Record<SoundEvent, number> = {
    tap: require('../../assets/sounds/tap.wav'),
    correct: require('../../assets/sounds/correct.wav'),
    wrong: require('../../assets/sounds/wrong.wav'),
    complete: require('../../assets/sounds/complete.wav'),
  };

  // Ajustado para loudness percebido parecido entre os 4 (o "wrong" e o
  // "complete" sintetizados têm RMS mais alto, então entram mais baixos).
  const VOLUME: Record<SoundEvent, number> = {
    tap: 0.32,
    correct: 0.62,
    wrong: 0.48,
    complete: 0.72,
  };

  try {
    // SFX curtos: tocam no modo silencioso do iOS e não interrompem música.
    expoAudio.setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
  } catch {
    // ignora
  }

  const players: Partial<Record<SoundEvent, Player>> = {};

  const getPlayer = (event: SoundEvent): Player | null => {
    try {
      let player = players[event];
      if (!player) {
        player = expoAudio.createAudioPlayer(SOURCES[event]);
        player.volume = VOLUME[event];
        players[event] = player;
      }
      return player;
    } catch {
      return null;
    }
  };

  const playCue = (event: SoundEvent): void => {
    const player = getPlayer(event);
    if (!player) return;
    try {
      player.seekTo(0).catch(() => {});
      player.play();
    } catch {
      // som é enfeite: falha de reprodução nunca interrompe o feedback
    }
  };

  registerSoundImpl({
    tap: () => playCue('tap'),
    correct: () => playCue('correct'),
    wrong: () => playCue('wrong'),
    complete: () => playCue('complete'),
  });
}
