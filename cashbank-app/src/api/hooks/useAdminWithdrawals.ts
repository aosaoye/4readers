import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { Withdrawal, WithdrawalStatus } from '../types';
import { asArray } from './usePaged';

export const useAdminWithdrawals = (status: WithdrawalStatus, enabled = true) =>
  useQuery({
    queryKey: qk.adminWithdrawals(status),
    queryFn: async () =>
      (await api.page<Withdrawal>('/payouts/admin/withdrawals', { page: 1, limit: 50, status })).items,
    select: (data) => asArray<Withdrawal>(data),
    enabled,
  });
