import type { Feather } from '@expo/vector-icons';

export interface TimelineItem {
  id: string;
  name: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  categoryId?: string;
}

export interface SnoozedTopic {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
  snoozedUntil: number; // timestamp en ms
}
