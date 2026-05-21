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
    description: 'Aprenda a identificar vértices, lados e o nome de uma forma',
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
    title: 'Convexo ou Côncavo?',
    description: 'Classifique formas convexas e côncavas em poucos movimentos',
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
    difficulty: 'médio',
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
    description: 'Reforce a classificação de formas convexas e côncavas apenas com toques',
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
    description: 'Calcule áreas de quadrado, retângulo e triângulo',
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
    description: 'Use o apótema para encontrar áreas de polígonos regulares',
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
    description: 'Integre perímetro, área e apótema em um desafio final',
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
    title: 'Ângulo Interno Regular',
    description: 'Calcule ângulos internos em polígonos regulares',
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
    title: 'Mapa da Simetria',
    description: 'Explore a simetria dos polígonos regulares',
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
    title: 'Cofre Geométrico',
    description: 'Resolva duas equações ao mesmo tempo para abrir o cofre',
    difficulty: 'médio',
    points: 20,
    objective:
      'Ajuste as medidas de dois lados para satisfazer simultaneamente as equações de perímetro e área de um retângulo.',
    tips: [
      'As duas condições precisam ser verdadeiras ao mesmo tempo',
      'Perímetro do retângulo: 2x + 2y',
      'Área do retângulo: x × y',
    ],
  },
  {
    id: 'fase4_m2',
    phaseId: 'fase4',
    title: 'Triângulo em Equilíbrio',
    description: 'Use equações para descobrir medidas faltantes em triângulos',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Resolva equações envolvendo Pitágoras e soma dos ângulos internos para completar estruturas triangulares.',
    tips: [
      'Em triângulo retângulo: a² + b² = c²',
      'Todo triângulo soma 180°',
      'Isole a incógnita com cuidado antes de substituir valores',
    ],
  },
  {
    id: 'fase4_m3',
    phaseId: 'fase4',
    title: 'Rota no Plano Cartesiano',
    description: 'Encontre a função da rota usando dois pontos',
    difficulty: 'difícil',
    points: 30,
    objective:
      'Ajuste coeficientes da equação da reta para que ela passe pelos pontos dados e permita prever novas posições.',
    tips: [
      'Equação da reta: y = mx + b',
      'Teste a reta em cada ponto conhecido',
      'Após encontrar m e b, preveja novos pontos da rota',
    ],
  },
  {
    id: 'fase4_m4',
    phaseId: 'fase4',
    title: 'Projeto por Sistema',
    description: 'Modele e resolva sistemas com duas incógnitas',
    difficulty: 'difícil',
    points: 35,
    objective:
      'Monte e resolva sistemas de equações a partir de situações geométricas para validar medidas de construção.',
    tips: [
      'Duas incógnitas pedem duas equações independentes',
      'Substituição e adição são estratégias válidas',
      'Sempre valide o resultado no contexto geométrico',
    ],
  },

  // Fase 5: Triunfo Final
  {
    id: 'fase5_m1',
    phaseId: 'fase5',
    title: 'Área de Triângulos',
    description: 'Pratique preenchendo áreas a partir de base e altura (entrada numérica).',
    difficulty: 'fácil',
    points: 15,
    objective:
      'Calcule áreas em 5 problemas onde você fornece a resposta numérica para cada triângulo (A = (base × altura) / 2).',
    tips: [
      'A fórmula é A = (base × altura) / 2',
      'Digite apenas o valor numérico (sem unidade)',
      'Use arredondamento quando indicado',
    ],
  },
  {
    id: 'fase5_m2',
    phaseId: 'fase5',
    title: 'Triangulação Interativa',
    description: 'Resolva polígonos dividindo em triângulos e somando áreas (entrada numérica).',
    difficulty: 'médio',
    points: 25,
    objective:
      'Calcule a área total a partir de 3 polígonos apresentados como conjuntos de triângulos (forneça as somas corretas).',
    tips: [
      'Separe em triângulos cujas áreas você consegue calcular',
      'Some os resultados com atenção às unidades',
      'Verifique os passos antes de submeter',
    ],
  },
  {
    id: 'fase5_m3',
    phaseId: 'fase5',
    title: 'Apótema na Prática',
    description: 'Calcule áreas de polígonos regulares a partir de perímetro e apótema (entrada numérica).',
    difficulty: 'difícil',
    points: 30,
    objective:
      'Resolva 4 problemas de polígonos regulares usando A = (P × a) / 2, digitando o resultado correto.',
    tips: [
      'Confira se P e a estão nas mesmas unidades',
      'Multiplique antes de dividir por 2',
      'Arredonde quando solicitado',
    ],
  },

  // Fase 6: Álgebra Aplicada
  {
    id: 'fase6_m1',
    phaseId: 'fase6',
    title: 'Oficina Linear',
    description: 'Modele e resolva equações do 1º grau a partir de cenários geométricos',
    difficulty: 'médio',
    points: 20,
    objective:
      'Resolva 5 equações do 1º grau geradas por situações geométricas (entrada numérica para x).',
    tips: ['Isole x, faça operações inversas e valide substituindo'],
  },
  {
    id: 'fase6_m2',
    phaseId: 'fase6',
    title: 'Sistema 2×2',
    description: 'Monte e resolva sistemas lineares simples a partir de pistas',
    difficulty: 'difícil',
    points: 30,
    objective:
      'Resolva 3 sistemas com duas incógnitas usando substituição ou adição (forneça as duas respostas).',
    tips: ['Procure por equações independentes e valide no contexto'],
  },
  {
    id: 'fase6_m3',
    phaseId: 'fase6',
    title: 'Pitágoras em Escala',
    description: 'Use o Teorema de Pitágoras com medidas em escala',
    difficulty: 'médio',
    points: 20,
    objective:
      'Resolva 4 problemas com triângulos em escalas e calcule a hipotenusa ou catetos ausentes.',
    tips: ['Lembre-se de ajustar pela razão de escala quando necessário'],
  },
  {
    id: 'fase6_m4',
    phaseId: 'fase6',
    title: 'Desafio de Otimização',
    description: 'Escolha dimensões que maximizem área sob restrição de perímetro',
    difficulty: 'difícil',
    points: 40,
    objective:
      'Dada uma restrição de perímetro, escolha entre opções qual configuração fornece maior área (quizzes e explicação).',
    tips: ['Para retângulos com perímetro fixo, o quadrado maximiza a área'],
  },
];

export const getMissionsByPhaseId = (phaseId: string): Mission[] => {
  return missions.filter((mission) => mission.phaseId === phaseId);
};

export const getMissionById = (id: string): Mission | undefined => {
  return missions.find((mission) => mission.id === id);
};
