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
