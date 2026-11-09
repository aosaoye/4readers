import { useQuery } from '@tanstack/react-query';
import { useMe } from '@/api/hooks';
import type { Post } from '@/api/types';
import { parseRepost } from './parseRepost';
import { readRepostIds } from './storage';

export function useRepostIds() {
  const uid = useMe().data?.id;
  return useQuery({
    queryKey: ['reposts', uid],
    queryFn: () => readRepostIds(uid!),
    enabled: !!uid,
    staleTime: Infinity,
  });
}

export function useIsReposted(post?: Post | null): boolean {
  const me = useMe().data;
  const { data = [] } = useRepostIds();
  if (!post) return false;
  if (data.includes(post.id)) return true;
  const meta = parseRepost(post);
  return meta.isRepost && meta.repostedBy === me?.username;
}
