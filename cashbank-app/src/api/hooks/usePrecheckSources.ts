import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { PostSourcesPrecheckReport } from '../types';

/** Prechequeo automático anti-SSRF de las fuentes de un artículo para asistir al moderador. */
export function usePrecheckSources(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<PostSourcesPrecheckReport>(`/blog/moderation/posts/${postId}/precheck-sources`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.post(postId) });
    },
  });
}
