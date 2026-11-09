import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { Post } from '../types';
import { usePostWriteEffects } from './usePostWriteEffects';

/** Compra la insignia: cobra fichas (402 sin saldo) y manda el artículo a la cola de moderación. */
export function useRequestVerification(id: string) {
  const qc = useQueryClient();
  const done = usePostWriteEffects();
  return useMutation({
    mutationFn: () => api.post<Post>(`/blog/posts/${id}/verification-request`),
    onSuccess: (post) => {
      done(post);
      qc.invalidateQueries({ queryKey: qk.wallet }); // se descontaron fichas
      qc.invalidateQueries({ queryKey: qk.me });
    },
  });
}
