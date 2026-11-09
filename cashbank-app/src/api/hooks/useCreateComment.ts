import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { CreatePostCommentInput, PostComment } from '../types';

export function useCreateComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePostCommentInput) =>
      api.post<PostComment>(`/blog/posts/${postId}/comments`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.postComments(postId) });
    },
  });
}
