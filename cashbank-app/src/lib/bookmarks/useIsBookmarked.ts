import { useBookmarks } from './useBookmarks';

export const useIsBookmarked = (id: string) => !!useBookmarks().data?.some((b) => b.id === id);
