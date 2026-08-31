import React, { useMemo, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BossConfig, BossQuestion } from '@/src/data/bossMissions';
import type { PhaseNarrative } from '@/src/data/narrative';
import { styles } from './styles';
import { haptics, useAnswerCue } from './feedback';
import { FeedbackNote, MissionCompletionAction, type MissionRenderProps } from './shared';

type BossMissionProps = MissionRenderProps & {
  config: BossConfig;
  narrative: PhaseNarrative;
};

type Stage = 'intro' | 'fight' | 'won';

/**
 * Duelo de chefão: barra de vida do inimigo = número de questões. Cada questão
 * precisa ser respondida corretamente para avançar (errar não tira vida, só
 * mostra o "porquê" e deixa tentar de novo). Vida zerada = fase revisada.
 */
export function BossMission({
  config,
  narrative,
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: BossMissionProps) {
  const [stage, setStage] = useState<Stage>(alreadyCompleted ? 'won' : 'intro');
  const [questions, setQuestions] = useState<BossQuestion[]>(() => config.buildQuestions());
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<'hit' | 'miss' | null>(null);
  const { shakeStyle, signal } = useAnswerCue();

  const maxHp = questions.length;
  const hp = Math.max(0, maxHp - index);
  const current = questions[index];

  const hpPct = useMemo(() => Math.round((hp / maxHp) * 100), [hp, maxHp]);

  const startFight = () => {
    haptics.tap();
    setQuestions(config.buildQuestions());
    setIndex(0);
    setSelected(null);
    setLastResult(null);
    setStage('fight');
  };

  const attack = () => {
    if (!selected || lastResult === 'hit') return;
    const correct = selected === current.answer;
    signal(correct);
    setLastResult(correct ? 'hit' : 'miss');
  };

  const advance = () => {
    const nextIndex = index + 1;
    setSelected(null);
    setLastResult(null);
    if (nextIndex >= questions.length) {
      setStage('won');
      return;
    }
    setIndex(nextIndex);
  };

  const retry = () => {
    setSelected(null);
    setLastResult(null);
  };

  // ---- INTRO ----------------------------------------------------------------
  if (stage === 'intro') {
    return (
      <View style={styles.missionCard}>
        <View style={bossStyles.villainCard}>
          <Text style={bossStyles.villainKicker}>CHEFÃO DE FASE · {narrative.district}</Text>
          <Text style={bossStyles.villainName}>{narrative.bossName}</Text>
          <Text style={bossStyles.villainTaunt}>“{narrative.bossTaunt}”</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          {config.title} — {maxHp} golpes certeiros para dissipar a Névoa deste distrito.
        </Text>
        <Pressable style={({ pressed }) => [styles.completeButton, pressed && styles.completeButtonPressed]} onPress={startFight} accessibilityRole="button">
          <Text style={styles.completeButtonText}>Começar o duelo</Text>
        </Pressable>
      </View>
    );
  }

  // ---- WON ----------------------------------------------------------------
  if (stage === 'won') {
    return (
      <View style={styles.missionCard}>
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>{narrative.bossName} derrotado!</Text>
          <Text style={styles.successText}>{narrative.bossDefeat}</Text>
        </View>
        <View style={bossStyles.medalCard}>
          <MaterialCommunityIcons name="medal" size={30} color="#B45309" />
          <View style={{ flex: 1 }}>
            <Text style={bossStyles.medalLabel}>Medalha conquistada</Text>
            <Text style={bossStyles.medalName}>{narrative.medal.name}</Text>
          </View>
        </View>
        <MissionCompletionAction
          alreadyCompleted={alreadyCompleted}
          nextMissionId={nextMissionId}
          onComplete={onComplete}
          onNext={onNext}
        />
      </View>
    );
  }

  // ---- FIGHT ----------------------------------------------------------------
  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>{narrative.bossName}</Text>

      <View style={bossStyles.hpRow}>
        <Text style={bossStyles.hpLabel}>Vida</Text>
        <View style={bossStyles.hpTrack}>
          <View style={[bossStyles.hpFill, { width: `${hpPct}%` }]} />
        </View>
        <Text style={bossStyles.hpValue}>{hp}/{maxHp}</Text>
      </View>

      <Animated.View style={[styles.trainingCard, shakeStyle]}>
        <Text style={styles.trainingTitle}>Golpe {index + 1} de {maxHp}</Text>
        <Text style={styles.caseContext}>{current.prompt}</Text>

        <View style={styles.optionsWrap}>
          {current.options.map((option) => {
            const isSelected = selected === option;
            const locked = lastResult === 'hit';
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`Alternativa: ${option}`}
                accessibilityState={{ disabled: locked, selected: isSelected }}
                style={({ pressed }) => [
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                  locked && styles.optionButtonDisabled,
                  pressed && !locked && styles.optionButtonPressed,
                ]}
                disabled={locked}
                onPress={() => {
                  haptics.tap();
                  setSelected(option);
                }}
              >
                <Text style={styles.optionButtonText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        {lastResult && (
          <FeedbackNote
            tone={lastResult === 'hit' ? 'correct' : 'wrong'}
            message={lastResult === 'hit' ? 'Golpe certeiro!' : 'A Névoa aparou o golpe.'}
            explanation={current.explanation}
          />
        )}

        {lastResult === 'hit' ? (
          <Pressable accessibilityRole="button" style={styles.nextCaseButton} onPress={advance}>
            <Text style={styles.nextCaseButtonText}>
              {index + 1 >= maxHp ? 'Golpe final!' : 'Próximo golpe'}
            </Text>
          </Pressable>
        ) : lastResult === 'miss' ? (
          <Pressable accessibilityRole="button" style={styles.nextCaseButton} onPress={retry}>
            <Text style={styles.nextCaseButtonText}>Tentar de novo</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.nextCaseButton,
              pressed && styles.nextCaseButtonPressed,
              !selected && styles.nextStepButtonDisabled,
            ]}
            disabled={!selected}
            onPress={attack}
            accessibilityRole="button"
          >
            <Text style={styles.nextCaseButtonText}>Atacar</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const bossStyles = {
  villainCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    padding: 14,
    gap: 6,
    marginBottom: 10,
  },
  villainKicker: { color: '#A5B4FC', fontSize: 10, fontWeight: '900' as const, letterSpacing: 1 },
  villainName: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' as const },
  villainTaunt: { color: '#C7D2FE', fontSize: 13, fontStyle: 'italic' as const, lineHeight: 18 },
  hpRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginBottom: 10 },
  hpLabel: { fontSize: 11, fontWeight: '800' as const, color: '#6B7280' },
  hpTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    overflow: 'hidden' as const,
  },
  hpFill: { height: '100%' as const, backgroundColor: '#DC2626', borderRadius: 999 },
  hpValue: { fontSize: 11, fontWeight: '900' as const, color: '#B91C1C' },
  medalCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: '#FEF9C3',
    borderColor: '#FDE047',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  medalEmoji: { fontSize: 32 },
  medalLabel: { fontSize: 10, fontWeight: '900' as const, color: '#854D0E', letterSpacing: 0.5 },
  medalName: { fontSize: 15, fontWeight: '900' as const, color: '#713F12' },
};
