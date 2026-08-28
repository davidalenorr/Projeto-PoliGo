import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  advanceStreak,
  dateStringDaysAgo,
  viewStreak,
  type StreakState,
} from '@/src/domain/streak';

export type DetectiveStreak = {
  detectiveId: string;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
};

const STREAK_STORAGE_KEY = '@poligo:detectiveStreaks:v1';

async function readStreakMap(): Promise<Record<string, DetectiveStreak>> {
  const raw = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function writeStreakMap(map: Record<string, DetectiveStreak>): Promise<void> {
  await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(map));
}

function emptyStreak(detectiveId: string): DetectiveStreak {
  return { detectiveId, currentStreak: 0, bestStreak: 0, lastActiveDate: '' };
}

function toState(streak: DetectiveStreak): StreakState {
  return {
    currentStreak: streak.currentStreak,
    bestStreak: streak.bestStreak,
    lastActiveDate: streak.lastActiveDate,
  };
}

export async function getDetectiveStreak(detectiveId: string): Promise<DetectiveStreak> {
  const map = await readStreakMap();
  const existing = map[detectiveId];

  if (!existing) {
    return emptyStreak(detectiveId);
  }

  const next = viewStreak(toState(existing), dateStringDaysAgo(0), dateStringDaysAgo(1));
  return { ...existing, detectiveId, ...next };
}

export async function recordDetectiveActivity(detectiveId: string): Promise<{
  streak: DetectiveStreak;
  streakIncreased: boolean;
}> {
  const map = await readStreakMap();
  const existing = map[detectiveId] ?? emptyStreak(detectiveId);

  const { state, streakIncreased } = advanceStreak(
    toState(existing),
    dateStringDaysAgo(0),
    dateStringDaysAgo(1),
  );

  const updatedStreak: DetectiveStreak = { detectiveId, ...state };

  if (!streakIncreased) {
    return { streak: { ...existing, detectiveId }, streakIncreased: false };
  }

  map[detectiveId] = updatedStreak;
  await writeStreakMap(map);

  return { streak: updatedStreak, streakIncreased: true };
}
