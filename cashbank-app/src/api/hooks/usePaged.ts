import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { PAGE_SIZE } from '@/config';
import { api } from '../client';
import type { Page } from '../types';

export type Params = Record<string, string | number | boolean | null | undefined>;
export type PagedOpts = {
  auth?: boolean;
  enabled?: boolean;
  staleTime?: number;
  poll?: (pages: Page<any>[]) => number | false;
};

export const asArray = <T,>(v: unknown): T[] => {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === 'object') {
    const anyV = v as any;
    if (Array.isArray(anyV.items)) return anyV.items as T[];
    if (Array.isArray(anyV.data)) return anyV.data as T[];
    if (anyV.data) return asArray<T>(anyV.data);
  }
  return [];
};

export function usePaged<T>(key: readonly unknown[], path: string, params: Params = {}, o: PagedOpts = {}) {
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => api.page<T>(path, { ...params, page: pageParam, limit: PAGE_SIZE }, { auth: o.auth }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last?.meta?.hasNextPage ? last.meta.page + 1 : undefined),
    enabled: o.enabled,
    staleTime: o.staleTime,
    refetchInterval: o.poll ? (q) => o.poll!(q.state.data?.pages ?? []) : false,
  });
}

export const flat = <T,>(d?: InfiniteData<Page<T>>) => d?.pages?.flatMap((p) => asArray<T>(p?.items ?? p)) ?? [];
export const total = <T,>(d?: InfiniteData<Page<T>>) => d?.pages?.[0]?.meta?.totalItems ?? 0;
