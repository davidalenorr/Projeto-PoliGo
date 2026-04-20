export interface Phase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  objectives: string[];
  formulas: {
    title: string;
    formula: string;
    explanation: string;
    example: string;
  }[];
  concepts: string[];
  challenges: string[];
}

export const phases: Phase[] = [
  {
    id: 'fase1',
    number: 1,
    title: 'Detetive das Formas',
    subtitle: 'Classificação e Convexidade',
    description:
      'Nesta primeira fase, você aprenderá a identificar e classificar diferentes tipos de polígonos. Você descobrirá como reconhecer polígonos convexos e côncavos, competências fundamentais para um verdadeiro detetive da geometria.',
    objectives: [
      'Identificar e nomear polígonos',
      'Diferenciar polígonos convexos de côncavos',
      'Contar vértices, lados e ângulos',
      'Reconhecer padrões geométricos em cenas reais',
      'Aplicar os conceitos em desafios curtos e progressivos',
    ],
    formulas: [
      {
        title: 'Polígono Convexo',
        formula: 'Todos os ângulos internos < 180°',
        explanation:
          'Um polígono é convexo quando todos os seus ângulos internos são menores que 180 graus. Geometricamente, nenhum vértice "aponta para dentro".',
        example:
          'Um quadrado, triângulo ou pentágono regular são exemplos de polígonos convexos.',
      },
      {
        title: 'Polígono Côncavo',
        formula: 'Pelo menos um ângulo interno > 180°',
        explanation:
          'Um polígono é côncavo (ou não-convexo) quando possui pelo menos um ângulo interno maior que 180 graus. Possui um ou mais vértices que "apontam para dentro".',
        example:
          'Uma estrela ou um polígono em forma de "L" são exemplos de polígonos côncavos.',
      },
    ],
    concepts: [
      'Vértice: ponto onde dois lados se encontram',
      'Lado: segmento de reta que forma o polígono',
      'Ângulo interno: ângulo formado dentro do polígono',
      'Diagonal: segmento que liga dois vértices não consecutivos',
    ],
    challenges: [
      'Siga uma missão guiada para dominar vértices, lados e nomenclatura',
      'Identifique se um polígono é convexo ou côncavo olhando para sua forma',
      'Conte corretamente os vértices e lados de diferentes figuras',
      'Distinga entre polígonos regulares e irregulares',
      'Detecte triângulos ocultos em fotografia arquitetônica',
    ],
  },
  {
    id: 'fase2',
    number: 2,
    title: 'Arquiteto',
    subtitle: 'Diagonais e Soma dos Ângulos Internos',
    description:
      'Como um arquiteto, você agora utilizará fórmulas para calcular propriedades cruciais dos polígonos. Aprenderá a encontrar o número de diagonais e a soma dos ângulos internos, ferramentas essenciais para projetar estruturas geométricas.',
    objectives: [
      'Calcular o número de diagonais de um polígono',
      'Encontrar a soma dos ângulos internos',
      'Aplicar fórmulas a diferentes polígonos',
      'Resolver problemas com polígonos regulares',
    ],
    formulas: [
      {
        title: 'Soma dos Ângulos Internos',
        formula: 'S = (n - 2) × 180°',
        explanation:
          'A soma de todos os ângulos internos de um polígono com n lados é calculada subtraindo 2 do número de lados, multiplicando por 180 graus.',
        example:
          'Um pentágono (5 lados): S = (5 - 2) × 180° = 3 × 180° = 540°',
      },
      {
        title: 'Número de Diagonais',
        formula: 'd = n(n-3)/2',
        explanation:
          'O número de diagonais de um polígono com n lados é calculado usando esta fórmula. Cada vértice conecta-se a (n-3) outros vértices através de diagonais.',
        example:
          'Um hexágono (6 lados): d = 6(6-3)/2 = 6×3/2 = 9 diagonais',
      },
    ],
    concepts: [
      'Triângulo como unidade: todo polígono pode ser dividido em triângulos',
      'Relação entre número de lados e propriedades do polígono',
      'Aplicação de fórmulas algébricas na geometria',
    ],
    challenges: [
      'Calcule a soma dos ângulos para polígonos com diferentes números de lados',
      'Determine o número de diagonais de um heptágono',
      'Resolva problemas inversos: encontre o número de lados a partir da soma dos ângulos',
    ],
  },
  {
    id: 'fase3',
    number: 3,
    title: 'Mestre dos Ângulos',
    subtitle: 'Polígonos Regulares e Ângulos Externos',
    description:
      'Especialize-se nos polígonos regulares onde todos os lados e ângulos são iguais. Você aprenderá a calcular ângulos individuais e explorar a simetria perfeita dessas formas especiais.',
    objectives: [
      'Calcular ângulos internos de polígonos regulares',
      'Encontrar ângulos externos de qualquer polígono',
      'Entender simetria em polígonos regulares',
      'Aplicar propriedades de polígonos regulares',
    ],
    formulas: [
      {
        title: 'Ângulo Interno em Polígono Regular',
        formula: 'a_i = (n-2) × 180° / n',
        explanation:
          'Para um polígono regular (todos os lados e ângulos iguais), divide-se a soma dos ângulos internos pelo número de lados.',
        example:
          'Um octógono regular: a_i = (8-2) × 180° / 8 = 6 × 180° / 8 = 135°',
      },
      {
        title: 'Soma dos Ângulos Externos',
        formula: 'S_e = 360°',
        explanation:
          'A soma de todos os ângulos externos de qualquer polígono (convexo ou côncavo) é sempre 360 graus, independente do número de lados.',
        example:
          'Em um triângulo: cada ângulo externo tem média de 360°/3 = 120°',
      },
      {
        title: 'Ângulo Externo em Polígono Regular',
        formula: 'a_e = 360° / n',
        explanation:
          'Para um polígono regular, cada ângulo externo é calculado dividindo 360 graus pelo número de lados.',
        example:
          'Um hexágono regular: a_e = 360° / 6 = 60°',
      },
    ],
    concepts: [
      'Ângulo externo: suplementar do ângulo interno',
      'Simetria rotacional em polígonos regulares',
      'Relação entre número de lados e medidas dos ângulos',
    ],
    challenges: [
      'Calcule todos os ângulos de um polígono regular com 12 lados',
      'Encontre a diferença entre ângulos internos de dois polígonos regulares',
      'Resolva problemas envolvendo ângulos externos em contextos práticos',
    ],
  },
  {
    id: 'fase4',
    number: 4,
    title: 'O Mosaico',
    subtitle: 'Deducción Lógica de Ladrilhamentos',
    description:
      'Nesta fase, você descobrirá como polígonos regulares se encaixam perfeitamente para formar mosaicos. Aprenderá a lógica por trás dos padrões que enfeitam pisos, paredes e obras de arte ao redor do mundo.',
    objectives: [
      'Entender condições para formação de mosaicos',
      'Identificar quais polígonos regulares formam mosaicos regulares',
      'Aplicar a regra de vértice para mosaicos',
      'Reconhecer mosaicos no mundo real',
    ],
    formulas: [
      {
        title: 'Regra Lógica do Vértice',
        formula: 'Σ a_i = 360° (no vértice de junção)',
        explanation:
          'Em um mosaico, a soma dos ângulos internos dos polígonos que se encontram em cada vértice deve ser exatamente 360 graus.',
        example:
          'Um hexágono regular (120°) pode ter exatamente 3 hexágonos em cada vértice: 3 × 120° = 360°',
      },
    ],
    concepts: [
      'Apenas 3 polígonos regulares formam mosaicos: triângulo, quadrado, hexágono',
      'Mosaicos semirregulares combinam mais de um tipo de polígono',
      'Padrões simétricos em natureza e arte',
      'Aplicações práticas em design e construção',
    ],
    challenges: [
      'Determine quais polígonos regulares podem formar mosaicos',
      'Calcule quantos polígonos de cada tipo se encontram em cada vértice',
      'Design seu próprio mosaico usando polígonos regulares',
    ],
  },
  {
    id: 'fase5',
    number: 5,
    title: 'Triunfo Final',
    subtitle: 'Cálculo de Áreas por Triangulação',
    description:
      'Na fase final, você dominará o cálculo de áreas de qualquer polígono usando triangulação. Esta é a habilidade suprema, permitindo medir o espaço de qualquer forma geométrica.',
    objectives: [
      'Calcular área de triângulos',
      'Usar triangulação para encontrar áreas de polígonos',
      'Calcular área de polígonos irregulares',
      'Aplicar conceitos de apótema e perímetro',
    ],
    formulas: [
      {
        title: 'Área por Triangulação',
        formula: 'A_total = Σ A_triângulo',
        explanation:
          'Qualquer polígono pode ser dividido em triângulos. A área total é a soma das áreas de todos os triângulos.',
        example:
          'Um pentágono dividido em 3 triângulos: A_total = A1 + A2 + A3',
      },
      {
        title: 'Área de Triângulo',
        formula: 'A = (base × altura) / 2',
        explanation:
          'A área de um triângulo é calculada multiplicando a base pela altura e dividindo por 2.',
        example:
          'Triângulo com base 8cm e altura 5cm: A = (8 × 5) / 2 = 20 cm²',
      },
      {
        title: 'Área de Polígono Regular com Apótema',
        formula: 'A = (Perímetro × Apótema) / 2',
        explanation:
          'Para um polígono regular, multiplica-se o perímetro pela apótema (distância do centro ao meio de um lado) e divide por 2.',
        example:
          'Hexágono regular com perímetro 24cm e apótema 4cm: A = (24 × 4) / 2 = 48 cm²',
      },
    ],
    concepts: [
      'Apótema: distância perpendicular do centro ao meio de um lado',
      'Triangulação sistemática para qualquer polígono',
      'Relação entre perímetro, apótema e área',
      'Aplicações em engenharia, arquitetura e agrimensura',
    ],
    challenges: [
      'Calcule a área de um polígono irregular usando triangulação',
      'Encontre a apótema de um polígono regular conhecendo sua área',
      'Resolva problemas práticos de medição de terrenos e superfícies',
    ],
  },
];

export const getPhaseById = (id: string): Phase | undefined => {
  return phases.find((phase) => phase.id === id);
};

export const getPhaseByNumber = (number: number): Phase | undefined => {
  return phases.find((phase) => phase.number === number);
};
