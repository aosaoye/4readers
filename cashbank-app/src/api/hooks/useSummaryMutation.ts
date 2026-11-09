import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '../keys';
import type { PayoutSummary } from '../types';

/** Las mutaciones de perfil de cobro devuelven el resumen actualizado: se guarda sin pedirlo otra vez. */
export function useSummaryMutation<I>(fn: (input: I) => Promise<PayoutSummary>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: (summary) => qc.setQueryData(qk.payoutSummary, summary) });
}
