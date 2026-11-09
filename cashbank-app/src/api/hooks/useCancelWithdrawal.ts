import { api } from '../client';
import type { Withdrawal } from '../types';
import { useWithdrawalMutation } from './useWithdrawalMutation';

export const useCancelWithdrawal = () =>
  useWithdrawalMutation((id: string) => api.post<Withdrawal>(`/payouts/me/withdrawals/${id}/cancel`));
