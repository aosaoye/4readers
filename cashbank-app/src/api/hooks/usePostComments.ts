import { qk } from '../keys';
import type { PostComment } from '../types';
import { usePaged } from './usePaged';

export const usePostComments = (postId: string) =>
  usePaged<PostComment>(
    qk.postComments(postId),
    `/blog/posts/${postId}/comments`,
    undefined,
    { auth: false, enabled: !!postId },
  );
