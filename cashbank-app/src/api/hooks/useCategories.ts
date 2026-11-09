import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { Category } from '../types';
import { asArray } from './usePaged';

export const useCategories = () =>
  useQuery({
    queryKey: qk.categories,
    queryFn: async () =>
      (await api.page<Category>('/blog/categories', { page: 1, limit: 50, sortOrder: 'ASC' }, { auth: false })).items,
    select: (data) => asArray<Category>(data),
    staleTime: 60 * 60_000, // las categorías casi nunca cambian
  });
