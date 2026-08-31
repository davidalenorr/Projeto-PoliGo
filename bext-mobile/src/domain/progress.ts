import type { Mission } from '@/src/data/missions';

export function getCurrentPhaseNumber(phaseLabel?: string, maxPhases = Number.POSITIVE_INFINITY): number {
  if (!phaseLabel) {
    return 1;
  }

  const match = phaseLabel.match(/Fase\s*(\d+)/i);
  const parsed = match ? Number(match[1]) : 1;

  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(parsed, maxPhases);
}

export function getCurrentPhaseIndex(phaseLabel?: string, maxPhases = Number.POSITIVE_INFINITY): number {
  return getCurrentPhaseNumber(phaseLabel, maxPhases) - 1;
}

export function getPhaseIdFromNumber(phaseNumber: number): string {
  return `fase${phaseNumber}`;
}

/** "fase3" | "fase3_m2" | "fase3_boss" -> 3 (1 se não reconhecer). */
export function getPhaseNumberFromId(phaseId?: string): number {
  const match = phaseId?.match(/^fase(\d+)/i);
  const parsed = match ? Number(match[1]) : 1;
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

export function getFirstMissionIdForPhase(phaseId: string, missionList: Mission[]): string | undefined {
  const firstMission = missionList.find((mission) => mission.phaseId === phaseId);
  return firstMission?.id;
}
