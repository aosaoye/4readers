import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { AuthorProfile } from '../types';

/** Perfil público: se cachea 5 min; la reputación no cambia a cada segundo. */
export const useAuthor = (username: string) =>
  useQuery({
    queryKey: qk.author(username),
    queryFn: () => api.get<AuthorProfile>(`/blog/authors/${encodeURIComponent(username)}`, { auth: true }),
    staleTime: 5 * 60_000,
    enabled: !!username,
  });
