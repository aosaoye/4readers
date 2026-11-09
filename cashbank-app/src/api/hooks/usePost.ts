import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { Post } from '../types';
import { findCachedPost } from './findCachedPost';
import { useMe } from './useMe';

/**
 * Detalle instantáneo: el feed ya trae el contenido completo, así que abrimos con esos datos
 * y revalidamos en segundo plano.
 *  - Artículo propio: se pide /blog/posts/me/:id (cualquier estado, con las notas del moderador).
 *  - Artículo ajeno publicado: endpoint público.
 *  - Ajeno no publicado (p. ej. rechazado, visto por un moderador): no existe endpoint público; se
 *    muestra la copia de la lista donde se tocó.
 */
export function usePost(id: string, enabled = true) {
  const qc = useQueryClient();
  const meId = useMe().data?.id;
  const cached = id ? findCachedPost(qc, id) : undefined;
  const mine = !!cached && cached.post.authorId === meId;
  const privateCopy = cached && !mine && cached.post.status !== 'PUBLISHED' ? cached.post : undefined;
  const q = useQuery({
    queryKey: qk.post(id),
    queryFn: () => (mine ? api.get<Post>(`/blog/posts/me/${id}`) : api.get<Post>(`/blog/posts/${id}`, { auth: true })),
    enabled: enabled && !!id && !privateCopy,
    initialData: cached?.post,
    initialDataUpdatedAt: cached?.updatedAt,
    staleTime: 5 * 60_000,
  });
  return privateCopy ? ({ ...q, data: privateCopy, isPending: false, error: null } as typeof q) : q;
}
