import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '../keys';
import type { Withdrawal } from '../types';

/** Retirar o cancelar mueve fichas: refresca saldo, resumen e historial. */
export function useWithdrawalMutation<I>(fn: (input: I) => Promise<Withdrawal>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payouts'] });
      qc.invalidateQueries({ queryKey: qk.wallet });
      qc.invalidateQueries({ queryKey: qk.me });
    },
  });
}
