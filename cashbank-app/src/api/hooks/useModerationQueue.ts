import { qk } from '../keys';
import type { Post } from '../types';
import { usePaged } from './usePaged';

export const useModerationQueue = (enabled: boolean) =>
  usePaged<Post>(qk.moderation, '/blog/moderation/posts', {}, { enabled });
