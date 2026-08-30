// Tokens do tema "Blueprint" — fonte única da paleta do app.
//
// O app inteiro usa um tema CLARO de "planta baixa de detetive": fundo cinza
// claro, cards brancos, azul #0B5F8F como cor de marca. Telas novas devem
// puxar destes tokens em vez de repetir hex solto.
//
// Navy (`bossInk`) é acento pontual — só em pílulas/faixas pequenas ligadas
// ao vilão, nunca como fundo de tela.

import { colors } from './colors';

export const theme = {
  // superfícies
  screenBg: '#D8D8DB',
  card: '#FFFFFF',
  cardAlt: '#F8FBFF', // card levemente azulado (comum nas telas de fase)
  cardBorder: '#D5E2ED',
  tintSoft: '#EEF6FF', // realce/chip claro
  tintSoftBorder: '#C9DEEF',

  // texto
  heading: '#0D3D66',
  headingStrong: '#1F3E66',
  accent: '#0B5F8F', // azul "blueprint" principal
  body: '#334155',
  bodyMuted: '#607287',
  onAccent: '#FFFFFF',

  // estados
  success: '#166534',
  successBg: '#EAF9EE',
  successBorder: '#A8E0BA',
  danger: '#B91C1C',
  dangerBg: '#FEF2F2',
  locked: '#94A3B8',

  // acentos especiais (uso parcimonioso)
  bossInk: '#1E1B4B', // navy do vilão — só em pílula/faixa pequena
  onBossInk: '#EEF2FF',
  hp: '#DC2626', // barra de vida do chefão
  hpTrack: '#FEE2E2',
  medalGold: '#B45309',
  medalBg: '#FEF9C3',
  medalBorder: '#FDE047',
} as const;

export { colors };
