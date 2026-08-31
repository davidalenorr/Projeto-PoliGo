import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  accumulateQuickQuiz,
  emptyPracticeStats,
  type PracticeStats,
} from '@/src/domain/practiceStats';

const KEY = '@poligo:practiceStats:v1';

type StatsMap = Record<string, PracticeStats>;

async function readMap(): Promise<StatsMap> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as StatsMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeMap(map: StatsMap): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

export async function getPracticeStats(detectiveId: string): Promise<PracticeStats> {
  const map = await readMap();
  return { ...emptyPracticeStats(), ...(map[detectiveId] ?? {}) };
}

export async function recordQuickQuizResult(
  detectiveId: string,
  correct: number,
  total: number,
): Promise<PracticeStats> {
  const map = await readMap();
  const prev = { ...emptyPracticeStats(), ...(map[detectiveId] ?? {}) };
  const next = accumulateQuickQuiz(prev, correct, total);
  map[detectiveId] = next;
  await writeMap(map);
  return next;
}

export async function clearPracticeStats(detectiveId: string): Promise<void> {
  const map = await readMap();
  delete map[detectiveId];
  await writeMap(map);
}
