import { qk } from '../keys';
import type { AuthorFollowStatus } from '../types';
import { usePaged } from './usePaged';

export const useMyFollowing = () =>
  usePaged<AuthorFollowStatus>(qk.myFollowing, '/blog/authors/me/following');
