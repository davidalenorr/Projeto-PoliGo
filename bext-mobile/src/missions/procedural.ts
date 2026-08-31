// Geração procedural de valores para as missões de cálculo.
//
// Cada missão sorteia seus números ao ser aberta (e pelo botão "Trocar números"),
// então o aluno pratica de novo sem decorar a resposta. Os geradores são
// calibrados para que a resposta caia sempre num número "limpo" (inteiro),
// evitando conta decimal feia de cabeça.

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(items: readonly T[]): T {
  return items[randInt(0, items.length - 1)];
}

// --- Fase 5 / prática de áreas ------------------------------------------------

export type TriangleAreaQuestion = { base: number; height: number; area: number };

export function makeTriangleArea(): TriangleAreaQuestion {
  const base = randInt(2, 9) * 2; // par -> área inteira
  const height = randInt(3, 9);
  return { base, height, area: (base * height) / 2 };
}

export type TriangulationQuestion = { parts: number[]; total: number };

export function makeTriangulation(): TriangulationQuestion {
  const parts = [randInt(2, 10) * 3, randInt(2, 10) * 3, randInt(2, 10) * 3];
  return { parts, total: parts.reduce((sum, value) => sum + value, 0) };
}

export type ApothemQuestion = { perimeter: number; apothem: number; area: number };

export function makeApothem(): ApothemQuestion {
  const perimeter = randInt(6, 20) * 2; // par -> área inteira
  const apothem = randInt(2, 8);
  return { perimeter, apothem, area: (perimeter * apothem) / 2 };
}

// --- Fase 6 / álgebra aplicada ---------------------------------------------------

export type LinearQuestion = { a: number; b: number; c: number; x: number; equation: string };

export function makeLinear(): LinearQuestion {
  const a = randInt(2, 6);
  const x = randInt(2, 9);
  const b = randInt(1, 12);
  const c = a * x + b;
  return { a, b, c, x, equation: `${a}x + ${b} = ${c}` };
}

export type SystemQuestion = {
  x: number;
  y: number;
  sumEquation: string;
  diffEquation: string;
};

export function makeSystem(): SystemQuestion {
  const y = randInt(2, 8);
  const x = y + randInt(1, 7); // x > y para a diferença ser positiva
  return {
    x,
    y,
    sumEquation: `2x + 2y = ${2 * (x + y)}`,
    diffEquation: `x - y = ${x - y}`,
  };
}

// --- Fase 6 / Pitágoras -------------------------------------------------------

const PYTHAGOREAN_TRIPLES: ReadonlyArray<readonly [number, number, number]> = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
  [12, 16, 20],
  [10, 24, 26],
  [9, 40, 41],
  [20, 21, 29],
];

export type PythagorasCase = { prompt: string; expected: number };

export function makePythagorasCase(): PythagorasCase {
  const [legA, legB, hyp] = pick(PYTHAGOREAN_TRIPLES);
  if (randInt(0, 1) === 0) {
    return {
      prompt: `Cateto a: ${legA}, Cateto b: ${legB}. Calcule a Hipotenusa (c).`,
      expected: hyp,
    };
  }
  return {
    prompt: `Cateto a: ${legA}, Hipotenusa c: ${hyp}. Calcule o outro Cateto (b).`,
    expected: legB,
  };
}

export function makePythagorasCases(count = 4): PythagorasCase[] {
  return Array.from({ length: count }, () => makePythagorasCase());
}

// --- Fase 8 / geometria espacial ----------------------------------------------

export type CubeQuestion = { edge: number; volume: number };

export function makeCube(): CubeQuestion {
  const edge = randInt(2, 8);
  return { edge, volume: edge ** 3 };
}

export type PrismQuestion = { length: number; width: number; height: number; volume: number };

export function makePrism(): PrismQuestion {
  const length = randInt(2, 9);
  const width = randInt(2, 9);
  const height = randInt(2, 9);
  return { length, width, height, volume: length * width * height };
}

export type SurfaceQuestion = { a: number; b: number; c: number; area: number };

export function makeSurface(): SurfaceQuestion {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  return { a, b, c, area: 2 * (a * b + a * c + b * c) };
}

// ===========================================================================
// Geradores de PASSOS para as missões de equação (GenericEquationMission).
//
// Cada função devolve os 3 passos completos de uma missão algébrica, com os
// números sorteados de modo que a resposta caia sempre num valor "limpo".
// O formato é o mesmo de EquationStep em src/data/equationMissions.ts
// (compatível estruturalmente — sem import cruzado).
// ===========================================================================

export type GeneratedEquationStep = {
  id: string;
  prompt: string;
  type: 'number' | 'pair';
  expected: number | { x: number; y: number };
  explanation?: string;
};

/** "1000000" -> "1.000.000" (sem depender de Intl no Hermes). */
function groupThousands(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Escreve uma equação linear de sistema: fmtSystemEq(2, -1, 5) -> "2x - y = 5". */
function fmtSystemEq(a: number, b: number, c: number): string {
  const xPart = `${a === 1 ? '' : a}x`;
  const yPart = `${Math.abs(b) === 1 ? '' : Math.abs(b)}y`;
  return `${xPart} ${b < 0 ? '-' : '+'} ${yPart} = ${c}`;
}

// --- fase7_m1: isolar a incógnita ------------------------------------------

export function makeIsolateXSteps(): GeneratedEquationStep[] {
  const b1 = randInt(2, 15);
  const x1 = randInt(3, 20);
  const a2 = randInt(2, 9);
  const x2 = randInt(2, 12);
  const a3 = randInt(2, 6);
  const x3 = randInt(2, 10);
  const b3 = randInt(1, Math.min(12, a3 * x3 - 1)); // mantém o lado direito positivo
  return [
    {
      id: 's1',
      prompt: `x + ${b1} = ${x1 + b1}`,
      type: 'number',
      expected: x1,
      explanation: `Operação inversa: subtraia ${b1} dos dois lados. x = ${x1 + b1} − ${b1} = ${x1}.`,
    },
    {
      id: 's2',
      prompt: `${a2}x = ${a2 * x2}`,
      type: 'number',
      expected: x2,
      explanation: `${a2}x é ${a2} vezes x. Divida os dois lados por ${a2}: x = ${a2 * x2} ÷ ${a2} = ${x2}.`,
    },
    {
      id: 's3',
      prompt: `${a3}x - ${b3} = ${a3 * x3 - b3}`,
      type: 'number',
      expected: x3,
      explanation: `Some ${b3} dos dois lados: ${a3}x = ${a3 * x3}. Divida por ${a3}: x = ${x3}.`,
    },
  ];
}

// --- fase7_m3: sistemas lineares (par x,y) --------------------------------

export function makeSystemPairSteps(): GeneratedEquationStep[] {
  // p1 / p3: soma e diferença
  const x1 = randInt(3, 9);
  const y1 = randInt(1, x1 - 1);
  const x3 = randInt(6, 14);
  const y3 = randInt(2, x3 - 2);
  // p2: 2x + y = A ; 3x - y = B  (somar elimina y -> 5x = A + B)
  const x2 = randInt(2, 6);
  const y2 = randInt(1, Math.min(9, 3 * x2 - 1));
  const A = 2 * x2 + y2;
  const B = 3 * x2 - y2;
  return [
    {
      id: 'p1',
      prompt: `${fmtSystemEq(1, 1, x1 + y1)}; ${fmtSystemEq(1, -1, x1 - y1)}`,
      type: 'pair',
      expected: { x: x1, y: y1 },
      explanation: `Some as duas equações: (x + y) + (x − y) → 2x = ${2 * x1} → x = ${x1}. Volte em x + y = ${x1 + y1}: y = ${y1}.`,
    },
    {
      id: 'p2',
      prompt: `${fmtSystemEq(2, 1, A)}; ${fmtSystemEq(3, -1, B)}`,
      type: 'pair',
      expected: { x: x2, y: y2 },
      explanation: `Os termos y têm sinais opostos. Some as equações: 5x = ${A + B} → x = ${x2}. Substitua em ${fmtSystemEq(2, 1, A)}: y = ${y2}.`,
    },
    {
      id: 'p3',
      prompt: `${fmtSystemEq(1, 1, x3 + y3)}; ${fmtSystemEq(1, -1, x3 - y3)}`,
      type: 'pair',
      expected: { x: x3, y: y3 },
      explanation: `Some as duas equações: 2x = ${2 * x3} → x = ${x3}. Substitua em x + y = ${x3 + y3}: y = ${y3}.`,
    },
  ];
}

// --- fase9_m1: Teorema de Tales (proporção, multiplicação cruzada) --------

function proportionStep(id: string, phrasing: 0 | 1 | 2): GeneratedEquationStep {
  const x = randInt(2, 9);
  const p = randInt(2, 8);
  const scale = randInt(1, 3);
  const q = x * scale;
  const r = p * scale;
  const forms = [`x/${p} = ${q}/${r}`, `${p}/x = ${r}/${q}`, `${q}/${r} = x/${p}`];
  return {
    id,
    prompt: `${forms[phrasing]}. Qual o valor de x?`,
    type: 'number',
    expected: x,
    explanation: `Multiplique cruzado e isole x: os produtos dos meios e dos extremos são iguais, logo x = ${x}.`,
  };
}

export function makeTalesSteps(): GeneratedEquationStep[] {
  return [proportionStep('t1', 0), proportionStep('t2', 1), proportionStep('t3', 2)];
}

// --- fase9_m2: seno e cosseno (tripla 3-4-5 escalada) --------------------

export function makeTrigRatioSteps(): GeneratedEquationStep[] {
  const k = randInt(2, 6);
  const opp = 3 * k;
  const adj = 4 * k;
  const hyp = 5 * k;
  return [
    {
      id: 's1',
      prompt: `Hipotenusa = ${hyp}, Cateto Oposto = ${opp}. Qual o valor do Seno (sen θ)?`,
      type: 'number',
      expected: opp / hyp,
      explanation: `sen θ = cateto oposto ÷ hipotenusa = ${opp} ÷ ${hyp} = ${(opp / hyp).toFixed(1)}.`,
    },
    {
      id: 's2',
      prompt: `Hipotenusa = ${hyp}, Cateto Adjacente = ${adj}. Qual o valor do Cosseno (cos θ)?`,
      type: 'number',
      expected: adj / hyp,
      explanation: `cos θ = cateto adjacente ÷ hipotenusa = ${adj} ÷ ${hyp} = ${(adj / hyp).toFixed(1)}.`,
    },
    {
      id: 's3',
      prompt: `Se cos(θ) = 0.8 e a Hipotenusa = ${hyp}, qual a medida do Cateto Adjacente?`,
      type: 'number',
      expected: adj,
      explanation: `adjacente = cos θ × hipotenusa = 0.8 × ${hyp} = ${adj}.`,
    },
  ];
}

// --- fase9_m3: tangente (altura x sombra) --------------------------------

export function makeTangentSteps(): GeneratedEquationStep[] {
  const tgOptions = [0.5, 1, 1.5, 2, 2.5] as const;
  const t1 = pick(tgOptions);
  const sh1 = randInt(3, 12) * 2;
  const t2 = pick(tgOptions);
  const sh2 = randInt(3, 10) * 2;
  const t3 = pick(tgOptions);
  const sh3 = randInt(3, 10) * 2;
  return [
    {
      id: 'tg1',
      prompt: `Uma torre projeta sombra de ${sh1}m. O ângulo solar tem tg(θ) = ${t1}. Qual a altura da torre (m)?`,
      type: 'number',
      expected: t1 * sh1,
      explanation: `tg θ = altura ÷ sombra → altura = tg θ × sombra = ${t1} × ${sh1} = ${t1 * sh1} m.`,
    },
    {
      id: 'tg2',
      prompt: `Um mastro de ${t2 * sh2}m projeta uma sombra de ${sh2}m. Qual a tangente do ângulo solar (tg θ)?`,
      type: 'number',
      expected: t2,
      explanation: `tg θ = altura ÷ sombra = ${t2 * sh2} ÷ ${sh2} = ${t2}.`,
    },
    {
      id: 'tg3',
      prompt: `Se tg(θ) = ${t3} e a sombra da árvore mede ${sh3}m, qual a altura da árvore (m)?`,
      type: 'number',
      expected: t3 * sh3,
      explanation: `altura = tg θ × sombra = ${t3} × ${sh3} = ${t3 * sh3} m.`,
    },
  ];
}

// --- fase10_m1: escalas de mapa ----------------------------------------------

export function makeScaleSteps(): GeneratedEquationStep[] {
  const s1 = pick([100000, 200000] as const);
  const d1 = randInt(2, 12);
  const realKm1 = (d1 * s1) / 100000;
  const s2 = pick([100000, 200000] as const);
  const meas2 = randInt(3, 15);
  const realKm2 = (meas2 * s2) / 100000;
  const s3 = pick([20, 50, 100] as const);
  const realM3 = randInt(2, 20);
  const draw3 = (realM3 * 100) / s3;
  return [
    {
      id: 'e1',
      prompt: `No mapa 1:${groupThousands(s1)}, a distância medida é ${d1}cm. Qual a distância real correspondente em km?`,
      type: 'number',
      expected: realKm1,
      explanation: `Real = medida × escala = ${d1} × ${groupThousands(s1)} = ${groupThousands(d1 * s1)} cm. Dividindo por 100.000 cm/km → ${realKm1} km.`,
    },
    {
      id: 'e2',
      prompt: `Escala 1:${groupThousands(s2)} e distância real de ${realKm2}km. Qual a distância medida no mapa em cm?`,
      type: 'number',
      expected: meas2,
      explanation: `${realKm2} km = ${groupThousands(realKm2 * 100000)} cm. Medida = real ÷ escala = ${groupThousands(realKm2 * 100000)} ÷ ${groupThousands(s2)} = ${meas2} cm.`,
    },
    {
      id: 'e3',
      prompt: `Terreno de ${realM3}m. No desenho em escala 1:${s3}, qual o comprimento no desenho em cm?`,
      type: 'number',
      expected: draw3,
      explanation: `${realM3} m = ${realM3 * 100} cm. Desenho = real ÷ escala = ${realM3 * 100} ÷ ${s3} = ${draw3} cm.`,
    },
  ];
}

// --- fase10_m2: probabilidade geométrica -----------------------------------

export function makeGeoProbSteps(): GeneratedEquationStep[] {
  const f1 = pick([10, 20, 25, 40, 50] as const);
  const pct2 = pick([10, 20, 25, 50] as const);
  const total2 = randInt(2, 6) * 20;
  const fav2 = (pct2 / 100) * total2;
  const pct3 = pick([5, 10, 15, 20, 25] as const);
  const total3 = randInt(2, 12) * 20;
  const area3 = (pct3 / 100) * total3;
  return [
    {
      id: 'p1',
      prompt: `Um alvo quadrado de 100m² tem uma zona central de ${f1}m². Qual a probabilidade (%) de acertar a zona central?`,
      type: 'number',
      expected: f1,
      explanation: `P = área favorável ÷ área total = ${f1} ÷ 100 = ${f1 / 100} = ${f1}%.`,
    },
    {
      id: 'p2',
      prompt: `Uma horta de ${fav2}m² está num terreno de ${total2}m². Qual a probabilidade (%) de cair na horta?`,
      type: 'number',
      expected: pct2,
      explanation: `P = ${fav2} ÷ ${total2} = ${pct2 / 100} = ${pct2}%.`,
    },
    {
      id: 'p3',
      prompt: `Se a área de um lago é ${pct3}% da área de um parque de ${total3}m², qual a área do lago em m²?`,
      type: 'number',
      expected: area3,
      explanation: `${pct3}% de ${total3} = ${pct3 / 100} × ${total3} = ${area3} m².`,
    },
  ];
}

// --- fase10_m3: porcentagem de área (gráfico de setores) ------------------

export function makePercentAreaSteps(): GeneratedEquationStep[] {
  const total = randInt(3, 20) * 100;
  const parts = [
    { pct: pick([10, 15, 20] as const), name: 'tomate' },
    { pct: pick([25, 30, 40] as const), name: 'alface' },
    { pct: pick([5, 10, 15] as const), name: 'batata' },
  ];
  return parts.map((part, i) => ({
    id: `g${i + 1}`,
    prompt: `Uma horta de ${groupThousands(total)}m² destina ${part.pct}% para ${part.name}. Qual a área destinada em m²?`,
    type: 'number' as const,
    expected: (part.pct / 100) * total,
    explanation: `${part.pct}% de ${groupThousands(total)} = ${part.pct / 100} × ${total} = ${(part.pct / 100) * total} m².`,
  }));
}

// ===========================================================================
// Geradores de QUESTÕES para as missões de quiz (MissionQuizFlow).
//
// Cada função devolve um array de questões de múltipla escolha, com a resposta
// correta e distratores plausíveis. Formato estruturalmente igual a
// QuizQuestion em src/missions/shared.tsx (sem import cruzado).
// ===========================================================================

export type GeneratedQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Monta as opções de uma questão numérica: correta + distratores únicos,
 * positivos e diferentes entre si, embaralhados. Garante `total` alternativas.
 */
export function buildNumericOptions(
  correctValue: number,
  unit: string,
  distractors: number[],
  total = 4,
): { options: string[]; answer: string } {
  const fmt = (v: number) => `${v}${unit}`;
  const answer = fmt(correctValue);
  const seen = new Set<number>([correctValue]);
  const chosen: number[] = [];

  for (const d of shuffle(distractors)) {
    if (chosen.length >= total - 1) break;
    const rounded = Math.round(d);
    if (rounded > 0 && !seen.has(rounded)) {
      seen.add(rounded);
      chosen.push(rounded);
    }
  }

  // completa com vizinhos da resposta se faltaram distratores únicos
  let delta = 1;
  while (chosen.length < total - 1) {
    for (const cand of [correctValue + delta, correctValue - delta]) {
      if (chosen.length >= total - 1) break;
      if (cand > 0 && !seen.has(cand)) {
        seen.add(cand);
        chosen.push(cand);
      }
    }
    delta++;
  }

  return { options: shuffle([answer, ...chosen.map(fmt)]), answer };
}

const EXTERNAL_ANGLE_N = [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24] as const; // 360/n inteiro

/** fase3_m2 (ExternalAngleVisualizer): ângulo externo = 360° / n. */
export function makeExternalAngleQuizQuestions(): GeneratedQuizQuestion[] {
  return shuffle(EXTERNAL_ANGLE_N)
    .slice(0, 3)
    .map((n, i) => {
      const ae = 360 / n;
      const { options, answer } = buildNumericOptions(ae, '°', [
        180 / n,
        360 / (n + 1),
        360 / Math.max(1, n - 1),
        ((n - 2) * 180) / n,
      ]);
      return {
        id: `ext${i + 1}`,
        prompt: `Qual é o ângulo externo de um polígono regular de ${n} lados?`,
        options,
        answer,
        explanation: `O ângulo externo de um polígono regular é 360° ÷ n. Aqui: 360° ÷ ${n} = ${ae}°.`,
      };
    });
}

const POLY_NAMES: Record<number, string> = {
  3: 'triângulo equilátero',
  4: 'quadrado',
  5: 'pentágono regular',
  6: 'hexágono regular',
  7: 'heptágono regular',
  8: 'octógono regular',
  9: 'eneágono regular',
  10: 'decágono regular',
  12: 'dodecágono regular',
};

/** fase3_m3 (SymmetryExplorer): um polígono regular de n lados tem n eixos de simetria. */
export function makeSymmetryAxesQuizQuestions(): GeneratedQuizQuestion[] {
  return shuffle([3, 4, 5, 6, 7, 8, 9, 10, 12])
    .slice(0, 3)
    .map((n, i) => {
      const { options, answer } = buildNumericOptions(n, '', [n * 2, n - 1, n + 2, Math.round(n / 2), 2]);
      return {
        id: `sym${i + 1}`,
        prompt: `Quantos eixos de simetria tem um ${POLY_NAMES[n] ?? `polígono regular de ${n} lados`} (n = ${n})?`,
        options,
        answer,
        explanation: `Todo polígono regular tem n eixos de simetria — um por vértice/lado. Para n = ${n}, são ${n} eixos.`,
      };
    });
}

/** Pitágoras em formato de múltipla escolha (a partir das triplas). */
export function makePythagorasQuizQuestions(): GeneratedQuizQuestion[] {
  return Array.from({ length: 3 }, (_, i) => {
    const [legA, legB, hyp] = pick(PYTHAGOREAN_TRIPLES);
    if (randInt(0, 1) === 0) {
      const { options, answer } = buildNumericOptions(hyp, '', [legA + legB, hyp + 1, hyp - 1, legB - legA]);
      return {
        id: `pit${i + 1}`,
        prompt: `Num triângulo retângulo os catetos medem ${legA} e ${legB}. Qual a hipotenusa? (${legA}² + ${legB}² = x²)`,
        options,
        answer,
        explanation: `x² = ${legA}² + ${legB}² = ${legA * legA} + ${legB * legB} = ${hyp * hyp}. Então x = √${hyp * hyp} = ${hyp}.`,
      };
    }
    const { options, answer } = buildNumericOptions(legA, '', [hyp - legB, legA + 1, legA + 2, legB]);
    return {
      id: `pit${i + 1}`,
      prompt: `Num triângulo retângulo um cateto mede ${legB} e a hipotenusa ${hyp}. Qual o outro cateto? (x² + ${legB}² = ${hyp}²)`,
      options,
      answer,
      explanation: `x² = ${hyp}² − ${legB}² = ${hyp * hyp} − ${legB * legB} = ${legA * legA}. Então x = √${legA * legA} = ${legA}.`,
    };
  });
}

/** Soma dos ângulos internos de um triângulo = 180°. */
export function makeAngleSumQuizQuestions(): GeneratedQuizQuestion[] {
  return Array.from({ length: 3 }, (_, i) => {
    const a = randInt(30, 90);
    const b = randInt(20, Math.min(120, 160 - a));
    const x = 180 - a - b;
    const { options, answer } = buildNumericOptions(x, '°', [180 - a, 180 - b, a + b, 90]);
    return {
      id: `ang${i + 1}`,
      prompt: `Num triângulo, os ângulos medem x, ${a}° e ${b}°. Quanto vale x?`,
      options,
      answer,
      explanation: `A soma dos ângulos internos de um triângulo é 180°. x = 180° − ${a}° − ${b}° = ${x}°.`,
    };
  });
}

/** Perímetro = soma dos lados (formas variadas). */
export function makePerimeterQuizQuestions(): GeneratedQuizQuestion[] {
  const shapes = [
    { name: 'triângulo', sides: 3 },
    { name: 'quadrilátero', sides: 4 },
    { name: 'pentágono', sides: 5 },
    { name: 'hexágono', sides: 6 },
  ] as const;
  return Array.from({ length: 3 }, (_, i) => {
    const shape = pick(shapes);
    const lens = Array.from({ length: shape.sides }, () => randInt(2, 15));
    const total = lens.reduce((sum, value) => sum + value, 0);
    const { options, answer } = buildNumericOptions(total, ' m', [
      total - lens[0],
      total + lens[0],
      Math.round(total / 2),
      total + 3,
    ]);
    return {
      id: `per${i + 1}`,
      prompt: `Um ${shape.name} tem lados ${lens.map((l) => `${l} m`).join(', ')}. Qual o perímetro?`,
      options,
      answer,
      explanation: `Perímetro é a soma dos lados: ${lens.join(' + ')} = ${total} m.`,
    };
  });
}

/** fase2_m1 (PerimeterGuardianMission): 2 cálculos de perímetro + 1 conceito fixo. */
export function makePerimeterGuardianQuizQuestions(): GeneratedQuizQuestion[] {
  const first = makePerimeterQuizQuestions()[0];
  const side = randInt(5, 20);
  const square = buildNumericOptions(4 * side, ' m', [side * side, 3 * side, 2 * side, 5 * side]);
  return [
    { ...first, id: 'pgd1' },
    {
      id: 'pgd2',
      prompt: `Para cercar um jardim quadrado de lado ${side} m, quantos metros de cerca são necessários?`,
      options: square.options,
      answer: square.answer,
      explanation: `Cerca = perímetro do quadrado = 4 × ${side} = ${4 * side} m.`,
    },
    {
      id: 'pgd3',
      prompt: 'Qual expressão representa o perímetro de um polígono qualquer?',
      options: shuffle(['P = l₁ + l₂ + ... + lₙ', 'P = b × h', 'P = (b × h) / 2', 'P = (P × a) / 2']),
      answer: 'P = l₁ + l₂ + ... + lₙ',
      explanation: 'Perímetro é sempre a soma de todos os lados.',
    },
  ];
}

/** fase2_m3 (ApothemaSecretMission): 2 conceitos fixos + 1 cálculo de área com apótema. */
export function makeApothemaSecretQuizQuestions(): GeneratedQuizQuestion[] {
  const perimeter = randInt(4, 20) * 2;
  const apothem = randInt(2, 9);
  const area = (perimeter * apothem) / 2;
  const areaOpts = buildNumericOptions(area, '', [perimeter * apothem, perimeter + apothem, Math.round(area / 2), area + apothem]);
  return [
    {
      id: 'aps1',
      prompt: 'A apótema de um polígono regular é o segmento que liga...',
      options: shuffle([
        'o centro ao meio de um lado (perpendicular a ele)',
        'o centro a um vértice',
        'dois vértices opostos',
        'a base ao topo da figura',
      ]),
      answer: 'o centro ao meio de um lado (perpendicular a ele)',
      explanation: 'Apótema = distância do centro ao ponto médio de um lado, formando ângulo reto com esse lado.',
    },
    {
      id: 'aps2',
      prompt: 'Qual fórmula dá a área de um polígono regular a partir da apótema?',
      options: shuffle(['A = (P × a) / 2', 'A = b × h', 'A = l²', 'A = (n − 2) × 180°']),
      answer: 'A = (P × a) / 2',
      explanation: 'Área = perímetro (P) vezes apótema (a), dividido por 2.',
    },
    {
      id: 'aps3',
      prompt: `Um polígono regular tem perímetro ${perimeter} e apótema ${apothem}. Qual a área?`,
      options: areaOpts.options,
      answer: areaOpts.answer,
      explanation: `A = (P × a) / 2 = (${perimeter} × ${apothem}) / 2 = ${area}.`,
    },
  ];
}

/** fase2_m5 (SupremeEngineerMission): perímetro→lado, lado→área e 1 conceito fixo. */
export function makeSupremeEngineerQuizQuestions(): GeneratedQuizQuestion[] {
  const side = randInt(4, 20);
  const perimeter = 4 * side;
  const area = side * side;
  const sideOpts = buildNumericOptions(side, ' m', [perimeter, Math.round(perimeter / 2), side + 2, side * 2]);
  const areaOpts = buildNumericOptions(area, ' m²', [perimeter, side * 2, area + side, Math.round(area / 2)]);
  return [
    {
      id: 'sup1',
      prompt: `Um quadrado tem perímetro ${perimeter} m. Qual é o lado?`,
      options: sideOpts.options,
      answer: sideOpts.answer,
      explanation: `Para o quadrado, P = 4 × l, então l = ${perimeter} ÷ 4 = ${side} m.`,
    },
    {
      id: 'sup2',
      prompt: `Com lado ${side} m, qual é a área desse quadrado?`,
      options: areaOpts.options,
      answer: areaOpts.answer,
      explanation: `A = l² = ${side}² = ${area} m².`,
    },
    {
      id: 'sup3',
      prompt: 'Um desafio pede para cercar E revestir uma praça. Quais medidas entram?',
      options: shuffle(['Perímetro e área', 'Somente área', 'Somente perímetro', 'Somente apótema']),
      answer: 'Perímetro e área',
      explanation: 'Cercar usa o perímetro (contorno); revestir usa a área (superfície).',
    },
  ];
}

/** fase4_m2 (TriangleBalanceMission): 2 de Pitágoras + 1 de soma de ângulos. */
export function makeTriangleBalanceQuizQuestions(): GeneratedQuizQuestion[] {
  const [p1, p2] = makePythagorasQuizQuestions();
  const [s1] = makeAngleSumQuizQuestions();
  return [
    { ...p1, id: 'tbal1' },
    { ...p2, id: 'tbal2' },
    { ...s1, id: 'tbal3' },
  ];
}

// --- fase2_m2 (AreaMasterMission): casos de área com preview ---------------

export type ShapeAreaCase = {
  id: string;
  title: string;
  shape: 'quadrado' | 'retangulo' | 'triangulo';
  formula: string;
  a: number;
  b: number;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

export function makeShapeAreaCase(id: string): ShapeAreaCase {
  const kind = pick(['quadrado', 'retangulo', 'triangulo'] as const);

  if (kind === 'quadrado') {
    const l = randInt(3, 15);
    const area = l * l;
    const { options, answer } = buildNumericOptions(area, ' m²', [4 * l, area + l, Math.round(area / 2), area + 2 * l]);
    return {
      id,
      title: 'Piso Quadrado',
      shape: 'quadrado',
      formula: 'A = l²',
      a: l,
      b: l,
      prompt: 'Quantos metros quadrados o piso ocupa?',
      options,
      answer,
      explanation: `Quadrado: A = l². Com lado ${l}, a área é ${l} × ${l} = ${area} m².`,
    };
  }

  if (kind === 'retangulo') {
    const base = randInt(3, 15);
    const height = randInt(2, 12);
    const area = base * height;
    const { options, answer } = buildNumericOptions(area, ' m²', [2 * (base + height), area + base, area - height, Math.round(area / 2)]);
    return {
      id,
      title: 'Terreno Retangular',
      shape: 'retangulo',
      formula: 'A = b × h',
      a: base,
      b: height,
      prompt: 'Qual é a área total do terreno?',
      options,
      answer,
      explanation: `Retângulo: A = b × h = ${base} × ${height} = ${area} m².`,
    };
  }

  const base = randInt(2, 12) * 2; // par -> área inteira
  const height = randInt(3, 12);
  const area = (base * height) / 2;
  const { options, answer } = buildNumericOptions(area, ' m²', [base * height, area + base, Math.round(area / 2), area + height]);
  return {
    id,
    title: 'Jardim Triangular',
    shape: 'triangulo',
    formula: 'A = (b × h) / 2',
    a: base,
    b: height,
    prompt: 'Qual é a área do jardim?',
    options,
    answer,
    explanation: `Triângulo: A = (b × h) / 2 = (${base} × ${height}) / 2 = ${area} m².`,
  };
}

export function makeShapeAreaCases(): ShapeAreaCase[] {
  return [makeShapeAreaCase('a1'), makeShapeAreaCase('a2'), makeShapeAreaCase('a3')];
}

// ===========================================================================
// Geradores de REVISÃO — combinam conceitos de uma fase num único bloco.
// Usados pelas missões "_m4" de revisão das fases 3, 5, 9 e 10.
// ===========================================================================

/** fase5_m4: área de triângulo, de retângulo e por triangulação. */
export function makeAreaReviewSteps(): GeneratedEquationStep[] {
  const b1 = randInt(3, 12) * 2; // par -> área inteira
  const h1 = randInt(3, 10);
  const b2 = randInt(4, 15);
  const h2 = randInt(3, 12);
  const parts = [randInt(3, 9) * 2, randInt(3, 9) * 2, randInt(3, 9) * 2].map(
    (base) => (base * randInt(2, 5)) / 2,
  );
  const total = parts.reduce((sum, value) => sum + value, 0);
  return [
    {
      id: 'ar1',
      prompt: `Um triângulo tem base ${b1} e altura ${h1}. Qual é a área?`,
      type: 'number',
      expected: (b1 * h1) / 2,
      explanation: `A = (b × h) / 2 = (${b1} × ${h1}) / 2 = ${(b1 * h1) / 2}.`,
    },
    {
      id: 'ar2',
      prompt: `Um retângulo tem base ${b2} e altura ${h2}. Qual é a área?`,
      type: 'number',
      expected: b2 * h2,
      explanation: `A = b × h = ${b2} × ${h2} = ${b2 * h2}.`,
    },
    {
      id: 'ar3',
      prompt: `Um polígono foi dividido em 3 triângulos de áreas ${parts.join(', ')}. Qual a área total?`,
      type: 'number',
      expected: total,
      explanation: `Triangulação: some as áreas → ${parts.join(' + ')} = ${total}.`,
    },
  ];
}

/** fase9_m4: seno, altura por tangente e semelhança (Tales). */
export function makeTrigReviewSteps(): GeneratedEquationStep[] {
  const k = randInt(2, 6);
  const opp = 3 * k;
  const hyp = 5 * k;
  const tg = pick([0.5, 1, 1.5, 2] as const);
  const shadow = randInt(3, 10) * 2;
  const x = randInt(2, 9);
  const p = randInt(2, 7);
  const scale = randInt(2, 4);
  return [
    {
      id: 'tr1',
      prompt: `Hipotenusa ${hyp}, cateto oposto ${opp}. Qual o valor de sen θ?`,
      type: 'number',
      expected: opp / hyp,
      explanation: `sen θ = cateto oposto ÷ hipotenusa = ${opp} ÷ ${hyp} = ${(opp / hyp).toFixed(1)}.`,
    },
    {
      id: 'tr2',
      prompt: `Uma árvore projeta sombra de ${shadow} m com tg(θ) = ${tg}. Qual a altura da árvore (m)?`,
      type: 'number',
      expected: tg * shadow,
      explanation: `altura = tg θ × sombra = ${tg} × ${shadow} = ${tg * shadow} m.`,
    },
    {
      id: 'tr3',
      prompt: `Semelhança (Tales): x/${p} = ${x * scale}/${p * scale}. Qual o valor de x?`,
      type: 'number',
      expected: x,
      explanation: `Multiplique cruzado: x × ${p * scale} = ${p} × ${x * scale} → x = ${x}.`,
    },
  ];
}

/** fase10_m4: escala, probabilidade geométrica e porcentagem de área. */
export function makeCartographyReviewSteps(): GeneratedEquationStep[] {
  return [makeScaleSteps()[0], makeGeoProbSteps()[0], makePercentAreaSteps()[0]];
}

/** fase3_m4: ângulo externo, ângulo interno e eixos de simetria. */
export function makeAngleMasteryQuizQuestions(): GeneratedQuizQuestion[] {
  const [ext] = makeExternalAngleQuizQuestions();
  const [sym] = makeSymmetryAxesQuizQuestions();
  const n = pick([3, 4, 5, 6, 9, 10, 12] as const);
  const internal = ((n - 2) * 180) / n;
  const { options, answer } = buildNumericOptions(internal, '°', [
    ((n - 1) * 180) / n,
    360 / n,
    ((n + 1) * 180) / n,
    180 - 360 / n,
  ]);
  return [
    { ...ext, id: 'am1' },
    {
      id: 'am2',
      prompt: `Qual é o ângulo interno de um polígono regular de ${n} lados?`,
      options,
      answer,
      explanation: `a_i = (n − 2) × 180° / n = (${n} − 2) × 180° / ${n} = ${internal}°.`,
    },
    { ...sym, id: 'am3' },
  ];
}

// ===========================================================================
// MODO TREINO LIVRE (quick-quiz): sorteia UMA questão de múltipla escolha de
// um tópico aleatório, cobrindo todas as fases.
// ===========================================================================

/** Converte um passo numérico de equação numa questão de múltipla escolha. */
function stepToQuiz(step: GeneratedEquationStep, unit = ''): GeneratedQuizQuestion {
  const value = step.expected as number;
  const { options, answer } = buildNumericOptions(value, unit, [
    value * 2,
    value + 1,
    Math.max(1, Math.round(value / 2)),
    value + 3,
  ]);
  return { id: step.id, prompt: step.prompt, options, answer, explanation: step.explanation ?? '' };
}

const TRAINING_TOPICS: ReadonlyArray<() => GeneratedQuizQuestion> = [
  () => pick(makeExternalAngleQuizQuestions()),
  () => pick(makeSymmetryAxesQuizQuestions()),
  () => pick(makeAngleMasteryQuizQuestions()),
  () => pick(makePythagorasQuizQuestions()),
  () => pick(makeAngleSumQuizQuestions()),
  () => pick(makePerimeterQuizQuestions()),
  () => {
    const c = makeShapeAreaCase('sa');
    const dims = c.shape === 'quadrado' ? `lado ${c.a} m` : `base ${c.a} m e altura ${c.b} m`;
    return {
      id: 'sa',
      prompt: `${c.title} (${c.formula}), ${dims}. Qual é a área?`,
      options: c.options,
      answer: c.answer,
      explanation: c.explanation,
    };
  },
  () => {
    const perimeter = randInt(4, 12) * 2;
    const apothem = randInt(2, 9);
    const area = (perimeter * apothem) / 2;
    const { options, answer } = buildNumericOptions(area, '', [
      perimeter * apothem,
      perimeter + apothem,
      Math.round(area / 2),
      area + apothem,
    ]);
    return {
      id: 'ap',
      prompt: `Polígono regular com perímetro ${perimeter} e apótema ${apothem}. Qual é a área?`,
      options,
      answer,
      explanation: `Área = (P × a) / 2 = (${perimeter} × ${apothem}) / 2 = ${area}.`,
    };
  },
  () => {
    const a = randInt(2, 6);
    const x = randInt(2, 9);
    const b = randInt(1, 10);
    const { options, answer } = buildNumericOptions(x, '', [x + 1, x - 1, a * x, a + b]);
    return {
      id: 'lin',
      prompt: `Resolva a equação: ${a}x + ${b} = ${a * x + b}. Qual o valor de x?`,
      options,
      answer,
      explanation: `Subtraia ${b}: ${a}x = ${a * x}. Divida por ${a}: x = ${x}.`,
    };
  },
  () => stepToQuiz(makeScaleSteps()[randInt(0, 2)]),
  () => stepToQuiz(makeGeoProbSteps()[randInt(0, 2)]),
  () => stepToQuiz(makePercentAreaSteps()[randInt(0, 2)]),
  () => stepToQuiz(makeTrigRatioSteps()[randInt(0, 2)]),
  () => stepToQuiz(makeTangentSteps()[randInt(1, 2)]),
  () => {
    const edge = randInt(2, 7);
    const { options, answer } = buildNumericOptions(edge ** 3, '', [edge * edge, edge * 3, edge ** 3 + edge, edge ** 2 * 2]);
    return {
      id: 'cube',
      prompt: `Qual é o volume de um cubo de aresta ${edge}?`,
      options,
      answer,
      explanation: `V = a³ = ${edge}³ = ${edge ** 3}.`,
    };
  },
  () => {
    const l = randInt(2, 8);
    const w = randInt(2, 8);
    const h = randInt(2, 8);
    const { options, answer } = buildNumericOptions(l * w * h, '', [l + w + h, l * w, 2 * (l * w + l * h + w * h), l * w * h + l]);
    return {
      id: 'prism',
      prompt: `Um paralelepípedo mede ${l} × ${w} × ${h}. Qual é o volume?`,
      options,
      answer,
      explanation: `V = a × b × c = ${l} × ${w} × ${h} = ${l * w * h}.`,
    };
  },
];

/** Uma questão de treino livre, de tópico sorteado. */
export function makeTrainingQuestion(): GeneratedQuizQuestion {
  return pick(TRAINING_TOPICS)();
}

/** Um bloco de treino livre com `count` questões (tópicos podem repetir). */
export function makeTrainingQuiz(count = 8): GeneratedQuizQuestion[] {
  return Array.from({ length: count }, (_, i) => {
    const q = makeTrainingQuestion();
    return { ...q, id: `tq${i + 1}` };
  });
}

// ===========================================================================
// Missões de quiz "conceituais" agora procedurais (fase 6/8 — otimização,
// embalagem, sistema).
// ===========================================================================

function stringOptions(answer: string, wrongs: string[]): string[] {
  const opts = [answer];
  for (const w of wrongs) {
    if (opts.length >= 4) break;
    if (!opts.includes(w)) opts.push(w);
  }
  return shuffle(opts);
}

/** fase6_m4 (OptimizationChallenge): perímetro fixo -> área máxima = quadrado. */
export function makeOptimizationQuizQuestions(): GeneratedQuizQuestion[] {
  const p = randInt(6, 15) * 4; // múltiplo de 4 -> lado inteiro (side >= 6)
  const side = p / 4;
  const half = p / 2;
  const mid = Math.floor((side - 1) / 2);
  const d1 = randInt(1, Math.max(1, mid));
  const d2 = randInt(mid + 1, side - 1);

  const rectOpt = (a: number, b: number) => `Lados ${a} m e ${b} m (Área = ${a * b} m²)`;

  const wallP = randInt(2, 5) * 4; // 2x + y = wallP, máximo em x = wallP/4 (inteiro)
  const wx = wallP / 4;
  const wy = wallP / 2;
  const wallOpt = (x: number, y: number) => `${x} m (perpendicular) e ${y} m (paralelo ao muro)`;
  const e1 = randInt(1, Math.max(1, wx - 1));

  return [
    {
      id: 'opt1',
      prompt: `Você tem ${p} metros de cerca para um cercado retangular. Qual configuração dá a MAIOR área?`,
      options: stringOptions(rectOpt(side, side), [
        rectOpt(side - d1, half - (side - d1)),
        rectOpt(side - d2, half - (side - d2)),
        rectOpt(1, half - 1),
      ]),
      answer: rectOpt(side, side),
      explanation: `Com perímetro fixo, a área do retângulo é máxima quando ele é um quadrado. Lado = ${p} ÷ 4 = ${side} m, área ${side * side} m².`,
    },
    {
      id: 'opt2',
      prompt: `Uma horta retangular usa um muro como um dos lados. Com ${wallP} m de cerca (2x + y = ${wallP}), quais medidas maximizam a área?`,
      options: stringOptions(wallOpt(wx, wy), [
        wallOpt(wx - e1, wallP - 2 * (wx - e1)),
        wallOpt(wx + e1, wallP - 2 * (wx + e1)),
        wallOpt(1, wallP - 2),
      ]),
      answer: wallOpt(wx, wy),
      explanation: `A área é A = x(${wallP} − 2x), máxima em x = ${wallP} ÷ 4 = ${wx} m, dando y = ${wy} m.`,
    },
    {
      id: 'opt3',
      prompt: 'Para um perímetro fixo, a área de um retângulo é máxima quando ele é...',
      options: shuffle(['um quadrado', 'bem alongado', 'um triângulo', 'o mais fino possível']),
      answer: 'um quadrado',
      explanation: 'Entre todos os retângulos de mesmo perímetro, o quadrado tem a maior área.',
    },
  ];
}

const BOX_CASES: ReadonlyArray<{ volume: number; cube: [number, number, number]; long: [number, number, number] }> = [
  { volume: 24, cube: [2, 3, 4], long: [1, 2, 12] },
  { volume: 36, cube: [3, 3, 4], long: [1, 4, 9] },
  { volume: 48, cube: [3, 4, 4], long: [2, 3, 8] },
  { volume: 60, cube: [3, 4, 5], long: [2, 5, 6] },
  { volume: 72, cube: [4, 3, 6], long: [2, 4, 9] },
];

const surfaceArea = ([a, b, c]: readonly [number, number, number]) => 2 * (a * b + a * c + b * c);

/** fase8_m4 (PackagingOptimizationChallenge): mesmo volume -> menor superfície é a "mais cúbica". */
export function makePackagingQuizQuestions(): GeneratedQuizQuestion[] {
  const build = (id: string): GeneratedQuizQuestion => {
    const c = pick(BOX_CASES);
    const saCube = surfaceArea(c.cube);
    const saLong = surfaceArea(c.long);
    const opt = (label: string, sa: number) => `Caixa ${label} (Área = ${sa} m²)`;
    return {
      id,
      prompt: `Duas caixas têm volume ${c.volume} m³. Caixa A: ${c.cube.join(' × ')} m. Caixa B: ${c.long.join(' × ')} m. Qual gasta MENOS papelão?`,
      options: stringOptions(opt('A', saCube), [
        opt('B', saLong),
        'As duas gastam o mesmo papelão',
        'Impossível dizer sem saber o peso',
      ]),
      answer: opt('A', saCube),
      explanation: `Superfície da A = 2(ab + ac + bc) = ${saCube} m²; da B = ${saLong} m². Formatos mais próximos de um cubo minimizam a área de superfície para um volume dado.`,
    };
  };
  return [build('pk1'), build('pk2'), {
    id: 'pk3',
    prompt: 'Para um mesmo volume, a caixa que gasta menos material (menor área de superfície) é...',
    options: shuffle(['a mais próxima de um cubo', 'a mais comprida e fina', 'a mais alta', 'sempre a de base quadrada, não importa a altura']),
    answer: 'a mais próxima de um cubo',
    explanation: 'Quanto mais "cúbica" a caixa, menor a superfície para o mesmo volume.',
  }];
}

/** fase4_m4 (SystemBlueprintMission): retângulo a partir de perímetro + diferença dos lados. */
export function makeSystemBlueprintQuizQuestions(): GeneratedQuizQuestion[] {
  const y = randInt(3, 9);
  const x = y + randInt(2, 6);
  const perimeter = 2 * (x + y);
  const diff = x - y;
  const area = x * y;

  const areaOpts = buildNumericOptions(area, '', [perimeter, x + y, area + x, Math.round(area / 2)]);

  return [
    {
      id: 'sb1',
      prompt: `Um retângulo tem perímetro ${perimeter} e a diferença entre os lados é ${diff}. Qual sistema representa o problema?`,
      options: stringOptions(`2x + 2y = ${perimeter} e x − y = ${diff}`, [
        `x + y = ${perimeter} e x + y = ${diff}`,
        `2x + y = ${perimeter} e x + y = ${diff}`,
        `x · y = ${perimeter} e x − y = ${diff}`,
      ]),
      answer: `2x + 2y = ${perimeter} e x − y = ${diff}`,
      explanation: `O perímetro dá 2x + 2y = ${perimeter}; a diferença dá x − y = ${diff}.`,
    },
    {
      id: 'sb2',
      prompt: 'Resolvendo o sistema, quais são os lados do retângulo?',
      options: stringOptions(`${x} e ${y}`, [`${x + 1} e ${y - 1}`, `${x - 2} e ${y}`, `${x} e ${y + 2}`]),
      answer: `${x} e ${y}`,
      explanation: `De x − y = ${diff}, x = y + ${diff}. Substituindo no perímetro: 2(y + ${diff}) + 2y = ${perimeter} → y = ${y}, x = ${x}.`,
    },
    {
      id: 'sb3',
      prompt: `Com lados ${x} e ${y}, qual é a área do retângulo?`,
      options: areaOpts.options,
      answer: areaOpts.answer,
      explanation: `Área = x × y = ${x} × ${y} = ${area}.`,
    },
  ];
}
