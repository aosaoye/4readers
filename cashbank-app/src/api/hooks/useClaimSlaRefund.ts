import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { Post } from '../types';

export function useClaimSlaRefund(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<Post>(`/blog/posts/${postId}/claim-sla-refund`),
    onSuccess: (p) => {
      qc.setQueryData(qk.post(postId), p);
      qc.invalidateQueries({ queryKey: qk.wallet });
      qc.invalidateQueries({ queryKey: qk.me });
      qc.invalidateQueries({ queryKey: ['posts', 'mine'] });
    },
  });
}
