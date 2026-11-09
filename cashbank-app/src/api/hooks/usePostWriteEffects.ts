import { useQueryClient } from '@tanstack/react-query';
import { qk } from '../keys';
import type { Post } from '../types';

/** Tras crear/editar/verificar: el detalle queda al día sin pedirlo y las listas se revalidan. */
export function usePostWriteEffects() {
  const qc = useQueryClient();
  return (post: Post) => {
    qc.setQueryData(qk.post(post.id), post);
    qc.invalidateQueries({ queryKey: ['posts', 'mine'] });
    qc.invalidateQueries({ queryKey: ['posts', 'feed'] });
  };
}
