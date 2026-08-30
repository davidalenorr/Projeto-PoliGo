import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Mission, missions } from '@/src/data/missions';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { getDetectives, saveDetectives } from '@/src/storage/detectives';
import { Detective } from '@/src/data/detectives';

export default function QuickQuizScreen() {
  const [detective, setDetective] = useState<Detective | undefined>(undefined);
  const [quizMissions, setQuizMissions] = useState<Mission[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [theme, setTheme] = useState<'classic' | 'cyberpunk' | 'space'>('classic');

  useEffect(() => {
    let isMounted = true;

    async function initQuiz() {
      const selectedId = await getSelectedDetectiveId();
      if (selectedId) {
        const list = await getDetectives();
        const d = list.find((item) => item.id === selectedId);
        if (isMounted && d) setDetective(d);
      }

      const storedTheme = await AsyncStorage.getItem('@poligo:appTheme:v1');
      if (storedTheme === 'classic' || storedTheme === 'cyberpunk' || storedTheme === 'space') {
        if (isMounted) setTheme(storedTheme);
      }

      // Shuffle & select 5 random missions
      startNewQuizSession();
    }

    initQuiz();

    return () => {
      isMounted = false;
    };
  }, []);

  const startNewQuizSession = () => {
    const shuffled = [...missions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    setQuizMissions(selected);
    setCurrentIndex(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedOption(null);
    setAnswered(false);
  };

  const currentMission = quizMissions[currentIndex];

  // Options options generator based on mission tips/objective
  const generateOptions = (mission?: Mission) => {
    if (!mission) return [];
    const correctText = mission.tips[0] || 'Aplica-se a propriedade correta dos polígonos';
    const fake1 = 'Propriedade de polígonos irregulares com lados desiguais';
    const fake2 = 'Soma angular igual a 180° fixo para qualquer polígono';
    const fake3 = 'Vértices internos sempre nulos ou inexistentes';
    
    return [
      { text: correctText, correct: true },
      { text: fake1, correct: false },
      { text: fake2, correct: false },
      { text: fake3, correct: false },
    ].sort(() => 0.5 - Math.random());
  };

  const [options, setOptions] = useState<Array<{ text: string; correct: boolean }>>([]);

  useEffect(() => {
    if (currentMission) {
      setOptions(generateOptions(currentMission));
      setSelectedOption(null);
      setAnswered(false);
    }
  }, [currentIndex, currentMission]);

  const handleSelectOption = (index: number) => {
    if (answered) return;
    setSelectedOption(index);
    setAnswered(true);

    const chosen = options[index];
    const correct = chosen.correct;
    setIsCorrect(correct);

    if (correct) {
      Vibration.vibrate([0, 60, 40, 80]);
      setScore((prev) => prev + 1);
    } else {
      Vibration.vibrate(100);
    }
  };

  const handleNextQuestion = async () => {
    Vibration.vibrate(30);
    if (currentIndex < quizMissions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finish Quiz & Add bonus points (5 Pts per correct answer)
      const bonusPoints = score * 5;
      if (bonusPoints > 0 && detective) {
        const list = await getDetectives();
        const updatedList = list.map((d) => {
          if (d.id === detective.id) {
            return { ...d, points: d.points + bonusPoints };
          }
          return d;
        });
        await saveDetectives(updatedList);
      }
      setQuizFinished(true);
    }
  };

  const getBgColor = () => {
    if (theme === 'cyberpunk') return '#0F172A';
    if (theme === 'space') return '#1E1B4B';
    return '#D8D8DB';
  };

  const getCardBg = () => {
    if (theme === 'cyberpunk') return '#1E293B';
    if (theme === 'space') return '#312E81';
    return '#FFFFFF';
  };

  const getTextColor = () => {
    if (theme === 'cyberpunk' || theme === 'space') return '#F8FAFC';
    return '#1F3E66';
  };

  const getSubTextColor = () => {
    if (theme === 'cyberpunk' || theme === 'space') return '#94A3B8';
    return '#607287';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: getBgColor() }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="arrow-back" size={24} color={getTextColor()} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: getTextColor() }]}>Modo Treino Livre</Text>
            <Text style={[styles.headerSub, { color: getSubTextColor() }]}>Perguntas aleatórias + 5 Pts bônus por acerto!</Text>
          </View>
        </View>

        {!quizFinished ? (
          <>
            {/* Progress Counter */}
            <View style={[styles.progressCard, { backgroundColor: getCardBg() }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0B5F8F' }}>
                  Questão {currentIndex + 1} de {quizMissions.length}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#D97706' }}>
                  Acertos: {score}
                </Text>
              </View>
              <View style={styles.progressBase}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((currentIndex + 1) / quizMissions.length) * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* Question Card */}
            {currentMission ? (
              <View style={[styles.card, { backgroundColor: getCardBg() }]}>
                <View style={styles.badgeRow}>
                  <Text style={styles.difficultyBadge}>
                    {currentMission.difficulty.toUpperCase()}
                  </Text>
                  <Text style={styles.pointsBadge}>+5 Pts Bônus</Text>
                </View>

                <Text style={[styles.questionTitle, { color: getTextColor() }]}>
                  {currentMission.title}
                </Text>
                <Text style={[styles.questionDesc, { color: getSubTextColor() }]}>
                  {currentMission.objective}
                </Text>

                <Text style={[styles.selectPrompt, { color: getTextColor() }]}>
                  Qual das alternativas apresenta a propriedade correta?
                </Text>

                {/* Options List */}
                <View style={styles.optionsList}>
                  {options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    let optionStyle = [styles.optionCard];

                    if (answered) {
                      if (opt.correct) {
                        optionStyle.push(styles.optionCorrect as any);
                      } else if (isSelected && !opt.correct) {
                        optionStyle.push(styles.optionIncorrect as any);
                      }
                    } else if (isSelected) {
                      optionStyle.push(styles.optionSelected as any);
                    }

                    return (
                      <Pressable
                        key={idx}
                        disabled={answered}
                        onPress={() => handleSelectOption(idx)}
                        style={({ pressed }) => [...optionStyle, pressed && !answered && styles.pressed]}
                      >
                        <View style={styles.optionIndex}>
                          <Text style={styles.optionIndexText}>
                            {String.fromCharCode(65 + idx)}
                          </Text>
                        </View>
                        <Text style={[styles.optionText, { color: getTextColor() }]}>
                          {opt.text}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Answer Feedback & Action */}
                {answered && (
                  <View style={styles.feedbackWrap}>
                    <View
                      style={[
                        styles.feedbackCard,
                        isCorrect ? styles.feedbackCorrectCard : styles.feedbackIncorrectCard,
                      ]}
                    >
                      <MaterialIcons
                        name={isCorrect ? 'check-circle' : 'cancel'}
                        size={24}
                        color={isCorrect ? '#059669' : '#DC2626'}
                      />
                      <Text
                        style={[
                          styles.feedbackText,
                          { color: isCorrect ? '#059669' : '#DC2626' },
                        ]}
                      >
                        {isCorrect
                          ? 'Excelente! Você acertou e ganhou +5 Pts!'
                          : 'Quase lá! Leia a alternativa em destaque verde.'}
                      </Text>
                    </View>

                    <TouchableOpacity style={styles.nextBtn} onPress={handleNextQuestion}>
                      <Text style={styles.nextBtnText}>
                        {currentIndex < quizMissions.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : null}
          </>
        ) : (
          /* Finished Summary Card */
          <View style={[styles.card, styles.summaryCard, { backgroundColor: getCardBg() }]}>
            <MaterialIcons name="workspace-premium" size={56} color="#D97706" />
            <Text style={[styles.summaryTitle, { color: getTextColor() }]}>Treino Concluído!</Text>
            <Text style={[styles.summarySub, { color: getSubTextColor() }]}>
              Você respondeu 5 perguntas do Modo Treino Livre.
            </Text>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreBig}>{score} / 5</Text>
              <Text style={styles.scoreLabel}>Perguntas Incorretas/Corretas</Text>
              <Text style={styles.scoreBonus}>+{score * 5} Pts Adicionados ao Perfil!</Text>
            </View>

            <View style={styles.summaryActions}>
              <TouchableOpacity style={styles.retryBtn} onPress={startNewQuizSession}>
                <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryBtnText}>Treinar Novamente</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backTrailBtn} onPress={() => router.back()}>
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
  safe: { flex: 1 },
  container: { padding: 20, gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },

  progressCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 8,
  },
  progressBase: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0B5F8F',
  },

  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0B5F8F',
    backgroundColor: '#EEF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  questionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  selectPrompt: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },

  optionsList: {
    gap: 10,
    marginTop: 6,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: 'rgba(0,0,0,0.02)',
    gap: 10,
  },
  optionSelected: {
    borderColor: '#0B5F8F',
    backgroundColor: '#EEF6FF',
  },
  optionCorrect: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  optionIncorrect: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  optionIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
  },

  feedbackWrap: {
    gap: 12,
    marginTop: 8,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
  },
  feedbackCorrectCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  feedbackIncorrectCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  nextBtn: {
    backgroundColor: '#0B5F8F',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  summaryCard: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  summarySub: {
    fontSize: 13,
    textAlign: 'center',
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    width: '100%',
    marginVertical: 10,
    gap: 4,
  },
  scoreBig: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0B5F8F',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#607287',
  },
  scoreBonus: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 4,
  },
  summaryActions: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0B5F8F',
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  backTrailBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  backTrailText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
});
