import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/session';
import { api } from '../client';
import { qk } from '../keys';
import type { UserProfile } from '../types';

export function useMe() {
  const { authenticated } = useSession();
  return useQuery({
    queryKey: qk.me,
    queryFn: () => api.get<UserProfile>('/users/me'),
    enabled: authenticated,
    staleTime: 5 * 60_000,
  });
}
