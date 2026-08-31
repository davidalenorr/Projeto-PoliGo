import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, Text, TextInput, Vibration, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Mission } from '@/src/data/missions';
import { numbersEqual, parseFlexibleNumber, parsePairInput } from '@/src/utils/equationValidation';
import { styles } from './styles';
import { haptics, usePop, useShake } from './feedback';

type FeedbackTone = 'correct' | 'wrong' | 'info';

/**
 * Retorno visual de uma tentativa: banner colorido, animado, com um bloco
 * "Por quê?" que explica o passo quando a resposta está errada.
 */
export function FeedbackNote({
  tone,
  message,
  explanation,
}: {
  tone: FeedbackTone;
  message: string;
  explanation?: string;
}) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [enter, message, explanation]);

  const palette =
    tone === 'correct'
      ? { bg: '#EAF9EE', border: '#A8E0BA', title: '#166534' }
      : tone === 'wrong'
        ? { bg: '#FEF2F2', border: '#FCA5A5', title: '#B91C1C' }
        : { bg: '#EEF6FF', border: '#C9DEEF', title: '#0B5F8F' };

  return (
    <Animated.View
      style={{
        backgroundColor: palette.bg,
        borderColor: palette.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        gap: 6,
        marginTop: 8,
        opacity: enter,
        transform: [
          {
            translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }),
          },
        ],
      }}
    >
      <Text style={{ color: palette.title, fontSize: 13, fontWeight: '800' }}>
        {tone === 'correct' ? '✅ ' : tone === 'wrong' ? '✋ ' : 'ℹ️ '}
        {message}
      </Text>

      {tone === 'wrong' && !!explanation && (
        <View style={{ gap: 2 }}>
          <Text style={{ color: '#9A3412', fontSize: 11, fontWeight: '900' }}>Por quê?</Text>
          <Text style={{ color: '#5B3A1E', fontSize: 12, lineHeight: 17 }}>{explanation}</Text>
        </View>
      )}
    </Animated.View>
  );
}

/** Botão discreto para sortear novos valores numa missão de cálculo procedural. */
export function RegenerateButton({ onPress, label }: { onPress: () => void; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? 'Trocar números'}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [
        {
          alignSelf: 'flex-start',
          marginTop: 4,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: '#C9DEEF',
          backgroundColor: '#EEF6FF',
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <MaterialIcons name="autorenew" size={13} color="#0B5F8F" />
        <Text style={{ color: '#0B5F8F', fontSize: 12, fontWeight: '800' }}>{label ?? 'Trocar números'}</Text>
      </View>
    </Pressable>
  );
}

/**
 * Feedback padrão das missões de prática numérica: mesmo texto de antes, mas
 * dispara haptics + tremida quando a resposta muda para errada, e "pop" quando
 * fica correta.
 */
export function PracticeFeedback({ feedback, ok }: { feedback: string | null; ok: boolean }) {
  const { shakeStyle, triggerShake } = useShake();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (feedback && feedback !== previous.current) {
      if (ok) {
        haptics.correct();
      } else {
        haptics.wrong();
        triggerShake();
      }
    }
    previous.current = feedback;
  }, [feedback, ok, triggerShake]);

  if (!feedback) {
    return null;
  }

  return (
    <Animated.View style={shakeStyle}>
      <Text style={[styles.feedbackText, !ok && { color: '#B91C1C' }]}>{feedback}</Text>
    </Animated.View>
  );
}

export type MissionRenderProps = {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
};

export function MissionHeader({ mission }: { mission: Mission }) {
  return (
    <View style={styles.headerCard}>
      <Text style={styles.headerTitle}>{mission.title}</Text>
      <Text style={styles.headerDescription}>{mission.description}</Text>
      <Text style={styles.headerObjective}>{mission.objective}</Text>
    </View>
  );
}

export function MissionHints({ tips }: { tips: string[] }) {
  const [revealedLevel, setRevealedLevel] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  if (!tips || !tips.length) {
    return null;
  }

  const handleRevealNext = () => {
    Vibration.vibrate(40);
    if (revealedLevel < tips.length) {
      setRevealedLevel((prev) => prev + 1);
    }
  };

  return (
    <View style={styles.hintsWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isOpen ? 'Ocultar dicas' : 'Pedir dica'}
        style={({ pressed }) => [styles.hintTrigger, pressed && styles.hintTriggerPressed]}
        onPress={() => {
          Vibration.vibrate(30);
          setIsOpen((prev) => !prev);
          if (revealedLevel === 0) setRevealedLevel(1);
        }}
      >
        <View style={styles.hintBubble}>
          <MaterialIcons name="lightbulb" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.hintTriggerText}>
          {isOpen ? 'Ocultar Dicas' : `💡 Dicas Graduais (${revealedLevel > 0 ? `Nível ${revealedLevel}/3` : 'Pedir Dica'})`}
        </Text>
      </Pressable>

      {isOpen && (
        <View style={styles.hintsCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={styles.hintsTitle}>Dicas da Missão</Text>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#0B5F8F' }}>
              Nível {revealedLevel} de {tips.length}
            </Text>
          </View>

          {tips.slice(0, revealedLevel).map((tip, idx) => (
            <View
              key={tip}
              style={{
                backgroundColor: '#F8FBFF',
                borderRadius: 12,
                padding: 10,
                marginBottom: 6,
                borderWidth: 1,
                borderColor: '#D0DFEE',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#0B5F8F', marginBottom: 2 }}>
                {idx === 0 ? '🔍 Pista Inicial' : idx === 1 ? '📐 Fórmula / Conceito' : '📝 Passo a Passo Explicativo'}
              </Text>
              <Text style={{ fontSize: 13, color: '#334155', lineHeight: 18 }}>{tip}</Text>
            </View>
          ))}

          {revealedLevel < tips.length && (
            <Pressable
              style={({ pressed }) => [
                {
                  marginTop: 4,
                  backgroundColor: '#EEF6FF',
                  borderWidth: 1,
                  borderColor: '#0B5F8F',
                  borderRadius: 12,
                  paddingVertical: 8,
                  alignItems: 'center',
                },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleRevealNext}
            >
              <Text style={{ color: '#0B5F8F', fontSize: 12, fontWeight: '800' }}>
                + Revelar Dica Nível {revealedLevel + 1}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export function MissionCompletionAction({
  alreadyCompleted,
  nextMissionId,
  onComplete,
  onNext,
}: {
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onComplete: () => void;
  onNext?: () => void;
}) {
  const [clicked, setClicked] = useState(false);
  const { popStyle, triggerPop } = usePop();

  const handlePress = () => {
    setClicked(true);
    haptics.complete();
    triggerPop();
    onComplete();
  };

  if (alreadyCompleted || clicked) {
    return (
      <View style={styles.afterCompleteWrap}>
        <Animated.View style={[
          styles.alreadyDoneBadge,
          { flexDirection: 'row', alignItems: 'center', gap: 6 },
          clicked && { backgroundColor: '#DEF7EC', borderColor: '#31C48D' },
          clicked && popStyle,
        ]}>
          <Image
            source={require('../../icons/screens/verificar.png')}
            style={{ width: 14, height: 14, resizeMode: 'contain' }}
          />
          <Text style={[
            styles.alreadyDoneText,
            clicked && { color: '#03543F' },
            { flexShrink: 1 }
          ]}>
            {clicked ? 'Missão concluída com sucesso!' : 'Missão já concluída para este detetive.'}
          </Text>
        </Animated.View>

        {nextMissionId && onNext ? (
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.nextMissionButton, pressed && styles.nextMissionButtonPressed]} onPress={onNext}>
            <Text style={styles.nextMissionButtonText}>Ir para a próxima missão</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.completeButton, pressed && styles.completeButtonPressed]} onPress={handlePress}>
      <Text style={styles.completeButtonText}>Concluir missão e continuar</Text>
    </Pressable>
  );
}

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

export function MissionQuizFlow({
  title,
  subtitle,
  questions: staticQuestions,
  generateQuestions,
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  /** Se presente, sorteia questões novas a cada abertura e pelo botão "Trocar questões". */
  generateQuestions?: () => QuizQuestion[];
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    generateQuestions ? generateQuestions() : staticQuestions,
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);
  const [hits, setHits] = useState(0);
  const { shakeStyle, triggerShake } = useShake();

  const handleRegenerate = () => {
    if (!generateQuestions) return;
    setQuestions(generateQuestions());
    setIndex(0);
    setSelected(null);
    setLastCorrect(null);
    setLocked(false);
    setHits(0);
  };

  const finished = index >= questions.length;
  const current = finished ? null : questions[index];

  if (finished) {
    const scorePct = Math.round((hits / questions.length) * 100);

    return (
      <View style={styles.missionCard}>
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Missão concluída!</Text>
          <Text style={styles.successText}>
            Acertos: {hits}/{questions.length} ({scorePct}%).
          </Text>
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

  if (!current) {
    return null;
  }

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>

      {generateQuestions && index === 0 && !locked && selected === null && (
        <RegenerateButton onPress={handleRegenerate} label="Trocar questões" />
      )}

      <Animated.View style={[styles.trainingCard, shakeStyle]}>
        <Text style={styles.trainingTitle}>Questão {index + 1} de {questions.length}</Text>
        <Text style={styles.caseContext}>{current.prompt}</Text>

        <View style={styles.optionsWrap}>
          {current.options.map((option) => {
            const isSelected = selected === option;

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

        {locked && lastCorrect !== null && (
          <FeedbackNote
            tone={lastCorrect ? 'correct' : 'wrong'}
            message={lastCorrect ? 'Correto!' : 'Não foi dessa vez.'}
            explanation={current.explanation}
          />
        )}

        {!locked ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !selected }}
            style={({ pressed }) => [
              styles.nextCaseButton,
              pressed && styles.nextCaseButtonPressed,
              !selected && styles.nextStepButtonDisabled,
            ]}
            disabled={!selected}
            onPress={() => {
              if (!selected) {
                return;
              }

              const correct = selected === current.answer;
              if (correct) {
                setHits((prev) => prev + 1);
                haptics.correct();
              } else {
                haptics.wrong();
                triggerShake();
              }

              setLastCorrect(correct);
              setLocked(true);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Validar resposta</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.nextCaseButton, pressed && styles.nextCaseButtonPressed]}
            onPress={() => {
              setIndex((prev) => prev + 1);
              setSelected(null);
              setLastCorrect(null);
              setLocked(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>
              {index + 1 === questions.length ? 'Ver resultado' : 'Próxima questão'}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

type EquationStepShape = {
  id: string;
  prompt: string;
  type: 'number' | 'pair';
  expected: number | { x: number; y: number };
  /** Explicação passo a passo mostrada quando a resposta está errada. */
  explanation?: string;
};

export function GenericEquationMission({
  title,
  subtitle,
  steps: initialSteps,
  generate,
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  title: string;
  subtitle?: string;
  steps: EquationStepShape[];
  /** Se presente, sorteia números novos a cada abertura e pelo botão "Trocar números". */
  generate?: () => EquationStepShape[];
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [steps, setSteps] = useState<EquationStepShape[]>(() =>
    generate ? generate() : initialSteps,
  );
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [inputY, setInputY] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | 'invalid' | null>(null);
  const { shakeStyle, triggerShake } = useShake();

  const step = steps[index];
  const isLastStep = index + 1 >= steps.length;

  const handleRegenerate = () => {
    if (!generate) return;
    setSteps(generate());
    setIndex(0);
    setInput('');
    setInputY('');
    setResult(null);
  };

  const registerWrong = (kind: 'wrong' | 'invalid') => {
    setResult(kind);
    haptics.wrong();
    triggerShake();
  };

  const handleCheck = () => {
    if (step.type === 'number') {
      const parsed = parseFlexibleNumber(input);
      if (parsed === null) {
        registerWrong('invalid');
        return;
      }

      const expected = step.expected as number;
      if (numbersEqual(parsed, expected, 1e-2)) {
        setResult('correct');
        haptics.correct();
        return;
      }

      registerWrong('wrong');
      return;
    }

    // pair
    const parsedPair = parsePairInput(input, inputY);
    if (!parsedPair) {
      registerWrong('invalid');
      return;
    }

    const exp = step.expected as { x: number; y: number };
    if (numbersEqual(parsedPair.x, exp.x, 1e-2) && numbersEqual(parsedPair.y, exp.y, 1e-2)) {
      setResult('correct');
      haptics.correct();
      return;
    }

    registerWrong('wrong');
  };

  const resetStepInput = () => {
    setResult(null);
    setInput('');
    setInputY('');
  };

  const handleAdvance = () => {
    resetStepInput();
    setIndex((i) => i + 1);
  };

  const feedbackNote =
    result === 'correct' ? (
      <FeedbackNote tone="correct" message={step.type === 'pair' ? 'Solução correta!' : 'Correto!'} />
    ) : result === 'wrong' ? (
      <FeedbackNote
        tone="wrong"
        message={step.type === 'pair' ? 'Solução incorreta.' : 'Resposta incorreta.'}
        explanation={step.explanation}
      />
    ) : result === 'invalid' ? (
      <FeedbackNote
        tone="info"
        message={step.type === 'pair' ? 'Insira números válidos para x e y.' : 'Insira um número válido.'}
      />
    ) : null;

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}

      {generate && index === 0 && result !== 'correct' && (
        <RegenerateButton onPress={handleRegenerate} />
      )}

      <Animated.View style={[styles.trainingCard, shakeStyle]}>
        <Text style={styles.trainingTitle}>{`Problema ${index + 1} de ${steps.length}`}</Text>
        <Text style={styles.caseContext}>{step.prompt}</Text>

        {step.type === 'number' ? (
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            accessibilityLabel="Sua resposta"
            value={input}
            onChangeText={(v) => { setInput(v); setResult(null); }}
          />
        ) : (
          <>
            <Text style={styles.caseContext}>x</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              accessibilityLabel="Valor de x"
              value={input}
              onChangeText={(v) => { setInput(v); setResult(null); }}
            />
            <Text style={styles.caseContext}>y</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              accessibilityLabel="Valor de y"
              value={inputY}
              onChangeText={(v) => { setInputY(v); setResult(null); }}
            />
          </>
        )}

        {feedbackNote}

        {result === null || result === 'invalid' ? (
          <Pressable accessibilityRole="button" style={styles.nextCaseButton} onPress={handleCheck}>
            <Text style={styles.nextCaseButtonText}>Verificar</Text>
          </Pressable>
        ) : result === 'wrong' ? (
          <Pressable accessibilityRole="button" style={styles.nextCaseButton} onPress={() => setResult(null)}>
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        ) : !isLastStep ? (
          <Pressable accessibilityRole="button" style={styles.nextCaseButton} onPress={handleAdvance}>
            <Text style={styles.nextCaseButtonText}>Próximo problema</Text>
          </Pressable>
        ) : null}
      </Animated.View>

      {result === 'correct' && isLastStep && (
        <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
      )}
    </View>
  );
}

export function GenericMission({
  mission,
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  mission: Mission;
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Conteúdo em desenvolvimento para esta fase</Text>
      <Text style={styles.sectionSubtitle}>{mission.objective}</Text>
      <MissionCompletionAction
        alreadyCompleted={alreadyCompleted}
        nextMissionId={nextMissionId}
        onComplete={onComplete}
        onNext={onNext}
      />
    </View>
  );
}
