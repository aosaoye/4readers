import { useMutation } from '@tanstack/react-query';
import { api } from '../client';
import type { Post, UpdatePostInput } from '../types';
import { usePostWriteEffects } from './usePostWriteEffects';

export function useUpdatePost(id: string) {
  const done = usePostWriteEffects();
  return useMutation({
    mutationFn: (input: UpdatePostInput) => api.patch<Post>(`/blog/posts/${id}`, input),
    onSuccess: done,
  });
}
