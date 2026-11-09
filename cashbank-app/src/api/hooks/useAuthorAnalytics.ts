import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { AuthorAnalytics } from '../types';

export const useAuthorAnalytics = () =>
  useQuery({
    queryKey: qk.myAnalytics,
    queryFn: () => api.get<AuthorAnalytics>('/blog/authors/me/analytics'),
  });
