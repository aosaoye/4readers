import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { Withdrawal } from '../types';

export function usePayWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, externalReference }: { id: string; externalReference: string }) =>
      api.post<Withdrawal>(`/payouts/admin/withdrawals/${id}/pay`, { externalReference }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
      qc.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
}
