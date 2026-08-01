import AsyncStorage from '@react-native-async-storage/async-storage';

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

function getTodayString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getDetectiveStreak(detectiveId: string): Promise<DetectiveStreak> {
  const map = await readStreakMap();
  const existing = map[detectiveId];

  if (!existing) {
    return {
      detectiveId,
      currentStreak: 0,
      bestStreak: 0,
      lastActiveDate: '',
    };
  }

  const today = getTodayString();
  const yesterday = getYesterdayString();

  // If last active was before yesterday, the active streak has reset to 0 (until they complete an action today)
  if (existing.lastActiveDate !== today && existing.lastActiveDate !== yesterday) {
    return {
      ...existing,
      currentStreak: 0,
    };
  }

  return existing;
}

export async function recordDetectiveActivity(detectiveId: string): Promise<{
  streak: DetectiveStreak;
  streakIncreased: boolean;
}> {
  const map = await readStreakMap();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  const existing = map[detectiveId] || {
    detectiveId,
    currentStreak: 0,
    bestStreak: 0,
    lastActiveDate: '',
  };

  if (existing.lastActiveDate === today) {
    // Already active today, streak doesn't increase further today
    return { streak: existing, streakIncreased: false };
  }

  let newCurrentStreak = 1;
  if (existing.lastActiveDate === yesterday) {
    newCurrentStreak = existing.currentStreak + 1;
  }

  const newBestStreak = Math.max(existing.bestStreak, newCurrentStreak);

  const updatedStreak: DetectiveStreak = {
    detectiveId,
    currentStreak: newCurrentStreak,
    bestStreak: newBestStreak,
    lastActiveDate: today,
  };

  map[detectiveId] = updatedStreak;
  await writeStreakMap(map);

  return { streak: updatedStreak, streakIncreased: true };
}
