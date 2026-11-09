import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { PayoutSummary } from '../types';

export const usePayoutSummary = () =>
  useQuery({
    queryKey: qk.payoutSummary,
    queryFn: () => api.get<PayoutSummary>('/payouts/me/summary'),
    staleTime: 30_000,
  });
