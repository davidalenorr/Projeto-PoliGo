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
    title: 'Identificar Polígonos',
    description: 'Aprenda a reconhecer diferentes tipos de polígonos',
    difficulty: 'fácil',
    points: 10,
    objective:
      'Classifique 5 figuras como polígonos ou não polígonos. Um polígono é uma figura fechada formada por segmentos de reta.',
    tips: [
      'Procure pela figura estar fechada',
      'Verifique se é formada apenas por linhas retas',
      'Contar os lados pode ajudar',
    ],
  },
  {
    id: 'fase1_m2',
    phaseId: 'fase1',
    title: 'Convexos vs Côncavos',
    description: 'Diferencie polígonos convexos de côncavos',
    difficulty: 'médio',
    points: 15,
    objective:
      'Classifique 4 polígonos como convexos (todos ângulos < 180°) ou côncavos (pelo menos um ângulo > 180°).',
    tips: [
      'Polígono convexo: nenhum vértice aponta para dentro',
      'Polígono côncavo: pelo menos um vértice aponta para dentro',
      'Imagine uma banda elástica ao redor da figura',
    ],
  },
  {
    id: 'fase1_m3',
    phaseId: 'fase1',
    title: 'Contagem de Elementos',
    description: 'Digite o número correto de vértices, lados e ângulos',
    difficulty: 'fácil',
    points: 10,
    objective:
      'Para 3 polígonos diferentes, conte corretamente o número de vértices, lados e ângulos internos.',
    tips: [
      'Vértice: onde dois lados se encontram',
      'Cada vértice tem um ângulo interno',
      'Em qualquer polígono, número de vértices = número de lados',
    ],
  },

  // Fase 2: Arquiteto
  {
    id: 'fase2_m1',
    phaseId: 'fase2',
    title: 'Soma dos Ângulos Internos',
    description: 'Calcule a soma dos ângulos de qualquer polígono',
    difficulty: 'médio',
    points: 15,
    objective:
      'Use a fórmula S = (n - 2) × 180° para calcular a soma dos ângulos internos de polígonos com 3 a 8 lados.',
    tips: [
      'A fórmula é S = (n - 2) × 180°',
      'n = número de lados',
      'Teste com um triângulo (n=3): (3-2)×180° = 180°',
    ],
  },
  {
    id: 'fase2_m2',
    phaseId: 'fase2',
    title: 'Cálculo de Diagonais',
    description: 'Encontre o número de diagonais usando a fórmula',
    difficulty: 'médio',
    points: 15,
    objective:
      'Calcule o número de diagonais de polígonos usando d = n(n-3)/2. Complete 5 cálculos diferentes.',
    tips: [
      'A fórmula é d = n(n-3)/2',
      'Diagonal liga dois vértices não consecutivos',
      'Um triângulo tem 0 diagonais',
    ],
  },
  {
    id: 'fase2_m3',
    phaseId: 'fase2',
    title: 'Problemas Combinados',
    description: 'Resolva problemas usando ambas as fórmulas',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Complete 3 problemas que exigem uso de ambas as fórmulas de ângulos e diagonais.',
    tips: [
      'Leia o problema com atenção',
      'Identifique o que é pedido',
      'Use o número de lados para aplicar as fórmulas',
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
