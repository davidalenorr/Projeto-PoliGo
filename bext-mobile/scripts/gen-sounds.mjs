// Sintetizador dos efeitos sonoros do feedback das missões.
//
//   npm run sounds     (na pasta bext-mobile)
//
// Gera 4 arquivos .wav em assets/sounds/ (16-bit PCM mono, 44.1 kHz), sem
// nenhuma dependência. Para trocar por sons próprios, basta substituir os
// arquivos mantendo os nomes — ou ajustar os parâmetros abaixo e rodar de novo.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const TAU = Math.PI * 2;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');
mkdirSync(OUT, { recursive: true });

// ---------- notas ----------
const NOTE = (semisFromA4) => 440 * Math.pow(2, semisFromA4 / 12);
const N = {
  C3: NOTE(-21), G3: NOTE(-14),
  C4: NOTE(-9), D4: NOTE(-7), E4: NOTE(-5), F4: NOTE(-4), G4: NOTE(-2), A4: NOTE(0),
  C5: NOTE(3), D5: NOTE(5), E5: NOTE(7), G5: NOTE(10), A5: NOTE(12),
  C6: NOTE(15), E6: NOTE(19), G6: NOTE(22),
};

// ---------- buffer ----------
class Buf {
  constructor(seconds) {
    this.data = new Float32Array(Math.max(1, Math.ceil(seconds * SR)));
  }
  get length() {
    return this.data.length;
  }
  add(i, v) {
    if (i >= 0 && i < this.data.length) this.data[i] += v;
  }
  /** mistura `other` neste buffer com ganho e deslocamento (segundos). */
  mix(other, gain = 1, offsetSec = 0) {
    const off = Math.round(offsetSec * SR);
    for (let i = 0; i < other.length; i++) this.add(i + off, other.data[i] * gain);
    return this;
  }
}

// ---------- envelope ADSR (segundos) ----------
function adsr(t, { a = 0.005, d = 0.05, s = 0.6, r = 0.1, dur }) {
  if (t < 0 || t >= dur) return 0;
  const sustainEnd = Math.max(a + d, dur - r);
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < sustainEnd) return s;
  return s * (1 - (t - sustainEnd) / (dur - sustainEnd));
}

// ---------- oscilador aditivo (fundamental + harmônicos com decaimento próprio) ----------
// harmonics: [ratio, amp, decayRate]  ·  f1: alvo de varredura exponencial (opcional)
// vibrato: profundidade em cents  ·  env: {a,d,s,r} ou omitido (usa `decay` exp)
function tone({ f0, f1, dur, harmonics = [[1, 1, 4]], env, vibrato = 0, vibratoRate = 6, decay = 4 }) {
  const buf = new Buf(dur + 0.03);
  const total = Math.min(buf.length, Math.floor((dur + 0.03) * SR));
  const phases = harmonics.map(() => 0);
  for (let i = 0; i < total; i++) {
    const t = i / SR;
    const frac = Math.min(1, t / dur);
    const base = f1 ? f0 * Math.pow(f1 / f0, frac) : f0;
    const vib = vibrato ? Math.pow(2, (vibrato / 1200) * Math.sin(TAU * vibratoRate * t)) : 1;
    let s = 0;
    for (let h = 0; h < harmonics.length; h++) {
      const [ratio, amp, hdec] = harmonics[h];
      phases[h] += (TAU * base * ratio * vib) / SR;
      s += amp * Math.exp(-hdec * t) * Math.sin(phases[h]);
    }
    const e = env ? adsr(t, { ...env, dur }) : Math.exp(-decay * t);
    buf.data[i] = s * e;
  }
  return buf;
}

// ---------- ruído filtrado (transiente de "clique"/"impacto") ----------
function noise({ dur, lp = 0.3, decay = 40 }) {
  const buf = new Buf(dur + 0.01);
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    y += lp * (Math.random() * 2 - 1 - y);
    buf.data[i] = y * Math.exp(-decay * t);
  }
  return buf;
}

// ---------- reverb curto (FIR: alguns ecos decrescentes — estável) ----------
function reverb(dry, { mix = 0.15 } = {}) {
  const taps = [
    [0.019, 0.55], [0.031, 0.4], [0.047, 0.3], [0.067, 0.21], [0.097, 0.13], [0.139, 0.08],
  ];
  const maxTail = taps[taps.length - 1][0];
  const out = new Buf(dry.length / SR + maxTail + 0.05);
  for (let i = 0; i < dry.length; i++) out.data[i] += dry.data[i];
  for (const [time, g] of taps) {
    const d = Math.round(time * SR);
    for (let i = 0; i < dry.length; i++) out.add(i + d, dry.data[i] * mix * g);
  }
  return out;
}

// ---------- masterização: trim, normalização, soft-clip, fades ----------
function master(buf, { peak = 0.9, fadeIn = 0.003, fadeOut = 0.02 } = {}) {
  let end = buf.length;
  while (end > 1 && Math.abs(buf.data[end - 1]) < 8e-5) end--;
  const out = Float32Array.prototype.slice.call(buf.data, 0, end + Math.round(0.004 * SR));

  let max = 0;
  for (const v of out) max = Math.max(max, Math.abs(v));
  const g = max > 0 ? peak / max : 1;
  const fi = Math.max(1, Math.round(fadeIn * SR));
  const fo = Math.max(1, Math.round(fadeOut * SR));
  const norm = Math.tanh(1.2);
  for (let i = 0; i < out.length; i++) {
    let v = Math.tanh(out[i] * g * 1.2) / norm;
    if (i < fi) v *= i / fi;
    if (i > out.length - fo) v *= (out.length - i) / fo;
    out[i] = v;
  }
  return out;
}

// ---------- WAV 16-bit PCM mono ----------
function toWav(samples) {
  const pcm = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    pcm.writeInt16LE((v < 0 ? v * 32768 : v * 32767) | 0, i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

// timbre "sino" reutilizável (acerto / conclusão)
const bell = (freq, dur, bright = 1) =>
  tone({
    f0: freq,
    dur,
    harmonics: [
      [1, 1, 4.2],
      [2, 0.5 * bright, 6],
      [3, 0.22 * bright, 8.5],
      [4.2, 0.1 * bright, 11],
      [5.4, 0.04 * bright, 14],
    ],
    env: { a: 0.002, d: 0.03, s: 0.32, r: 0.2 },
  });

// timbre "sopro" oco (erro suave) — só harmônicos ímpares
const reed = (f0, f1, dur) =>
  tone({
    f0,
    f1,
    dur,
    harmonics: [[1, 1, 5], [3, 0.2, 9], [5, 0.07, 13]],
    env: { a: 0.004, d: 0.04, s: 0.5, r: 0.13 },
  });

// =====================================================================
// 1) tap — toque leve de seleção (~50 ms)
// =====================================================================
const tap = new Buf(0.06)
  .mix(tone({ f0: 1180, f1: 900, dur: 0.026, harmonics: [[1, 1, 60], [2, 0.28, 90]], decay: 60 }), 0.85)
  .mix(noise({ dur: 0.005, lp: 0.6, decay: 120 }), 0.12);

// =====================================================================
// 2) correct — acerto: arpejo maior C5-E5-G5, tipo carrilhão (~360 ms)
// =====================================================================
let correct = new Buf(0.42);
correct.mix(bell(N.C5, 0.28), 0.5, 0.0);
correct.mix(bell(N.E5, 0.28), 0.5, 0.055);
correct.mix(bell(N.G5, 0.34, 1.15), 0.62, 0.11);
correct = reverb(correct, { mix: 0.13 });

// =====================================================================
// 3) wrong — erro suave: terça menor descendente E4 -> C4, timbre oco (~260 ms)
//    deliberadamente discreto: não é um "buzzer" agressivo.
// =====================================================================
let wrong = new Buf(0.32);
wrong.mix(reed(N.E4, N.E4 * 0.985, 0.12), 0.45, 0.0);
wrong.mix(reed(N.C4, N.C4 * 0.97, 0.19), 0.5, 0.09);
wrong = reverb(wrong, { mix: 0.09 });

// =====================================================================
// 4) complete — conclusão: fanfarra C5-E5-G5-C6 + acorde final sustentado (~850 ms)
// =====================================================================
let complete = new Buf(1.0);
complete.mix(tone({ f0: N.C3, dur: 0.28, harmonics: [[1, 1, 8], [2, 0.3, 11]], decay: 8 }), 0.3, 0.0); // corpo grave
[
  [N.C5, 0.0],
  [N.E5, 0.07],
  [N.G5, 0.14],
  [N.C6, 0.21],
].forEach(([f, off]) => complete.mix(bell(f, 0.22, 1.1), 0.46, off));
// acorde final (C6 + G5 + E5) com leve vibrato e cauda longa
complete.mix(
  tone({ f0: N.C6, dur: 0.5, harmonics: [[1, 1, 2.3], [2, 0.4, 3.6], [3, 0.14, 5]], env: { a: 0.005, d: 0.05, s: 0.6, r: 0.32 }, vibrato: 14, vibratoRate: 5.5 }),
  0.36,
  0.3,
);
complete.mix(
  tone({ f0: N.G5, dur: 0.5, harmonics: [[1, 1, 2.5], [2, 0.32, 4]], env: { a: 0.005, d: 0.05, s: 0.55, r: 0.32 } }),
  0.28,
  0.3,
);
complete.mix(
  tone({ f0: N.E5, dur: 0.46, harmonics: [[1, 1, 2.7]], env: { a: 0.005, d: 0.05, s: 0.5, r: 0.3 } }),
  0.2,
  0.3,
);
complete = reverb(complete, { mix: 0.17 });

// =====================================================================
const files = {
  'tap.wav': master(tap, { peak: 0.7, fadeOut: 0.012 }),
  'correct.wav': master(correct, { peak: 0.9 }),
  'wrong.wav': master(wrong, { peak: 0.66, fadeOut: 0.03 }),
  'complete.wav': master(complete, { peak: 0.95, fadeOut: 0.04 }),
};

for (const [name, samples] of Object.entries(files)) {
  const buf = toWav(samples);
  writeFileSync(join(OUT, name), buf);
  console.log(`${name.padEnd(14)} ${(samples.length / SR).toFixed(2)}s  ${(buf.length / 1024).toFixed(1)} KB`);
}
