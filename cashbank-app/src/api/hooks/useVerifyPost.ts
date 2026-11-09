import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { Post, VerifyPostInput } from '../types';

export function useVerifyPost(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VerifyPostInput) => api.post<Post>(`/blog/moderation/posts/${id}/verify`, input),
    onSuccess: (post) => {
      qc.setQueryData(qk.post(id), post);
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
