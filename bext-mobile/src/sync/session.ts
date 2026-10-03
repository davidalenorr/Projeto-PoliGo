import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SyncSession } from './types.ts';
import { randomUuidV4 } from './ids.ts';

const SESSION_KEY = '@poligo:syncSession:v1';
const DEVICE_ID_KEY = '@poligo:syncDeviceId:v1';

export function buildSession(
  studentId: string,
  classId: string,
  className: string,
  deviceId: string,
): SyncSession {
  return { studentId, classId, className, deviceId };
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const deviceId = randomUuidV4();
  await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export async function getSession(): Promise<SyncSession | undefined> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as SyncSession;
    if (!parsed || typeof parsed !== 'object' || !parsed.studentId) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export async function saveSession(session: SyncSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
