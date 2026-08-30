import { useCallback, useRef } from 'react';
import { Animated, Vibration } from 'react-native';
import { sounds } from './sound';

// Retorno sensorial imediato para as missões: vibração + som (quando ligado).
// Padrões distintos para cada evento ajudam o aluno a "sentir" o resultado
// antes mesmo de ler.
//
// Vibração: construída sobre o Vibration do core do React Native (sem
// dependência nova). Para haptics reais no iOS, trocar por expo-haptics aqui
// é mudança de um arquivo só.
// Som: `./sound` é no-op até uma implementação de áudio ser registrada
// (ver src/missions/sound.ts). Nenhum call site precisa mudar quando o som ligar.
export const haptics = {
  /** toque leve de seleção */
  tap: () => {
    Vibration.vibrate(12);
    sounds.tap();
  },
  /** acerto */
  correct: () => {
    Vibration.vibrate(35);
    sounds.correct();
  },
  /** erro: dois toques curtos */
  wrong: () => {
    Vibration.vibrate([0, 45, 55, 45]);
    sounds.wrong();
  },
  /** missão concluída: padrão de comemoração */
  complete: () => {
    Vibration.vibrate([0, 60, 90, 60, 90, 130]);
    sounds.complete();
  },
};

/**
 * Animação de "tremida" para respostas erradas.
 * Aplique `shakeStyle` em uma <Animated.View> e chame `triggerShake()` no erro.
 */
export function useShake() {
  const value = useRef(new Animated.Value(0)).current;

  const triggerShake = useCallback(() => {
    value.setValue(0);
    Animated.sequence([
      Animated.timing(value, { toValue: 1, duration: 45, useNativeDriver: true }),
      Animated.timing(value, { toValue: -1, duration: 45, useNativeDriver: true }),
      Animated.timing(value, { toValue: 0.6, duration: 45, useNativeDriver: true }),
      Animated.timing(value, { toValue: -0.6, duration: 45, useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  }, [value]);

  const shakeStyle = {
    transform: [
      {
        translateX: value.interpolate({
          inputRange: [-1, 1],
          outputRange: [-7, 7],
        }),
      },
    ],
  };

  return { shakeStyle, triggerShake };
}

/**
 * Retorno de resposta pronto para as missões "bespoke" (cada uma com sua
 * própria lógica de validação). Junta o haptic certo com a tremida no erro e
 * o "pop" no acerto.
 *
 * Aplique `shakeStyle` no card da missão e chame `signal(ok)` no momento em
 * que o aluno confirma uma resposta / classificação.
 */
export function useAnswerCue() {
  const { shakeStyle, triggerShake } = useShake();
  const { popStyle, triggerPop } = usePop();

  const signal = useCallback(
    (ok: boolean) => {
      if (ok) {
        haptics.correct();
        triggerPop();
      } else {
        haptics.wrong();
        triggerShake();
      }
    },
    [triggerShake, triggerPop],
  );

  return { shakeStyle, popStyle, signal };
}

/**
 * Animação de "pop" (escala) para acertos e conclusão.
 * Aplique `popStyle` em uma <Animated.View> e chame `triggerPop()` no acerto.
 */
export function usePop() {
  const value = useRef(new Animated.Value(1)).current;

  const triggerPop = useCallback(() => {
    value.setValue(0.82);
    Animated.spring(value, {
      toValue: 1,
      friction: 4,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const popStyle = { transform: [{ scale: value }] };

  return { popStyle, triggerPop };
}
