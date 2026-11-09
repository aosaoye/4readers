import AsyncStorage from '@react-native-async-storage/async-storage';

const keyFor = (uid: string) => `cashbank.reposts.v1.${uid}`;

export async function readRepostIds(uid: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(uid));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function writeRepostIds(uid: string, ids: string[]): Promise<void> {
  await AsyncStorage.setItem(keyFor(uid), JSON.stringify(ids));
}
