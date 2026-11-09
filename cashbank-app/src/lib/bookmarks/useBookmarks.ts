import { useQuery } from '@tanstack/react-query';
import { useMe } from '@/api/hooks';
import { qk } from '@/api/keys';
import { loadBookmarks } from './storage';

export function useBookmarks() {
  const uid = useMe().data?.id;
  return useQuery({
    queryKey: qk.bookmarks(uid),
    queryFn: () => loadBookmarks(uid!),
    enabled: !!uid,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
