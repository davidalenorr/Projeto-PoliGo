import AsyncStorage from '@react-native-async-storage/async-storage';
import { missions, getMissionById, getMissionsByPhaseId } from '@/src/data/missions';
import { phases } from '@/src/data/phases';
import { getDetectives, saveDetectives } from '@/src/storage/detectives';
import { getCurrentPhaseNumber, getPhaseIdFromNumber } from '@/src/domain/progress';

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
  const phaseMissionIds = missions.filter((mission) => mission.phaseId === phaseId).map((mission) => mission.id);

  return phaseMissionIds.find((missionId) => !completed.includes(missionId));
}

export async function completeMissionForDetective(
  detectiveId: string,
  missionId: string
): Promise<{ newlyCompleted: boolean }> {
  const map = await readProgressMap();
  const completed = Array.from(new Set(map[detectiveId] ?? []));

  if (completed.includes(missionId)) {
    return { newlyCompleted: false };
  }

  completed.push(missionId);
  map[detectiveId] = completed;
  await writeProgressMap(map);

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
    const completedInCurrentPhase = completed.filter((id) =>
      missionsInCurrentPhase.some((phaseMission) => phaseMission.id === id)
    ).length;

    const progressValue = missionsInCurrentPhase.length
      ? Math.round((completedInCurrentPhase / missionsInCurrentPhase.length) * 100)
      : detective.progress;

    const shouldAdvance = progressValue >= 100 && currentPhaseNumber < phases.length;
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
