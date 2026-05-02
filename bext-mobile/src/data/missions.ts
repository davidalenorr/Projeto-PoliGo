export interface Mission {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  points: number;
  objective: string;
  tips: string[];
}

export const missions: Mission[] = [
  // Fase 1: Detetive das Formas
  {
    id: 'fase1_m1',
    phaseId: 'fase1',
    title: 'Detetive Guiado',
    description: 'Aprenda a identificar vértices, lados e o nome da forma',
    difficulty: 'fácil',
    points: 10,
    objective:
      'Siga as etapas guiadas para reconhecer um triângulo: toque nos vértices, conte os lados e escolha o nome correto da forma.',
    tips: [
      'Comece pelos cantos da forma: eles são os vértices',
      'Todo triângulo possui 3 lados e 3 vértices',
      'Use as dicas visuais para acertar mais rápido',
    ],
  },
  {
    id: 'fase1_m2',
    phaseId: 'fase1',
    title: 'Classificação Relâmpago',
    description: 'Classifique formas convexas e não convexas em poucos movimentos',
    difficulty: 'médio',
    points: 15,
    objective:
      'Arraste cada forma para a caixa correta e valide rapidamente sua classificação geométrica.',
    tips: [
      'Convexo: todos os vértices apontam para fora',
      'Côncavo: pelo menos um recorte para dentro',
      'A técnica da banda elástica continua valendo',
    ],
  },
  {
    id: 'fase1_m3',
    phaseId: 'fase1',
    title: 'Batizando as Formas',
    description: 'Conte os lados e escolha o nome correto do polígono',
    difficulty: 'fácil',
    points: 20,
    objective:
      'Toque nos lados de contornos inspirados em praças e prédios e selecione o nome correto (Heptágono, Eneágono e outros).',
    tips: [
      'Conte os lados em sequência para evitar repetição',
      'Lados e vértices sempre possuem a mesma quantidade',
      'Associe número de lados ao nome do polígono',
    ],
  },
  {
    id: 'fase1_m4',
    phaseId: 'fase1',
    title: 'Convexo ou Não? (Toque Rápido)',
    description: 'Classifique formas convexas e não convexas sem arrastar',
    difficulty: 'médio',
    points: 20,
    objective:
      'Em uma sequência rápida de formas inspiradas na cidade, escolha se cada uma é convexa ou não convexa usando toques.',
    tips: [
      'Convexo: nenhum “recorte” para dentro',
      'Não convexo (côncavo): tem pelo menos um recorte',
      'Pense na banda elástica envolvendo a forma',
    ],
  },
  {
    id: 'fase1_m5',
    phaseId: 'fase1',
    title: 'Laudo do Detetive',
    description: 'Revise um relatório com erros e corrija classificações geométricas',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Analise cada linha de um laudo técnico, identifique o que está correto e corrija nome de polígono e convexidade quando houver erro.',
    tips: [
      'Nem toda linha está errada: valide antes de corrigir',
      'Se marcar linha incorreta, complete as duas correções',
      'Use a definição de convexidade para evitar trocas indevidas',
    ],
  },

  // Fase 2: Engenheiro de Medidas
  {
    id: 'fase2_m1',
    phaseId: 'fase2',
    title: 'Guardião do Perímetro',
    description: 'Entenda perímetro como medida do contorno',
    difficulty: 'fácil',
    points: 10,
    objective:
      'Calcule perímetros somando os lados e diferencie contorno de espaço interno em situações visuais.',
    tips: [
      'Perímetro é a soma de todos os lados',
      'Cerca e muro pedem perímetro',
      'Não confunda contorno com área',
    ],
  },
  {
    id: 'fase2_m2',
    phaseId: 'fase2',
    title: 'Mestre da Área',
    description: 'Calcule área de quadrado, retângulo e triângulo',
    difficulty: 'médio',
    points: 15,
    objective:
      'Resolva desafios de superfície com as fórmulas de área e compare área com perímetro em exemplos práticos.',
    tips: [
      'Quadrado: A = l x l',
      'Retângulo: A = b x h',
      'Triângulo: A = (b x h) / 2',
    ],
  },
  {
    id: 'fase2_m3',
    phaseId: 'fase2',
    title: 'Segredo do Apótema',
    description: 'Use apótema em polígonos regulares',
    difficulty: 'médio',
    points: 20,
    objective:
      'Identifique o apótema e aplique A = (P x a) / 2 para calcular áreas de polígonos regulares.',
    tips: [
      'Apótema vai do centro ao meio do lado',
      'Apótema é perpendicular ao lado',
      'Use perímetro e apótema na fórmula da área',
    ],
  },
  {
    id: 'fase2_m4',
    phaseId: 'fase2',
    title: 'Construtor de Espaços',
    description: 'Resolva situações reais com perímetro e área',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Interprete cenários e decida quando usar perímetro e quando usar área para resolver problemas aplicados.',
    tips: [
      'Se for cercar, pense em perímetro',
      'Se for cobrir, pense em área',
      'Leia a pergunta antes de escolher a fórmula',
    ],
  },
  {
    id: 'fase2_m5',
    phaseId: 'fase2',
    title: 'Engenheiro Supremo',
    description: 'Integre todos os conceitos da trilha',
    difficulty: 'difícil',
    points: 30,
    objective:
      'Resolva um desafio final que mistura perímetro, área, apótema e interpretação de contexto em múltiplas etapas.',
    tips: [
      'Organize os dados antes de calcular',
      'Separe o problema em partes menores',
      'Valide unidade de cada resposta',
    ],
  },

  // Fase 3: Mestre dos Ângulos
  {
    id: 'fase3_m1',
    phaseId: 'fase3',
    title: 'Ângulos em Polígonos Regulares',
    description: 'Calcule ângulos individuais em polígonos regulares',
    difficulty: 'médio',
    points: 15,
    objective:
      'Use a fórmula a_i = (n-2) × 180° / n para calcular o ângulo interno em polígonos regulares.',
    tips: [
      'Adicione a fórmula a_i = (n-2) × 180° / n',
      'Todos os ângulos são iguais em polígonos regulares',
      'Hexágono regular: (6-2)×180°/6 = 120°',
    ],
  },
  {
    id: 'fase3_m2',
    phaseId: 'fase3',
    title: 'Ângulos Externos',
    description: 'Compreenda e calcule ângulos externos',
    difficulty: 'médio',
    points: 15,
    objective:
      'Descubra que a soma dos ângulos externos é sempre 360°. Calcule ângulos externos individuais em polígonos regulares.',
    tips: [
      'Ângulo externo + Ângulo interno = 180°',
      'Soma dos ângulos externos = 360° (sempre!)',
      'Em polígono regular: a_e = 360° / n',
    ],
  },
  {
    id: 'fase3_m3',
    phaseId: 'fase3',
    title: 'Simetria em Polígonos Regulares',
    description: 'Explore as simetrias dos polígonos regulares',
    difficulty: 'difícil',
    points: 20,
    objective:
      'Desenvolva compreensão sobre simetria rotacional e axial em polígonos regulares. Identifique eixos de simetria.',
    tips: [
      'Polígonos regulares têm simetria perfeita',
      'Número de eixos de simetria = número de lados',
      'Visualize girar a figura',
    ],
  },

  // Fase 4: O Mosaico
  {
    id: 'fase4_m1',
    phaseId: 'fase4',
    title: 'Regra do Vértice',
    description: 'Aprenda quando polígonos formam mosaicos',
    difficulty: 'médio',
    points: 15,
    objective:
      'Compreenda que em um mosaico, a soma dos ângulos no vértice deve ser 360°. Teste com diferentes polígonos.',
    tips: [
      'A soma dos ângulos no vértice = 360°',
      'Hexágono regular: 3 × 120° = 360°',
      'Quadrado: 4 × 90° = 360°',
    ],
  },
  {
    id: 'fase4_m2',
    phaseId: 'fase4',
    title: 'Quais Polígonos Formam Mosaicos',
    description: 'Identifique polígonos regulares que formam mosaicos',
    difficulty: 'médio',
    points: 15,
    objective:
      'Descubra que apenas 3 polígonos regulares formam mosaicos: triângulo, quadrado e hexágono. Prove com cálculos.',
    tips: [
      'Só 3 polígonos regulares funcionam',
      'Triângulo: 6 × 60° = 360°',
      'Quadrado: 4 × 90° = 360°',
      'Hexágono: 3 × 120° = 360°',
    ],
  },
  {
    id: 'fase4_m3',
    phaseId: 'fase4',
    title: 'Criando Mosaicos',
    description: 'Design e construa seus próprios mosaicos',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Crie 2 mosaicos diferentes: um com um único polígono regular e outro combinando dois tipos diferentes.',
    tips: [
      'Use a regra do vértice para verificar',
      'Mosaicos semirregulares combinam polígonos',
      'Sketche sua ideia antes de desenhar',
    ],
  },

  // Fase 5: Triunfo Final
  {
    id: 'fase5_m1',
    phaseId: 'fase5',
    title: 'Área de Triângulos',
    description: 'Calcule a área de triângulos usando base e altura',
    difficulty: 'fácil',
    points: 10,
    objective:
      'Use A = (base × altura) / 2 para calcular a área de 5 triângulos diferentes com medidas dadas.',
    tips: [
      'A fórmula é A = (base × altura) / 2',
      'Base e altura devem ser perpendiculares',
      'A altura pode estar fora do triângulo em triângulos obtusângulos',
    ],
  },
  {
    id: 'fase5_m2',
    phaseId: 'fase5',
    title: 'Triangulação de Polígonos',
    description: 'Divida polígonos em triângulos e calcule área',
    difficulty: 'médio',
    points: 20,
    objective:
      'Divida 3 polígonos irregulares em triângulos e calcule a área total usando triangulação.',
    tips: [
      'Todos os polígonos podem ser divididos em triângulos',
      'Escolha um vértice e trace linhas para todos os outros',
      'Some as áreas dos triângulos',
    ],
  },
  {
    id: 'fase5_m3',
    phaseId: 'fase5',
    title: 'Área com Apótema',
    description: 'Calcule área de polígonos regulares usando apótema',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Use A = (Perímetro × Apótema) / 2 para calcular áreas de polígonos regulares. Resolva 4 problemas.',
    tips: [
      'A = (Perímetro × Apótema) / 2',
      'Apótema é a distância do centro ao meio de um lado',
      'Funciona para qualquer polígono regular',
    ],
  },
];

export const getMissionsByPhaseId = (phaseId: string): Mission[] => {
  return missions.filter((mission) => mission.phaseId === phaseId);
};

export const getMissionById = (id: string): Mission | undefined => {
  return missions.find((mission) => mission.id === id);
};
