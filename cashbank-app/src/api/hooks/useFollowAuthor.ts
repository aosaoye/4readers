import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/ui/Toast';
import { api } from '../client';
import { qk } from '../keys';
import type { AuthorFollowStatus } from '../types';

export function useFollowAuthor(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<AuthorFollowStatus>(`/blog/authors/${encodeURIComponent(username)}/follow`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.author(username) });
      qc.invalidateQueries({ queryKey: qk.myFollowing });
      qc.invalidateQueries({ queryKey: ['posts', 'feed'] });
      toast.success(`Siguiendo a @${username}`);
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo seguir al autor');
    },
  });
}
