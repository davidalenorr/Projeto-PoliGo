// Patente do detetive e medalhas — funções puras, testáveis sem storage/RN.
//
// A patente sobe conforme o número de CHEFÕES derrotados (um por fase).
// As medalhas vêm da narrativa (uma por chefão derrotado).

// Import relativo com extensão .ts: resolve no Metro/tsc e no runner nativo do Node.
import { phaseNarratives, type PhaseNarrative } from '../data/narrative.ts';

// --- Convenção de id do chefão -------------------------------------------------

/** id da missão de chefão de uma fase: "fase3" -> "fase3_boss". */
export function bossIdForPhase(phaseId: string): string {
  return `${phaseId}_boss`;
}

/** "fase3_boss" -> "fase3". */
export function phaseIdForBoss(bossId: string): string {
  return bossId.replace(/_boss$/, '');
}

/** true para ids no formato "faseN_boss". */
export function isBossId(id: string): boolean {
  return /^fase\d+_boss$/.test(id);
}

/** Quantos chefões há na lista de ids concluídos. */
export function countBossesDefeated(completedIds: readonly string[]): number {
  return completedIds.filter(isBossId).length;
}

/** Pts concedidos ao derrotar o chefão da fase N (fase 1 = 50 … fase 10 = 140). */
export function bossReward(phaseNumber: number): number {
  const n = Math.max(1, Math.floor(phaseNumber || 1));
  return 40 + n * 10;
}

// --- Patente -----------------------------------------------------------------

export type Rank = {
  /** Mínimo de chefões derrotados para alcançar esta patente. */
  min: number;
  title: string;
  emoji: string;
  /** Nome de ícone MaterialCommunityIcons para renderização (sem emoji). */
  icon: string;
};

export const RANKS: readonly Rank[] = [
  { min: 0, title: 'Recruta', emoji: '🔰', icon: 'shield-outline' },
  { min: 1, title: 'Detetive Júnior', emoji: '🕵️', icon: 'shield-account' },
  { min: 3, title: 'Detetive', emoji: '🔎', icon: 'shield-half-full' },
  { min: 5, title: 'Investigador-Chefe', emoji: '🧭', icon: 'shield-star' },
  { min: 7, title: 'Mestre Geômetra', emoji: '📐', icon: 'shield-crown' },
  { min: 10, title: 'Lenda da Cidade Nítida', emoji: '🏆', icon: 'trophy' },
];

export type RankStatus = {
  current: Rank;
  next: Rank | null;
  /** Chefões que ainda faltam para a próxima patente (0 se já é a máxima). */
  toNext: number;
  /** Progresso [0..1] dentro da faixa atual rumo à próxima patente. */
  progress: number;
};

export function computeRank(bossesDefeated: number): RankStatus {
  const safe = Math.max(0, Math.floor(bossesDefeated));

  let current = RANKS[0];
  for (const rank of RANKS) {
    if (safe >= rank.min) {
      current = rank;
    }
  }

  const next = RANKS.find((rank) => rank.min > current.min) ?? null;

  if (!next) {
    return { current, next: null, toNext: 0, progress: 1 };
  }

  const span = next.min - current.min;
  const done = safe - current.min;
  return {
    current,
    next,
    toNext: Math.max(0, next.min - safe),
    progress: span > 0 ? Math.min(1, Math.max(0, done / span)) : 0,
  };
}

// --- Medalhas --------------------------------------------------------------------

export type Medal = {
  phaseId: string;
  emoji: string;
  name: string;
  /** Nome do chefão cuja derrota concede a medalha. */
  bossName: string;
};

/** Medalhas conquistadas a partir dos ids concluídos (chefões derrotados). */
export function earnedMedals(
  completedIds: readonly string[],
  narratives: readonly PhaseNarrative[] = phaseNarratives,
): Medal[] {
  const defeated = new Set(completedIds.filter(isBossId).map(phaseIdForBoss));
  return narratives
    .filter((entry) => defeated.has(entry.phaseId))
    .map((entry) => ({
      phaseId: entry.phaseId,
      emoji: entry.medal.emoji,
      name: entry.medal.name,
      bossName: entry.bossName,
    }));
}

/** Total de medalhas possíveis (uma por fase). */
export const TOTAL_MEDALS = phaseNarratives.length;
