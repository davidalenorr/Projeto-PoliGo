// Chefões de fase ("Operação Cidade Nítida").
//
// Um chefão por fase: um duelo de revisão que combina os principais conceitos
// daquela fase em 4 questões de múltipla escolha. A "vida" do chefão é o número
// de questões — cada acerto tira 1 de vida; errar não tira vida (só custa tempo).
//
// `buildQuestions` sorteia um duelo novo a cada tentativa (reaproveitando os
// geradores procedurais quando existem). Import relativo com extensão .ts para
// funcionar também no runner de testes do Node.

import {
  randInt,
  pick,
  shuffle,
  buildNumericOptions,
  makeExternalAngleQuizQuestions,
  makeSymmetryAxesQuizQuestions,
  makePythagorasQuizQuestions,
  makeAngleSumQuizQuestions,
  makePerimeterQuizQuestions,
  makeShapeAreaCase,
  type GeneratedQuizQuestion,
} from '../missions/procedural.ts';

export type BossQuestion = GeneratedQuizQuestion;

export type BossConfig = {
  phaseId: string;
  /** Título curto do duelo (o nome do chefão vem da narrativa). */
  title: string;
  buildQuestions: () => BossQuestion[];
};

// --- helpers ---------------------------------------------------------------------

function concept(
  id: string,
  prompt: string,
  answer: string,
  wrong: string[],
  explanation: string,
): BossQuestion {
  return { id, prompt, options: shuffle([answer, ...wrong]), answer, explanation };
}

function numeric(
  id: string,
  prompt: string,
  value: number,
  unit: string,
  distractors: number[],
  explanation: string,
): BossQuestion {
  const { options, answer } = buildNumericOptions(value, unit, distractors);
  return { id, prompt, options, answer, explanation };
}

const TRIPLES: ReadonlyArray<readonly [number, number, number]> = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
];

function reid(q: BossQuestion, id: string): BossQuestion {
  return { ...q, id };
}

/** "200000" -> "200.000" (sem depender de Intl no Hermes). */
function groupThousands(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function fromAreaCase(id: string): BossQuestion {
  const c = makeShapeAreaCase(id);
  const dims = c.shape === 'quadrado' ? `lado ${c.a} m` : `base ${c.a} m e altura ${c.b} m`;
  return {
    id,
    prompt: `${c.title} (${c.formula}), ${dims}. Qual a área?`,
    options: c.options,
    answer: c.answer,
    explanation: c.explanation,
  };
}

// --- chefões --------------------------------------------------------------------

export const bossMissionConfigs: Record<string, BossConfig> = {
  fase1: {
    phaseId: 'fase1',
    title: 'Duelo do Borrão',
    buildQuestions: () => {
      const names: Record<number, string> = { 5: 'pentágono', 6: 'hexágono', 7: 'heptágono', 8: 'octógono' };
      const n = pick([5, 6, 7, 8]);
      const otherNames = Object.values(names).filter((x) => x !== names[n]);
      return [
        concept(
          'b1',
          `Um polígono com ${n} lados chama-se:`,
          names[n],
          shuffle(otherNames).slice(0, 3),
          `${n} lados → ${names[n]}. O nome vem sempre do número de lados.`,
        ),
        concept(
          'b2',
          'Uma estrela de 5 pontas é um polígono:',
          'côncavo (não convexo)',
          ['convexo', 'regular convexo', 'sem classificação'],
          'A estrela tem "pontas para dentro" — pelo menos um ângulo interno maior que 180°, logo é côncava.',
        ),
        numeric('b3', `Quantos vértices tem um ${names[n]}?`, n, '', [n + 1, n - 1, n + 2], `Lados e vértices são sempre em igual número: ${n}.`),
        concept(
          'b4',
          'Num polígono regular, os lados e os ângulos são:',
          'todos iguais entre si',
          ['todos diferentes', 'só os lados iguais', 'só os ângulos iguais'],
          'Regular = todos os lados iguais E todos os ângulos iguais.',
        ),
      ];
    },
  },

  fase2: {
    phaseId: 'fase2',
    title: 'Duelo da Trena Partida',
    buildQuestions: () => {
      const perimeter = randInt(4, 12) * 2;
      const apothem = randInt(2, 8);
      const area = (perimeter * apothem) / 2;
      return [
        reid(makePerimeterQuizQuestions()[0], 'b1'),
        fromAreaCase('b2'),
        numeric(
          'b3',
          `Um polígono regular tem perímetro ${perimeter} e apótema ${apothem}. Qual a área?`,
          area,
          '',
          [perimeter * apothem, perimeter + apothem, Math.round(area / 2)],
          `A = (P × a) / 2 = (${perimeter} × ${apothem}) / 2 = ${area}.`,
        ),
        concept(
          'b4',
          'Para saber quanta cerca um terreno precisa, você calcula:',
          'o perímetro',
          ['a área', 'a apótema', 'a diagonal'],
          'Cercar acompanha o contorno — isso é perímetro. Área seria para cobrir a superfície.',
        ),
      ];
    },
  },

  fase3: {
    phaseId: 'fase3',
    title: 'Duelo do Ângulo Torto',
    buildQuestions: () => {
      const n = pick([3, 4, 5, 6, 9, 10, 12]);
      const internal = ((n - 2) * 180) / n;
      return [
        reid(makeExternalAngleQuizQuestions()[0], 'b1'),
        reid(makeSymmetryAxesQuizQuestions()[0], 'b2'),
        numeric(
          'b3',
          `Qual é o ângulo interno de um polígono regular de ${n} lados?`,
          internal,
          '°',
          [Math.round((n * 180) / n), Math.round(((n - 1) * 180) / n), 360 / n],
          `a_i = (n − 2) × 180° / n = (${n} − 2) × 180° / ${n} = ${internal}°.`,
        ),
        concept(
          'b4',
          'A soma de todos os ângulos externos de qualquer polígono é:',
          '360°',
          ['180°', '90°', '(n − 2) × 180°'],
          'Independe do número de lados: a soma dos ângulos externos é sempre 360°.',
        ),
      ];
    },
  },

  fase4: {
    phaseId: 'fase4',
    title: 'Duelo da Incógnita Sombria',
    buildQuestions: () => {
      const a = randInt(2, 6);
      const x = randInt(2, 9);
      const b = randInt(1, 10);
      return [
        reid(makePythagorasQuizQuestions()[0], 'b1'),
        reid(makeAngleSumQuizQuestions()[0], 'b2'),
        numeric('b3', `Resolva: ${a}x + ${b} = ${a * x + b}. Qual o valor de x?`, x, '', [x + 1, x - 1, a * x], `Subtraia ${b}: ${a}x = ${a * x}. Divida por ${a}: x = ${x}.`),
        concept(
          'b4',
          'Na equação da reta y = mx + b, o coeficiente m representa:',
          'a inclinação da reta',
          ['o ponto onde corta o eixo y', 'a área sob a reta', 'o comprimento da reta'],
          'm é o coeficiente angular (inclinação); b é onde a reta cruza o eixo y.',
        ),
      ];
    },
  },

  fase5: {
    phaseId: 'fase5',
    title: 'Duelo do Terreno Sem Forma',
    buildQuestions: () => {
      const parts = [randInt(3, 9) * 2, randInt(3, 9) * 2, randInt(3, 9) * 2].map((base) => base * randInt(3, 7) / 2);
      const total = parts.reduce((sum, value) => sum + value, 0);
      return [
        fromAreaCase('b1'),
        fromAreaCase('b2'),
        numeric(
          'b3',
          `Um terreno foi dividido em 3 triângulos com áreas ${parts.join(', ')} m². Qual a área total?`,
          total,
          ' m²',
          [total - parts[0], total + parts[1], Math.round(total / 2)],
          `Triangulação: some as áreas dos triângulos → ${parts.join(' + ')} = ${total} m².`,
        ),
        concept(
          'b4',
          'Para medir a área de um polígono irregular qualquer, a técnica é:',
          'dividir em triângulos e somar as áreas (triangulação)',
          ['multiplicar todos os lados', 'usar apenas A = l²', 'medir só o perímetro'],
          'Qualquer polígono pode ser recortado em triângulos; a área total é a soma deles.',
        ),
      ];
    },
  },

  fase6: {
    phaseId: 'fase6',
    title: 'Duelo do Desperdício',
    buildQuestions: () => {
      const a = randInt(2, 6);
      const x = randInt(2, 9);
      const b = randInt(1, 10);
      const p = randInt(4, 12) * 4;
      const side = p / 4;
      return [
        numeric('b1', `Isole x: ${a}x − ${b} = ${a * x - b}.`, x, '', [x + 1, x - 1, a * x], `Some ${b}: ${a}x = ${a * x}. Divida por ${a}: x = ${x}.`),
        numeric(
          'b2',
          `Um retângulo tem perímetro ${p} m. Que lado (quadrado) dá a MAIOR área possível?`,
          side,
          ' m',
          [side + 2, side - 2, p / 2],
          `Com perímetro fixo, a área do retângulo é máxima quando ele é um quadrado: lado = ${p} ÷ 4 = ${side} m.`,
        ),
        numeric('b3', `Com lado ${side} m, qual é essa área máxima?`, side * side, ' m²', [4 * side, side * 2, side * side + side], `A = l² = ${side}² = ${side * side} m².`),
        concept(
          'b4',
          'Modelar um problema de otimização significa:',
          'escrever o objetivo e as restrições como expressões e buscar o melhor valor',
          ['chutar valores até dar certo', 'ignorar as restrições', 'usar sempre a maior medida'],
          'Otimizar = definir o que maximizar/minimizar (objetivo) sob limites (restrições).',
        ),
      ];
    },
  },

  fase7: {
    phaseId: 'fase7',
    title: 'Duelo do Sinal Trocado',
    buildQuestions: () => {
      const x1 = randInt(3, 15);
      const b1 = randInt(2, 12);
      const a2 = randInt(2, 9);
      const x2 = randInt(2, 10);
      const a3 = randInt(2, 6);
      const x3 = randInt(2, 9);
      const b3 = randInt(1, Math.min(10, a3 * x3 - 1));
      const k = randInt(2, 5);
      const x4 = randInt(2, 8);
      const inside = randInt(1, 5);
      return [
        numeric('b1', `x + ${b1} = ${x1 + b1}`, x1, '', [x1 + 1, x1 - 1, b1], `Subtraia ${b1}: x = ${x1 + b1} − ${b1} = ${x1}.`),
        numeric('b2', `${a2}x = ${a2 * x2}`, x2, '', [x2 + 1, a2 * x2, x2 + a2], `Divida por ${a2}: x = ${a2 * x2} ÷ ${a2} = ${x2}.`),
        numeric('b3', `${a3}x − ${b3} = ${a3 * x3 - b3}`, x3, '', [x3 + 1, x3 - 1, a3 * x3], `Some ${b3}: ${a3}x = ${a3 * x3}. Divida por ${a3}: x = ${x3}.`),
        numeric('b4', `${k}(x + ${inside}) = ${k * (x4 + inside)}`, x4, '', [x4 + 1, x4 - 1, k * inside], `Divida por ${k}: x + ${inside} = ${x4 + inside}. Subtraia ${inside}: x = ${x4}.`),
      ];
    },
  },

  fase8: {
    phaseId: 'fase8',
    title: 'Duelo do Vazio Cúbico',
    buildQuestions: () => {
      const edge = randInt(2, 7);
      const la = randInt(2, 8);
      const lb = randInt(2, 8);
      const lc = randInt(2, 8);
      const sa = randInt(2, 6);
      const sb = randInt(2, 6);
      const sc = randInt(2, 6);
      return [
        numeric('b1', `Qual o volume de um cubo de aresta ${edge}?`, edge ** 3, '', [edge * edge, edge * 3, edge ** 3 + edge], `V = a³ = ${edge}³ = ${edge ** 3}.`),
        numeric('b2', `Um paralelepípedo mede ${la} × ${lb} × ${lc}. Qual o volume?`, la * lb * lc, '', [la + lb + lc, la * lb, 2 * (la * lb + la * lc + lb * lc)], `V = a × b × c = ${la} × ${lb} × ${lc} = ${la * lb * lc}.`),
        numeric(
          'b3',
          `Qual a área total da superfície de um bloco ${sa} × ${sb} × ${sc}?`,
          2 * (sa * sb + sa * sc + sb * sc),
          '',
          [sa * sb * sc, sa * sb + sa * sc + sb * sc, 2 * sa * sb * sc],
          `A = 2(ab + ac + bc) = 2(${sa}×${sb} + ${sa}×${sc} + ${sb}×${sc}) = ${2 * (sa * sb + sa * sc + sb * sc)}.`,
        ),
        concept(
          'b4',
          'Volume e área de superfície medem, respectivamente:',
          'o espaço 3D ocupado e a soma das áreas das faces',
          ['a mesma coisa', 'o contorno e a diagonal', 'o peso e a altura'],
          'Volume = quanto cabe dentro (3D). Área de superfície = quanto material recobre as faces (2D).',
        ),
      ];
    },
  },

  fase9: {
    phaseId: 'fase9',
    title: 'Duelo da Sombra Comprida',
    buildQuestions: () => {
      const k = randInt(2, 6);
      const [opp, adj, hyp] = [3 * k, 4 * k, 5 * k];
      const tg = pick([0.5, 1, 1.5, 2]);
      const shadow = randInt(3, 10) * 2;
      return [
        numeric('b1', `Hipotenusa ${hyp}, cateto oposto ${opp}. Qual o seno (sen θ)?`, opp / hyp, '', [adj / hyp, hyp / opp, 1], `sen θ = oposto ÷ hipotenusa = ${opp} ÷ ${hyp} = ${(opp / hyp).toFixed(1)}.`),
        numeric('b2', `Hipotenusa ${hyp}, cateto adjacente ${adj}. Qual o cosseno (cos θ)?`, adj / hyp, '', [opp / hyp, hyp / adj, 1], `cos θ = adjacente ÷ hipotenusa = ${adj} ÷ ${hyp} = ${(adj / hyp).toFixed(1)}.`),
        numeric('b3', `Uma torre projeta sombra de ${shadow} m e tg(θ) = ${tg}. Qual a altura da torre (m)?`, tg * shadow, '', [shadow, tg * shadow + shadow, Math.round(shadow / tg)], `altura = tg θ × sombra = ${tg} × ${shadow} = ${tg * shadow} m.`),
        concept(
          'b4',
          'Num triângulo retângulo, a hipotenusa é:',
          'o maior lado, oposto ao ângulo reto',
          ['o menor lado', 'qualquer cateto', 'o lado que forma o ângulo reto'],
          'A hipotenusa fica de frente para o ângulo de 90° e é sempre o lado mais comprido.',
        ),
      ];
    },
  },

  fase10: {
    phaseId: 'fase10',
    title: 'Duelo Final: A Névoa',
    buildQuestions: () => {
      const scale = pick([100000, 200000]);
      const dMap = randInt(2, 12);
      const realKm = (dMap * scale) / 100000;
      const realKm2 = randInt(2, 10) * (scale === 200000 ? 2 : 1);
      const mapCm = (realKm2 * 100000) / scale;
      const favor = pick([10, 20, 25, 50]);
      const totalArea = 100;
      return [
        numeric('b1', `No mapa 1:${groupThousands(scale)}, mediu-se ${dMap} cm. Qual a distância real em km?`, realKm, ' km', [dMap, realKm * 2, realKm + dMap], `Real = ${dMap} × ${scale} = ${dMap * scale} cm = ${realKm} km.`),
        numeric('b2', `Escala 1:${groupThousands(scale)}, distância real de ${realKm2} km. Quanto mede no mapa (cm)?`, mapCm, ' cm', [realKm2, mapCm * 2, mapCm + realKm2], `${realKm2} km = ${realKm2 * 100000} cm. No mapa: ${realKm2 * 100000} ÷ ${scale} = ${mapCm} cm.`),
        numeric('b3', `Um alvo de ${totalArea} m² tem zona central de ${favor} m². Qual a probabilidade (%) de acertar o centro?`, favor, '', [favor * 2, Math.round(favor / 2), 100 - favor], `P = área favorável ÷ área total = ${favor} ÷ ${totalArea} = ${favor}%.`),
        concept(
          'b4',
          'Uma escala 1:100.000 significa que:',
          '1 cm no mapa equivale a 100.000 cm (1 km) reais',
          ['1 cm no mapa equivale a 100.000 km reais', '1 km no mapa equivale a 1 cm real', 'o mapa é 100.000 vezes maior que a realidade'],
          'A escala compara mapa : realidade. 1:100.000 → cada 1 cm desenhado são 100.000 cm de verdade.',
        ),
      ];
    },
  },
};

export const getBossConfig = (phaseId: string): BossConfig | undefined => bossMissionConfigs[phaseId];
