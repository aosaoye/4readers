import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { UnlockPostResult } from '../types';

export function useUnlockPost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<UnlockPostResult>(`/blog/posts/${postId}/unlock`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.post(postId) });
      qc.invalidateQueries({ queryKey: ['posts', 'feed'] });
      qc.invalidateQueries({ queryKey: qk.wallet });
      qc.invalidateQueries({ queryKey: qk.me });
    },
  });
}
