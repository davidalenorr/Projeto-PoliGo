import AsyncStorage from '@react-native-async-storage/async-storage';
import { shopItems, ShopItem } from '@/src/data/shopItems';
import { getDetectives, saveDetectives } from '@/src/storage/detectives';

const UNLOCKED_ITEMS_KEY = '@poligo:unlockedShopItems:v1';
const EQUIPPED_ITEMS_KEY = '@poligo:equippedShopItems:v1';

type UnlockedMap = Record<string, string[]>; // detectiveId -> itemId[]
type EquippedMap = Record<string, { avatarId?: string; borderId?: string }>; // detectiveId -> equipped

async function readUnlockedMap(): Promise<UnlockedMap> {
  const raw = await AsyncStorage.getItem(UNLOCKED_ITEMS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function writeUnlockedMap(map: UnlockedMap): Promise<void> {
  await AsyncStorage.setItem(UNLOCKED_ITEMS_KEY, JSON.stringify(map));
}

async function readEquippedMap(): Promise<EquippedMap> {
  const raw = await AsyncStorage.getItem(EQUIPPED_ITEMS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function writeEquippedMap(map: EquippedMap): Promise<void> {
  await AsyncStorage.setItem(EQUIPPED_ITEMS_KEY, JSON.stringify(map));
}

export async function getUnlockedItemIds(detectiveId: string): Promise<string[]> {
  const map = await readUnlockedMap();
  const list = map[detectiveId] || [];
  // Free items are unlocked by default
  const defaultFreeIds = shopItems.filter((item) => item.cost === 0).map((item) => item.id);
  return Array.from(new Set([...defaultFreeIds, ...list]));
}

export async function getEquippedItems(detectiveId: string): Promise<{ avatarId: string; borderId: string }> {
  const map = await readEquippedMap();
  const equipped = map[detectiveId] || {};
  return {
    avatarId: equipped.avatarId || 'avatar-classic',
    borderId: equipped.borderId || 'border-default',
  };
}

export async function buyShopItem(
  detectiveId: string,
  itemId: string
): Promise<{ success: boolean; message: string; newPoints?: number }> {
  const item = shopItems.find((i) => i.id === itemId);
  if (!item) {
    return { success: false, message: 'Item não encontrado.' };
  }

  const unlocked = await getUnlockedItemIds(detectiveId);
  if (unlocked.includes(itemId)) {
    return { success: false, message: 'Você já possui este item!' };
  }

  const detectives = await getDetectives();
  const detective = detectives.find((d) => d.id === detectiveId);
  if (!detective) {
    return { success: false, message: 'Detetive não encontrado.' };
  }

  if (detective.points < item.cost) {
    return { success: false, message: `Pontos insuficientes. Você precisa de ${item.cost} Pts.` };
  }

  // Deduct points
  const updatedPoints = detective.points - item.cost;
  const updatedDetectives = detectives.map((d) => {
    if (d.id === detectiveId) {
      const updatedObj = { ...d, points: updatedPoints };
      // If buying an avatar, optionally sync avatarBg/color
      if (item.category === 'avatar' && item.avatarBg) {
        updatedObj.avatarBg = item.avatarBg;
        if (item.avatarColor) updatedObj.avatarColor = item.avatarColor;
      }
      return updatedObj;
    }
    return d;
  });

  await saveDetectives(updatedDetectives);

  // Save to unlocked map
  const unlockedMap = await readUnlockedMap();
  unlockedMap[detectiveId] = Array.from(new Set([...(unlockedMap[detectiveId] || []), itemId]));
  await writeUnlockedMap(unlockedMap);

  // Auto-equip bought item
  await equipShopItem(detectiveId, itemId);

  return {
    success: true,
    message: `Você desbloqueou "${item.name}"!`,
    newPoints: updatedPoints,
  };
}

export async function equipShopItem(detectiveId: string, itemId: string): Promise<void> {
  const item = shopItems.find((i) => i.id === itemId);
  if (!item) return;

  const equippedMap = await readEquippedMap();
  const current = equippedMap[detectiveId] || { avatarId: 'avatar-classic', borderId: 'border-default' };

  if (item.category === 'avatar') {
    current.avatarId = itemId;
    // Also update avatarBg in detective object
    const detectives = await getDetectives();
    const updatedList = detectives.map((d) => {
      if (d.id === detectiveId && item.avatarBg) {
        return {
          ...d,
          avatarBg: item.avatarBg,
          avatarColor: item.avatarColor || d.avatarColor,
        };
      }
      return d;
    });
    await saveDetectives(updatedList);
  } else if (item.category === 'border') {
    current.borderId = itemId;
  }

  equippedMap[detectiveId] = current;
  await writeEquippedMap(equippedMap);
}
