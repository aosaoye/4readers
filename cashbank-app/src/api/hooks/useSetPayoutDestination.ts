import { api } from '../client';
import type { PayoutSummary } from '../types';
import { useSummaryMutation } from './useSummaryMutation';

export const useSetPayoutDestination = () =>
  useSummaryMutation((destination: string) => api.put<PayoutSummary>('/payouts/me/destination', { destination }));
