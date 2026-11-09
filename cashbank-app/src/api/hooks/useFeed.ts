import { FeedFilter, qk } from '../keys';
import type { Post } from '../types';
import { usePaged } from './usePaged';

export const useFeed = (f: FeedFilter) =>
  usePaged<Post>(
    qk.feed(f),
    '/blog/posts',
    {
      categoryId: f.categoryId,
      sortOrder: f.sortOrder,
      verifiedOnly: f.verifiedOnly || undefined,
      followingOnly: f.followingOnly || undefined,
      search: f.search?.trim() || undefined,
      organizationId: f.organizationId || undefined,
      authorUsername: f.authorUsername || undefined,
    },
    { auth: true },
  );
