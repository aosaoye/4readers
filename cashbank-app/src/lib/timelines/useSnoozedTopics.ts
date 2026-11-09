import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loadSnoozedTopics, saveSnoozedTopics } from './storage';

const SNOOZED_QUERY_KEY = ['snoozed_topics'];
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function useSnoozedTopics() {
  const qc = useQueryClient();

  const query = useQuery<Record<string, number>>({
    queryKey: SNOOZED_QUERY_KEY,
    queryFn: loadSnoozedTopics,
    initialData: {},
  });

  const saveMutation = useMutation({
    mutationFn: async (topics: Record<string, number>) => {
      await savePinnedTimelinesSafe(topics);
      return topics;
    },
    onSuccess: (topics) => {
      qc.setQueryData(SNOOZED_QUERY_KEY, topics);
      qc.invalidateQueries({ queryKey: ['posts', 'feed'] });
    },
  });

  async function savePinnedTimelinesSafe(topics: Record<string, number>) {
    await saveSnoozedTopics(topics);
  }

  const isSnoozed = (id: string): boolean => {
    const expiresAt = query.data?.[id];
    if (!expiresAt) return false;
    return expiresAt > Date.now();
  };

  const toggleSnooze = (id: string) => {
    const current = { ...(query.data ?? {}) };
    if (isSnoozed(id)) {
      delete current[id];
    } else {
      current[id] = Date.now() + ONE_DAY_MS;
    }
    saveMutation.mutate(current);
  };

  const setSnoozedTopics = (topics: Record<string, number>) => {
    saveMutation.mutate(topics);
  };

  const resetSnoozes = () => {
    saveMutation.mutate({});
  };

  const activeSnoozedCount = useMemo(() => {
    const data = query.data ?? {};
    const now = Date.now();
    return Object.values(data).filter((exp) => exp > now).length;
  }, [query.data]);

  return {
    snoozedMap: query.data ?? {},
    isSnoozed,
    toggleSnooze,
    setSnoozedTopics,
    resetSnoozes,
    snoozedCount: activeSnoozedCount,
  };
}
