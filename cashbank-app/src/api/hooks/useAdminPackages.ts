import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { TokenPackage } from '../types';
import { asArray } from './usePaged';

export const useAdminPackages = (enabled = true) =>
  useQuery({
    queryKey: qk.adminPackages,
    queryFn: async () =>
      (await api.page<TokenPackage>('/store/packages', { page: 1, limit: 50, onlyActive: false, sortOrder: 'ASC' }))
        .items,
    select: (data) => asArray<TokenPackage>(data),
    enabled,
  });
