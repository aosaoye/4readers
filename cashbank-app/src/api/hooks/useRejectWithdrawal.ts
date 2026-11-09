import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { Withdrawal } from '../types';

export function useRejectWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<Withdrawal>(`/payouts/admin/withdrawals/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
      qc.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
}
