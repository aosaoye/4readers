import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Post } from '@/api/types';

/**
 * "Guardados" (For Later): la API no tiene favoritos, así que viven en el dispositivo.
 * Guardamos una copia del artículo para poder leerlo sin conexión. Se separan por usuario.
 */
export type Bookmark = Post & { savedAt: number };
export const storageKey = (uid: string) => `cashbank.bookmarks.v1.${uid}`;

export async function loadBookmarks(uid: string): Promise<Bookmark[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(uid));
    return raw ? (JSON.parse(raw) as Bookmark[]) : [];
  } catch {
    return [];
  }
}
