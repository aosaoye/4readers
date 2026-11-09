import { qk } from '../keys';
import type { Post } from '../types';
import { usePaged } from './usePaged';

export const useAuthorPosts = (authorId?: string) =>
  usePaged<Post>(
    qk.authorPosts(authorId ?? ''),
    '/blog/posts',
    { authorId, sortOrder: 'DESC' },
    { auth: false, enabled: !!authorId },
  );
