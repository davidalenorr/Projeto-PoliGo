import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Mission, getMissionById } from '@/src/data/missions';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IGREJA_IMAGE = require('../assets/images/fase1/igreja_matriz_belo_jardim.png');
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

function HunterTrianglesMission() {
  const [captured, setCaptured] = useState<number[]>([]);

  const hotspots = [
    { id: 1, left: 52, top: 58 },
    { id: 2, left: 228, top: 80 },
    { id: 3, left: 140, top: 138 },
    { id: 4, left: 70, top: 186 },
    { id: 5, left: 256, top: 166 },
  ];

  const progress = Math.round((captured.length / hotspots.length) * 100);
  const completed = captured.length === hotspots.length;

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Cena 1: Igreja Matriz e Estacao Ferroviaria</Text>
      <Text style={styles.sectionSubtitle}>Toque nos pontos para capturar 5 triangulos escondidos.</Text>

      <View style={styles.sceneMock}>
        <Text style={styles.sceneLabel}>Igreja Matriz e Estacao Ferroviaria - Belo Jardim</Text>

        <View style={styles.photoRow}>
          <ImageBackground source={IGREJA_IMAGE} style={styles.photoCard} imageStyle={styles.photoCardImage}>
            <View style={styles.photoOverlay}>
              <Text style={styles.photoTitle}>Igreja Matriz</Text>
            </View>
          </ImageBackground>

          {/* <ImageBackground source={ESTACAO_IMAGE} style={styles.photoCard} imageStyle={styles.photoCardImage}>
            <View style={styles.photoOverlay}>
              <Text style={styles.photoTitle}>Estacao Ferroviaria</Text>
            </View>
          </ImageBackground> */}
        </View>

        {hotspots.map((spot) => {
          const isCaptured = captured.includes(spot.id);

          return (
            <Pressable
              key={spot.id}
              onPress={() => {
                if (isCaptured) {
                  return;
                }
                setCaptured((prev) => [...prev, spot.id]);
              }}
              style={[
                styles.hotspot,
                { left: spot.left, top: spot.top },
                isCaptured && styles.hotspotCaptured,
              ]}
            >
              <Text style={styles.hotspotText}>{isCaptured ? '✓' : '△'}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.progressPanel}>
        <Text style={styles.progressText}>Capturados: {captured.length}/5</Text>
        <View style={styles.progressBarBase}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {completed && (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Missao concluida!</Text>
          <Text style={styles.successText}>
            Voce treinou seu olhar arquitetonico e encontrou triangulos no ambiente real.
          </Text>
        </View>
      )}
    </View>
  );
}

type DraggableShape = {
  id: string;
  label: string;
  type: 'convexo' | 'concavo';
};

function ConvexityTrapMission() {
  const [resultMap, setResultMap] = useState<Record<string, 'convexo' | 'concavo'>>({});

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

  const completed = shapes.every((shape) => resultMap[shape.id] === shape.type);

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Arraste para classificar</Text>
      <Text style={styles.sectionSubtitle}>Caixa verde = Convexos | Caixa vermelha = Nao-convexos</Text>

      <View style={styles.dragArea}>
        <View style={[styles.dropZone, styles.dropZoneGreen, { top: zoneTop, left: 0, width: zoneWidth, height: zoneHeight }]}>
          <Text style={styles.dropZoneTitle}>Convexos</Text>
        </View>
        <View style={[styles.dropZone, styles.dropZoneRed, { top: zoneTop, left: zoneWidth + gap, width: zoneWidth, height: zoneHeight }]}>
          <Text style={styles.dropZoneTitle}>Nao-convexos</Text>
        </View>

        {shapes.map((shape, index) => (
          <DraggableChip
            key={shape.id}
            label={shape.label}
            startX={12 + (index % 2) * ((SCREEN_WIDTH - 32) / 2)}
            startY={24 + Math.floor(index / 2) * 64}
            onDrop={(x, y) => {
              const inVerticalRange = y >= zoneTop && y <= zoneTop + zoneHeight;
              if (!inVerticalRange) {
                return;
              }

              if (x <= zoneWidth) {
                setResultMap((prev) => ({ ...prev, [shape.id]: 'convexo' }));
                return;
              }

              if (x > zoneWidth + gap) {
                setResultMap((prev) => ({ ...prev, [shape.id]: 'concavo' }));
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
              {shape.label}: {answer ? answer.toUpperCase() : 'SEM CLASSIFICACAO'}
            </Text>
          );
        })}
      </View>

      {completed && (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Classificacao perfeita!</Text>
          <Text style={styles.successText}>Voce dominou a diferenca entre convexidade e concavidade.</Text>
        </View>
      )}
    </View>
  );
}

function DraggableChip({
  label,
  startX,
  startY,
  onDrop,
}: {
  label: string;
  startX: number;
  startY: number;
  onDrop: (x: number, y: number) => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({
          x: startX + gestureState.dx,
          y: startY + gestureState.dy,
        });
      },
      onPanResponderRelease: (_, gestureState) => {
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
    <Animated.View {...panResponder.panHandlers} style={[styles.dragChip, { transform: pan.getTranslateTransform() }]}>
      <Text style={styles.dragChipText}>{label}</Text>
    </Animated.View>
  );
}

function NamingShapesMission() {
  const [stepIndex, setStepIndex] = useState(0);
  const [touchedSides, setTouchedSides] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');

  const tasks = [
    { id: 'p1', place: 'Contorno da Praca Central', sides: 7, answer: 'Heptagono' },
    { id: 'p2', place: 'Fachada do Predio Antigo', sides: 9, answer: 'Eneagono' },
    { id: 'p3', place: 'Cantero da Avenida', sides: 8, answer: 'Octogono' },
  ];

  const current = tasks[stepIndex];
  const options = ['Pentagono', 'Hexagono', 'Heptagono', 'Octogono', 'Eneagono', 'Decagono'];

  const completed = stepIndex >= tasks.length;

  if (completed) {
    return (
      <View style={styles.missionCard}>
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Missao concluida!</Text>
          <Text style={styles.successText}>
            Voce contou e batizou as formas corretamente. Excelente leitura geometrica!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Caso {stepIndex + 1}: {current.place}</Text>
      <Text style={styles.sectionSubtitle}>Toque em cada lado para contar e selecione o nome correto.</Text>

      <View style={styles.sidesGrid}>
        {Array.from({ length: current.sides }).map((_, idx) => {
          const sideNumber = idx + 1;
          const touched = touchedSides.includes(sideNumber);

          return (
            <Pressable
              key={`${current.id}-${sideNumber}`}
              style={[styles.sideChip, touched && styles.sideChipTouched]}
              onPress={() => {
                if (!touched) {
                  setTouchedSides((prev) => [...prev, sideNumber]);
                }
              }}
            >
              <Text style={[styles.sideChipText, touched && styles.sideChipTextTouched]}>Lado {sideNumber}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.counterText}>Lados tocados: {touchedSides.length}/{current.sides}</Text>

      <View style={styles.optionsWrap}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={styles.optionButton}
            onPress={() => {
              if (option !== current.answer) {
                setFeedback('Resposta incorreta. Revise a contagem dos lados e tente novamente.');
                return;
              }

              if (touchedSides.length < current.sides) {
                setFeedback('Antes de responder, toque em todos os lados do contorno.');
                return;
              }

              setFeedback('Correto! Avancando para o proximo contorno.');
              setTimeout(() => {
                setStepIndex((prev) => prev + 1);
                setTouchedSides([]);
                setFeedback('');
              }, 500);
            }}
          >
            <Text style={styles.optionButtonText}>{option}</Text>
          </Pressable>
        ))}
      </View>

      {!!feedback && <Text style={styles.feedbackText}>{feedback}</Text>}
    </View>
  );
}

function GenericMission({ mission }: { mission: Mission }) {
  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Conteudo em desenvolvimento para esta fase</Text>
      <Text style={styles.sectionSubtitle}>{mission.objective}</Text>
      {mission.tips.map((tip) => (
        <Text key={tip} style={styles.tipText}>• {tip}</Text>
      ))}
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
          <Text style={styles.notFoundText}>Missao nao encontrada.</Text>
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
          <Text style={styles.backButtonText}>← Voltar para Missoes</Text>
        </Pressable>

        <MissionHeader mission={mission} />

        {mission.id === 'fase1_m1' && <HunterTrianglesMission />}
        {mission.id === 'fase1_m2' && <ConvexityTrapMission />}
        {mission.id === 'fase1_m3' && <NamingShapesMission />}
        {!['fase1_m1', 'fase1_m2', 'fase1_m3'].includes(mission.id) && <GenericMission mission={mission} />}

        <View style={styles.ahaCard}>
          <Text style={styles.ahaTitle}>Aha! Moment</Text>
          <Text style={styles.ahaText}>
            A geometria nao vive so no quadro-negro. Ela aparece nas ruas, nas fachadas e nas formas que voce observa todos os dias.
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
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    color: '#0B5F8F',
    fontWeight: '700',
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
  sceneMock: {
    height: 260,
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
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 8,
  },
  photoCard: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CAD9E8',
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0B5F8F',
    alignItems: 'center',
    justifyContent: 'center',
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
  dragChipText: {
    color: '#0D3D66',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
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
  optionButtonText: {
    color: '#1F3E66',
    fontSize: 12,
    fontWeight: '700',
  },
  feedbackText: {
    color: '#0B5F8F',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
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
