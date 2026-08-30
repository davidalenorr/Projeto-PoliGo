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
  {
    id: 'fase3_m4',
    phaseId: 'fase3',
    title: 'Revisão dos Ângulos',
    description: 'Combine ângulo interno, externo e eixos de simetria de polígonos regulares.',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Responda a um quiz que sorteia polígonos regulares e cobra ângulo interno, ângulo externo e número de eixos de simetria.',
    tips: [
      'Ângulo externo: a_e = 360° / n',
      'Ângulo interno: a_i = (n − 2) × 180° / n',
      'Eixos de simetria de um polígono regular = n',
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
  {
    id: 'fase5_m4',
    phaseId: 'fase5',
    title: 'Revisão de Áreas',
    description: 'Área de triângulo, de retângulo e por triangulação, com valores sorteados.',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Resolva 3 problemas: área de um triângulo, área de um retângulo e área total de um polígono dividido em triângulos.',
    tips: [
      'Triângulo: A = (b × h) / 2',
      'Retângulo: A = b × h',
      'Triangulação: some as áreas dos triângulos',
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

  // Fase 7: Oficina das Equações
  {
    id: 'fase7_m1',
    phaseId: 'fase7',
    title: 'Sprint Algébrico',
    description: 'Resolva equações lineares diretas em sequência',
    difficulty: 'fácil',
    points: 15,
    objective:
      'Resolva 3 equações do 1º grau em ordem, digitando apenas o valor de x em cada etapa.',
    tips: [
      'Isole x passo a passo',
      'Verifique cada resposta antes de avançar',
      'As três equações são independentes',
    ],
  },
  {
    id: 'fase7_m2',
    phaseId: 'fase7',
    title: 'Balanceando Expressões',
    description: 'Aplique distributiva e simplifique expressões algébricas',
    difficulty: 'médio',
    points: 25,
    objective:
      'Resolva 3 desafios que misturam distribuição, simplificação e isolamento de incógnitas.',
    tips: [
      'Distribua antes de somar ou subtrair',
      'Observe sinais negativos com atenção',
      'Teste o resultado substituindo na expressão original',
    ],
  },
  {
    id: 'fase7_m3',
    phaseId: 'fase7',
    title: 'Sistemas em Dupla',
    description: 'Reconheça e resolva sistemas de equações simples',
    difficulty: 'difícil',
    points: 30,
    objective:
      'Analise 3 sistemas e identifique o par de valores correto em cada caso.',
    tips: [
      'Some as equações quando os sinais forem opostos',
      'Substituição também é uma boa estratégia',
      'Confira o par final em ambas as equações',
    ],
  },
  {
    id: 'fase7_m4',
    phaseId: 'fase7',
    title: 'Desafio Final das Equações',
    description: 'Feche a fase resolvendo equações e validando respostas',
    difficulty: 'difícil',
    points: 35,
    objective:
      'Resolva 3 equações finais e confirme que domina a leitura algébrica sem apoio visual.',
    tips: [
      'Cada equação pode ser resolvida isolando o termo desconhecido',
      'Não avance sem entender o passo atual',
      'Relembre as regras de equivalência entre os lados',
    ],
  },
  // Fase 8: Explorador Espacial
  {
    id: 'fase8_m1',
    phaseId: 'fase8',
    title: 'O Espaço do Cubo',
    description: 'Calcule volumes de cubos a partir de suas arestas',
    difficulty: 'fácil',
    points: 15,
    objective:
      'Calcule o volume tridimensional de cubos de diferentes tamanhos a partir da medida de suas arestas (V = a³).',
    tips: [
      'Todas as arestas do cubo têm a mesma medida',
      'Eleve a aresta ao cubo: multiplique ela por ela mesma três vezes',
      'Volume é dado em unidades cúbicas (ex: cm³)',
    ],
  },
  {
    id: 'fase8_m2',
    phaseId: 'fase8',
    title: 'Carregando o Bloco',
    description: 'Calcule o volume de blocos retangulares',
    difficulty: 'médio',
    points: 20,
    objective:
      'Determine o volume (capacidade) de caixas e reservatórios retangulares multiplicando comprimento, largura e altura.',
    tips: [
      'A fórmula é V = comprimento × largura × altura',
      'Certifique-se de que todas as medidas estão na mesma unidade',
      'Problemas práticos de piscina e caixas de papelão usam essa fórmula',
    ],
  },
  {
    id: 'fase8_m3',
    phaseId: 'fase8',
    title: 'Superfície de Embrulho',
    description: 'Calcule a área de superfície total de blocos retangulares',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Calcule a área total do revestimento de caixas somando a área de suas 6 faces retangulares.',
    tips: [
      'A fórmula é A = 2 × (ab + ac + bc)',
      'Representa a quantidade de papel de presente ou tinta necessária para cobrir o sólido',
      'Não confunda área de superfície (2D) com volume (3D)',
    ],
  },
  {
    id: 'fase8_m4',
    phaseId: 'fase8',
    title: 'Desafio das Embalagens',
    description: 'Resolva problemas aplicados de Geometria Espacial',
    difficulty: 'difícil',
    points: 30,
    objective:
      'Analise cenários práticos envolvendo armazenamento e determine a melhor embalagem com base em volume e área.',
    tips: [
      'Caixas diferentes podem ter o mesmo volume mas áreas de superfície diferentes',
      'Otimizar a embalagem significa reduzir a área de superfície mantendo o volume',
      'Pense no custo do material de fabricação',
    ],
  },
  {
    id: 'fase8_m5',
    phaseId: 'fase8',
    title: 'Volume do Cilindro',
    description: 'Determine a capacidade de latas e silos redondos',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Calcule o volume de cilindros multiplicando a área da base circular pela altura (V = π × r² × h).',
    tips: [
      'A área da base é circular: A_base = π × r²',
      'Multiplique a área da base pela altura do cilindro',
      'Considere π ≈ 3.14 para os cálculos',
    ],
  },
  // Fase 9: Trigonometria Aplicada
  {
    id: 'fase9_m1',
    phaseId: 'fase9',
    title: 'Teorema de Tales',
    description: 'Use semelhança de triângulos para resolver proporções',
    difficulty: 'fácil',
    points: 15,
    objective:
      'Determine valores desconhecidos usando a proporcionalidade entre segmentos paralelos cortados por transversais.',
    tips: [
      'Se duas retas paralelas são cortadas por transversais, os segmentos correspondentes são proporcionais',
      'Escreva a fração de proporção e multiplique cruzado',
    ],
  },
  {
    id: 'fase9_m2',
    phaseId: 'fase9',
    title: 'Seno e Cosseno',
    description: 'Calcule as razões trigonométricas fundamentais',
    difficulty: 'médio',
    points: 20,
    objective:
      'Encontre os valores de seno e cosseno para ângulos específicos em triângulos retângulos.',
    tips: [
      'Seno é a razão entre o cateto oposto e a hipotenusa',
      'Cosseno é a razão entre o cateto adjacente e a hipotenusa',
    ],
  },
  {
    id: 'fase9_m3',
    phaseId: 'fase9',
    title: 'A Sombra da Torre',
    description: 'Calcule a altura de objetos inacessíveis',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Use a tangente do ângulo solar e a sombra medida para determinar a altura real de uma torre.',
    tips: [
      'A tangente do ângulo é a razão entre a altura (oposto) e a sombra (adjacente)',
      'Multiplique o comprimento da sombra pela tangente do ângulo',
    ],
  },
  {
    id: 'fase9_m4',
    phaseId: 'fase9',
    title: 'Revisão Trigonométrica',
    description: 'Seno, tangente e semelhança de triângulos em um único bloco.',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Resolva 3 problemas sorteados: o seno de um ângulo, a altura por tangente/sombra e um valor por semelhança (Tales).',
    tips: [
      'sen θ = cateto oposto ÷ hipotenusa',
      'altura = tg θ × sombra',
      'Em proporções, multiplique cruzado para isolar x',
    ],
  },
  // Fase 10: O Cartógrafo
  {
    id: 'fase10_m1',
    phaseId: 'fase10',
    title: 'Escalas do Mapa',
    description: 'Converta distâncias do mapa para a realidade',
    difficulty: 'fácil',
    points: 15,
    objective:
      'Calcule distâncias reais a partir de medições feitas com régua em mapas com escalas dadas.',
    tips: [
      'Escala 1:100.000 significa que 1cm no mapa equivale a 100.000cm (1km) no mundo real',
      'Multiplique a medida do mapa pelo denominador da escala',
    ],
  },
  {
    id: 'fase10_m2',
    phaseId: 'fase10',
    title: 'Alvo Probabilístico',
    description: 'Calcule a probabilidade em áreas geométricas',
    difficulty: 'médio',
    points: 20,
    objective:
      'Determine a probabilidade de um objeto cair em uma área específica de um alvo dividindo a área favorável pela total.',
    tips: [
      'A probabilidade é a razão entre a área menor (alvo) e a área maior (total)',
      'Dê a resposta em porcentagem ou decimal simples',
    ],
  },
  {
    id: 'fase10_m3',
    phaseId: 'fase10',
    title: 'Gráfico da Horta',
    description: 'Analise divisões proporcionais em gráficos de pizza',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Determine a área de plantio de hortaliças baseando-se nas frações/porcentagens de um gráfico de setores.',
    tips: [
      'Gráficos de setores dividem uma área circular proporcionalmente',
      'Multiplique a área total do terreno pela porcentagem ou ângulo correspondente',
    ],
  },
  {
    id: 'fase10_m4',
    phaseId: 'fase10',
    title: 'Revisão do Cartógrafo',
    description: 'Escala, probabilidade geométrica e porcentagem de área juntas.',
    difficulty: 'difícil',
    points: 25,
    objective:
      'Resolva 3 problemas sorteados: uma conversão de escala, uma probabilidade geométrica e a área correspondente a uma porcentagem.',
    tips: [
      'Escala: real = medida × denominador da escala',
      'Probabilidade geométrica = área favorável ÷ área total',
      'Porcentagem de área = (porcentagem ÷ 100) × área total',
    ],
  },
];

export const getMissionsByPhaseId = (phaseId: string): Mission[] => {
  return missions.filter((mission) => mission.phaseId === phaseId);
};

export const getMissionById = (id: string): Mission | undefined => {
  return missions.find((mission) => mission.id === id);
};
