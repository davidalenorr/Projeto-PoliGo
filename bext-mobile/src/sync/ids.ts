// Gerador de id no formato UUID v4 (sem dependência nova — o servidor só
// confere o formato, não exige CSPRNG). `rng` injetável para testes.
export function randomUuidV4(rng: () => number = Math.random): string {
  const hex: string[] = [];
  for (let i = 0; i < 16; i++) {
    hex.push(Math.floor(rng() * 256).toString(16).padStart(2, '0'));
  }

  hex[6] = ((parseInt(hex[6], 16) & 0x0f) | 0x40).toString(16).padStart(2, '0');
  hex[8] = ((parseInt(hex[8], 16) & 0x3f) | 0x80).toString(16).padStart(2, '0');

  const s = hex.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
}
