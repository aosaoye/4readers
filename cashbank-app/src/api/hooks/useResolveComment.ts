import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { PostComment } from '../types';

export function useResolveComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      api.patch<PostComment>(`/blog/posts/${postId}/comments/${commentId}/resolve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.postComments(postId) });
    },
  });
}
