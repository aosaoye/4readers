import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { Withdrawal } from '../types';

export function useApproveWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Withdrawal>(`/payouts/admin/withdrawals/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
      qc.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
}
