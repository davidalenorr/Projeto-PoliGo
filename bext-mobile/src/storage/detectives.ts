import AsyncStorage from '@react-native-async-storage/async-storage';
import { Detective, defaultDetectives } from '@/src/data/detectives';

const DETECTIVES_KEY = '@poligo:detectives';
const MIGRATION_ONLY_DAVID_V1_KEY = '@poligo:migration:onlyDavid:v1';
const AVATAR_PALETTE = ['#2F84B0', '#F6C131', '#5A67D8', '#0E9F6E', '#D97706', '#DB2777'];

function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function buildAvatar(name: string): string {
  return name.charAt(0).toUpperCase();
}

function buildPalette(index: number): { avatarBg: string; avatarColor?: string } {
  const avatarBg = AVATAR_PALETTE[index % AVATAR_PALETTE.length];

  if (avatarBg === '#F6C131') {
    return { avatarBg, avatarColor: '#111827' };
  }

  return { avatarBg };
}

function normalizeDetective(detective: Detective): Detective {
  return {
    ...detective,
    points: typeof detective.points === 'number' ? detective.points : 0,
    progress: typeof detective.progress === 'number' ? detective.progress : 0,
    phase: detective.phase || 'Fase 1: Detetive das Formas',
  };
}

function buildResetDavid(existing?: Detective): Detective {
  return {
    id: 'david',
    name: 'David',
    phase: 'Fase 1: Detetive das Formas',
    points: 0,
    progress: 0,
    avatar: existing?.avatar || 'D',
    avatarBg: existing?.avatarBg || '#2F84B0',
    avatarColor: existing?.avatarColor,
  };
}

async function applyOnlyDavidMigration(list: Detective[]): Promise<Detective[]> {
  const existingDavid = list.find((item) => {
    const name = item.name?.trim().toLowerCase();
    return item.id === 'david' || name === 'david';
  });

  const resetList = [buildResetDavid(existingDavid)];
  await saveDetectives(resetList);
  await AsyncStorage.setItem(MIGRATION_ONLY_DAVID_V1_KEY, 'done');

  return resetList;
}

export async function saveDetectives(list: Detective[]): Promise<void> {
  await AsyncStorage.setItem(DETECTIVES_KEY, JSON.stringify(list));
}

export async function getDetectives(): Promise<Detective[]> {
  const raw = await AsyncStorage.getItem(DETECTIVES_KEY);
  const migrationDone = await AsyncStorage.getItem(MIGRATION_ONLY_DAVID_V1_KEY);

  if (!raw) {
    await saveDetectives(defaultDetectives);
    return migrationDone ? defaultDetectives : applyOnlyDavidMigration(defaultDetectives);
  }

  try {
    const parsed = JSON.parse(raw) as Detective[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      await saveDetectives(defaultDetectives);
      return migrationDone ? defaultDetectives : applyOnlyDavidMigration(defaultDetectives);
    }

    const normalized = parsed.map((item) => normalizeDetective(item));

    if (!migrationDone) {
      return applyOnlyDavidMigration(normalized);
    }

    return normalized;
  } catch {
    await saveDetectives(defaultDetectives);
    return migrationDone ? defaultDetectives : applyOnlyDavidMigration(defaultDetectives);
  }
}

export async function createDetective(nameInput: string): Promise<Detective> {
  const name = sanitizeName(nameInput);

  if (name.length < 3) {
    throw new Error('Nome invalido');
  }

  const currentList = await getDetectives();
  const palette = buildPalette(currentList.length);

  const detective: Detective = {
    id: `det-${Date.now()}`,
    name,
    phase: 'Fase 1: Detetive das Formas',
    points: 0,
    progress: 0,
    avatar: buildAvatar(name),
    ...palette,
  };

  const updated = [...currentList, detective];
  await saveDetectives(updated);

  return detective;
}
