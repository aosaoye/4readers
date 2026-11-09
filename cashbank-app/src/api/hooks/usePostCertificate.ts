import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { PostCertificate } from '../types';

/** Certificado público de un artículo verificado (`/blog/posts/:id/certificate`). */
export function usePostCertificate(postId: string, enabled = true) {
  return useQuery({
    queryKey: qk.certificate(postId),
    queryFn: () => api.get<PostCertificate>(`/blog/posts/${postId}/certificate`, { auth: false }),
    enabled: enabled && !!postId,
    staleTime: 10 * 60_000,
  });
}
