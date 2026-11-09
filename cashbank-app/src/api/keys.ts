import type { SortOrder } from './types';

export type FeedFilter = {
  categoryId: string | null;
  sortOrder: SortOrder;
  verifiedOnly: boolean;
  followingOnly?: boolean;
  search?: string;
  organizationId?: string | null;
  authorUsername?: string | null;
};

export const qk = {
  me: ['me'] as const,
  wallet: ['wallet'] as const,
  transactions: (type: string | null) => ['wallet', 'tx', { type }] as const,
  categories: ['categories'] as const,
  feed: (f: FeedFilter) => ['posts', 'feed', f] as const,
  post: (id: string) => ['posts', 'detail', id] as const,
  postComments: (postId: string) => ['posts', postId, 'comments'] as const,
  certificate: (id: string) => ['posts', 'certificate', id] as const,
  payoutSummary: ['payouts', 'summary'] as const,
  withdrawals: ['payouts', 'withdrawals'] as const,
  author: (username: string) => ['authors', username] as const,
  authorPosts: (authorId: string) => ['posts', 'author', authorId] as const,
  myAnalytics: ['authors', 'me', 'analytics'] as const,
  myFollowing: ['authors', 'me', 'following'] as const,
  myOrganizations: ['organizations', 'me'] as const,
  organization: (slug: string) => ['organizations', 'slug', slug] as const,
  myPosts: (status: string | null) => ['posts', 'mine', { status }] as const,
  moderation: ['posts', 'moderation'] as const,
  packages: ['store', 'packages'] as const,
  adminPackages: ['store', 'admin-packages'] as const,
  orders: ['store', 'orders'] as const,
  bookmarks: (userId?: string) => ['bookmarks', userId] as const,
  adminKyc: (status: string) => ['admin', 'kyc', status] as const,
  adminWithdrawals: (status: string) => ['admin', 'withdrawals', status] as const,
  adminUsers: ['admin', 'users'] as const,
  notifications: ['me', 'notifications'] as const,
};
