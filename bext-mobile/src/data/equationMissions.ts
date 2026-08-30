// Configuração de missões do tipo "equação" (renderizadas por GenericEquationMission).
//
// Adicionar uma missão puramente algébrica agora é só acrescentar uma entrada aqui,
// sem tocar em app/mission-play.tsx. O id precisa bater com o id da missão em missions.ts.
//
// `explanation` é o feedback passo a passo mostrado quando o aluno erra o passo.
//
// `generate` (opcional): quando presente, a missão sorteia números novos a cada
// abertura e pelo botão "Trocar números" — `steps` vira só o exemplo de fallback.

// Import relativo com extensão .ts: funciona no Metro/tsc e também no runner
// nativo do Node usado pelos testes (que não resolve o alias @/*).
import {
  makeGeoProbSteps,
  makeIsolateXSteps,
  makePercentAreaSteps,
  makeScaleSteps,
  makeSystemPairSteps,
  makeTalesSteps,
  makeTangentSteps,
  makeTrigRatioSteps,
} from '../missions/procedural.ts';

export type EquationStep = {
  id: string;
  prompt: string;
  type: 'number' | 'pair';
  expected: number | { x: number; y: number };
  explanation?: string;
};

export type EquationMissionConfig = {
  title: string;
  subtitle?: string;
  steps: EquationStep[];
  generate?: () => EquationStep[];
};

export const equationMissionConfigs: Record<string, EquationMissionConfig> = {
  fase7_m1: {
    title: 'Sprint Algébrico',
    subtitle: 'Isolando incógnitas',
    generate: makeIsolateXSteps,
    steps: [
      {
        id: 's1',
        prompt: 'x + 7 = 12',
        type: 'number',
        expected: 5,
        explanation: 'Faça a operação inversa: subtraia 7 dos dois lados. x = 12 − 7 = 5.',
      },
      {
        id: 's2',
        prompt: '3x = 21',
        type: 'number',
        expected: 7,
        explanation: '3x significa 3 vezes x. Divida os dois lados por 3: x = 21 ÷ 3 = 7.',
      },
      {
        id: 's3',
        prompt: '2x - 5 = 9',
        type: 'number',
        expected: 7,
        explanation: 'Some 5 dos dois lados: 2x = 14. Depois divida por 2: x = 7.',
      },
    ],
  },
  fase7_m2: {
    title: 'Balanceando Expressões',
    subtitle: 'Distribuição e frações',
    steps: [
      {
        id: 'd1',
        prompt: '2(x + 3) = 14',
        type: 'number',
        expected: 4,
        explanation: 'Distribua o 2: 2x + 6 = 14. Subtraia 6: 2x = 8. Divida por 2: x = 4.',
      },
      {
        id: 'd2',
        prompt: '(3/2)x = 9',
        type: 'number',
        expected: 6,
        explanation: 'Multiplique os dois lados pelo inverso da fração (2/3): x = 9 × 2/3 = 6.',
      },
      {
        id: 'd3',
        prompt: '4x + 3 = 3x + 11',
        type: 'number',
        expected: 8,
        explanation: 'Junte os x de um lado: subtraia 3x dos dois lados → x + 3 = 11. Subtraia 3: x = 8.',
      },
    ],
  },
  fase7_m3: {
    title: 'Sistemas em Dupla',
    subtitle: 'Resolva pares (x,y)',
    generate: makeSystemPairSteps,
    steps: [
      {
        id: 'p1',
        prompt: 'x + y = 7; x - y = 1',
        type: 'pair',
        expected: { x: 4, y: 3 },
        explanation: 'Some as duas equações: (x + y) + (x − y) = 7 + 1 → 2x = 8 → x = 4. Volte em x + y = 7: y = 3.',
      },
      {
        id: 'p2',
        prompt: '2x + y = 10; 3x - y = 5',
        type: 'pair',
        expected: { x: 3, y: 4 },
        explanation: 'Os termos y têm sinais opostos. Some as equações: 5x = 15 → x = 3. Substitua em 2x + y = 10: y = 4.',
      },
      {
        id: 'p3',
        prompt: 'x + y = 4; x - y = 2',
        type: 'pair',
        expected: { x: 3, y: 1 },
        explanation: 'Some as duas equações: 2x = 6 → x = 3. Substitua em x + y = 4: y = 1.',
      },
    ],
  },
  fase7_m4: {
    title: 'Desafio Final das Equações',
    subtitle: 'Modelagem e sprint',
    steps: [
      {
        id: 'm1',
        prompt: 'Ana tem o dobro que Bia; juntas têm 30. Quanto Bia tem?',
        type: 'number',
        expected: 10,
        explanation: 'Chame Bia de x. Ana = 2x. Juntas: x + 2x = 30 → 3x = 30 → x = 10.',
      },
      {
        id: 'm2',
        prompt: 'x+5=12',
        type: 'number',
        expected: 7,
        explanation: 'Subtraia 5 dos dois lados: x = 12 − 5 = 7.',
      },
      {
        id: 'm3',
        prompt: '2(x-3)=8',
        type: 'number',
        expected: 7,
        explanation: 'Divida os dois lados por 2: x − 3 = 4. Some 3: x = 7.',
      },
    ],
  },
  fase8_m5: {
    title: 'Volume do Cilindro',
    subtitle: 'Calculando a capacidade de sólidos redondos',
    steps: [
      {
        id: 'c1',
        prompt: 'Uma lata de refrigerante tem raio r = 3cm e altura h = 10cm. Usando π = 3.14, qual a área da base da lata em cm²?',
        type: 'number',
        expected: 28.26,
        explanation: 'A base é um círculo: A = π × r². A = 3.14 × 3² = 3.14 × 9 = 28.26 cm².',
      },
      {
        id: 'c2',
        prompt: 'Usando a área da base anterior (28.26 cm²), qual o volume total da lata em cm³?',
        type: 'number',
        expected: 282.6,
        explanation: 'Volume = área da base × altura = 28.26 × 10 = 282.6 cm³.',
      },
      {
        id: 'c3',
        prompt: 'Um silo tem raio r = 2m e altura h = 5m. Usando π = 3.14, qual o volume total do silo em m³?',
        type: 'number',
        expected: 62.8,
        explanation: 'V = π × r² × h = 3.14 × 2² × 5 = 3.14 × 4 × 5 = 62.8 m³.',
      },
    ],
  },
  fase9_m1: {
    title: 'Teorema de Tales',
    subtitle: 'Proporções e semelhança',
    generate: makeTalesSteps,
    steps: [
      {
        id: 't1',
        prompt: '3/x = 9/12. Qual o valor de x?',
        type: 'number',
        expected: 4,
        explanation: 'Multiplique cruzado: 3 × 12 = 9 × x → 36 = 9x → x = 4.',
      },
      {
        id: 't2',
        prompt: 'x/5 = 8/10. Qual o valor de x?',
        type: 'number',
        expected: 4,
        explanation: 'Multiplique cruzado: 10x = 5 × 8 = 40 → x = 4.',
      },
      {
        id: 't3',
        prompt: '2/3 = x/9. Qual o valor de x?',
        type: 'number',
        expected: 6,
        explanation: 'Multiplique cruzado: 3x = 2 × 9 = 18 → x = 6.',
      },
    ],
  },
  fase9_m2: {
    title: 'Seno e Cosseno',
    subtitle: 'Razões trigonométricas básicas',
    generate: makeTrigRatioSteps,
    steps: [
      {
        id: 's1',
        prompt: 'Hipotenusa = 10, Cateto Oposto = 6. Qual o valor do Seno (sen θ)?',
        type: 'number',
        expected: 0.6,
        explanation: 'sen θ = cateto oposto ÷ hipotenusa = 6 ÷ 10 = 0.6.',
      },
      {
        id: 's2',
        prompt: 'Hipotenusa = 13, Cateto Adjacente = 5. Qual o Cosseno (cos θ) em fração (ex: 5/13)?',
        type: 'number',
        expected: 5 / 13,
        explanation: 'cos θ = cateto adjacente ÷ hipotenusa = 5/13 ≈ 0.385.',
      },
      {
        id: 's3',
        prompt: 'Se o cos(θ) = 0.8 e a Hipotenusa = 15, qual a medida do Cateto Adjacente?',
        type: 'number',
        expected: 12,
        explanation: 'cos θ = adjacente ÷ hipotenusa → adjacente = cos θ × hipotenusa = 0.8 × 15 = 12.',
      },
    ],
  },
  fase9_m3: {
    title: 'A Sombra da Torre',
    subtitle: 'Calculando alturas com Tangente',
    generate: makeTangentSteps,
    steps: [
      {
        id: 'tg1',
        prompt: 'Uma torre projeta sombra de 30m. O ângulo solar tem tg(θ) = 1.5. Qual a altura da torre (m)?',
        type: 'number',
        expected: 45,
        explanation: 'tg θ = altura ÷ sombra → altura = tg θ × sombra = 1.5 × 30 = 45 m.',
      },
      {
        id: 'tg2',
        prompt: 'Um mastro de 12m projeta uma sombra de 12m. Qual a tangente do ângulo solar (tg θ)?',
        type: 'number',
        expected: 1,
        explanation: 'tg θ = altura ÷ sombra = 12 ÷ 12 = 1.',
      },
      {
        id: 'tg3',
        prompt: 'Se tg(θ) = 2.5 e a sombra da árvore mede 4m, qual a altura da árvore (m)?',
        type: 'number',
        expected: 10,
        explanation: 'altura = tg θ × sombra = 2.5 × 4 = 10 m.',
      },
    ],
  },
  fase10_m1: {
    title: 'Escalas do Mapa',
    subtitle: 'Distâncias no mundo real',
    generate: makeScaleSteps,
    steps: [
      {
        id: 'e1',
        prompt: 'No mapa 1:100.000, a distância medida é 5cm. Qual a distância real correspondente em km?',
        type: 'number',
        expected: 5,
        explanation: 'Real = medida × escala = 5 × 100.000 = 500.000 cm. Dividindo por 100.000 cm/km → 5 km.',
      },
      {
        id: 'e2',
        prompt: 'Escala 1:200.000 e distância real de 16km. Qual a distância medida no mapa em cm?',
        type: 'number',
        expected: 8,
        explanation: '16 km = 1.600.000 cm. Medida = real ÷ escala = 1.600.000 ÷ 200.000 = 8 cm.',
      },
      {
        id: 'e3',
        prompt: 'Terreno de 30m. No desenho em escala 1:50, qual o comprimento no desenho em cm?',
        type: 'number',
        expected: 60,
        explanation: '30 m = 3.000 cm. Desenho = real ÷ escala = 3.000 ÷ 50 = 60 cm.',
      },
    ],
  },
  fase10_m2: {
    title: 'Alvo Probabilístico',
    subtitle: 'Probabilidade geométrica em alvos',
    generate: makeGeoProbSteps,
    steps: [
      {
        id: 'p1',
        prompt: 'Um alvo quadrado de 100m² tem uma zona central de 25m². Qual a probabilidade (%) de acertar a zona central?',
        type: 'number',
        expected: 25,
        explanation: 'P = área favorável ÷ área total = 25 ÷ 100 = 0,25 = 25%.',
      },
      {
        id: 'p2',
        prompt: 'Uma horta circular de 12m² está num terreno de 60m². Qual a probabilidade (%) de cair na horta?',
        type: 'number',
        expected: 20,
        explanation: 'P = 12 ÷ 60 = 0,2 = 20%.',
      },
      {
        id: 'p3',
        prompt: 'Se a área de um lago é 10% da área de um parque de 500m², qual a área do lago em m²?',
        type: 'number',
        expected: 50,
        explanation: '10% de 500 = 0,10 × 500 = 50 m².',
      },
    ],
  },
  fase10_m3: {
    title: 'Gráfico da Horta',
    subtitle: 'Divisões proporcionais em gráfico de setores',
    generate: makePercentAreaSteps,
    steps: [
      {
        id: 'g1',
        prompt: 'Um terreno de 1000m² destina 40% para tomate. Qual a área destinada ao tomate em m²?',
        type: 'number',
        expected: 400,
        explanation: '40% de 1000 = 0,40 × 1000 = 400 m².',
      },
      {
        id: 'g2',
        prompt: 'Se o plantio de alface ocupa 25% da horta de 1000m², qual a área do alface em m²?',
        type: 'number',
        expected: 250,
        explanation: '25% de 1000 = 0,25 × 1000 = 250 m².',
      },
      {
        id: 'g3',
        prompt: 'Fatia de batata representa 15% de uma horta de 200m². Qual a área de batatas em m²?',
        type: 'number',
        expected: 30,
        explanation: '15% de 200 = 0,15 × 200 = 30 m².',
      },
    ],
  },
};
