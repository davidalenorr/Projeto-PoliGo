// Lógica pura de roteamento/progresso de missões — sem I/O, para ser testável.
// A camada de storage (src/storage/missionProgress.ts) usa estas funções.

type MissionLike = { id: string; phaseId: string };

/** Ids das missões de uma fase, na ordem em que aparecem em `missions`. */
export function orderedPhaseMissionIds(allMissions: MissionLike[], phaseId: string): string[] {
  return allMissions.filter((mission) => mission.phaseId === phaseId).map((mission) => mission.id);
}

/** Primeira missão da fase que ainda não foi concluída (ou undefined se todas foram). */
export function findNextIncompleteMissionId(
  phaseMissionIds: string[],
  completedIds: string[],
): string | undefined {
  const done = new Set(completedIds);
  return phaseMissionIds.find((id) => !done.has(id));
}

/** Percentual concluído (0–100, arredondado). Fase sem missões -> 0. */
export function phaseCompletionPercent(completedCount: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((completedCount / total) * 100);
}

/** Verdadeiro quando todas as missões da fase foram concluídas. */
export function isPhaseComplete(completedCount: number, total: number): boolean {
  return total > 0 && completedCount >= total;
}

/** Quantas das missões concluídas pertencem a este conjunto de missões da fase. */
export function countCompletedInPhase(phaseMissionIds: string[], completedIds: string[]): number {
  const inPhase = new Set(phaseMissionIds);
  return completedIds.filter((id) => inPhase.has(id)).length;
}
