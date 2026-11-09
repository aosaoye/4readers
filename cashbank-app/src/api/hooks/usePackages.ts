import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { TokenPackage } from '../types';
import { asArray } from './usePaged';

export const usePackages = () =>
  useQuery({
    queryKey: qk.packages,
    queryFn: async () =>
      (
        await api.page<TokenPackage>(
          '/store/packages',
          { page: 1, limit: 50, onlyActive: true, sortOrder: 'ASC' },
          { auth: false },
        )
      ).items,
    select: (data) => asArray<TokenPackage>(data),
    staleTime: 30 * 60_000,
  });
