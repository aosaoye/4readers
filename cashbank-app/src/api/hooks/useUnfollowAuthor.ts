import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/ui/Toast';
import { api } from '../client';
import { qk } from '../keys';
import type { AuthorFollowStatus } from '../types';

export function useUnfollowAuthor(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.del<AuthorFollowStatus>(`/blog/authors/${encodeURIComponent(username)}/follow`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.author(username) });
      qc.invalidateQueries({ queryKey: qk.myFollowing });
      qc.invalidateQueries({ queryKey: ['posts', 'feed'] });
      toast.info(`Dejaste de seguir a @${username}`);
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo dejar de seguir al autor');
    },
  });
}
