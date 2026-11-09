import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { TipResult } from '../types';

/** Propina en fichas: sale de tu billetera, así que refresca saldo y movimientos. */
export function useTip(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tokensAmount: number) => api.post<TipResult>(`/blog/posts/${postId}/tips`, { tokensAmount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.wallet });
      qc.invalidateQueries({ queryKey: qk.me });
    },
  });
}
