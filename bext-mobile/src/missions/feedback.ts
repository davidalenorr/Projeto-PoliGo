import { useCallback, useRef } from 'react';
import { Animated, Vibration } from 'react-native';

// Retorno tátil imediato para as missões. Padrões distintos para cada evento
// ajudam o aluno a "sentir" o resultado antes mesmo de ler.
//
// Construído sobre o Vibration do core do React Native (sem dependência nova).
// Para haptics reais no iOS, trocar a implementação por expo-haptics aqui é
// mudança de um arquivo só.
export const haptics = {
  /** toque leve de seleção */
  tap: () => Vibration.vibrate(12),
  /** acerto */
  correct: () => Vibration.vibrate(35),
  /** erro: dois toques curtos */
  wrong: () => Vibration.vibrate([0, 45, 55, 45]),
  /** missão concluída: padrão de comemoração */
  complete: () => Vibration.vibrate([0, 60, 90, 60, 90, 130]),
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
