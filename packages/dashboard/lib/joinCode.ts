// Código de entrada da turma: 6 caracteres A-Z/0-9, mesmo formato validado
// no Edge Function join-class (supabase/functions/join-class/index.ts).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem O/0/I/1 — difícil confundir

export function generateJoinCode(rng: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Math.floor(rng() * ALPHABET.length)];
  }
  return code;
}
