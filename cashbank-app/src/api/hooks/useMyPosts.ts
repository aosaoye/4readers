import { qk } from '../keys';
import type { Post } from '../types';
import { asArray, usePaged } from './usePaged';

export const useMyPosts = (status: string | null) =>
  usePaged<Post>(
    qk.myPosts(status),
    '/blog/posts/me',
    { verificationStatus: status },
    {
      poll: (pages) =>
        pages.some((p) => asArray<Post>(p?.items ?? p).some((x: Post) => x.verificationStatus === 'PENDING'))
          ? 20_000
          : false,
    },
  );
