import { useMutation } from '@tanstack/react-query';
import { api } from '../client';
import type { CreatePostInput, Post } from '../types';
import { usePostWriteEffects } from './usePostWriteEffects';

/** Publicar es gratis: no toca la billetera. */
export function useCreatePost() {
  const done = usePostWriteEffects();
  return useMutation({
    mutationFn: (input: CreatePostInput) => api.post<Post>('/blog/posts', input),
    onSuccess: done,
  });
}
