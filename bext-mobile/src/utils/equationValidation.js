function parseFlexibleNumber(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  if (/^[-+]?\d+\s*\/\s*\d+$/.test(trimmed)) {
    const parts = trimmed.split('/');
    const num = Number(parts[0].trim());
    const den = Number(parts[1].trim());
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
    return num / den;
  }

  const normalized = trimmed.replace(',', '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function numbersEqual(a, b, tolerance) {
  if (tolerance === undefined) tolerance = 1e-6;
  return Math.abs(a - b) <= tolerance;
}

function parsePairInput(inputX, inputY) {
  const px = parseFlexibleNumber(inputX);
  const py = parseFlexibleNumber(inputY);
  if (px === null || py === null) return null;
  return { x: px, y: py };
}

module.exports = { parseFlexibleNumber, numbersEqual, parsePairInput };
