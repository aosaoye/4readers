import { api } from '../client';
import type { Withdrawal } from '../types';
import { useWithdrawalMutation } from './useWithdrawalMutation';

export const useRequestWithdrawal = () =>
  useWithdrawalMutation((tokensAmount: number) => api.post<Withdrawal>('/payouts/me/withdrawals', { tokensAmount }));
