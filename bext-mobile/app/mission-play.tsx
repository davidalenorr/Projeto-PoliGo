import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Vibration,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Mission, getMissionById } from '@/src/data/missions';
import { parseFlexibleNumber, numbersEqual, parsePairInput } from '@/src/utils/equationValidation';
import { getDetectives } from '@/src/storage/detectives';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import {
  completeMissionForDetective,
  getNextMissionIdForDetectivePhase,
  isMissionCompletedForDetective,
} from '@/src/storage/missionProgress';
import { getCurrentPhaseNumber, getPhaseIdFromNumber } from '@/src/domain/progress';
import { phases } from '@/src/data/phases';

const SCREEN_WIDTH = Dimensions.get('window').width;
// const ESTACAO_IMAGE = require('../assets/images/fase1/estacao_ferroviaria_belo_jardim.png');

function MissionHeader({ mission }: { mission: Mission }) {
  return (
    <View style={styles.headerCard}>
      <Text style={styles.headerTitle}>{mission.title}</Text>
      <Text style={styles.headerDescription}>{mission.description}</Text>
      <Text style={styles.headerObjective}>{mission.objective}</Text>
    </View>
  );
}

function TriangleAreaPractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [userArea, setUserArea] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const base = 6;
  const height = 4;
  const expectedArea = 12;

  const handleValidate = () => {
    const parsedArea = parseFlexibleNumber(userArea);

    if (parsedArea === null || parsedArea <= 0) {
      setFeedback('Insira uma área válida, maior que zero.');
      setSubmitted(true);
      setCanComplete(false);
      return;
    }

    setSubmitted(true);
    if (numbersEqual(parsedArea, expectedArea, 1e-2)) {
      setFeedback(`Correto! A área calculada é ${expectedArea} m².`);
      setCanComplete(true);
      return;
    }

    setFeedback(`Resultado incorreto. Para base 6 e altura 4, use A = (b × h) / 2.`);
    setCanComplete(false);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Prática: Área de Triângulo</Text>
      <Text style={styles.sectionSubtitle}>Calcule a área do triângulo dado.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Valores do Triângulo</Text>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
          <Text style={styles.caseContext}>Base (b): <Text style={{ fontWeight: 'bold' }}>{base} m</Text></Text>
          <Text style={styles.caseContext}>Altura (h): <Text style={{ fontWeight: 'bold' }}>{height} m</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira a Área Calculada (m²)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 15"
          value={userArea}
          onChangeText={(value) => {
            setUserArea(value);
            setSubmitted(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        {!!feedback && <Text style={[styles.feedbackText, !canComplete && { color: '#B91C1C' }]}>{feedback}</Text>}

        {!submitted ? (
          <Pressable style={styles.nextCaseButton} onPress={handleValidate}>
            <Text style={styles.nextCaseButtonText}>Validar resposta</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setSubmitted(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function PolygonTriangulationPractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [userTotal, setUserTotal] = useState('');
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const tri1 = 12;
  const tri2 = 18;
  const tri3 = 24;
  const expectedTotal = 54;

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Prática: Triangulação de Polígonos</Text>
      <Text style={styles.sectionSubtitle}>Some as áreas dos triângulos que compõem o polígono.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Áreas dos componentes</Text>
        <View style={{ gap: 4, marginBottom: 12 }}>
          <Text style={styles.caseContext}>• Triângulo 1: <Text style={{ fontWeight: 'bold' }}>{tri1} m²</Text></Text>
          <Text style={styles.caseContext}>• Triângulo 2: <Text style={{ fontWeight: 'bold' }}>{tri2} m²</Text></Text>
          <Text style={styles.caseContext}>• Triângulo 3: <Text style={{ fontWeight: 'bold' }}>{tri3} m²</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira a Área Total (m²)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 50"
          value={userTotal}
          onChangeText={(value) => {
            setUserTotal(value);
            setDone(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        {!!feedback && <Text style={[styles.feedbackText, !canComplete && { color: '#B91C1C' }]}>{feedback}</Text>}

        {!done ? (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              const parsedTotal = parseFlexibleNumber(userTotal);
              if (parsedTotal === null || parsedTotal <= 0) {
                setFeedback('Preencha a área com um número válido maior que zero.');
                setDone(true);
                setCanComplete(false);
                return;
              }

              setDone(true);
              if (numbersEqual(parsedTotal, expectedTotal, 1e-2)) {
                setFeedback(`Correto! A área total do polígono é ${expectedTotal} m².`);
                setCanComplete(true);
                return;
              }

              setFeedback(`Soma incorreta. Some as áreas dos três triângulos.`);
              setCanComplete(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Confirmar soma</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setDone(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function ApothemPractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [userArea, setUserArea] = useState('');
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const perimeter = 24;
  const apothem = 4;
  const expectedArea = 48;

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Prática: Área via Apótema</Text>
      <Text style={styles.sectionSubtitle}>Use A = (P × a) / 2</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Valores do Polígono</Text>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
          <Text style={styles.caseContext}>Perímetro (P): <Text style={{ fontWeight: 'bold' }}>{perimeter} m</Text></Text>
          <Text style={styles.caseContext}>Apótema (a): <Text style={{ fontWeight: 'bold' }}>{apothem} m</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira a Área Calculada (m²)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 40"
          value={userArea}
          onChangeText={(value) => {
            setUserArea(value);
            setChecked(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        {!!feedback && <Text style={[styles.feedbackText, !canComplete && { color: '#B91C1C' }]}>{feedback}</Text>}

        {!checked ? (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              const parsedArea = parseFlexibleNumber(userArea);

              if (parsedArea === null || parsedArea <= 0) {
                setFeedback('A área deve ser um número válido maior que zero.');
                setChecked(true);
                setCanComplete(false);
                return;
              }

              setChecked(true);
              if (numbersEqual(parsedArea, expectedArea, 1e-2)) {
                setFeedback(`Correto! A área é ${expectedArea} m².`);
                setCanComplete(true);
                return;
              }

              setFeedback(`Resultado incorreto. Aplique a fórmula A = (P × a) / 2.`);
              setCanComplete(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Validar cálculo</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setChecked(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function LinearWorkshop({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [x, setX] = useState('');
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);
  const expected = 2;

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Oficina Linear</Text>
      <Text style={styles.sectionSubtitle}>Resolva 3x + 2 = 8</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.caseContext}>Valor de x</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          value={x}
          onChangeText={(value) => {
            setX(value);
            setChecked(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        {!!feedback && <Text style={[styles.feedbackText, !canComplete && { color: '#B91C1C' }]}>{feedback}</Text>}

        {!checked ? (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              const parsedX = Number(x);
              if (!Number.isFinite(parsedX)) {
                setFeedback('Insira um valor numérico válido para x.');
                setChecked(true);
                setCanComplete(false);
                return;
              }

              setChecked(true);
              if (parsedX === expected) {
                setFeedback(`Correto! x = ${expected}.`);
                setCanComplete(true);
                return;
              }

              setFeedback(`Resposta incorreta. O valor correto é ${expected}.`);
              setCanComplete(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Verificar</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setChecked(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function SystemSolver({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Solver de Sistemas</Text>
      <Text style={styles.sectionSubtitle}>Sistema: 2x + 2y = 34 e x - y = 3</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.caseContext}>x</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          value={x}
          onChangeText={(value) => {
            setX(value);
            setChecked(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />
        <Text style={styles.caseContext}>y</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          value={y}
          onChangeText={(value) => {
            setY(value);
            setChecked(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        {!!feedback && <Text style={[styles.feedbackText, !canComplete && { color: '#B91C1C' }]}>{feedback}</Text>}

        {!checked ? (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              const parsedX = Number(x);
              const parsedY = Number(y);

              if (!Number.isFinite(parsedX) || !Number.isFinite(parsedY)) {
                setFeedback('Insira valores numéricos válidos para x e y.');
                setChecked(true);
                setCanComplete(false);
                return;
              }

              setChecked(true);
              if (parsedX === 10 && parsedY === 7) {
                setFeedback('Solução correta!');
                setCanComplete(true);
                return;
              }

              setFeedback('Solução incorreta. O par correto é x = 10 e y = 7.');
              setCanComplete(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Validar</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setChecked(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function PitagorasScale({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [userHypotenuse, setUserHypotenuse] = useState('');
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const a = 5;
  const b = 12;
  const expectedHypotenuse = 13;

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Escala de Pitágoras</Text>
      <Text style={styles.sectionSubtitle}>Calcule a hipotenusa para os catetos dados.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Valores do Triângulo Retângulo</Text>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
          <Text style={styles.caseContext}>Cateto a: <Text style={{ fontWeight: 'bold' }}>{a}</Text></Text>
          <Text style={styles.caseContext}>Cateto b: <Text style={{ fontWeight: 'bold' }}>{b}</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira a Hipotenusa (c)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 10"
          value={userHypotenuse}
          onChangeText={(value) => {
            setUserHypotenuse(value);
            setChecked(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        {!!feedback && <Text style={[styles.feedbackText, !canComplete && { color: '#B91C1C' }]}>{feedback}</Text>}

        {!checked ? (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              const parsedHyp = parseFlexibleNumber(userHypotenuse);

              if (parsedHyp === null || parsedHyp <= 0) {
                setFeedback('A hipotenusa deve ser um número válido maior que zero.');
                setChecked(true);
                setCanComplete(false);
                return;
              }

              setChecked(true);
              if (numbersEqual(parsedHyp, expectedHypotenuse, 1e-2)) {
                setFeedback(`Correto! A hipotenusa é ${expectedHypotenuse}.`);
                setCanComplete(true);
                return;
              }

              setFeedback(`Resultado incorreto. Aplique a² + b² = c².`);
              setCanComplete(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Calcular</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setChecked(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Recalcular</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// Componente genérico para missões de equações numéricas (sequência de passos)
function GenericEquationMission({
  title,
  subtitle,
  steps,
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  title: string;
  subtitle?: string;
  steps: Array<{
    id: string;
    prompt: string;
    type: 'number' | 'pair';
    expected: number | { x: number; y: number };
  }>;
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [inputY, setInputY] = useState('');
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const step = steps[index];

  const handleCheck = () => {
    setChecked(true);
    if (step.type === 'number') {
      const parsed = parseFlexibleNumber(input);
      if (parsed === null) {
        setFeedback('Insira um número válido.');
        return;
      }

      const expected = step.expected as number;
      if (numbersEqual(parsed, expected, 1e-2)) {
        setFeedback('Correto!');
        return;
      }

      setFeedback(`Incorreto. Tente revisar os passos.`);
      return;
    }

    // pair
    const parsedPair = parsePairInput(input, inputY);
    if (!parsedPair) {
      setFeedback('Insira números válidos para x e y.');
      return;
    }

    const exp = step.expected as { x: number; y: number };
    if (numbersEqual(parsedPair.x, exp.x, 1e-2) && numbersEqual(parsedPair.y, exp.y, 1e-2)) {
      setFeedback('Solução correta!');
      return;
    }

    setFeedback('Solução incorreta. Verifique suas operações.');
  };

  const handleNext = () => {
    setChecked(false);
    setFeedback(null);
    setInput('');
    setInputY('');

    if (index + 1 >= steps.length) {
      onComplete();
      return;
    }

    setIndex((i) => i + 1);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>{`Problema ${index + 1} de ${steps.length}`}</Text>
        <Text style={styles.caseContext}>{step.prompt}</Text>

        {step.type === 'number' ? (
          <TextInput style={styles.textInput} keyboardType="numeric" value={input} onChangeText={(v) => { setInput(v); setChecked(false); setFeedback(null); }} />
        ) : (
          <>
            <Text style={styles.caseContext}>x</Text>
            <TextInput style={styles.textInput} keyboardType="numeric" value={input} onChangeText={(v) => { setInput(v); setChecked(false); setFeedback(null); }} />
            <Text style={styles.caseContext}>y</Text>
            <TextInput style={styles.textInput} keyboardType="numeric" value={inputY} onChangeText={(v) => { setInputY(v); setChecked(false); setFeedback(null); }} />
          </>
        )}

        {!!feedback && <Text style={[styles.feedbackText, { marginTop: 8 }]}>{feedback}</Text>}

        {!checked ? (
          <Pressable style={styles.nextCaseButton} onPress={handleCheck}>
            <Text style={styles.nextCaseButtonText}>Verificar</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.nextCaseButton} onPress={handleNext}>
            <Text style={styles.nextCaseButtonText}>{index + 1 >= steps.length ? 'Concluir missão' : 'Próximo problema'}</Text>
          </Pressable>
        )}
      </View>

      {checked && !feedback?.startsWith('Incorreto') && (
        <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
      )}
    </View>
  );
}

function OptimizationChallenge({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const questions: QuizQuestion[] = [
    {
      id: 'opt1',
      prompt: 'Você tem 40 metros de cerca para construir um cercado retangular. Qual configuração de lados proporcionará a maior área útil?',
      options: [
        'Lados de 12m e 8m (Área = 96m²)',
        'Lados de 10m e 10m (Área = 100m²)',
        'Lados de 15m e 5m (Área = 75m²)',
        'Lados de 14m e 6m (Área = 84m²)',
      ],
      answer: 'Lados de 10m e 10m (Área = 100m²)',
      explanation: 'Para um perímetro fixo, a área de um retângulo é máxima quando ele é um quadrado (todos os lados iguais). Portanto, lados de 10m e 10m (perímetro 10+10+10+10 = 40m) dão a maior área (100m²).',
    },
    {
      id: 'opt2',
      prompt: 'Você quer cercar uma horta retangular encostada em um muro de pedra (não precisando de cerca no lado do muro). Se possui 20 metros de cerca no total, quais dimensões maximizam a área?',
      options: [
        'Lados de 5m (perpendicular) e 10m (paralelo ao muro)',
        'Lados de 4m (perpendicular) e 12m (paralelo ao muro)',
        'Lados de 6m (perpendicular) e 8m (paralelo ao muro)',
        'Lados de 5m (perpendicular) e 5m (paralelo ao muro)',
      ],
      answer: 'Lados de 5m (perpendicular) e 10m (paralelo ao muro)',
      explanation: 'Com o muro servindo como um dos lados, o perímetro da cerca é 2x + y = 20, logo y = 20 - 2x. A área é A = x * y = x(20 - 2x) = 20x - 2x². Essa função quadrática atinge seu valor máximo em x = 5 (largura), dando y = 10 (comprimento), resultando em 50m².',
    },
  ];

  return (
    <MissionQuizFlow
      title="Desafio de Otimização"
      subtitle="Escolha a configuração que maximiza a área"
      questions={questions}
      onComplete={onComplete}
      alreadyCompleted={alreadyCompleted}
      nextMissionId={nextMissionId}
      onNext={onNext}
    />
  );
}

function VolumeCubePractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [userVolume, setUserVolume] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const edge = 4;
  const expectedVolume = 64; // 4³ = 64

  const handleValidate = () => {
    const parsedVol = parseFlexibleNumber(userVolume);

    if (parsedVol === null || parsedVol <= 0) {
      setFeedback('Insira um volume válido, maior que zero.');
      setSubmitted(true);
      setCanComplete(false);
      return;
    }

    setSubmitted(true);
    if (numbersEqual(parsedVol, expectedVolume, 1e-2)) {
      setFeedback(`Correto! O volume do cubo é ${expectedVolume} cm³.`);
      setCanComplete(true);
      return;
    }

    setFeedback(`Resultado incorreto. Para aresta de 4cm, use a fórmula do volume: V = a³ (aresta × aresta × aresta).`);
    setCanComplete(false);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Volume do Cubo</Text>
      <Text style={styles.sectionSubtitle}>Calcule o volume tridimensional do cubo dado.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Valores do Cubo</Text>
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.caseContext}>Aresta (a): <Text style={{ fontWeight: 'bold' }}>{edge} cm</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira o Volume Calculado (cm³)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 50"
          value={userVolume}
          onChangeText={(value) => {
            setUserVolume(value);
            setSubmitted(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        {!!feedback && <Text style={[styles.feedbackText, !canComplete && { color: '#B91C1C' }]}>{feedback}</Text>}

        {!submitted ? (
          <Pressable style={styles.nextCaseButton} onPress={handleValidate}>
            <Text style={styles.nextCaseButtonText}>Validar resposta</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setSubmitted(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function VolumePrismPractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [userVolume, setUserVolume] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const length = 5;
  const width = 4;
  const height = 3;
  const expectedVolume = 60; // 5 * 4 * 3 = 60

  const handleValidate = () => {
    const parsedVol = parseFlexibleNumber(userVolume);

    if (parsedVol === null || parsedVol <= 0) {
      setFeedback('Insira um volume válido, maior que zero.');
      setSubmitted(true);
      setCanComplete(false);
      return;
    }

    setSubmitted(true);
    if (numbersEqual(parsedVol, expectedVolume, 1e-2)) {
      setFeedback(`Correto! O volume do bloco é ${expectedVolume} m³.`);
      setCanComplete(true);
      return;
    }

    setFeedback(`Resultado incorreto. Multiplique as três dimensões: V = comprimento × largura × altura.`);
    setCanComplete(false);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Volume de Bloco Retangular</Text>
      <Text style={styles.sectionSubtitle}>Calcule o volume do paralelepípedo retangular.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Dimensões da Caixa</Text>
        <View style={{ gap: 4, marginBottom: 12 }}>
          <Text style={styles.caseContext}>• Comprimento: <Text style={{ fontWeight: 'bold' }}>{length} m</Text></Text>
          <Text style={styles.caseContext}>• Largura: <Text style={{ fontWeight: 'bold' }}>{width} m</Text></Text>
          <Text style={styles.caseContext}>• Altura: <Text style={{ fontWeight: 'bold' }}>{height} m</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira o Volume Calculado (m³)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 50"
          value={userVolume}
          onChangeText={(value) => {
            setUserVolume(value);
            setSubmitted(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        {!!feedback && <Text style={[styles.feedbackText, !canComplete && { color: '#B91C1C' }]}>{feedback}</Text>}

        {!submitted ? (
          <Pressable style={styles.nextCaseButton} onPress={handleValidate}>
            <Text style={styles.nextCaseButtonText}>Validar resposta</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setSubmitted(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function SurfaceAreaPractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [userArea, setUserArea] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const length = 5;
  const width = 4;
  const height = 3;
  const expectedArea = 94; // 2*(5*4 + 5*3 + 4*3) = 2*(20+15+12) = 2*47 = 94

  const handleValidate = () => {
    const parsedArea = parseFlexibleNumber(userArea);

    if (parsedArea === null || parsedArea <= 0) {
      setFeedback('Insira uma área válida, maior que zero.');
      setSubmitted(true);
      setCanComplete(false);
      return;
    }

    setSubmitted(true);
    if (numbersEqual(parsedArea, expectedArea, 1e-2)) {
      setFeedback(`Correto! A área total de superfície é ${expectedArea} m².`);
      setCanComplete(true);
      return;
    }

    setFeedback(`Resultado incorreto. Use a fórmula: A = 2 × (ab + ac + bc) para somar as 6 faces.`);
    setCanComplete(false);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Área de Superfície</Text>
      <Text style={styles.sectionSubtitle}>Calcule a área total das faces do bloco retangular.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Dimensões da Caixa</Text>
        <View style={{ gap: 4, marginBottom: 12 }}>
          <Text style={styles.caseContext}>• Lado a: <Text style={{ fontWeight: 'bold' }}>{length} m</Text></Text>
          <Text style={styles.caseContext}>• Lado b: <Text style={{ fontWeight: 'bold' }}>{width} m</Text></Text>
          <Text style={styles.caseContext}>• Lado c: <Text style={{ fontWeight: 'bold' }}>{height} m</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira a Área de Superfície (m²)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 80"
          value={userArea}
          onChangeText={(value) => {
            setUserArea(value);
            setSubmitted(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        {!!feedback && <Text style={[styles.feedbackText, !canComplete && { color: '#B91C1C' }]}>{feedback}</Text>}

        {!submitted ? (
          <Pressable style={styles.nextCaseButton} onPress={handleValidate}>
            <Text style={styles.nextCaseButtonText}>Validar resposta</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setSubmitted(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function PackagingOptimizationChallenge({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const questions: QuizQuestion[] = [
    {
      id: 'sp1',
      prompt: 'Duas caixas têm o mesmo volume de 24 m³. Caixa A tem dimensões 2m x 3m x 4m. Caixa B tem dimensões 1m x 2m x 12m. Qual caixa gasta menos papelão para ser fabricada (menor área de superfície)?',
      options: [
        'Caixa A (Área = 52 m²)',
        'Caixa B (Área = 76 m²)',
        'Ambas gastam o mesmo papelão (mesma área)',
        'Incomparável sem saber o peso',
      ],
      answer: 'Caixa A (Área = 52 m²)',
      explanation: 'Para Caixa A: A = 2(2x3 + 2x4 + 3x4) = 2(6+8+12) = 52 m². Para Caixa B: A = 2(1x2 + 1x12 + 2x12) = 2(2+12+24) = 76 m². A Caixa A consome menos papelão, sendo mais econômica.',
    },
  ];

  return (
    <MissionQuizFlow
      title="Desafio das Embalagens"
      subtitle="Otimização de volume e superfície"
      questions={questions}
      onComplete={onComplete}
      alreadyCompleted={alreadyCompleted}
      nextMissionId={nextMissionId}
      onNext={onNext}
    />
  );
}

function MissionHints({ tips }: { tips: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!tips.length) {
    return null;
  }

  return (
    <View style={styles.hintsWrap}>
      <Pressable
        style={({ pressed }) => [styles.hintTrigger, pressed && styles.hintTriggerPressed]}
        onPress={() => setIsOpen((prev) => !prev)}
      >
        <View style={styles.hintBubble}>
          <Image
            source={require('../icons/screens/interrogatorio.png')}
            style={{ width: 14, height: 14, resizeMode: 'contain', tintColor: '#FFFFFF' }}
          />
        </View>
        <Text style={styles.hintTriggerText}>{isOpen ? 'Ocultar dicas' : 'Ver dicas da missão'}</Text>
      </Pressable>

      {isOpen && (
        <View style={styles.hintsCard}>
          <Text style={styles.hintsTitle}>Dicas</Text>
          {tips.map((tip) => (
            <Text key={tip} style={styles.hintItem}>
              • {tip}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function MissionCompletionAction({
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

  const handlePress = () => {
    setClicked(true);
    onComplete();
  };

  if (alreadyCompleted || clicked) {
    return (
      <View style={styles.afterCompleteWrap}>
        <View style={[
          styles.alreadyDoneBadge,
          { flexDirection: 'row', alignItems: 'center', gap: 6 },
          clicked && { backgroundColor: '#DEF7EC', borderColor: '#31C48D' }
        ]}>
          <Image
            source={require('../icons/screens/verificar.png')}
            style={{ width: 14, height: 14, resizeMode: 'contain' }}
          />
          <Text style={[
            styles.alreadyDoneText,
            clicked && { color: '#03543F' },
            { flexShrink: 1 }
          ]}>
            {clicked ? 'Missão concluída com sucesso!' : 'Missão já concluída para este detetive.'}
          </Text>
        </View>

        {nextMissionId && onNext ? (
          <Pressable style={({ pressed }) => [styles.nextMissionButton, pressed && styles.nextMissionButtonPressed]} onPress={onNext}>
            <Text style={styles.nextMissionButtonText}>Ir para a próxima missão</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <Pressable style={({ pressed }) => [styles.completeButton, pressed && styles.completeButtonPressed]} onPress={handlePress}>
      <Text style={styles.completeButtonText}>Concluir missão e continuar</Text>
    </Pressable>
  );
}

function GuidedFirstMission({
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [touchedVertices, setTouchedVertices] = useState<number[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [trainingBoardSize, setTrainingBoardSize] = useState({ width: 0, height: 0 });

  const correctName = 'Triângulo';
  const options = ['Triângulo', 'Quadrado', 'Pentágono'];
  const verticesDone = touchedVertices.length === 3;
  const answeredCorrect = selectedName === correctName;

  const vertexPositions = [
    { id: 1, leftPct: 19, topPct: 72 },
    { id: 2, leftPct: 50, topPct: 20 },
    { id: 3, leftPct: 81, topPct: 72 },
  ] as const;

  const boardVertices = useMemo(() => {
    if (!trainingBoardSize.width || !trainingBoardSize.height) {
      return [] as Array<{ id: number; x: number; y: number }>;
    }

    return vertexPositions.map((vertex) => ({
      id: vertex.id,
      x: (vertex.leftPct / 100) * trainingBoardSize.width,
      y: (vertex.topPct / 100) * trainingBoardSize.height,
    }));
  }, [trainingBoardSize]);

  const boardEdges = useMemo(() => {
    if (boardVertices.length !== 3) {
      return [] as Array<{ x: number; y: number; length: number; angle: number }>;
    }

    const pairs: Array<[number, number]> = [
      [0, 1],
      [1, 2],
      [2, 0],
    ];

    return pairs.map(([from, to]) => {
      const start = boardVertices[from];
      const end = boardVertices[to];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      return {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
        length,
        angle,
      };
    });
  }, [boardVertices]);

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Treinamento Guiado</Text>
      <Text style={styles.sectionSubtitle}>Etapa {step}/3: domine a leitura de formas antes do desafio real.</Text>

      {step === 1 && (
        <View style={styles.trainingCard}>
          <Text style={styles.trainingTitle}>Etapa 1: toque nos 3 vértices do triângulo</Text>
          <View
            style={styles.trainingBoard}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setTrainingBoardSize({ width, height });
            }}
          >
            {boardEdges.map((edge, index) => (
              <View
                key={`edge-${index}`}
                style={[
                  styles.trainingLine,
                  {
                    width: edge.length,
                    left: edge.x - edge.length / 2,
                    top: edge.y - 1.5,
                    transform: [{ rotate: `${edge.angle}deg` }],
                  },
                ]}
              />
            ))}

            {vertexPositions.map((vertex) => {
              const vertexId = vertex.id;
              const touched = touchedVertices.includes(vertexId);

              return (
                <Pressable
                  key={vertexId}
                  style={[
                    styles.vertexDot,
                    { left: `${vertex.leftPct}%`, top: `${vertex.topPct}%` },
                    touched && styles.vertexDotTouched,
                  ]}
                  onPress={() => {
                    if (!touched) {
                      setTouchedVertices((prev) => [...prev, vertexId]);
                    }
                  }}
                >
                  <Text style={styles.vertexDotText}>{touched ? '✓' : vertexId}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.trainingMeta}>Vértices encontrados: {touchedVertices.length}/3</Text>

          <Pressable
            style={({ pressed }) => [styles.nextStepButton, pressed && styles.nextStepButtonPressed, !verticesDone && styles.nextStepButtonDisabled]}
            disabled={!verticesDone}
            onPress={() => setStep(2)}
          >
            <Text style={styles.nextStepButtonText}>Continuar para nomeação</Text>
          </Pressable>
        </View>
      )}

      {step === 2 && (
        <View style={styles.trainingCard}>
          <Text style={styles.trainingTitle}>Etapa 2: qual é o nome dessa forma?</Text>
          <View style={styles.optionList}>
            {options.map((option) => {
              const active = selectedName === option;

              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.quizOption,
                    active && styles.quizOptionActive,
                    pressed && styles.quizOptionPressed,
                  ]}
                  onPress={() => setSelectedName(option)}
                >
                  <Text style={[styles.quizOptionText, active && styles.quizOptionTextActive]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          {selectedName && (
            <Text style={[styles.quizFeedback, answeredCorrect ? styles.quizFeedbackOk : styles.quizFeedbackWrong]}>
              {answeredCorrect
                ? 'Correto! Triângulo possui 3 lados e 3 vértices.'
                : 'Quase! Revise: a forma possui exatamente 3 lados.'}
            </Text>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.nextStepButton,
              pressed && styles.nextStepButtonPressed,
              !answeredCorrect && styles.nextStepButtonDisabled,
            ]}
            disabled={!answeredCorrect}
            onPress={() => setStep(3)}
          >
            <Text style={styles.nextStepButtonText}>Finalizar treinamento</Text>
          </Pressable>
        </View>
      )}

      {step === 3 && (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Pronto para a trilha!</Text>
          <Text style={styles.successText}>
            Você concluiu o treinamento inicial e já sabe reconhecer vértices, lados e nome de uma forma básica.
          </Text>
        </View>
      )}

      {step === 3 && (
        <MissionCompletionAction
          alreadyCompleted={alreadyCompleted}
          nextMissionId={nextMissionId}
          onComplete={onComplete}
          onNext={onNext}
        />
      )}
    </View>
  );
}

type DraggableShape = {
  id: string;
  label: string;
  type: 'convexo' | 'concavo';
};

function ConvexityTrapMission({
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [resultMap, setResultMap] = useState<Record<string, 'convexo' | 'concavo'>>({});
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  const shapes: DraggableShape[] = [
    { id: 's1', label: 'Placa Hexagonal', type: 'convexo' },
    { id: 's2', label: 'Seta recortada', type: 'concavo' },
    { id: 's3', label: 'Estrela decorativa', type: 'concavo' },
    { id: 's4', label: 'Placa Pentagonal', type: 'convexo' },
  ];

  const zoneTop = 250;
  const zoneHeight = 120;
  const gap = 14;
  const zoneWidth = (SCREEN_WIDTH - 32 - gap) / 2;
  const CHIP_WIDTH = 150;
  const CHIP_HEIGHT = 34;

  const classifyShape = (shapeId: string, target: 'convexo' | 'concavo') => {
    setResultMap((prev) => ({ ...prev, [shapeId]: target }));
  };

  const completed = shapes.every((shape) => resultMap[shape.id] === shape.type);

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Arraste para classificar</Text>
      <Text style={styles.sectionSubtitle}>Caixa verde = convexos | caixa vermelha = não convexos</Text>
      <Text style={styles.tapAssistText}>No trackpad: toque em uma peça e depois toque na caixa desejada.</Text>

      <View style={styles.dragArea}>
        <Pressable
          style={[styles.dropZone, styles.dropZoneGreen, { top: zoneTop, left: 0, width: zoneWidth, height: zoneHeight }]}
          onPress={() => {
            if (!selectedShapeId) {
              return;
            }

            classifyShape(selectedShapeId, 'convexo');
          }}
        >
          <Text style={styles.dropZoneTitle}>Convexos</Text>
        </Pressable>
        <Pressable
          style={[styles.dropZone, styles.dropZoneRed, { top: zoneTop, left: zoneWidth + gap, width: zoneWidth, height: zoneHeight }]}
          onPress={() => {
            if (!selectedShapeId) {
              return;
            }

            classifyShape(selectedShapeId, 'concavo');
          }}
        >
          <Text style={styles.dropZoneTitle}>Não convexos</Text>
        </Pressable>

        {shapes.map((shape, index) => (
          <DraggableChip
            key={shape.id}
            label={shape.label}
            selected={selectedShapeId === shape.id}
            onSelect={() => setSelectedShapeId(shape.id)}
            startX={12 + (index % 2) * ((SCREEN_WIDTH - 32) / 2)}
            startY={24 + Math.floor(index / 2) * 64}
            onDrop={(x, y) => {
              const dropCenterX = x + CHIP_WIDTH / 2;
              const dropCenterY = y + CHIP_HEIGHT / 2;

              const inVerticalRange = dropCenterY >= zoneTop - 20 && dropCenterY <= zoneTop + zoneHeight + 20;
              if (!inVerticalRange) {
                return;
              }

              if (dropCenterX <= zoneWidth + 16) {
                classifyShape(shape.id, 'convexo');
                return;
              }

              if (dropCenterX >= zoneWidth + gap - 16) {
                classifyShape(shape.id, 'concavo');
              }
            }}
          />
        ))}
      </View>

      <View style={styles.answerList}>
        {shapes.map((shape) => {
          const answer = resultMap[shape.id];
          const correct = answer === shape.type;

          return (
            <Text key={shape.id} style={[styles.answerItem, answer && !correct && styles.answerItemWrong, correct && styles.answerItemOk]}>
              {shape.label}: {answer ? answer.toUpperCase() : 'SEM CLASSIFICAÇÃO'}
            </Text>
          );
        })}
      </View>

      {completed && (
        <>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Classificação perfeita!</Text>
            <Text style={styles.successText}>Você dominou a diferença entre convexidade e concavidade.</Text>
          </View>
          <MissionCompletionAction
            alreadyCompleted={alreadyCompleted}
            nextMissionId={nextMissionId}
            onComplete={onComplete}
            onNext={onNext}
          />
        </>
      )}
    </View>
  );
}

function DraggableChip({
  label,
  selected,
  onSelect,
  startX,
  startY,
  onDrop,
}: {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  startX: number;
  startY: number;
  onDrop: (x: number, y: number) => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        onSelect?.();
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({
          x: startX + gestureState.dx,
          y: startY + gestureState.dy,
        });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6) {
          onSelect?.();
        }

        const releaseX = startX + gestureState.dx;
        const releaseY = startY + gestureState.dy;

        onDrop(releaseX, releaseY);

        Animated.spring(pan, {
          toValue: { x: startX, y: startY },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.dragChip, selected && styles.dragChipSelected, { transform: pan.getTranslateTransform() }]}
    >
      <Text style={styles.dragChipText}>{label}</Text>
    </Animated.View>
  );
}

function NamingShapesMission({
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [touchedSides, setTouchedSides] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');
  const [canAdvance, setCanAdvance] = useState(false);

  const BOARD_WIDTH = 300;
  const BOARD_HEIGHT = 210;
  const BOARD_CENTER_X = BOARD_WIDTH / 2;
  const BOARD_CENTER_Y = BOARD_HEIGHT / 2;
  const POLYGON_RADIUS = 76;

  const tasks = [
    {
      id: 'p1',
      place: 'Contorno da Praça Central',
      sides: 7,
      answer: 'Heptágono',
      context: 'Observe o contorno principal da praça e identifique quantos lados ele possui.',
    },
    {
      id: 'p2',
      place: 'Fachada do Prédio Antigo',
      sides: 9,
      answer: 'Eneágono',
      context: 'O recorte superior da fachada possui vários cantos. Conte com calma para não repetir.',
    },
    {
      id: 'p3',
      place: 'Canteiro da Avenida',
      sides: 8,
      answer: 'Octógono',
      context: 'Use os vértices como referência e percorra o contorno no mesmo sentido.',
    },
  ];

  const completed = stepIndex >= tasks.length;
  const safeTaskIndex = tasks.length > 0 ? Math.min(stepIndex, tasks.length - 1) : 0;
  const current = tasks[safeTaskIndex];
  const options = ['Pentágono', 'Hexágono', 'Heptágono', 'Octógono', 'Eneágono', 'Decágono'];
  const currentSides = current?.sides ?? 0;
  const canAnswerCurrentCase = touchedSides.length === currentSides;

  const polygonVertices = useMemo(() => {
    return Array.from({ length: currentSides }).map((_, index) => {
      const angle = (-Math.PI / 2) + (index * (2 * Math.PI)) / currentSides;
      return {
        x: BOARD_CENTER_X + POLYGON_RADIUS * Math.cos(angle),
        y: BOARD_CENTER_Y + POLYGON_RADIUS * Math.sin(angle),
      };
    });
  }, [currentSides]);

  const polygonEdges = useMemo(() => {
    return polygonVertices.map((start, index) => {
      const end = polygonVertices[(index + 1) % polygonVertices.length];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      return {
        sideNumber: index + 1,
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
        length,
        angle,
      };
    });
  }, [polygonVertices]);

  if (completed) {
    return (
      <View style={styles.missionCard}>
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Missão concluída!</Text>
          <Text style={styles.successText}>
            Você contou e batizou as formas corretamente. Excelente leitura geométrica!
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
      <Text style={styles.sectionTitle}>Caso {stepIndex + 1} de {tasks.length}: {current.place}</Text>
      <Text style={styles.sectionSubtitle}>Toque nos lados do polígono e selecione o nome correto.</Text>
      <Text style={styles.caseContext}>{current.context}</Text>

      <View style={styles.polygonBoard}>
        {polygonEdges.map((edge) => {
          const touched = touchedSides.includes(edge.sideNumber);

          return (
            <View
              key={`line-${current.id}-${edge.sideNumber}`}
              style={[
                styles.polygonEdge,
                touched && styles.polygonEdgeTouched,
                {
                  width: edge.length,
                  left: edge.x - edge.length / 2,
                  top: edge.y - 2,
                  transform: [{ rotate: `${edge.angle}deg` }],
                },
              ]}
            />
          );
        })}

        {polygonEdges.map((edge) => {
          const touched = touchedSides.includes(edge.sideNumber);

          return (
            <Pressable
              key={`touch-${current.id}-${edge.sideNumber}`}
              style={[
                styles.polygonTouchPoint,
                touched && styles.polygonTouchPointTouched,
                {
                  left: edge.x - 16,
                  top: edge.y - 16,
                },
              ]}
              onPress={() => {
                if (!touched) {
                  setTouchedSides((prev) => [...prev, edge.sideNumber]);
                }
              }}
            >
              <Text style={[styles.polygonTouchPointText, touched && styles.polygonTouchPointTextTouched]}>
                {edge.sideNumber}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.counterText}>Lados tocados: {touchedSides.length}/{current.sides}</Text>

      <View style={styles.optionsWrap}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={({ pressed }) => [
              styles.optionButton,
              (!canAnswerCurrentCase || canAdvance) && styles.optionButtonDisabled,
              pressed && canAnswerCurrentCase && !canAdvance && styles.optionButtonPressed,
            ]}
            disabled={!canAnswerCurrentCase || canAdvance}
            onPress={() => {
              if (option !== current.answer) {
                setFeedback('Resposta incorreta. Revise a contagem dos lados e tente novamente.');
                return;
              }

              if (touchedSides.length < current.sides) {
                setFeedback('Antes de responder, toque em todos os lados do contorno.');
                return;
              }

              setFeedback('Correto! Clique em "Próximo caso" para continuar.');
              setCanAdvance(true);
            }}
          >
            <Text style={styles.optionButtonText}>{option}</Text>
          </Pressable>
        ))}
      </View>

      {!canAnswerCurrentCase && !canAdvance ? (
        <Text style={styles.feedbackHint}>Toque em todos os lados para liberar as respostas.</Text>
      ) : null}

      {!!feedback && <Text style={styles.feedbackText}>{feedback}</Text>}

      {canAdvance && (
        <Pressable
          style={({ pressed }) => [styles.nextCaseButton, pressed && styles.nextCaseButtonPressed]}
          onPress={() => {
            setStepIndex((prev) => prev + 1);
            setTouchedSides([]);
            setFeedback('');
            setCanAdvance(false);
          }}
        >
          <Text style={styles.nextCaseButtonText}>Próximo caso</Text>
        </Pressable>
      )}
    </View>
  );
}

type TapClassifyShape = {
  id: string;
  label: string;
  type: 'convexo' | 'concavo';
};

function ConvexityTapMission({
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [selectionMap, setSelectionMap] = useState<Record<string, 'convexo' | 'concavo'>>({});

  const shapes: TapClassifyShape[] = [
    { id: 't1', label: 'Placa hexagonal (regular)', type: 'convexo' },
    { id: 't2', label: 'Seta recortada (placa)', type: 'concavo' },
    { id: 't3', label: 'Jardim em estrela (canteiro)', type: 'concavo' },
    { id: 't4', label: 'Janela pentagonal', type: 'convexo' },
    { id: 't5', label: 'Moldura octogonal', type: 'convexo' },
    { id: 't6', label: 'Logotipo com recorte', type: 'concavo' },
  ];

  const completed = shapes.every((shape) => selectionMap[shape.id] === shape.type);

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Classifique por toque</Text>
      <Text style={styles.sectionSubtitle}>Toque em Convexo ou Não convexo em cada item.</Text>

      <View style={styles.tapList}>
        {shapes.map((shape) => {
          const selection = selectionMap[shape.id];
          const hasSelection = !!selection;
          const isCorrect = hasSelection && selection === shape.type;
          const isWrong = hasSelection && selection !== shape.type;

          return (
            <View key={shape.id} style={styles.tapRow}>
              <View style={styles.tapRowHeader}>
                <Text style={styles.tapRowTitle}>{shape.label}</Text>
                {isCorrect ? (
                  <Text style={styles.tapRowStatusOk}>✓</Text>
                ) : isWrong ? (
                  <Text style={styles.tapRowStatusWrong}>✕</Text>
                ) : (
                  <Text style={styles.tapRowStatusPending}>•</Text>
                )}
              </View>

              <View style={styles.tapButtonsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.tapButton,
                    selection === 'convexo' && styles.tapButtonActive,
                    pressed && styles.tapButtonPressed,
                  ]}
                  onPress={() => setSelectionMap((prev) => ({ ...prev, [shape.id]: 'convexo' }))}
                >
                  <Text style={[styles.tapButtonText, selection === 'convexo' && styles.tapButtonTextActive]}>Convexo</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.tapButton,
                    selection === 'concavo' && styles.tapButtonActive,
                    pressed && styles.tapButtonPressed,
                  ]}
                  onPress={() => setSelectionMap((prev) => ({ ...prev, [shape.id]: 'concavo' }))}
                >
                  <Text style={[styles.tapButtonText, selection === 'concavo' && styles.tapButtonTextActive]}>Não convexo</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {completed && (
        <>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Perfeito!</Text>
            <Text style={styles.successText}>Você classificou convexidade e concavidade com segurança.</Text>
          </View>
          <MissionCompletionAction
            alreadyCompleted={alreadyCompleted}
            nextMissionId={nextMissionId}
            onComplete={onComplete}
            onNext={onNext}
          />
        </>
      )}
    </View>
  );
}

type DetectiveReportEntry = {
  id: string;
  place: string;
  sides: number;
  submittedName: string;
  submittedConvexity: 'convexo' | 'concavo';
  correctName: string;
  correctConvexity: 'convexo' | 'concavo';
};

function ReportShapePreview({ sides, concave }: { sides: number; concave: boolean }) {
  const width = 96;
  const height = 78;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = 30;
  const innerRadius = 19;

  const vertices = useMemo(() => {
    return Array.from({ length: sides }).map((_, index) => {
      const angle = (-Math.PI / 2) + (index * (2 * Math.PI)) / sides;
      const radius = concave ? (index % 2 === 0 ? outerRadius : innerRadius) : outerRadius;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [concave, sides]);

  const edges = useMemo(() => {
    return vertices.map((start, index) => {
      const end = vertices[(index + 1) % vertices.length];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      return {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
        length,
        angle,
      };
    });
  }, [vertices]);

  return (
    <View style={styles.reportShapePreviewBox}>
      {edges.map((edge, index) => (
        <View
          key={`edge-${sides}-${index}`}
          style={[
            styles.reportShapeEdge,
            {
              width: edge.length,
              left: edge.x - edge.length / 2,
              top: edge.y - 1.5,
              transform: [{ rotate: `${edge.angle}deg` }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function DetectiveReportMission({
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [decisionMap, setDecisionMap] = useState<Record<string, 'correta' | 'incorreta'>>({});
  const [nameCorrectionMap, setNameCorrectionMap] = useState<Record<string, string>>({});
  const [convexityCorrectionMap, setConvexityCorrectionMap] = useState<Record<string, 'convexo' | 'concavo'>>({});
  const [expandedEntryId, setExpandedEntryId] = useState<string>('r1');
  const [feedback, setFeedback] = useState('');

  const entries: DetectiveReportEntry[] = [
    {
      id: 'r1',
      place: 'Placa da Praça Central',
      sides: 7,
      submittedName: 'Heptágono',
      submittedConvexity: 'convexo',
      correctName: 'Heptágono',
      correctConvexity: 'convexo',
    },
    {
      id: 'r2',
      place: 'Logo recortado da loja',
      sides: 8,
      submittedName: 'Octógono',
      submittedConvexity: 'convexo',
      correctName: 'Octógono',
      correctConvexity: 'concavo',
    },
    {
      id: 'r3',
      place: 'Moldura do Prédio Antigo',
      sides: 9,
      submittedName: 'Decágono',
      submittedConvexity: 'convexo',
      correctName: 'Eneágono',
      correctConvexity: 'convexo',
    },
    {
      id: 'r4',
      place: 'Jardim em estrela da avenida',
      sides: 9,
      submittedName: 'Eneágono',
      submittedConvexity: 'convexo',
      correctName: 'Eneágono',
      correctConvexity: 'concavo',
    },
  ];

  const options = ['Pentágono', 'Hexágono', 'Heptágono', 'Octógono', 'Eneágono', 'Decágono'];

  const isEntryFilled = (entry: DetectiveReportEntry) => {
    const decision = decisionMap[entry.id];
    if (!decision) {
      return false;
    }

    if (decision === 'incorreta') {
      return !!nameCorrectionMap[entry.id] && !!convexityCorrectionMap[entry.id];
    }

    return true;
  };

  const reviewedCount = entries.filter((entry) => !!decisionMap[entry.id]).length;
  const correctedCount = entries.filter((entry) => {
    if (decisionMap[entry.id] !== 'incorreta') {
      return false;
    }

    return !!nameCorrectionMap[entry.id] && !!convexityCorrectionMap[entry.id];
  }).length;
  const filledCount = entries.filter((entry) => isEntryFilled(entry)).length;
  const fillPercent = Math.round((filledCount / entries.length) * 100);

  const solved = entries.every((entry) => {
    const expectedDecision =
      entry.submittedName === entry.correctName && entry.submittedConvexity === entry.correctConvexity
        ? 'correta'
        : 'incorreta';

    if (decisionMap[entry.id] !== expectedDecision) {
      return false;
    }

    if (expectedDecision === 'incorreta') {
      return nameCorrectionMap[entry.id] === entry.correctName && convexityCorrectionMap[entry.id] === entry.correctConvexity;
    }

    return true;
  });

  if (solved) {
    return (
      <View style={styles.missionCard}>
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Laudo revisado com sucesso!</Text>
          <Text style={styles.successText}>Excelente trabalho de revisão técnica. Você encontrou e corrigiu todos os erros.</Text>
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

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Laudo do Detetive</Text>
      <Text style={styles.sectionSubtitle}>Analise cada linha, marque se está correta e corrija as incorretas.</Text>

      <View style={styles.reportHelpCard}>
        <Text style={styles.reportHelpTitle}>Como jogar</Text>
        <Text style={styles.reportHelpText}>1. Leia o laudo enviado em cada linha.</Text>
        <Text style={styles.reportHelpText}>2. Marque se a linha está correta ou se tem erro.</Text>
        <Text style={styles.reportHelpText}>3. Se tiver erro, faça as duas correções: nome e convexidade.</Text>
      </View>

      <View style={styles.reportProgressCard}>
        <Text style={styles.reportProgressText}>Linhas revisadas: {reviewedCount}/{entries.length}</Text>
        <Text style={styles.reportProgressText}>Linhas corrigidas: {correctedCount}</Text>
      </View>
      <View style={styles.reportProgressBarTrack}>
        <View style={[styles.reportProgressBarFill, { width: `${fillPercent}%` }]} />
      </View>
      <Text style={styles.reportProgressCaption}>Progresso de preenchimento: {filledCount}/{entries.length}</Text>

      <View style={styles.reportList}>
        {entries.map((entry, index) => {
          const decision = decisionMap[entry.id];
          const requiresCorrection = decision === 'incorreta';
          const isExpanded = expandedEntryId === entry.id;
          const isFilled = isEntryFilled(entry);
          const nextPending = entries.find((item) => !isEntryFilled(item) && item.id !== entry.id);

          return (
            <View key={entry.id} style={[styles.reportCard, isExpanded && styles.reportCardExpanded]}>
              <Pressable style={styles.reportCardHeader} onPress={() => setExpandedEntryId(isExpanded ? '' : entry.id)}>
                <Text style={styles.reportCardTitle}>Linha {index + 1}: {entry.place}</Text>
                <View style={styles.reportCardHeaderRight}>
                  <View style={[styles.reportStatusPill, isFilled && styles.reportStatusPillDone]}>
                    <Text style={[styles.reportStatusText, isFilled && styles.reportStatusTextDone]}>
                        {isFilled ? 'Pronta' : decision ? 'Em revisão' : 'Pendente'}
                    </Text>
                  </View>
                  <Text style={styles.reportChevron}>{isExpanded ? '−' : '+'}</Text>
                </View>
              </Pressable>

              {isExpanded && (
                <>
                  <Text style={styles.reportSubmittedText}>Laudo enviado pelo detetive júnior:</Text>
                  <View style={styles.reportSubmittedChipRow}>
                    <View style={styles.reportSubmittedChip}>
                      <Text style={styles.reportSubmittedChipText}>Nome: {entry.submittedName}</Text>
                    </View>
                    <View style={styles.reportSubmittedChip}>
                      <Text style={styles.reportSubmittedChipText}>
                        {entry.submittedConvexity === 'convexo' ? 'Convexo' : 'Não convexo'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reportVisualRow}>
                    <ReportShapePreview sides={entry.sides} concave={entry.correctConvexity === 'concavo'} />
                    <View style={styles.reportVisualTextWrap}>
                      <Text style={styles.reportVisualTitle}>Pista visual compacta</Text>
                      <Text style={styles.reportVisualText}>{entry.sides} lados na forma</Text>
                      <Text style={styles.reportVisualText}>Observe se o contorno entra para dentro.</Text>
                    </View>
                  </View>

                  <Text style={styles.reportPromptText}>Essa linha está correta?</Text>

                  <View style={styles.reportDecisionRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.reportDecisionButton,
                        decision === 'correta' && styles.reportDecisionButtonActive,
                        pressed && styles.reportDecisionButtonPressed,
                      ]}
                      onPress={() => setDecisionMap((prev) => ({ ...prev, [entry.id]: 'correta' }))}
                    >
                      <Text style={[styles.reportDecisionButtonText, decision === 'correta' && styles.reportDecisionButtonTextActive]}>
                        Correta
                      </Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.reportDecisionButton,
                        decision === 'incorreta' && styles.reportDecisionButtonActive,
                        pressed && styles.reportDecisionButtonPressed,
                      ]}
                      onPress={() => setDecisionMap((prev) => ({ ...prev, [entry.id]: 'incorreta' }))}
                    >
                      <Text style={[styles.reportDecisionButtonText, decision === 'incorreta' && styles.reportDecisionButtonTextActive]}>
                        Tem erro
                      </Text>
                    </Pressable>
                  </View>

                  {requiresCorrection && (
                    <View style={styles.reportCorrectionWrap}>
                      <Text style={styles.reportCorrectionHint}>Agora preencha as correções abaixo:</Text>
                      <Text style={styles.reportCorrectionLabel}>Nome correto</Text>
                      <View style={styles.optionsWrap}>
                        {options.map((option) => {
                          const selected = nameCorrectionMap[entry.id] === option;
                          return (
                            <Pressable
                              key={`${entry.id}-${option}`}
                              style={({ pressed }) => [
                                styles.optionButton,
                                selected && styles.optionButtonSelected,
                                pressed && styles.optionButtonPressed,
                              ]}
                              onPress={() => setNameCorrectionMap((prev) => ({ ...prev, [entry.id]: option }))}
                            >
                              <Text style={styles.optionButtonText}>{option}</Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      <Text style={styles.reportCorrectionLabel}>Convexidade correta</Text>
                      <View style={styles.convexityRow}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.convexityButton,
                            convexityCorrectionMap[entry.id] === 'convexo' && styles.convexityButtonSelected,
                            pressed && styles.convexityButtonPressed,
                          ]}
                          onPress={() => setConvexityCorrectionMap((prev) => ({ ...prev, [entry.id]: 'convexo' }))}
                        >
                          <Text style={styles.convexityButtonText}>Convexo</Text>
                        </Pressable>

                        <Pressable
                          style={({ pressed }) => [
                            styles.convexityButton,
                            convexityCorrectionMap[entry.id] === 'concavo' && styles.convexityButtonSelected,
                            pressed && styles.convexityButtonPressed,
                          ]}
                          onPress={() => setConvexityCorrectionMap((prev) => ({ ...prev, [entry.id]: 'concavo' }))}
                        >
                          <Text style={styles.convexityButtonText}>Não convexo</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}

                  {isFilled && nextPending ? (
                    <Pressable style={({ pressed }) => [styles.nextReportButton, pressed && styles.nextReportButtonPressed]} onPress={() => setExpandedEntryId(nextPending.id)}>
                      <Text style={styles.nextReportButtonText}>Revisar próxima linha</Text>
                    </Pressable>
                  ) : null}
                </>
              )}
            </View>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [styles.checkButton, pressed && styles.checkButtonPressed]}
        onPress={() => {
          const unrevisedLines = entries
            .map((entry, index) => (!decisionMap[entry.id] ? { id: entry.id, line: index + 1 } : null))
            .filter((item): item is { id: string; line: number } => item !== null);

          if (unrevisedLines.length > 0) {
            setExpandedEntryId(unrevisedLines[0].id);
            setFeedback(`Faltam revisar as linhas: ${unrevisedLines.map((item) => item.line).join(', ')}.`);
            return;
          }

          const missingCorrectionLines = entries
            .map((entry, index) => {
              if (decisionMap[entry.id] !== 'incorreta') {
                return null;
              }

              const missingName = !nameCorrectionMap[entry.id];
              const missingConvexity = !convexityCorrectionMap[entry.id];

              return missingName || missingConvexity ? { id: entry.id, line: index + 1 } : null;
            })
            .filter((item): item is { id: string; line: number } => item !== null);

          if (missingCorrectionLines.length > 0) {
            setExpandedEntryId(missingCorrectionLines[0].id);
            setFeedback(`Faltam correções completas nas linhas: ${missingCorrectionLines.map((item) => item.line).join(', ')}.`);
            return;
          }

          if (solved) {
            setFeedback('Perfeito! Todas as linhas foram revisadas corretamente.');
            return;
          }

          const wrongLines = entries
            .map((entry, index) => {
              const expectedDecision =
                entry.submittedName === entry.correctName && entry.submittedConvexity === entry.correctConvexity
                  ? 'correta'
                  : 'incorreta';

              const selectedDecision = decisionMap[entry.id];

              if (selectedDecision !== expectedDecision) {
                return { id: entry.id, line: index + 1 };
              }

              if (expectedDecision === 'incorreta') {
                const nameOk = nameCorrectionMap[entry.id] === entry.correctName;
                const convexityOk = convexityCorrectionMap[entry.id] === entry.correctConvexity;

                if (!nameOk || !convexityOk) {
                  return { id: entry.id, line: index + 1 };
                }
              }

              return null;
            })
            .filter((item): item is { id: string; line: number } => item !== null);

          if (wrongLines.length > 0) {
            setExpandedEntryId(wrongLines[0].id);
            setFeedback(`Ainda há erros nas linhas: ${wrongLines.map((item) => item.line).join(', ')}.`);
            return;
          }

          setFeedback('Ainda há inconsistências no laudo. Revise as linhas e tente novamente.');
        }}
      >
        <Text style={styles.checkButtonText}>Validar laudo</Text>
      </Pressable>

      {!!feedback && <Text style={styles.feedbackText}>{feedback}</Text>}
    </View>
  );
}

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

function MissionQuizFlow({
  title,
  subtitle,
  questions,
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [locked, setLocked] = useState(false);
  const [hits, setHits] = useState(0);

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

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Questão {index + 1} de {questions.length}</Text>
        <Text style={styles.caseContext}>{current.prompt}</Text>

        <View style={styles.optionsWrap}>
          {current.options.map((option) => {
            const isSelected = selected === option;

            return (
              <Pressable
                key={option}
                style={({ pressed }) => [
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                  locked && styles.optionButtonDisabled,
                  pressed && !locked && styles.optionButtonPressed,
                ]}
                disabled={locked}
                onPress={() => setSelected(option)}
              >
                <Text style={styles.optionButtonText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        {!!feedback && <Text style={styles.feedbackText}>{feedback}</Text>}

        {!locked ? (
          <Pressable
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
              }

              setFeedback(`${correct ? 'Correto!' : 'Resposta incorreta.'} ${current.explanation}`);
              setLocked(true);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Validar resposta</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.nextCaseButton, pressed && styles.nextCaseButtonPressed]}
            onPress={() => {
              setIndex((prev) => prev + 1);
              setSelected(null);
              setFeedback('');
              setLocked(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>
              {index + 1 === questions.length ? 'Ver resultado' : 'Próxima questão'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function PerimeterGuardianMission(props: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const questions: QuizQuestion[] = [
    {
      id: 'p1',
      prompt: 'Um pentágono tem lados 5m, 6m, 7m, 6m e 4m. Qual é o perímetro?',
      options: ['26 m', '28 m', '30 m', '32 m'],
      answer: '28 m',
      explanation: 'Perímetro é a soma de todos os lados: 5 + 6 + 7 + 6 + 4 = 28.',
    },
    {
      id: 'p2',
      prompt: 'Para cercar um jardim quadrado de lado 9m, você precisa calcular...',
      options: ['Área', 'Perímetro', 'Apótema', 'Diagonal'],
      answer: 'Perímetro',
      explanation: 'Cercar significa medir contorno. Contorno é perímetro.',
    },
    {
      id: 'p3',
      prompt: 'Qual expressão representa o perímetro de um polígono qualquer?',
      options: ['P = l1 + l2 + ... + ln', 'P = b x h', 'P = (b x h)/2', 'P = (P x a)/2'],
      answer: 'P = l1 + l2 + ... + ln',
      explanation: 'Perímetro é sempre soma dos lados.',
    },
  ];

  return (
    <MissionQuizFlow
      {...props}
      title="Guardião do Perímetro"
      subtitle="Treine contorno e soma de lados em cenários práticos."
      questions={questions}
    />
  );
}

function AreaMasterMission(props: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const stages = [
    {
      id: 'a1',
      title: 'Piso Quadrado',
      shape: 'quadrado' as const,
      formula: 'A = l²',
      hint: 'Lado do piso: 6m',
      prompt: 'Quantos metros quadrados o piso ocupa?',
      options: ['24 m²', '30 m²', '36 m²', '12 m²'],
      answer: '36 m²',
      explanation: 'Quadrado: A = l². Com lado 6, a área é 6 × 6 = 36 m².',
    },
    {
      id: 'a2',
      title: 'Terreno Retangular',
      shape: 'retangulo' as const,
      formula: 'A = b × h',
      hint: 'Base 8m e altura 5m',
      prompt: 'Qual é a área total do terreno?',
      options: ['20 m²', '30 m²', '35 m²', '40 m²'],
      answer: '40 m²',
      explanation: 'Retângulo: A = b × h. Com 8 e 5, a área é 40 m².',
    },
    {
      id: 'a3',
      title: 'Jardim Triangular',
      shape: 'triangulo' as const,
      formula: 'A = (b × h) / 2',
      hint: 'Base 10m e altura 6m',
      prompt: 'Qual a área do jardim?',
      options: ['16 m²', '24 m²', '30 m²', '60 m²'],
      answer: '30 m²',
      explanation: 'Triângulo: A = (b × h)/2. Com 10 e 6, a área é 30 m².',
    },
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [hits, setHits] = useState(0);

  const current = stages[stepIndex];
  const finished = stepIndex >= stages.length;

  if (finished) {
    const scorePct = Math.round((hits / stages.length) * 100);

    return (
      <View style={styles.missionCard}>
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Superfície dominada!</Text>
          <Text style={styles.successText}>
            Você concluiu a missão com {hits}/{stages.length} acertos ({scorePct}%).
          </Text>
        </View>
        <MissionCompletionAction
          alreadyCompleted={props.alreadyCompleted}
          nextMissionId={props.nextMissionId}
          onComplete={props.onComplete}
          onNext={props.onNext}
        />
      </View>
    );
  }

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Mestre da Área</Text>
      <Text style={styles.sectionSubtitle}>Leia a figura, escolha a fórmula e calcule a superfície correta.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Desafio {stepIndex + 1} de {stages.length}: {current.title}</Text>

        <View style={styles.areaPreviewWrap}>
          <AreaShapePreview shape={current.shape} />
          <View style={styles.areaPreviewInfo}>
            <Text style={styles.areaFormulaLabel}>Fórmula</Text>
            <Text style={styles.areaFormulaValue}>{current.formula}</Text>
            <Text style={styles.areaHint}>{current.hint}</Text>
          </View>
        </View>

        <Text style={styles.caseContext}>{current.prompt}</Text>

        <View style={styles.optionsWrap}>
          {current.options.map((option) => {
            const isSelected = selected === option;

            return (
              <Pressable
                key={option}
                style={({ pressed }) => [
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                  locked && styles.optionButtonDisabled,
                  pressed && !locked && styles.optionButtonPressed,
                ]}
                disabled={locked}
                onPress={() => setSelected(option)}
              >
                <Text style={styles.optionButtonText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        {!!feedback && <Text style={styles.feedbackText}>{feedback}</Text>}

        {!locked ? (
          <Pressable
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
              }

              setFeedback(`${correct ? 'Correto!' : 'Não foi dessa vez.'} ${current.explanation}`);
              setLocked(true);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Validar cálculo</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.nextCaseButton, pressed && styles.nextCaseButtonPressed]}
            onPress={() => {
              setStepIndex((prev) => prev + 1);
              setSelected(null);
              setFeedback('');
              setLocked(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>
              {stepIndex + 1 === stages.length ? 'Ver resultado' : 'Próximo desafio'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function AreaShapePreview({ shape }: { shape: 'quadrado' | 'retangulo' | 'triangulo' }) {
  if (shape === 'quadrado') {
    return (
      <View style={styles.areaShapeCard}>
        <View style={styles.squareShape}>
          <Text style={styles.shapeMeasureText}>6m</Text>
        </View>
        <Text style={styles.shapeCaption}>Quadrado</Text>
      </View>
    );
  }

  if (shape === 'retangulo') {
    return (
      <View style={styles.areaShapeCard}>
        <View style={styles.rectangleShape}>
          <Text style={styles.shapeMeasureText}>8m</Text>
          <Text style={styles.shapeMeasureTextSmall}>5m</Text>
        </View>
        <Text style={styles.shapeCaption}>Retângulo</Text>
      </View>
    );
  }

  return (
    <View style={styles.areaShapeCard}>
      <View style={styles.triangleShape} />
      <View style={styles.triangleLabelsRow}>
        <Text style={styles.shapeMeasureTextSmall}>10m</Text>
        <Text style={styles.shapeMeasureTextSmall}>6m</Text>
      </View>
      <Text style={styles.shapeCaption}>Triângulo</Text>
    </View>
  );
}

function PolygonAngleCalculator({
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [n, setN] = useState(5);
  const ai = Math.round(((n - 2) * 180) / n * 100) / 100;
  const options = useMemo(() => {
    const correct = `${ai}°`;
    const alt1 = `${Math.round(((n - 1) * 180) / n)}°`;
    const alt2 = `${Math.round(((n - 3) * 180) / n)}°`;
    const alt3 = `${Math.round(((n - 2) * 180) / (n + 1))}°`;
    return [correct, alt1, alt2, alt3].sort(() => Math.random() - 0.5);
  }, [n, ai]);

  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [hits, setHits] = useState(0);

  const handleValidate = () => {
    if (!selected) return;
    const correct = selected === `${ai}°`;
    if (correct) setHits((h) => h + 1);
    setLocked(true);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Ângulos em Polígonos Regulares</Text>
      <Text style={styles.sectionSubtitle}>Escolha o número de lados e calcule o ângulo interno.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Selecione o número de lados (n)</Text>
        <View style={styles.optionsWrap}>
          {Array.from({ length: 10 }).map((_, i) => {
            const val = i + 3;
            const active = val === n;
            return (
              <Pressable
                key={val}
                style={({ pressed }) => [styles.sideChip, active && styles.sideChipTouched, pressed && styles.optionButtonPressed]}
                onPress={() => {
                  setN(val);
                  setSelected(null);
                  setLocked(false);
                }}
              >
                <Text style={[styles.sideChipText, active && styles.sideChipTextTouched]}>{val}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.caseContext, { marginTop: 8 }]}>Fórmula: a_i = (n-2) × 180° / n</Text>
        <Text style={[styles.caseContext]}>Resultado esperado para n = {n}: {ai}°</Text>

        <View style={{ marginTop: 8 }} />
        <Text style={styles.trainingTitle}>Escolha a resposta correta</Text>
        <View style={styles.optionsWrap}>
          {options.map((opt) => (
            <Pressable
              key={opt}
              style={({ pressed }) => [styles.optionButton, selected === opt && styles.optionButtonSelected, pressed && !locked && styles.optionButtonPressed]}
              disabled={locked}
              onPress={() => setSelected(opt)}
            >
              <Text style={styles.optionButtonText}>{opt}</Text>
            </Pressable>
          ))}
        </View>

        {!locked ? (
          <Pressable style={styles.nextCaseButton} onPress={handleValidate} disabled={!selected}>
            <Text style={styles.nextCaseButtonText}>Validar resposta</Text>
          </Pressable>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={styles.feedbackText}>{selected === `${ai}°` ? 'Correto! Ótimo cálculo.' : `Resposta incorreta. O ângulo interno é ${ai}°.`}</Text>
            <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
          </View>
        )}
      </View>
    </View>
  );
}

function ExternalAngleVisualizer({
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const questions: QuizQuestion[] = [
    {
      id: 'ext1',
      prompt: 'Qual é o ângulo externo de um triângulo regular (n = 3)?',
      options: ['60°', '90°', '120°', '180°'],
      answer: '120°',
      explanation: 'a_e = 360° / n, então 360° / 3 = 120°.',
    },
    {
      id: 'ext2',
      prompt: 'Qual é o ângulo externo de um quadrado regular (n = 4)?',
      options: ['45°', '60°', '90°', '120°'],
      answer: '90°',
      explanation: '360° / 4 = 90°.',
    },
    {
      id: 'ext3',
      prompt: 'Qual é o ângulo externo de um octógono regular (n = 8)?',
      options: ['22.5°', '30°', '45°', '60°'],
      answer: '45°',
      explanation: '360° / 8 = 45°.',
    },
  ];

  return (
    <MissionQuizFlow
      title="Ângulos Externos"
      subtitle="Calcule a_e = 360° / n para polígonos regulares"
      questions={questions}
      onComplete={onComplete}
      alreadyCompleted={alreadyCompleted}
      nextMissionId={nextMissionId}
      onNext={onNext}
    />
  );
}

function SymmetryExplorer({
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const questions: QuizQuestion[] = [
    {
      id: 'sym1',
      prompt: 'Quantos eixos de simetria tem um quadrado regular (n = 4)?',
      options: ['2', '4', '6', '8'],
      answer: '4',
      explanation: 'Polígonos regulares possuem n eixos de simetria; para o quadrado, n = 4.',
    },
    {
      id: 'sym2',
      prompt: 'Quantos eixos de simetria tem um hexágono regular (n = 6)?',
      options: ['3', '6', '5', '4'],
      answer: '6',
      explanation: 'Hexágono regular tem 6 eixos — um por vértice e por lado.',
    },
    {
      id: 'sym3',
      prompt: 'Quantos eixos de simetria tem um triângulo equilátero (n = 3)?',
      options: ['1', '2', '3', '6'],
      answer: '3',
      explanation: 'Triângulo equilátero tem 3 eixos de simetria, um por vértice.',
    },
  ];

  return (
    <MissionQuizFlow
      title="Mapa da Simetria"
      subtitle="Identifique o número de eixos de simetria em polígonos regulares"
      questions={questions}
      onComplete={onComplete}
      alreadyCompleted={alreadyCompleted}
      nextMissionId={nextMissionId}
      onNext={onNext}
    />
  );
}

function EquationVaultMission({
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [x, setX] = useState(4);
  const [y, setY] = useState(4);

  const perimeter = 2 * x + 2 * y;
  const area = x * y;

  const perimeterOk = perimeter === 30;
  const areaOk = area === 56;
  const solved = perimeterOk && areaOk;

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Cofre Geométrico</Text>
      <Text style={styles.sectionSubtitle}>Ajuste x e y para cumprir as duas equações simultaneamente.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Regras do cofre</Text>
        <Text style={styles.caseContext}>2x + 2y = 30</Text>
        <Text style={styles.caseContext}>x × y = 56</Text>

        <View style={styles.equationAdjustGrid}>
          <View style={styles.equationAdjustCard}>
            <Text style={styles.equationAdjustLabel}>Valor de x</Text>
            <View style={styles.equationAdjustControls}>
              <Pressable
                style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
                onPress={() => setX((prev) => Math.max(1, prev - 1))}
              >
                <Text style={styles.optionButtonText}>-</Text>
              </Pressable>
              <Text style={styles.equationAdjustValue}>{x}</Text>
              <Pressable
                style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
                onPress={() => setX((prev) => Math.min(30, prev + 1))}
              >
                <Text style={styles.optionButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.equationAdjustCard}>
            <Text style={styles.equationAdjustLabel}>Valor de y</Text>
            <View style={styles.equationAdjustControls}>
              <Pressable
                style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
                onPress={() => setY((prev) => Math.max(1, prev - 1))}
              >
                <Text style={styles.optionButtonText}>-</Text>
              </Pressable>
              <Text style={styles.equationAdjustValue}>{y}</Text>
              <Pressable
                style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
                onPress={() => setY((prev) => Math.min(30, prev + 1))}
              >
                <Text style={styles.optionButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.equationStatusWrap}>
          <Text style={[styles.equationStatusText, perimeterOk && styles.equationStatusTextOk]}>
            Perímetro atual: {perimeter} {perimeterOk ? 'OK' : '(alvo 30)'}
          </Text>
          <Text style={[styles.equationStatusText, areaOk && styles.equationStatusTextOk]}>
            Área atual: {area} {areaOk ? 'OK' : '(alvo 56)'}
          </Text>
        </View>

        {solved && (
          <>
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>Cofre aberto!</Text>
              <Text style={styles.successText}>Você encontrou medidas que satisfazem as duas equações.</Text>
            </View>
            <MissionCompletionAction
              alreadyCompleted={alreadyCompleted}
              nextMissionId={nextMissionId}
              onComplete={onComplete}
              onNext={onNext}
            />
          </>
        )}
      </View>
    </View>
  );
}

function TriangleBalanceMission(props: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const questions: QuizQuestion[] = [
    {
      id: 'tb1',
      prompt: 'Em um triângulo retângulo: x² + 12² = 13². Qual o valor de x?',
      options: ['4', '5', '6', '7'],
      answer: '5',
      explanation: 'x² = 169 - 144 = 25, então x = 5.',
    },
    {
      id: 'tb2',
      prompt: 'Resolva 8^2 + x^2 = 17^2 para encontrar o outro cateto.',
      options: ['12', '13', '15', '16'],
      answer: '15',
      explanation: 'x² = 289 - 64 = 225, logo x = 15.',
    },
    {
      id: 'tb3',
      prompt: 'Em um triângulo, x + 35 + 90 = 180. Quanto vale x?',
      options: ['45', '50', '55', '60'],
      answer: '55',
      explanation: 'x = 180 - 125 = 55.',
    },
  ];

  return (
    <MissionQuizFlow
      {...props}
      title="Triângulo em Equilíbrio"
      subtitle="Use Pitágoras e soma dos ângulos para descobrir medidas faltantes."
      questions={questions}
    />
  );
}

function CartesianRouteMission({
  onComplete,
  alreadyCompleted,
  nextMissionId,
  onNext,
}: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const [m, setM] = useState(0);
  const [b, setB] = useState(0);

  const pointAOk = m * 1 + b === 3;
  const pointBOk = m * 3 + b === 7;
  const forecastOk = m * 5 + b === 11;
  const solved = pointAOk && pointBOk && forecastOk;

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Rota no Plano Cartesiano</Text>
      <Text style={styles.sectionSubtitle}>Ajuste m e b para modelar a rota usando y = mx + b.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Pontos da rota</Text>
        <Text style={styles.caseContext}>A(1, 3), B(3, 7) e previsão para x = 5 com y = 11</Text>

        <View style={styles.equationAdjustGrid}>
          <View style={styles.equationAdjustCard}>
            <Text style={styles.equationAdjustLabel}>Coeficiente m</Text>
            <View style={styles.equationAdjustControls}>
              <Pressable
                style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
                onPress={() => setM((prev) => Math.max(-10, prev - 1))}
              >
                <Text style={styles.optionButtonText}>-</Text>
              </Pressable>
              <Text style={styles.equationAdjustValue}>{m}</Text>
              <Pressable
                style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
                onPress={() => setM((prev) => Math.min(10, prev + 1))}
              >
                <Text style={styles.optionButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.equationAdjustCard}>
            <Text style={styles.equationAdjustLabel}>Intercepto b</Text>
            <View style={styles.equationAdjustControls}>
              <Pressable
                style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
                onPress={() => setB((prev) => Math.max(-10, prev - 1))}
              >
                <Text style={styles.optionButtonText}>-</Text>
              </Pressable>
              <Text style={styles.equationAdjustValue}>{b}</Text>
              <Pressable
                style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
                onPress={() => setB((prev) => Math.min(10, prev + 1))}
              >
                <Text style={styles.optionButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.equationStatusWrap}>
          <Text style={[styles.equationStatusText, pointAOk && styles.equationStatusTextOk]}>
            Teste em A: {m} x 1 + {b} = {m + b} {pointAOk ? 'OK' : '(alvo 3)'}
          </Text>
          <Text style={[styles.equationStatusText, pointBOk && styles.equationStatusTextOk]}>
            Teste em B: {m} x 3 + {b} = {3 * m + b} {pointBOk ? 'OK' : '(alvo 7)'}
          </Text>
          <Text style={[styles.equationStatusText, forecastOk && styles.equationStatusTextOk]}>
            Previsão x=5: y = {5 * m + b} {forecastOk ? 'OK' : '(alvo 11)'}
          </Text>
        </View>

        {solved && (
          <>
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>Rota validada!</Text>
              <Text style={styles.successText}>A função y = {m}x + {b} atende todos os pontos e previsão.</Text>
            </View>
            <MissionCompletionAction
              alreadyCompleted={alreadyCompleted}
              nextMissionId={nextMissionId}
              onComplete={onComplete}
              onNext={onNext}
            />
          </>
        )}
      </View>
    </View>
  );
}

function SystemBlueprintMission(props: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const questions: QuizQuestion[] = [
    {
      id: 'sb1',
      prompt: 'Para um retângulo com perímetro 34 e diferença entre lados 3, qual sistema representa o problema?',
      options: [
        '2x + 2y = 34 e x - y = 3',
        'x + y = 34 e x + y = 3',
        '2x + y = 34 e x + y = 3',
        'xy = 34 e x - y = 3',
      ],
      answer: '2x + 2y = 34 e x - y = 3',
      explanation: 'Perímetro gera 2x + 2y = 34 e a diferença gera x - y = 3.',
    },
    {
      id: 'sb2',
      prompt: 'Resolvendo o sistema, quais são os lados do retângulo?',
      options: ['10 e 7', '11 e 8', '12 e 9', '13 e 10'],
      answer: '10 e 7',
      explanation: 'De x - y = 3, x = y + 3. Substituindo no perímetro: 2(y+3) + 2y = 34, então y = 7 e x = 10.',
    },
    {
      id: 'sb3',
      prompt: 'Com lados 10 e 7, qual a area final?',
      options: ['60', '70', '80', '90'],
      answer: '70',
      explanation: 'Área de retângulo: A = x × y = 10 × 7 = 70.',
    },
  ];

  return (
    <MissionQuizFlow
      {...props}
      title="Projeto por Sistema"
      subtitle="Modele cenários geométricos com duas equações e valide o resultado."
      questions={questions}
    />
  );
}

function ApothemaSecretMission(props: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const questions: QuizQuestion[] = [
    {
      id: 'ap1',
      prompt: 'Apótema é o segmento que vai...',
      options: [
        'do centro ao vértice',
        'do centro ao meio de um lado (perpendicular)',
        'de um vértice ao outro',
        'da base ao topo',
      ],
      answer: 'do centro ao meio de um lado (perpendicular)',
      explanation: 'Essa é a definição correta de apótema.',
    },
    {
      id: 'ap2',
      prompt: 'Área de polígono regular usando apótema:',
      options: ['A = (P x a)/2', 'A = b x h', 'A = l²', 'A = (n-2) x 180'],
      answer: 'A = (P x a)/2',
      explanation: 'Perímetro vezes apótema dividido por 2.',
    },
    {
      id: 'ap3',
      prompt: 'Hexágono regular com P = 24 e a = 4. Área?',
      options: ['48', '96', '24', '12'],
      answer: '48',
      explanation: 'A = (24 x 4)/2 = 48.',
    },
  ];

  return (
    <MissionQuizFlow
      {...props}
      title="Segredo do Apótema"
      subtitle="Identifique apótema e aplique a fórmula de área em polígonos regulares."
      questions={questions}
    />
  );
}

function SpaceBuilderMission(props: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const questions: QuizQuestion[] = [
    {
      id: 's1',
      prompt: 'Um muro para cercar um terreno exige qual medida?',
      options: ['Área', 'Perímetro', 'Apótema', 'Volume'],
      answer: 'Perímetro',
      explanation: 'Muro acompanha o contorno.',
    },
    {
      id: 's2',
      prompt: 'Quantidade de grama para cobrir um jardim exige...',
      options: ['Área', 'Perímetro', 'Ângulo interno', 'Número de lados'],
      answer: 'Área',
      explanation: 'Cobrir superfície é calcular área.',
    },
    {
      id: 's3',
      prompt: 'Jardim hexagonal regular: cerca + grama. Você usa...',
      options: [
        'Só área',
        'Só perímetro',
        'Perímetro para cerca e área para grama',
        'Nenhuma das anteriores',
      ],
      answer: 'Perímetro para cerca e área para grama',
      explanation: 'Cenários mistos pedem medidas diferentes para cada objetivo.',
    },
  ];

  return (
    <MissionQuizFlow
      {...props}
      title="Construtor de Espaços"
      subtitle="Interprete o problema antes de escolher a fórmula."
      questions={questions}
    />
  );
}

function SupremeEngineerMission(props: {
  onComplete: () => void;
  alreadyCompleted: boolean;
  nextMissionId?: string | null;
  onNext?: () => void;
}) {
  const questions: QuizQuestion[] = [
    {
      id: 'e1',
      prompt: 'Um quadrado tem perímetro 40m. Qual o lado?',
      options: ['8 m', '10 m', '12 m', '20 m'],
      answer: '10 m',
      explanation: 'Para quadrado, P = 4l. Então l = 40/4 = 10.',
    },
    {
      id: 'e2',
      prompt: 'Com lado 10m, qual a área desse quadrado?',
      options: ['20 m²', '40 m²', '100 m²', '400 m²'],
      answer: '100 m²',
      explanation: 'A = l² = 10² = 100.',
    },
    {
      id: 'e3',
      prompt: 'Um desafio pede cercar e revestir uma praça. Quais medidas entram?',
      options: [
        'Somente área',
        'Somente perímetro',
        'Perímetro e área',
        'Somente apótema',
      ],
      answer: 'Perímetro e área',
      explanation: 'Cercar = perímetro, revestir = área.',
    },
  ];

  return (
    <MissionQuizFlow
      {...props}
      title="Engenheiro Supremo"
      subtitle="Integre perímetro, área, apótema e interpretação de cenário."
      questions={questions}
    />
  );
}

function GenericMission({
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

export default function MissionPlayScreen() {
  const { missionId, phaseId, from } = useLocalSearchParams<{
    missionId: string;
    phaseId?: string;
    from?: string;
  }>();
  const mission = useMemo(() => (missionId ? getMissionById(missionId) : undefined), [missionId]);
  const [selectedDetectiveId, setSelectedDetectiveId] = useState<string | null>(null);
  const [missionAlreadyCompleted, setMissionAlreadyCompleted] = useState(false);
  const [nextMissionId, setNextMissionId] = useState<string | null>(null);
  const [completionFeedback, setCompletionFeedback] = useState('');

  const resolveNextMissionId = async (detectiveId: string, missionPhaseId: string) => {
    const currentPhaseNextMissionId = await getNextMissionIdForDetectivePhase(detectiveId, missionPhaseId);

    if (currentPhaseNextMissionId) {
      return currentPhaseNextMissionId;
    }

    const currentPhaseNumber = Number(missionPhaseId.replace('fase', ''));
    const nextPhase = phases.find((phase) => phase.number === currentPhaseNumber + 1);

    if (!nextPhase) {
      return null;
    }

    return getNextMissionIdForDetectivePhase(detectiveId, nextPhase.id);
  };

  useEffect(() => {
    let isMounted = true;

    async function syncMissionState() {
      const detectiveId = await getSelectedDetectiveId();

      if (!isMounted) {
        return;
      }

      setSelectedDetectiveId(detectiveId);

      if (!detectiveId || !missionId) {
        setMissionAlreadyCompleted(false);
        setNextMissionId(null);
        return;
      }

      const completed = await isMissionCompletedForDetective(detectiveId, missionId);

      if (isMounted) {
        setMissionAlreadyCompleted(completed);
      }

      if (!mission?.phaseId) {
        setNextMissionId(null);
        return;
      }

      const nextId = await resolveNextMissionId(detectiveId, mission.phaseId);

      if (isMounted) {
        setNextMissionId(nextId ?? null);
      }
    }

    syncMissionState();

    return () => {
      isMounted = false;
    };
  }, [missionId]);

  const handleCompleteMission = async () => {
    if (!mission || !selectedDetectiveId) {
      return;
    }

    const result = await completeMissionForDetective(selectedDetectiveId, mission.id);
    Vibration.vibrate(80);
    setMissionAlreadyCompleted(true);

      if (mission.phaseId) {
        const nextId = await resolveNextMissionId(selectedDetectiveId, mission.phaseId);
        setNextMissionId(nextId ?? null);
    }

    setCompletionFeedback(
      result.newlyCompleted
        ? `Missão registrada com sucesso! +${mission.points} pts`
        : 'Esta missão já estava concluída para este detetive.'
    );
  };

  const handleNextMission = () => {
    if (!nextMissionId) {
      router.replace('/submissions');
      return;
    }

    const nextMission = getMissionById(nextMissionId);

    router.push({
      pathname: '/mission-play',
      params: {
        missionId: nextMissionId,
        phaseId: nextMission?.phaseId ?? phaseId ?? 'fase1',
        from: 'mission-play',
      },
    });
  };

  const backLabel = useMemo(() => {
    if (from === 'submissions') {
      return '← Voltar para Submissões';
    }

    if (from === 'challenges') {
      return '← Voltar para Hub';
    }

    return '← Voltar para Missões';
  }, [from]);

  const handleBack = () => {
    if (phaseId) {
      router.replace({
        pathname: '/phase-missions',
        params: {
          phaseId,
          from: from === 'submissions' ? 'submissions' : from === 'challenges' ? 'challenges' : 'trilha',
        },
      });
      return;
    }

    if (from === 'submissions') {
      router.replace('/submissions');
      return;
    }

    router.replace('/(tabs)/two');
  };

  if (!mission) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Missão não encontrada.</Text>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{backLabel}</Text>
        </Pressable>

        <MissionHeader mission={mission} />
        <MissionHints tips={mission.tips} />

        {mission.id === 'fase1_m1' && (
          <GuidedFirstMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase1_m2' && (
          <ConvexityTrapMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase1_m3' && (
          <NamingShapesMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase1_m4' && (
          <ConvexityTapMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase1_m5' && (
          <DetectiveReportMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase2_m1' && (
          <PerimeterGuardianMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase2_m2' && (
          <AreaMasterMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase2_m3' && (
          <ApothemaSecretMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase2_m4' && (
          <SpaceBuilderMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase2_m5' && (
          <SupremeEngineerMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase3_m1' && (
          <PolygonAngleCalculator
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase3_m2' && (
          <ExternalAngleVisualizer
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase3_m3' && (
          <SymmetryExplorer
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase4_m1' && (
          <EquationVaultMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase4_m2' && (
          <TriangleBalanceMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase4_m3' && (
          <CartesianRouteMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase4_m4' && (
          <SystemBlueprintMission
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase5_m1' && (
          <TriangleAreaPractice
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase5_m2' && (
          <PolygonTriangulationPractice
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase5_m3' && (
          <ApothemPractice
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase6_m1' && (
          <LinearWorkshop
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase6_m2' && (
          <SystemSolver
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase6_m3' && (
          <PitagorasScale
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase6_m4' && (
          <OptimizationChallenge
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase7_m1' && (
          <GenericEquationMission
            title="Sprint Algébrico"
            subtitle="Isolando incógnitas"
            steps={[
              { id: 's1', prompt: 'x + 7 = 12', type: 'number', expected: 5 },
              { id: 's2', prompt: '3x = 21', type: 'number', expected: 7 },
              { id: 's3', prompt: '2x - 5 = 9', type: 'number', expected: 7 },
            ]}
            onComplete={handleCompleteMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
            onNext={handleNextMission}
          />
        )}
        {mission.id === 'fase7_m2' && (
          <GenericEquationMission
            title="Balanceando Expressões"
            subtitle="Distribuição e frações"
            steps={[
              { id: 'd1', prompt: '2(x + 3) = 14', type: 'number', expected: 4 },
              { id: 'd2', prompt: '(3/2)x = 9', type: 'number', expected: 6 },
              { id: 'd3', prompt: '4x + 3 = 3x + 11', type: 'number', expected: 8 },
            ]}
            onComplete={handleCompleteMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
            onNext={handleNextMission}
          />
        )}
        {mission.id === 'fase7_m3' && (
          <GenericEquationMission
            title="Sistemas em Dupla"
            subtitle="Resolva pares (x,y)"
            steps={[
              { id: 'p1', prompt: 'x + y = 7; x - y = 1', type: 'pair', expected: { x: 4, y: 3 } },
              { id: 'p2', prompt: '2x + y = 10; x - 2y = -1', type: 'pair', expected: { x: 3, y: 4 } },
              { id: 'p3', prompt: '3x - y = 5; x + y = 4', type: 'pair', expected: { x: 3, y: 1 } },
            ]}
            onComplete={handleCompleteMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
            onNext={handleNextMission}
          />
        )}
        {mission.id === 'fase7_m4' && (
          <GenericEquationMission
            title="Desafio Final das Equações"
            subtitle="Modelagem e sprint"
            steps={[
              { id: 'm1', prompt: 'Ana tem o dobro que Bia; juntas têm 30. Quanto Bia tem?', type: 'number', expected: 10 },
              { id: 'm2', prompt: 'x+5=12', type: 'number', expected: 7 },
              { id: 'm3', prompt: '2(x-3)=8', type: 'number', expected: 7 },
            ]}
            onComplete={handleCompleteMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
            onNext={handleNextMission}
          />
        )}
        {mission.id === 'fase8_m1' && (
          <VolumeCubePractice
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase8_m2' && (
          <VolumePrismPractice
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase8_m3' && (
          <SurfaceAreaPractice
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase8_m4' && (
          <PackagingOptimizationChallenge
            onComplete={handleCompleteMission}
            onNext={handleNextMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
          />
        )}
        {mission.id === 'fase9_m1' && (
          <GenericEquationMission
            title="Teorema de Tales"
            subtitle="Proporções e semelhança"
            steps={[
              { id: 't1', prompt: '3/x = 9/12. Qual o valor de x?', type: 'number', expected: 4 },
              { id: 't2', prompt: 'x/5 = 8/10. Qual o valor de x?', type: 'number', expected: 4 },
              { id: 't3', prompt: '2/3 = x/9. Qual o valor de x?', type: 'number', expected: 6 },
            ]}
            onComplete={handleCompleteMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
            onNext={handleNextMission}
          />
        )}
        {mission.id === 'fase9_m2' && (
          <GenericEquationMission
            title="Seno e Cosseno"
            subtitle="Razões trigonométricas básicas"
            steps={[
              { id: 's1', prompt: 'Hipotenusa = 10, Cateto Oposto = 6. Qual o valor do Seno (sen θ)?', type: 'number', expected: 0.6 },
              { id: 's2', prompt: 'Hipotenusa = 13, Cateto Adjacente = 5. Qual o Cosseno (cos θ) em fração (ex: 5/13)?', type: 'number', expected: 5/13 },
              { id: 's3', prompt: 'Se o cos(θ) = 0.8 e a Hipotenusa = 15, qual a medida do Cateto Adjacente?', type: 'number', expected: 12 },
            ]}
            onComplete={handleCompleteMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
            onNext={handleNextMission}
          />
        )}
        {mission.id === 'fase9_m3' && (
          <GenericEquationMission
            title="A Sombra da Torre"
            subtitle="Calculando alturas com Tangente"
            steps={[
              { id: 'tg1', prompt: 'Uma torre projeta sombra de 30m. O ângulo solar tem tg(θ) = 1.5. Qual a altura da torre (m)?', type: 'number', expected: 45 },
              { id: 'tg2', prompt: 'Um mastro de 12m projeta uma sombra de 12m. Qual a tangente do ângulo solar (tg θ)?', type: 'number', expected: 1 },
              { id: 'tg3', prompt: 'Se tg(θ) = 2.5 e a sombra da árvore mede 4m, qual a altura da árvore (m)?', type: 'number', expected: 10 },
            ]}
            onComplete={handleCompleteMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
            onNext={handleNextMission}
          />
        )}
        {mission.id === 'fase10_m1' && (
          <GenericEquationMission
            title="Escalas do Mapa"
            subtitle="Distâncias no mundo real"
            steps={[
              { id: 'e1', prompt: 'No mapa 1:100.000, a distância medida é 5cm. Qual a distância real correspondente em km?', type: 'number', expected: 5 },
              { id: 'e2', prompt: 'Escala 1:200.000 e distância real de 16km. Qual a distância medida no mapa em cm?', type: 'number', expected: 8 },
              { id: 'e3', prompt: 'Terreno de 30m. No desenho em escala 1:50, qual o comprimento no desenho em cm?', type: 'number', expected: 60 },
            ]}
            onComplete={handleCompleteMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
            onNext={handleNextMission}
          />
        )}
        {mission.id === 'fase10_m2' && (
          <GenericEquationMission
            title="Alvo Probabilístico"
            subtitle="Probabilidade geométrica em alvos"
            steps={[
              { id: 'p1', prompt: 'Um alvo quadrado de 100m² tem uma zona central de 25m². Qual a probabilidade (%) de acertar a zona central?', type: 'number', expected: 25 },
              { id: 'p2', prompt: 'Uma horta circular de 12m² está num terreno de 60m². Qual a probabilidade (%) de cair na horta?', type: 'number', expected: 20 },
              { id: 'p3', prompt: 'Se a área de um lago é 10% da área de um parque de 500m², qual a área do lago em m²?', type: 'number', expected: 50 },
            ]}
            onComplete={handleCompleteMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
            onNext={handleNextMission}
          />
        )}
        {mission.id === 'fase10_m3' && (
          <GenericEquationMission
            title="Gráfico da Horta"
            subtitle="Divisões proporcionais em gráfico de setores"
            steps={[
              { id: 'g1', prompt: 'Um terreno de 1000m² destina 40% para tomate. Qual a área destinada ao tomate em m²?', type: 'number', expected: 400 },
              { id: 'g2', prompt: 'Se o plantio de alface ocupa 25% da horta de 1000m², qual a área do alface em m²?', type: 'number', expected: 250 },
              { id: 'g3', prompt: 'Fatia de batata representa 15% de uma horta de 200m². Qual a área de batatas em m²?', type: 'number', expected: 30 },
            ]}
            onComplete={handleCompleteMission}
            alreadyCompleted={missionAlreadyCompleted}
            nextMissionId={nextMissionId}
            onNext={handleNextMission}
          />
        )}
        {![
          'fase1_m1',
          'fase1_m2',
          'fase1_m3',
          'fase1_m4',
          'fase1_m5',
          'fase2_m1',
          'fase2_m2',
          'fase2_m3',
          'fase2_m4',
          'fase2_m5',
          'fase3_m1',
          'fase3_m2',
          'fase3_m3',
          'fase4_m1',
          'fase4_m2',
          'fase4_m3',
          'fase4_m4',
          'fase5_m1',
          'fase5_m2',
          'fase5_m3',
          'fase6_m1',
          'fase6_m2',
          'fase6_m3',
          'fase6_m4',
          'fase7_m1',
          'fase7_m2',
          'fase7_m3',
          'fase7_m4',
          'fase8_m1',
          'fase8_m2',
          'fase8_m3',
          'fase8_m4',
          'fase9_m1',
          'fase9_m2',
          'fase9_m3',
          'fase10_m1',
          'fase10_m2',
          'fase10_m3',
        ].includes(mission.id) && (
          <GenericMission
            mission={mission}
            onComplete={handleCompleteMission}
            alreadyCompleted={missionAlreadyCompleted}
            onNext={handleNextMission}
            nextMissionId={nextMissionId}
          />
        )}

        {!!completionFeedback && <Text style={styles.completionFeedback}>{completionFeedback}</Text>}

        <View style={styles.ahaCard}>
          <Text style={styles.ahaTitle}>Aha! Moment</Text>
          <Text style={styles.ahaText}>
            A geometria não vive só no quadro-negro. Ela aparece nas ruas, nas fachadas e nas formas que você observa todos os dias.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#D8D8DB',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#C9DEEF',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#0B5F8F',
    fontWeight: '800',
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 14,
    gap: 8,
  },
  headerTitle: {
    color: '#0D3D66',
    fontSize: 20,
    fontWeight: '900',
  },
  headerDescription: {
    color: '#0B5F8F',
    fontSize: 13,
    fontWeight: '700',
  },
  headerObjective: {
    color: '#475A6F',
    fontSize: 13,
    lineHeight: 18,
  },
  hintsWrap: {
    gap: 8,
  },
  hintTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  hintTriggerPressed: {
    opacity: 0.86,
  },
  hintBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0B5F8F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  hintBubbleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  hintTriggerText: {
    color: '#0B5F8F',
    fontSize: 13,
    fontWeight: '700',
  },
  hintsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F2D58A',
    padding: 10,
    gap: 4,
  },
  hintsTitle: {
    color: '#7A5B00',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  hintItem: {
    color: '#5D4800',
    fontSize: 12,
    lineHeight: 17,
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    color: '#0D3D66',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#607287',
    fontSize: 13,
  },
  caseContext: {
    color: '#4A6078',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  polygonBoard: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    height: 210,
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#D3E3F1',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  polygonEdge: {
    position: 'absolute',
    height: 4,
    borderRadius: 999,
    backgroundColor: '#9CC3DE',
  },
  polygonEdgeTouched: {
    backgroundColor: '#0B5F8F',
  },
  polygonTouchPoint: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#9CC3DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  polygonTouchPointTouched: {
    backgroundColor: '#0B5F8F',
    borderColor: '#0B5F8F',
  },
  polygonTouchPointText: {
    color: '#355877',
    fontSize: 12,
    fontWeight: '800',
  },
  polygonTouchPointTextTouched: {
    color: '#FFFFFF',
  },
  trainingCard: {
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#D3E3F1',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  trainingTitle: {
    color: '#0D3D66',
    fontSize: 14,
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3E1EE',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#0D3D66',
  },
  equationAdjustGrid: {
    gap: 8,
  },
  equationAdjustCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3E1EE',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  equationAdjustLabel: {
    color: '#0B5F8F',
    fontSize: 12,
    fontWeight: '800',
  },
  equationAdjustControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  equationAdjustValue: {
    color: '#0D3D66',
    fontSize: 20,
    fontWeight: '900',
    minWidth: 34,
    textAlign: 'center',
  },
  equationStatusWrap: {
    gap: 6,
    marginTop: 2,
  },
  equationStatusText: {
    color: '#4A6078',
    fontSize: 12,
    fontWeight: '700',
  },
  equationStatusTextOk: {
    color: '#166534',
  },
  areaPreviewWrap: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  areaShapeCard: {
    width: 144,
    minHeight: 132,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 8,
  },
  areaPreviewInfo: {
    flex: 1,
    gap: 4,
  },
  areaFormulaLabel: {
    color: '#0B5F8F',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  areaFormulaValue: {
    color: '#1F3E66',
    fontSize: 16,
    fontWeight: '900',
  },
  areaHint: {
    color: '#4A6078',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  squareShape: {
    width: 68,
    height: 68,
    borderWidth: 3,
    borderColor: '#0B5F8F',
    backgroundColor: '#EAF4FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rectangleShape: {
    width: 88,
    height: 56,
    borderWidth: 3,
    borderColor: '#0B5F8F',
    backgroundColor: '#EAF4FC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  triangleShape: {
    width: 0,
    height: 0,
    borderLeftWidth: 36,
    borderRightWidth: 36,
    borderBottomWidth: 62,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0B5F8F',
    marginTop: 4,
  },
  triangleLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 92,
    marginTop: -2,
  },
  shapeCaption: {
    color: '#0D3D66',
    fontSize: 12,
    fontWeight: '800',
  },
  shapeMeasureText: {
    color: '#0D3D66',
    fontSize: 13,
    fontWeight: '900',
  },
  shapeMeasureTextSmall: {
    color: '#0D3D66',
    fontSize: 11,
    fontWeight: '800',
  },
  trainingBoard: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5E2ED',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  trainingLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#9CC3DE',
    borderRadius: 999,
  },
  vertexDot: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    marginLeft: -17,
    marginTop: -17,
    backgroundColor: '#0B5F8F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vertexDotTouched: {
    backgroundColor: '#16A34A',
  },
  vertexDotText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  trainingMeta: {
    color: '#4A6078',
    fontSize: 12,
    fontWeight: '700',
  },
  optionList: {
    gap: 8,
  },
  quizOption: {
    borderWidth: 1,
    borderColor: '#C8D8E8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  quizOptionPressed: {
    opacity: 0.85,
  },
  quizOptionActive: {
    borderColor: '#0B5F8F',
    backgroundColor: '#EEF6FF',
  },
  quizOptionText: {
    color: '#1F3E66',
    fontSize: 14,
    fontWeight: '700',
  },
  quizOptionTextActive: {
    color: '#0B5F8F',
  },
  quizFeedback: {
    fontSize: 13,
    fontWeight: '700',
  },
  quizFeedbackOk: {
    color: '#166534',
  },
  quizFeedbackWrong: {
    color: '#B91C1C',
  },
  nextStepButton: {
    borderRadius: 10,
    backgroundColor: '#0B5F8F',
    paddingVertical: 10,
    alignItems: 'center',
  },
  nextStepButtonPressed: {
    opacity: 0.86,
  },
  nextStepButtonDisabled: {
    opacity: 0.45,
  },
  nextStepButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sceneMock: {
    borderRadius: 14,
    backgroundColor: '#EEF4FA',
    borderWidth: 1,
    borderColor: '#CAD9E8',
    overflow: 'hidden',
  },
  sceneLabel: {
    color: '#355877',
    fontSize: 12,
    fontWeight: '700',
    padding: 10,
  },
  photoRow: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 8,
  },
  photoCard: {
    width: '100%',
    aspectRatio: 1308 / 1024,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CAD9E8',
  },
  photoCardFill: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  photoCardImage: {
    borderRadius: 10,
    resizeMode: 'cover',
  },
  photoOverlay: {
    backgroundColor: 'rgba(11, 95, 143, 0.72)',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  photoTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  hotspot: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0B5F8F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -16,
    marginTop: -16,
  },
  hotspotCaptured: {
    backgroundColor: '#16A34A',
  },
  hotspotText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  progressPanel: {
    gap: 6,
  },
  sceneHint: {
    color: '#4A6078',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  progressText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBase: {
    height: 8,
    borderRadius: 5,
    backgroundColor: '#E1E7EF',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0B5F8F',
  },
  dragArea: {
    height: 390,
    borderRadius: 12,
    backgroundColor: '#F6FAFD',
    borderWidth: 1,
    borderColor: '#DBE5F0',
    position: 'relative',
    overflow: 'hidden',
  },
  dropZone: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneGreen: {
    borderColor: '#22C55E',
    backgroundColor: '#ECFDF3',
  },
  dropZoneRed: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  dropZoneTitle: {
    color: '#334155',
    fontWeight: '800',
    fontSize: 12,
  },
  dragChip: {
    position: 'absolute',
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9D8E6',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dragChipSelected: {
    borderColor: '#0B5F8F',
    borderWidth: 2,
    backgroundColor: '#EAF4FC',
  },
  dragChipText: {
    color: '#0D3D66',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  tapAssistText: {
    color: '#4A6078',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -2,
    marginBottom: 2,
  },
  answerList: {
    gap: 5,
  },
  answerItem: {
    color: '#475A6F',
    fontSize: 12,
  },
  answerItemOk: {
    color: '#166534',
    fontWeight: '700',
  },
  answerItemWrong: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  sidesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sideChip: {
    backgroundColor: '#EDF4FB',
    borderWidth: 1,
    borderColor: '#D3E1EE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sideChipTouched: {
    backgroundColor: '#0B5F8F',
    borderColor: '#0B5F8F',
  },
  sideChipText: {
    color: '#355877',
    fontSize: 12,
    fontWeight: '700',
  },
  sideChipTextTouched: {
    color: '#FFFFFF',
  },
  counterText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  reportList: {
    gap: 10,
  },
  reportHelpCard: {
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#C9DEEF',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  reportHelpTitle: {
    color: '#0B5F8F',
    fontSize: 12,
    fontWeight: '900',
  },
  reportHelpText: {
    color: '#355877',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  reportProgressCard: {
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#D3E1EE',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  reportProgressText: {
    color: '#0D3D66',
    fontSize: 12,
    fontWeight: '800',
  },
  reportProgressBarTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E1E7EF',
    overflow: 'hidden',
  },
  reportProgressBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
  },
  reportProgressCaption: {
    color: '#4A6078',
    fontSize: 11,
    fontWeight: '700',
    marginTop: -2,
  },
  reportCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D3E1EE',
    padding: 10,
    gap: 8,
  },
  reportCardExpanded: {
    borderColor: '#AFCFE8',
    backgroundColor: '#FDFEFF',
  },
  reportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  reportCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportStatusPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  reportStatusPillDone: {
    backgroundColor: '#ECFDF3',
    borderColor: '#22C55E',
  },
  reportStatusText: {
    color: '#9A3412',
    fontSize: 10,
    fontWeight: '900',
  },
  reportStatusTextDone: {
    color: '#166534',
  },
  reportChevron: {
    color: '#0B5F8F',
    fontSize: 18,
    fontWeight: '900',
    width: 16,
    textAlign: 'center',
  },
  reportCardTitle: {
    color: '#0D3D66',
    fontSize: 13,
    fontWeight: '800',
  },
  reportSubmittedText: {
    color: '#4A6078',
    fontSize: 12,
    fontWeight: '600',
  },
  reportSubmittedChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportSubmittedChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3E1EE',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  reportSubmittedChipText: {
    color: '#355877',
    fontSize: 11,
    fontWeight: '700',
  },
  reportVisualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3E1EE',
    borderRadius: 10,
    padding: 8,
  },
  reportShapePreviewBox: {
    width: 96,
    height: 78,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBE5F0',
    backgroundColor: '#F8FBFF',
    position: 'relative',
    overflow: 'hidden',
  },
  reportShapeEdge: {
    position: 'absolute',
    height: 3,
    borderRadius: 999,
    backgroundColor: '#0B5F8F',
  },
  reportVisualTextWrap: {
    flex: 1,
    gap: 2,
  },
  reportVisualTitle: {
    color: '#0B5F8F',
    fontSize: 11,
    fontWeight: '900',
  },
  reportVisualText: {
    color: '#4A6078',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  reportPromptText: {
    color: '#0B5F8F',
    fontSize: 12,
    fontWeight: '800',
  },
  reportDecisionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reportDecisionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7D7E6',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  reportDecisionButtonActive: {
    borderColor: '#0B5F8F',
    borderWidth: 2,
    backgroundColor: '#EEF6FF',
  },
  reportDecisionButtonPressed: {
    opacity: 0.86,
  },
  reportDecisionButtonText: {
    color: '#1F3E66',
    fontSize: 12,
    fontWeight: '800',
  },
  reportDecisionButtonTextActive: {
    color: '#0B5F8F',
  },
  reportCorrectionWrap: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#D7E4EF',
    paddingTop: 8,
  },
  reportCorrectionLabel: {
    color: '#0B5F8F',
    fontSize: 12,
    fontWeight: '800',
  },
  reportCorrectionHint: {
    color: '#355877',
    fontSize: 11,
    fontWeight: '700',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7D7E6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionButtonPressed: {
    opacity: 0.86,
  },
  optionButtonDisabled: {
    opacity: 0.55,
  },
  optionButtonSelected: {
    borderColor: '#0B5F8F',
    borderWidth: 2,
  },
  optionButtonText: {
    color: '#1F3E66',
    fontSize: 12,
    fontWeight: '700',
  },
  tapList: {
    gap: 10,
  },
  tapRow: {
    backgroundColor: '#F8FBFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D3E1EE',
    padding: 12,
    gap: 10,
  },
  tapRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tapRowTitle: {
    color: '#0D3D66',
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
    paddingRight: 10,
  },
  tapRowStatusOk: {
    color: '#166534',
    fontWeight: '900',
    fontSize: 14,
  },
  tapRowStatusWrong: {
    color: '#B91C1C',
    fontWeight: '900',
    fontSize: 14,
  },
  tapRowStatusPending: {
    color: '#94A3B8',
    fontWeight: '900',
    fontSize: 14,
  },
  tapButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tapButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9DEEF',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tapButtonActive: {
    backgroundColor: '#0B5F8F',
    borderColor: '#0B5F8F',
  },
  tapButtonPressed: {
    opacity: 0.85,
  },
  tapButtonText: {
    color: '#0B5F8F',
    fontWeight: '900',
    fontSize: 12,
  },
  tapButtonTextActive: {
    color: '#FFFFFF',
  },
  finalBossSectionTitle: {
    color: '#0B5F8F',
    fontWeight: '900',
    fontSize: 12,
    marginTop: 2,
  },
  convexityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  convexityButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9DEEF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  convexityButtonSelected: {
    borderColor: '#0B5F8F',
    borderWidth: 2,
  },
  convexityButtonDisabled: {
    opacity: 0.5,
  },
  convexityButtonPressed: {
    opacity: 0.85,
  },
  convexityButtonText: {
    color: '#0D3D66',
    fontWeight: '900',
    fontSize: 12,
  },
  checkButton: {
    backgroundColor: '#0B5F8F',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 2,
  },
  checkButtonDisabled: {
    opacity: 0.5,
  },
  checkButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  nextReportButton: {
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#C9DEEF',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  nextReportButtonPressed: {
    opacity: 0.85,
  },
  nextReportButtonText: {
    color: '#0B5F8F',
    fontSize: 12,
    fontWeight: '800',
  },
  feedbackText: {
    color: '#0B5F8F',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  feedbackHint: {
    color: '#4A6078',
    fontSize: 12,
    fontWeight: '600',
  },
  nextCaseButton: {
    backgroundColor: '#0B5F8F',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  nextCaseButtonPressed: {
    opacity: 0.86,
  },
  nextCaseButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  tipText: {
    color: '#475A6F',
    fontSize: 13,
    lineHeight: 18,
  },
  successCard: {
    backgroundColor: '#EAF9EE',
    borderWidth: 1,
    borderColor: '#A8E0BA',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  successTitle: {
    color: '#166534',
    fontSize: 15,
    fontWeight: '900',
  },
  successText: {
    color: '#166534',
    fontSize: 13,
    lineHeight: 18,
  },
  completeButton: {
    backgroundColor: '#0B5F8F',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  completeButtonPressed: {
    opacity: 0.86,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  afterCompleteWrap: {
    gap: 8,
  },
  nextMissionButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  nextMissionButtonPressed: {
    opacity: 0.86,
  },
  nextMissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  alreadyDoneBadge: {
    borderRadius: 10,
    backgroundColor: '#E8F6EC',
    borderWidth: 1,
    borderColor: '#BFE7CC',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  alreadyDoneText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  completionFeedback: {
    color: '#0B5F8F',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  ahaCard: {
    backgroundColor: '#FFF4D6',
    borderWidth: 1,
    borderColor: '#F2D58A',
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  ahaTitle: {
    color: '#7A5B00',
    fontSize: 14,
    fontWeight: '900',
  },
  ahaText: {
    color: '#5D4800',
    fontSize: 13,
    lineHeight: 18,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    color: '#1F3E66',
    fontSize: 16,
    fontWeight: '800',
  },
});
