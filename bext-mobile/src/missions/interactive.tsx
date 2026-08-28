import React, { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, Text, View } from 'react-native';
import { SCREEN_WIDTH, styles } from './styles';
import { MissionCompletionAction, MissionQuizFlow, MissionRenderProps, QuizQuestion } from './shared';

export function GuidedFirstMission({
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

export type DraggableShape = {
  id: string;
  label: string;
  type: 'convexo' | 'concavo';
};

export function ConvexityTrapMission({
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

export function DraggableChip({
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

export function NamingShapesMission({
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

export type TapClassifyShape = {
  id: string;
  label: string;
  type: 'convexo' | 'concavo';
};

export function ConvexityTapMission({
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

export type DetectiveReportEntry = {
  id: string;
  place: string;
  sides: number;
  submittedName: string;
  submittedConvexity: 'convexo' | 'concavo';
  correctName: string;
  correctConvexity: 'convexo' | 'concavo';
};

export function ReportShapePreview({ sides, concave }: { sides: number; concave: boolean }) {
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

export function DetectiveReportMission({
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

export function PolygonAngleCalculator({
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

export function ExternalAngleVisualizer({
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

export function SymmetryExplorer({
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

export function EquationVaultMission({
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

export function CartesianRouteMission({
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

