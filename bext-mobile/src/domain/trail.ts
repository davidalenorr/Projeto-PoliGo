// Estado da trilha "Operação Cidade Nítida" — função pura, testável sem storage.
//
// A partir da lista de ids concluídos (missões normais + `faseN_boss`), monta o
// estado de cada distrito, a patente atual e as medalhas conquistadas.

import { phases } from '../data/phases.ts';
import { missions } from '../data/missions.ts';
import { phaseNarratives } from '../data/narrative.ts';
import {
  bossIdForPhase,
  computeRank,
  countBossesDefeated,
  earnedMedals,
  type Medal,
  type RankStatus,
} from './rank.ts';

export type TrailNodeStatus = 'done' | 'current' | 'locked';

export type TrailNode = {
  phaseId: string;
  number: number;
  title: string;
  subtitle: string;
  district: string;
  bossName: string;
  medal: { emoji: string; name: string };
  missionsDone: number;
  missionsTotal: number;
  /** Todas as missões normais da fase concluídas. */
  missionsComplete: boolean;
  bossDefeated: boolean;
  status: TrailNodeStatus;
};

export type TrailState = {
  nodes: TrailNode[];
  bossesDefeated: number;
  rank: RankStatus;
  medals: Medal[];
  /** Distritos com todas as missões normais concluídas. */
  districtsRestored: number;
  totalPhases: number;
};

export function buildTrail(completedIds: readonly string[]): TrailState {
  const completed = new Set(completedIds);
  const ordered = [...phases].sort((a, b) => a.number - b.number);

  const nodes: TrailNode[] = [];
  let previousComplete = true; // a primeira fase começa desbloqueada
  let currentAssigned = false;

  for (const phase of ordered) {
    const phaseMissionIds = missions.filter((m) => m.phaseId === phase.id).map((m) => m.id);
    const missionsTotal = phaseMissionIds.length;
    const missionsDone = phaseMissionIds.filter((id) => completed.has(id)).length;
    const missionsComplete = missionsTotal > 0 && missionsDone >= missionsTotal;
    const bossDefeated = completed.has(bossIdForPhase(phase.id));
    const narrative = phaseNarratives.find((n) => n.phaseId === phase.id);

    const unlocked = previousComplete;
    let status: TrailNodeStatus;
    if (missionsComplete) {
      status = 'done';
    } else if (unlocked && !currentAssigned) {
      status = 'current';
      currentAssigned = true;
    } else {
      status = 'locked';
    }

    nodes.push({
      phaseId: phase.id,
      number: phase.number,
      title: phase.title,
      subtitle: phase.subtitle,
      district: narrative?.district ?? phase.title,
      bossName: narrative?.bossName ?? 'Chefão',
      medal: narrative?.medal ?? { emoji: '🏅', name: `Selo da ${phase.title}` },
      missionsDone,
      missionsTotal,
      missionsComplete,
      bossDefeated,
      status,
    });

    previousComplete = missionsComplete;
  }

  return {
    nodes,
    bossesDefeated: countBossesDefeated(completedIds),
    rank: computeRank(countBossesDefeated(completedIds)),
    medals: earnedMedals(completedIds),
    districtsRestored: nodes.filter((n) => n.missionsComplete).length,
    totalPhases: nodes.length,
  };
}
