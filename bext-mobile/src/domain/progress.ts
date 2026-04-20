import { Mission } from '@/src/data/missions';

export function getCurrentPhaseNumber(phaseLabel?: string, maxPhases = 5): number {
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

export function getCurrentPhaseIndex(phaseLabel?: string, maxPhases = 5): number {
  return getCurrentPhaseNumber(phaseLabel, maxPhases) - 1;
}

export function getPhaseIdFromNumber(phaseNumber: number): string {
  return `fase${phaseNumber}`;
}

export function getFirstMissionIdForPhase(phaseId: string, missionList: Mission[]): string | undefined {
  const firstMission = missionList.find((mission) => mission.phaseId === phaseId);
  return firstMission?.id;
}
