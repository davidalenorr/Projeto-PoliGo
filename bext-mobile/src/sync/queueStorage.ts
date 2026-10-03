import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QueuedSyncEvent } from './types.ts';

const QUEUE_KEY = '@poligo:syncQueue:v1';

export async function getQueue(): Promise<QueuedSyncEvent[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveQueue(queue: QueuedSyncEvent[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}
