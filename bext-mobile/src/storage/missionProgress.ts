import AsyncStorage from '@react-native-async-storage/async-storage';
import { missions, getMissionById, getMissionsByPhaseId } from '@/src/data/missions';
import { phases } from '@/src/data/phases';
import { getDetectives, saveDetectives } from '@/src/storage/detectives';
import { getCurrentPhaseNumber, getPhaseIdFromNumber } from '@/src/domain/progress';
import { bossReward, isBossId, phaseIdForBoss } from '@/src/domain/rank';
import {
  countCompletedInPhase,
  findNextIncompleteMissionId,
  isPhaseComplete,
  orderedPhaseMissionIds,
  phaseCompletionPercent,
} from '@/src/domain/missionRouting';
import { Detective } from '@/src/data/detectives';

type MissionProgressMap = Record<string, string[]>;

const MISSION_PROGRESS_KEY = '@poligo:missionProgress:v1';

async function readProgressMap(): Promise<MissionProgressMap> {
  const raw = await AsyncStorage.getItem(MISSION_PROGRESS_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as MissionProgressMap;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

async function writeProgressMap(map: MissionProgressMap): Promise<void> {
  await AsyncStorage.setItem(MISSION_PROGRESS_KEY, JSON.stringify(map));
}

export async function getCompletedMissionIdsForDetective(detectiveId: string): Promise<string[]> {
  const map = await readProgressMap();
  const list = map[detectiveId] ?? [];
  return Array.from(new Set(list));
}

export async function isMissionCompletedForDetective(detectiveId: string, missionId: string): Promise<boolean> {
  const completed = await getCompletedMissionIdsForDetective(detectiveId);
  return completed.includes(missionId);
}

export async function getNextMissionIdForDetectivePhase(detectiveId: string, phaseId: string): Promise<string | undefined> {
  const completed = await getCompletedMissionIdsForDetective(detectiveId);
  return findNextIncompleteMissionId(orderedPhaseMissionIds(missions, phaseId), completed);
}

export async function completeMissionForDetective(
  detectiveId: string,
  missionId: string
): Promise<{ newlyCompleted: boolean; pointsAwarded?: number }> {
  const map = await readProgressMap();
  const completed = Array.from(new Set(map[detectiveId] ?? []));

  if (completed.includes(missionId)) {
    return { newlyCompleted: false };
  }

  completed.push(missionId);
  map[detectiveId] = completed;
  await writeProgressMap(map);

  // Chefão de fase: não está em missions.ts. Concede Pts fixos por fase e não
  // mexe na fase atual (ela já avançou ao concluir as missões normais).
  if (isBossId(missionId)) {
    const phaseNumber = Number(phaseIdForBoss(missionId).replace('fase', '')) || 1;
    const reward = bossReward(phaseNumber);
    const detectiveList = await getDetectives();
    await saveDetectives(
      detectiveList.map((detective) =>
        detective.id === detectiveId ? { ...detective, points: detective.points + reward } : detective,
      ),
    );
    return { newlyCompleted: true, pointsAwarded: reward };
  }

  const mission = getMissionById(missionId);
  if (!mission) {
    return { newlyCompleted: true };
  }

  const detectiveList = await getDetectives();
  const updatedList = detectiveList.map((detective) => {
    if (detective.id !== detectiveId) {
      return detective;
    }

    const currentPhaseNumber = getCurrentPhaseNumber(detective.phase, phases.length);
    const currentPhaseId = getPhaseIdFromNumber(currentPhaseNumber);
    const missionsInCurrentPhase = getMissionsByPhaseId(currentPhaseId);
    const phaseMissionIds = missionsInCurrentPhase.map((phaseMission) => phaseMission.id);
    const completedInCurrentPhase = countCompletedInPhase(phaseMissionIds, completed);

    const progressValue = missionsInCurrentPhase.length
      ? phaseCompletionPercent(completedInCurrentPhase, missionsInCurrentPhase.length)
      : detective.progress;

    // Advance when all missions in the current phase are completed (robust to rounding)
    const allCompletedInPhase = isPhaseComplete(completedInCurrentPhase, missionsInCurrentPhase.length);
    const shouldAdvance = allCompletedInPhase && currentPhaseNumber < phases.length;
    const nextPhase = phases.find((phaseItem) => phaseItem.number === currentPhaseNumber + 1);

    return {
      ...detective,
      points: detective.points + mission.points,
      progress: shouldAdvance ? 0 : Math.min(progressValue, 100),
      phase:
        shouldAdvance && nextPhase
          ? `Fase ${nextPhase.number}: ${nextPhase.title}`
          : detective.phase,
    };
  });

  await saveDetectives(updatedList);

  return { newlyCompleted: true };
}

export async function syncDetectiveProgress(detectiveId: string): Promise<Detective | undefined> {
  const detectiveList = await getDetectives();
  const detective = detectiveList.find((d) => d.id === detectiveId);
  if (!detective) return undefined;

  const completed = await getCompletedMissionIdsForDetective(detectiveId);
  let currentPhaseNumber = getCurrentPhaseNumber(detective.phase, phases.length);
  let changed = false;
  let updatedPhase = detective.phase;
  let updatedProgress = detective.progress;

  while (currentPhaseNumber < phases.length) {
    const currentPhaseId = getPhaseIdFromNumber(currentPhaseNumber);
    const missionsInCurrentPhase = getMissionsByPhaseId(currentPhaseId);
    
    if (missionsInCurrentPhase.length === 0) {
      break;
    }

    const completedInCurrentPhase = countCompletedInPhase(
      missionsInCurrentPhase.map((m) => m.id),
      completed,
    );

    const allCompletedInPhase = isPhaseComplete(completedInCurrentPhase, missionsInCurrentPhase.length);

    if (allCompletedInPhase) {
      const nextPhase = phases.find((p) => p.number === currentPhaseNumber + 1);
      if (nextPhase) {
        currentPhaseNumber = nextPhase.number;
        updatedPhase = `Fase ${nextPhase.number}: ${nextPhase.title}`;
        updatedProgress = 0;
        changed = true;
      } else {
        break;
      }
    } else {
      const progressValue = Math.round((completedInCurrentPhase / missionsInCurrentPhase.length) * 100);
      if (progressValue !== detective.progress) {
        updatedProgress = progressValue;
        changed = true;
      }
      break;
    }
  }

  if (changed) {
    const updatedList = detectiveList.map((d) => {
      if (d.id === detectiveId) {
        return {
          ...d,
          phase: updatedPhase,
          progress: updatedProgress,
        };
      }
      return d;
    });
    await saveDetectives(updatedList);
    return updatedList.find((d) => d.id === detectiveId);
  }

  return detective;
}

export async function clearDetectiveMissionProgress(detectiveId: string): Promise<void> {
  const map = await readProgressMap();
  delete map[detectiveId];
  await writeProgressMap(map);
}

