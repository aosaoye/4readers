import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DEFAULT_PINNED_TIMELINES,
  loadPinnedTimelines,
  savePinnedTimelines,
} from './storage';
import type { TimelineItem } from './types';

const PINNED_QUERY_KEY = ['pinned_timelines'];

export function usePinnedTimelines() {
  const qc = useQueryClient();

  const query = useQuery<TimelineItem[]>({
    queryKey: PINNED_QUERY_KEY,
    queryFn: loadPinnedTimelines,
    initialData: DEFAULT_PINNED_TIMELINES,
  });

  const saveMutation = useMutation({
    mutationFn: async (items: TimelineItem[]) => {
      await savePinnedTimelines(items);
      return items;
    },
    onSuccess: (items) => {
      qc.setQueryData(PINNED_QUERY_KEY, items);
    },
  });

  const pin = (item: TimelineItem) => {
    if (!item || !item.id || item.id === 'for-you' || item.id === 'following') return;
    const current = query.data ?? [];
    if (current.some((t) => t.id === item.id)) return;
    const next = [...current, item];
    saveMutation.mutate(next);
  };

  const unpin = (id: string) => {
    const current = query.data ?? [];
    const next = current.filter((t) => t && t.id !== id);
    saveMutation.mutate(next);
  };

  const reorder = (items: TimelineItem[]) => {
    const clean = (items ?? []).filter(
      (t) => t && t.id && t.id !== 'for-you' && t.id !== 'following' && Boolean(t.name)
    );
    saveMutation.mutate(clean);
  };

  const moveUp = (index: number) => {
    const current = [...(query.data ?? [])];
    if (index <= 0 || index >= current.length) return;
    const temp = current[index - 1];
    current[index - 1] = current[index];
    current[index] = temp;
    saveMutation.mutate(current);
  };

  const moveDown = (index: number) => {
    const current = [...(query.data ?? [])];
    if (index < 0 || index >= current.length - 1) return;
    const temp = current[index + 1];
    current[index + 1] = current[index];
    current[index] = temp;
    saveMutation.mutate(current);
  };

  return {
    timelines: (query.data ?? DEFAULT_PINNED_TIMELINES).filter(
      (t) => t && t.id && t.id !== 'for-you' && t.id !== 'following' && Boolean(t.name)
    ),
    isLoading: query.isLoading,
    pin,
    unpin,
    reorder,
    moveUp,
    moveDown,
  };
}
