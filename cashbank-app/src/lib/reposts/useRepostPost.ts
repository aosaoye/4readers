import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useMe } from '@/api/hooks/useMe';
import type { CreatePostInput, Post } from '@/api/types';
import { toast } from '@/ui/Toast';
import { formatRepostSummary, parseRepost } from './parseRepost';
import { readRepostIds, writeRepostIds } from './storage';

/**
 * Republicación automática con 1 toque:
 * - Publica automáticamente el artículo conservando al propietario/autor original.
 * - Registra el estado republicado y refresca el feed y Mis artículos.
 */
export function useRepostPost() {
  const qc = useQueryClient();
  const uid = useMe().data?.id ?? 'anon';

  return useMutation({
    mutationFn: async (post: Post) => {
      const currentIds = await readRepostIds(uid);
      const meta = parseRepost(post);
      const originalOwner = meta.originalAuthor || post.authorUsername || 'autor';

      const body: CreatePostInput = {
        categoryId: post.categoryId,
        title: post.title,
        summary: formatRepostSummary(originalOwner, meta.cleanSummary),
        content: post.content,
        coverImageUrl: post.coverImageUrl ?? undefined,
        sources:
          post.sources && post.sources.length > 0
            ? post.sources.map((s) => ({
                title: s.title,
                url: s.url,
                publisher: s.publisher,
              }))
            : undefined,
      };

      const created = await api.post<Post>('/blog/posts', body);
      const nextIds = Array.from(new Set([post.id, created.id, ...currentIds]));
      await writeRepostIds(uid, nextIds);
      return { created, nextIds };
    },
    onSuccess: ({ nextIds }) => {
      qc.setQueryData(['reposts', uid], nextIds);
      qc.invalidateQueries({ queryKey: ['posts', 'feed'] });
      qc.invalidateQueries({ queryKey: ['posts', 'mine'] });
      toast.success('Publicación compartida en tu perfil');
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo compartir la publicación');
    },
  });
}
