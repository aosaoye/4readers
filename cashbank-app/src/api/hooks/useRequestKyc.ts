import { api } from '../client';
import type { PayoutSummary } from '../types';
import { useSummaryMutation } from './useSummaryMutation';

export const useRequestKyc = () => useSummaryMutation(() => api.post<PayoutSummary>('/payouts/me/kyc-request'));
