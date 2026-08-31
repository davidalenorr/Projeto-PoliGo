import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { getDetectives, saveDetectives } from '@/src/storage/detectives';
import { recordQuickQuizResult } from '@/src/storage/practiceStats';
import { makeTrainingQuiz, type GeneratedQuizQuestion } from '@/src/missions/procedural';
import { haptics } from '@/src/missions/feedback';

const QUESTIONS_PER_SESSION = 8;
const POINTS_PER_CORRECT = 5;

export default function QuickQuizScreen() {
  const [detectiveId, setDetectiveId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GeneratedQuizQuestion[]>(() => makeTrainingQuiz(QUESTIONS_PER_SESSION));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [awardedPoints, setAwardedPoints] = useState(0);

  useEffect(() => {
    let mounted = true;
    getSelectedDetectiveId().then((id) => {
      if (mounted) setDetectiveId(id);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const startSession = useCallback(() => {
    setQuestions(makeTrainingQuiz(QUESTIONS_PER_SESSION));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setFinished(false);
    setAwardedPoints(0);
  }, []);

  const current = questions[index];
  const isCorrect = answered && selected === current?.answer;

  const handleSelect = (option: string) => {
    if (answered) return;
    haptics.tap();
    setSelected(option);
    setAnswered(true);
    if (option === current.answer) {
      haptics.correct();
      setScore((prev) => prev + 1);
    } else {
      haptics.wrong();
    }
  };

  const handleNext = async () => {
    if (index < questions.length - 1) {
      setIndex((prev) => prev + 1);
      setSelected(null);
      setAnswered(false);
      return;
    }

    // fim da sessão
    const bonus = score * POINTS_PER_CORRECT;
    setAwardedPoints(bonus);
    setFinished(true);
    haptics.complete();

    if (detectiveId) {
      await recordQuickQuizResult(detectiveId, score, questions.length);
      if (bonus > 0) {
        const list = await getDetectives();
        await saveDetectives(
          list.map((d) => (d.id === detectiveId ? { ...d, points: d.points + bonus } : d)),
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="arrow-back" size={22} color="#1F3E66" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Modo Treino Livre</Text>
            <Text style={styles.headerSub}>Questões sorteadas de todas as fases · +{POINTS_PER_CORRECT} Pts por acerto</Text>
          </View>
        </View>

        {!finished ? (
          <>
            <View style={styles.progressCard}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>
                  Questão {index + 1} de {questions.length}
                </Text>
                <Text style={styles.progressScore}>Acertos: {score}</Text>
              </View>
              <View style={styles.progressBase}>
                <View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} />
              </View>
            </View>

            {current ? (
              <View style={styles.card}>
                <Text style={styles.questionPrompt}>{current.prompt}</Text>

                <View style={styles.optionsList}>
                  {current.options.map((option, idx) => {
                    const chosen = selected === option;
                    const showCorrect = answered && option === current.answer;
                    const showWrong = answered && chosen && option !== current.answer;

                    return (
                      <Pressable
                        key={option}
                        disabled={answered}
                        onPress={() => handleSelect(option)}
                        accessibilityRole="button"
                        accessibilityLabel={`Alternativa ${String.fromCharCode(65 + idx)}: ${option}`}
                        accessibilityState={{ disabled: answered, selected: chosen }}
                        style={({ pressed }) => [
                          styles.optionCard,
                          chosen && !answered && styles.optionSelected,
                          showCorrect && styles.optionCorrect,
                          showWrong && styles.optionIncorrect,
                          pressed && !answered && styles.pressed,
                        ]}
                      >
                        <View style={styles.optionIndex}>
                          <Text style={styles.optionIndexText}>{String.fromCharCode(65 + idx)}</Text>
                        </View>
                        <Text style={styles.optionText}>{option}</Text>
                        {showCorrect ? (
                          <MaterialIcons name="check-circle" size={18} color="#059669" />
                        ) : showWrong ? (
                          <MaterialIcons name="cancel" size={18} color="#DC2626" />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>

                {answered && (
                  <View style={styles.feedbackWrap}>
                    <View style={[styles.feedbackCard, isCorrect ? styles.feedbackOk : styles.feedbackBad]}>
                      <Text style={[styles.feedbackTitle, { color: isCorrect ? '#059669' : '#DC2626' }]}>
                        {isCorrect ? `Correto! +${POINTS_PER_CORRECT} Pts` : 'Não foi dessa vez.'}
                      </Text>
                      {!!current.explanation && <Text style={styles.feedbackExpl}>{current.explanation}</Text>}
                    </View>

                    <TouchableOpacity accessibilityRole="button" style={styles.nextBtn} onPress={handleNext}>
                      <Text style={styles.nextBtnText}>
                        {index < questions.length - 1 ? 'Próxima questão' : 'Ver resultado'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : null}
          </>
        ) : (
          <View style={[styles.card, styles.summaryCard]}>
            <MaterialIcons name="workspace-premium" size={52} color="#D97706" />
            <Text style={styles.summaryTitle}>Treino concluído!</Text>
            <Text style={styles.summarySub}>Você respondeu {questions.length} questões do Modo Treino Livre.</Text>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreBig}>
                {score} / {questions.length}
              </Text>
              <Text style={styles.scoreLabel}>acertos</Text>
              {awardedPoints > 0 ? (
                <Text style={styles.scoreBonus}>+{awardedPoints} Pts adicionados ao perfil</Text>
              ) : (
                <Text style={styles.scoreLabel}>Continue treinando para ganhar Pts!</Text>
              )}
            </View>

            <View style={styles.summaryActions}>
              <TouchableOpacity accessibilityRole="button" style={styles.retryBtn} onPress={startSession}>
                <MaterialIcons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.retryBtnText}>Treinar novamente</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" style={styles.backTrailBtn} onPress={() => router.back()}>
                <Text style={styles.backTrailText}>Voltar para a Trilha</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#D8D8DB' },
  container: { padding: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#C9DEEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1F3E66' },
  headerSub: { fontSize: 12, marginTop: 2, color: '#607287' },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    gap: 8,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 13, fontWeight: '800', color: '#0B5F8F' },
  progressScore: { fontSize: 13, fontWeight: '800', color: '#D97706' },
  progressBase: { height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0B5F8F' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    gap: 12,
  },
  questionPrompt: { fontSize: 16, fontWeight: '700', color: '#0D3D66', lineHeight: 22 },

  optionsList: { gap: 10, marginTop: 2 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FBFF',
    gap: 10,
  },
  optionSelected: { borderColor: '#0B5F8F', backgroundColor: '#EEF6FF' },
  optionCorrect: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  optionIncorrect: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  optionIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(11,95,143,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: { fontSize: 13, fontWeight: '800', color: '#334155' },
  optionText: { flex: 1, fontSize: 14, lineHeight: 18, color: '#334155' },

  feedbackWrap: { gap: 12, marginTop: 6 },
  feedbackCard: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 4 },
  feedbackOk: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  feedbackBad: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  feedbackTitle: { fontSize: 13, fontWeight: '800' },
  feedbackExpl: { fontSize: 12, lineHeight: 17, color: '#5B3A1E' },
  nextBtn: { backgroundColor: '#0B5F8F', paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  nextBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  summaryCard: { alignItems: 'center', paddingVertical: 26, gap: 10 },
  summaryTitle: { fontSize: 22, fontWeight: '800', color: '#1F3E66' },
  summarySub: { fontSize: 13, textAlign: 'center', color: '#607287' },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#D5E2ED',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 18,
    width: '100%',
    marginVertical: 8,
    gap: 2,
  },
  scoreBig: { fontSize: 34, fontWeight: '900', color: '#0B5F8F' },
  scoreLabel: { fontSize: 12, color: '#607287' },
  scoreBonus: { fontSize: 14, fontWeight: '800', color: '#D97706', marginTop: 4 },
  summaryActions: { width: '100%', gap: 10, marginTop: 4 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0B5F8F',
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  backTrailBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  backTrailText: { color: '#334155', fontSize: 14, fontWeight: '700' },
});
