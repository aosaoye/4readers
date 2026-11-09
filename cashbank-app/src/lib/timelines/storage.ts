import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SnoozedTopic, TimelineItem } from './types';

export const PINNED_TIMELINES_STORAGE_KEY = 'cashbank_pinned_timelines_v1';
export const SNOOZED_TOPICS_STORAGE_KEY = 'cashbank_snoozed_topics_v1';

export const DEFAULT_PINNED_TIMELINES: TimelineItem[] = [
  { id: 'futbol', name: 'Fútbol', subtitle: 'Tema', icon: 'dribbble' },
  { id: 'ciencia', name: 'Ciencia', subtitle: 'Tema', icon: 'aperture' },
];

export const ALL_SYSTEM_TOPICS: TimelineItem[] = [
  { id: 'futbol', name: 'Fútbol', subtitle: 'Tema', icon: 'dribbble' },
  { id: 'ciencia', name: 'Ciencia', subtitle: 'Tema', icon: 'aperture' },
  { id: 'bolsa-economia', name: 'Bolsa y economía', subtitle: 'Tema', icon: 'trending-up' },
  { id: 'politica', name: 'Política', subtitle: 'Tema', icon: 'archive' },
  { id: 'noticias-iran', name: 'Conflicto en Irán', subtitle: 'Tema', icon: 'globe' },
  { id: 'deportes', name: 'Deportes', subtitle: 'Tema', icon: 'disc' },
  { id: 'negocios-finanzas', name: 'Negocios y finanzas', subtitle: 'Tema', icon: 'briefcase' },
  { id: 'tecnologia', name: 'Tecnología', subtitle: 'Tema', icon: 'cpu' },
  { id: 'peliculas-tv', name: 'Películas y TV', subtitle: 'Tema', icon: 'video' },
  { id: 'arte', name: 'Arte', subtitle: 'Tema', icon: 'image' },
  { id: 'inteligencia-artificial', name: 'Inteligencia artificial', subtitle: 'Tema', icon: 'zap' },
  { id: 'juegos', name: 'Juegos', subtitle: 'Tema', icon: 'play-circle' },
  { id: 'criptomonedas', name: 'Criptomonedas', subtitle: 'Tema', icon: 'dollar-sign' },
  { id: 'videos', name: 'Videos', subtitle: 'Tema', icon: 'video' },
];

export async function loadPinnedTimelines(): Promise<TimelineItem[]> {
  try {
    const raw = await AsyncStorage.getItem(PINNED_TIMELINES_STORAGE_KEY);
    if (raw === null) return DEFAULT_PINNED_TIMELINES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const clean = parsed.filter(
        (t) =>
          t &&
          typeof t.id === 'string' &&
          t.id !== 'for-you' &&
          t.id !== 'following' &&
          Boolean(t.name)
      );
      return clean;
    }
    return DEFAULT_PINNED_TIMELINES;
  } catch {
    return DEFAULT_PINNED_TIMELINES;
  }
}

export async function savePinnedTimelines(items: TimelineItem[]): Promise<void> {
  try {
    const clean = (items ?? []).filter(
      (t) =>
        t &&
        typeof t.id === 'string' &&
        t.id !== 'for-you' &&
        t.id !== 'following' &&
        Boolean(t.name)
    );
    await AsyncStorage.setItem(PINNED_TIMELINES_STORAGE_KEY, JSON.stringify(clean));
  } catch {}
}

export async function loadSnoozedTopics(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(SNOOZED_TOPICS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const now = Date.now();
    const valid: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'number' && v > now) {
        valid[k] = v;
      }
    }
    return valid;
  } catch {
    return {};
  }
}

export async function saveSnoozedTopics(topics: Record<string, number>): Promise<void> {
  try {
    await AsyncStorage.setItem(SNOOZED_TOPICS_STORAGE_KEY, JSON.stringify(topics));
  } catch {}
}
