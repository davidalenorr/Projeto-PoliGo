import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from './styles';
import { MissionCompletionAction, MissionQuizFlow, MissionRenderProps, QuizQuestion } from './shared';

export function OptimizationChallenge({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
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

export function PackagingOptimizationChallenge({ onComplete, alreadyCompleted, nextMissionId, onNext }: {
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

export function PerimeterGuardianMission(props: {
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

export function AreaMasterMission(props: {
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

export function AreaShapePreview({ shape }: { shape: 'quadrado' | 'retangulo' | 'triangulo' }) {
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

export function TriangleBalanceMission(props: {
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

export function SystemBlueprintMission(props: {
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

export function ApothemaSecretMission(props: {
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

export function SpaceBuilderMission(props: {
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

export function SupremeEngineerMission(props: {
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

