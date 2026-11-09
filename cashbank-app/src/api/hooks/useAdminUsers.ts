import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { UserProfile } from '../types';
import { asArray } from './usePaged';

export const useAdminUsers = (enabled = true) =>
  useQuery({
    queryKey: qk.adminUsers,
    queryFn: async () => (await api.page<UserProfile>('/users', { page: 1, limit: 50, sortOrder: 'DESC' })).items,
    select: (data) => asArray<UserProfile>(data),
    enabled,
  });
