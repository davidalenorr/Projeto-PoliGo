import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_DETECTIVE_KEY = '@poligo:selectedDetective';

export async function saveSelectedDetectiveId(detectiveId: string): Promise<void> {
  await AsyncStorage.setItem(SELECTED_DETECTIVE_KEY, detectiveId);
}

export async function getSelectedDetectiveId(): Promise<string | null> {
  return AsyncStorage.getItem(SELECTED_DETECTIVE_KEY);
}
