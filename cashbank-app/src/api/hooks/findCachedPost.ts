import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { Page, Post } from '../types';
import { asArray } from './usePaged';

/** Busca un artículo ya descargado en cualquier lista (feed, mis artículos, guardados). */
export function findCachedPost(qc: QueryClient, id: string): { post: Post; updatedAt: number } | undefined {
  for (const q of qc.getQueryCache().findAll({ queryKey: ['posts'] })) {
    if (q.queryKey[1] === 'detail') continue;
    for (const pg of (q.state.data as InfiniteData<Page<Post>> | undefined)?.pages ?? []) {
      const hit = asArray<Post>(pg?.items ?? pg).find((i) => i.id === id);
      if (hit) return { post: hit, updatedAt: q.state.dataUpdatedAt };
    }
  }
  for (const q of qc.getQueryCache().findAll({ queryKey: ['bookmarks'] })) {
    const hit = (q.state.data as Post[] | undefined)?.find((i) => i.id === id);
    if (hit) return { post: hit, updatedAt: q.state.dataUpdatedAt };
  }
}
