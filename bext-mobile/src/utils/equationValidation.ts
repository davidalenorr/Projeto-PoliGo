export const parseFlexibleNumber = (input: string): number | null => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed === '') return null;

  // Accept fraction like 23/5
  if (/^[-+]?\d+\s*\/\s*\d+$/.test(trimmed)) {
    const [num, den] = trimmed.split('/').map((s) => Number(s.trim()));
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
    return num / den;
  }

  // Accept comma as decimal
  const normalized = trimmed.replace(',', '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
};

export const numbersEqual = (a: number, b: number, tolerance = 1e-6): boolean => {
  return Math.abs(a - b) <= tolerance;
};

export const parsePairInput = (inputX: string, inputY: string): { x: number; y: number } | null => {
  const px = parseFlexibleNumber(inputX);
  const py = parseFlexibleNumber(inputY);
  if (px === null || py === null) return null;
  return { x: px, y: py };
};
