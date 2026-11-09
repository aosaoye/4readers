import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMe } from '@/api/hooks';
import { qk } from '@/api/keys';
import type { Post } from '@/api/types';
import { toast } from '@/ui';
import { type Bookmark, loadBookmarks, storageKey } from './storage';

export function useToggleBookmark() {
  const qc = useQueryClient();
  const uid = useMe().data?.id;
  return useMutation({
    mutationFn: async (post: Post) => {
      const key = qk.bookmarks(uid);
      const current = qc.getQueryData<Bookmark[]>(key) ?? (await loadBookmarks(uid!));
      const next = current.some((b) => b.id === post.id)
        ? current.filter((b) => b.id !== post.id)
        : [{ ...post, verifications: undefined, savedAt: Date.now() }, ...current];
      await AsyncStorage.setItem(storageKey(uid!), JSON.stringify(next));
      return next;
    },
    // Optimista: el icono cambia al tocar, sin esperar al disco.
    onMutate: (post) => {
      const key = qk.bookmarks(uid);
      const prev = qc.getQueryData<Bookmark[]>(key) ?? [];
      qc.setQueryData<Bookmark[]>(
        key,
        prev.some((b) => b.id === post.id)
          ? prev.filter((b) => b.id !== post.id)
          : [{ ...post, verifications: undefined, savedAt: Date.now() }, ...prev],
      );
      return { prev };
    },
    onError: (_e, _p, ctx) => ctx && qc.setQueryData(qk.bookmarks(uid), ctx.prev),
    onSuccess: (next, post) => {
      const isSaved = next.some((b) => b.id === post.id);
      if (isSaved) {
        toast.success('Artículo guardado');
      } else {
        toast.info('Artículo eliminado de guardados');
      }
    },
  });
}
