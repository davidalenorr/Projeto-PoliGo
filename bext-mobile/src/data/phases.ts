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
    title: 'Engenheiro de Medidas',
    subtitle: 'Perímetro, Área e Apótema',
    description:
      'Como um engenheiro de medidas, você vai calcular contornos e superfícies com fórmulas. Nesta fase, o foco é decidir quando usar perímetro, quando usar área e como aplicar o apótema em polígonos regulares.',
    objectives: [
      'Calcular perímetro em figuras planas',
      'Encontrar área de quadrados, retângulos e triângulos',
      'Aplicar o apótema na área de polígonos regulares',
      'Escolher a fórmula correta para cada situação',
    ],
    formulas: [
      {
        title: 'Perímetro',
        formula: 'P = soma de todos os lados',
        explanation:
          'O perímetro mede o contorno da figura. Basta somar todos os lados para descobrir quanto a forma “anda” em volta.',
        example:
          'Um retângulo com lados 8 e 5: P = 8 + 5 + 8 + 5 = 26.',
      },
      {
        title: 'Área de Quadrado, Retângulo e Triângulo',
        formula: 'A = l², A = b × h, A = (b × h) / 2',
        explanation:
          'Área mede a superfície ocupada pela figura. Cada forma tem uma fórmula própria, então é importante reconhecer o desenho antes de calcular.',
        example:
          'Um triângulo com base 10 e altura 6: A = (10 × 6) / 2 = 30.',
      },
      {
        title: 'Área de Polígono Regular',
        formula: 'A = (P × a) / 2',
        explanation:
          'Quando a figura é regular, o apótema ajuda a calcular a área com precisão usando o perímetro e a distância do centro ao meio de um lado.',
        example:
          'Se P = 24 e a = 4, então A = (24 × 4) / 2 = 48.',
      },
    ],
    concepts: [
      'Perímetro é o contorno da figura',
      'Área mede a superfície ocupada',
      'Apótema liga o centro ao meio de um lado, perpendicularmente',
    ],
    challenges: [
      'Descubra quando usar perímetro e quando usar área',
      'Calcule a superfície de figuras simples com segurança',
      'Aplique o apótema para resolver problemas de polígonos regulares',
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
    title: 'Laboratório de Equações',
    subtitle: 'Modelagem Algébrica em Geometria',
    description:
      'Nesta fase, você vai resolver desafios geométricos com equações. Em vez de apenas reconhecer formas, será necessário modelar situações, encontrar incógnitas e validar resultados em construções do jogo.',
    objectives: [
      'Modelar situações geométricas com equações',
      'Resolver equações do 1º grau e sistemas simples',
      'Aplicar Pitágoras e relações angulares para encontrar medidas',
      'Validar soluções algébricas em cenários visuais',
    ],
    formulas: [
      {
        title: 'Perímetro e Área de Retângulo',
        formula: 'P = 2x + 2y e A = x × y',
        explanation:
          'Com duas equações envolvendo os lados x e y, é possível determinar medidas exatas de um retângulo em problemas de construção.',
        example:
          'Se P = 30 e A = 56, então 2x + 2y = 30 e x × y = 56.',
      },
      {
        title: 'Teorema de Pitágoras',
        formula: 'a² + b² = c²',
        explanation:
          'Em triângulos retângulos, o quadrado da hipotenusa é a soma dos quadrados dos catetos. Isso permite encontrar medidas desconhecidas.',
        example:
          'Se c = 13 e b = 12, então a² + 12² = 13², logo a = 5.',
      },
      {
        title: 'Equação da Reta',
        formula: 'y = mx + b',
        explanation:
          'A posição de pontos no plano cartesiano pode ser prevista com uma função afim. O coeficiente angular m define inclinação e b define intercepto.',
        example:
          'Uma reta com m = 2 e b = 1 passa por (1,3), (3,7) e (5,11).',
      },
    ],
    concepts: [
      'Modelagem: transformar cenário em equação',
      'Incógnita: valor desconhecido a ser descoberto',
      'Sistema linear com duas variáveis',
      'Validação matemática no contexto geométrico',
    ],
    challenges: [
      'Abrir o cofre resolvendo perímetro e área simultaneamente',
      'Completar triângulos usando Pitágoras e soma dos ângulos',
      'Ajustar uma rota no plano cartesiano com y = mx + b',
      'Resolver sistemas em projetos geométricos com duas incógnitas',
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
  {
    id: 'fase6',
    number: 6,
    title: 'Álgebra Aplicada',
    subtitle: 'Modelagem Algébrica e Otimização',
    description:
      'Conecte geometria e álgebra para modelar situações reais, isolar incógnitas e tomar decisões ótimas sob restrições.',
    objectives: [
      'Modelar situações geométricas com equações',
      'Isolar incógnitas e resolver equações do 1º grau',
      'Resolver sistemas 2×2 e validar soluções',
      'Raciocinar sobre otimização simples (maximizar área sob restrição)',
    ],
    formulas: [
      {
        title: 'Equação Linear Simples',
        formula: 'ax + b = c',
        explanation: 'Isole x com operações inversas: x = (c - b) / a.',
        example: '2x + 3 = 11 → x = 4.',
      },
      {
        title: 'Sistema Linear 2×2 (exemplo)',
        formula: 'x + y = 10; x - y = 2',
        explanation: 'Use soma e subtração ou substituição para encontrar x e y.',
        example: 'x = 6, y = 4.',
      },
      {
        title: 'Otimização sob restrição (exemplo)',
        formula: 'Maximize A = x × y sujeito a 2x + 2y = P',
        explanation:
          'Com perímetro fixo P, escolha x e y que maximizem a área A. Para retângulos, a solução ótima é o quadrado (x = y = P/4).',
        example: 'Se P = 20, então x = y = 5 maximiza A = 25.',
      },
    ],
    concepts: [
      'Isolamento de incógnitas e verificação por substituição',
      'Métodos de resolução de sistemas: substituição e adição',
      'Modelagem de restrições e objetivos (otimização)',
      'Interpretação geométrica de soluções algébricas',
    ],
    challenges: [
      'Transforme enunciados em equações e isole incógnitas',
      'Resolva sistemas simples e valide soluções no contexto',
      'Compare configurações para escolher a que maximiza área sob uma restrição',
    ],
  },
  {
    id: 'fase7',
    number: 7,
    title: 'Oficina das Equações',
    subtitle: 'Somente Equações',
    description:
      'Nesta fase, você trabalha exclusivamente com equações. O foco é resolver expressões lineares, interpretar sistemas e reconhecer o formato correto de cada problema algébrico.',
    objectives: [
      'Resolver equações do 1º grau com rapidez',
      'Reconhecer e simplificar expressões algébricas',
      'Montar e resolver sistemas simples',
      'Conferir resultados por substituição',
    ],
    formulas: [
      {
        title: 'Equação Linear',
        formula: 'ax + b = c',
        explanation: 'Isole x aplicando operações inversas dos dois lados da igualdade.',
        example: '3x + 2 = 8 → x = 2.',
      },
      {
        title: 'Distribuição',
        formula: 'k(x + y) = kx + ky',
        explanation: 'A propriedade distributiva ajuda a expandir expressões antes de resolver a equação.',
        example: '2(x + 3) = 2x + 6.',
      },
      {
        title: 'Sistema 2x2',
        formula: 'x + y = a; x - y = b',
        explanation: 'Combine as equações por soma ou substituição para encontrar as duas incógnitas.',
        example: 'x + y = 14 e x - y = 2 → x = 8, y = 6.',
      },
    ],
    concepts: [
      'Isolamento de incógnitas',
      'Igualdade entre os dois lados da equação',
      'Distribuição e simplificação algébrica',
      'Verificação por substituição',
    ],
    challenges: [
      'Resolva sequências de equações lineares sem apoio visual',
      'Escolha a forma algébrica correta de um enunciado',
      'Compare soluções de sistemas e valide o resultado final',
    ],
  },
  {
    id: 'fase8',
    number: 8,
    title: 'Explorador Espacial',
    subtitle: 'Volume e Área de Sólidos Geométricos',
    description:
      'Nesta fase de geometria espacial, você aprenderá a calcular o espaço tridimensional ocupado por sólidos geométricos (volume) e a área de suas superfícies. Domine o cálculo em cubos, paralelepípedos e prismas simples.',
    objectives: [
      'Calcular o volume de cubos e paralelepípedos',
      'Determinar a área de superfície de sólidos geométricos',
      'Resolver problemas práticos envolvendo capacidade e embalagens',
      'Compreender a diferença entre área (2D) e volume (3D)',
    ],
    formulas: [
      {
        title: 'Volume do Cubo',
        formula: 'V = a³',
        explanation: 'O volume do cubo é a sua aresta elevada ao cubo (comprimento × largura × altura, que são todos iguais).',
        example: 'Um cubo com aresta de 3cm: V = 3³ = 27 cm³.',
      },
      {
        title: 'Volume do Paralelepípedo (Bloco Retangular)',
        formula: 'V = a × b × c',
        explanation: 'O volume é obtido multiplicando as três dimensões: comprimento (a), largura (b) e altura (c).',
        example: 'Uma caixa com dimensões 5m, 4m e 3m: V = 5 × 4 × 3 = 60 m³.',
      },
      {
        title: 'Área Total de Superfície do Paralelepípedo',
        formula: 'A_total = 2(ab + ac + bc)',
        explanation: 'Soma das áreas de todas as 6 faces retangulares do bloco.',
        example: 'Para lados 5, 4 e 3: A = 2(5×4 + 5×3 + 4×3) = 2(20 + 15 + 12) = 94 m².',
      },
    ],
    concepts: [
      'Aresta: segmento de reta comum a duas faces de um sólido',
      'Face: superfície plana que delimita o sólido',
      'Volume: quantidade de espaço tridimensional ocupado',
      'Área de Superfície: soma das áreas de todas as faces externas',
    ],
    challenges: [
      'Calcule a quantidade de água necessária para encher uma piscina retangular',
      'Determine o papel de presente necessário para cobrir uma caixa (área de superfície)',
      'Compare capacidades e otimize dimensões de caixas de armazenamento',
    ],
  },
  {
    id: 'fase9',
    number: 9,
    title: 'Trigonometria Aplicada',
    subtitle: 'Razões Trigonométricas e Semelhança',
    description: 'Aprenda a desvendar alturas e distâncias inacessíveis usando as relações métricas e trigonométricas básicas no triângulo retângulo.',
    objectives: [
      'Identificar cateto oposto, cateto adjacente e hipotenusa',
      'Calcular Seno, Cosseno e Tangente de ângulos notáveis',
      'Aplicar o Teorema de Tales em semelhança de triângulos',
    ],
    formulas: [
      {
        title: 'Seno (sen θ)',
        formula: 'sen θ = Cateto Oposto / Hipotenusa',
        explanation: 'Razão entre o cateto oposto ao ângulo e a hipotenusa.',
        example: 'sen 30° = 1/2 = 0.5.',
      },
      {
        title: 'Cosseno (cos θ)',
        formula: 'cos θ = Cateto Adjacente / Hipotenusa',
        explanation: 'Razão entre o cateto adjacente ao ângulo e a hipotenusa.',
        example: 'cos 60° = 1/2 = 0.5.',
      },
      {
        title: 'Tangente (tg θ)',
        formula: 'tg θ = Cateto Oposto / Cateto Adjacente',
        explanation: 'Razão entre o cateto oposto e o cateto adjacente.',
        example: 'tg 45° = 1.',
      },
    ],
    concepts: [
      'Hipotenusa: o maior lado do triângulo retângulo, oposto ao ângulo reto',
      'Cateto Oposto: o lado que fica em frente ao ângulo de referência',
      'Cateto Adjacente: o lado que ajuda a formar o ângulo de referência',
      'Semelhança: figuras com a mesma forma, mas tamanhos proporcionais',
    ],
    challenges: [
      'Calcule a altura de um prédio histórico baseando-se na sombra e no ângulo solar',
      'Determine o cosseno de um triângulo retângulo conhecendo seus catetos',
      'Use a relação de semelhança para encontrar a largura de um rio',
    ],
  },
  {
    id: 'fase10',
    number: 10,
    title: 'O Cartógrafo',
    subtitle: 'Escalas, Mapas e Probabilidade',
    description: 'Trabalhe com escalas cartográficas para converter medidas de mapas para o mundo real e explore a probabilidade aplicada a áreas geométricas.',
    objectives: [
      'Compreender escalas de ampliação e redução em mapas',
      'Converter medidas lineares e de área em escalas reais',
      'Calcular probabilidade baseando-se em razões de áreas geométricas',
    ],
    formulas: [
      {
        title: 'Fórmula da Escala',
        formula: 'E = d / D',
        explanation: 'A escala (E) é a razão entre a distância no mapa (d) e a distância real (D).',
        example: 'Um mapa 1:100.000 onde 1cm = 100.000cm (1km) na realidade.',
      },
      {
        title: 'Probabilidade Geométrica',
        formula: 'P = Área Favorável / Área Total',
        explanation: 'Chance de um ponto aleatório cair em uma região específica.',
        example: 'Região circular de 10m² dentro de um terreno de 100m²: P = 10/100 = 10%.',
      },
    ],
    concepts: [
      'Escala Cartográfica: proporção de redução do mundo real no mapa',
      'Distância no Mapa (d): comprimento medido diretamente com régua',
      'Distância Real (D): comprimento no mundo real',
      'Probabilidade em Áreas: razão entre a área do alvo e a área total',
    ],
    challenges: [
      'Encontre a distância real entre duas cidades em um mapa com escala de 1:200.000',
      'Calcule a probabilidade de um dardo acertar a zona central de um alvo geométrico',
      'Determine a área real de uma plantação a partir de um desenho em escala',
    ],
  },
];

export const getPhaseById = (id: string): Phase | undefined => {
  return phases.find((phase) => phase.id === id);
};

export const getPhaseByNumber = (number: number): Phase | undefined => {
  return phases.find((phase) => phase.number === number);
};
