import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import type { SortOrder } from '@/api/types';
import { PostList, SortToggle } from '@/components/PostList';
import { useBookmarks } from '@/lib/bookmarks';
import { ChipRow, Screen, ScreenHeader } from '@/ui';

export default function Saved() {
  const { data = [], isLoading } = useBookmarks();
  const [category, setCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  const options = useMemo(() => {
    const seen = new Map<string, string>();
    data.forEach((b) => b.categoryName && seen.set(b.categoryId, b.categoryName));
    return [{ key: 'all', label: 'Todos' }, ...[...seen].map(([key, label]) => ({ key, label }))];
  }, [data]);

  const posts = useMemo(() => {
    const list = category === 'all' ? data : data.filter((b) => b.categoryId === category);
    return [...list].sort((a, b) => (sortOrder === 'DESC' ? b.savedAt - a.savedAt : a.savedAt - b.savedAt));
  }, [data, category, sortOrder]);

  return (
    <Screen>
      <PostList
        posts={posts} pending={isLoading}
        empty={{ title: 'Nada guardado todavía', message: 'Toca el marcador en cualquier artículo para leerlo después, incluso sin conexión.', actionLabel: 'Ver artículos', onAction: () => router.navigate('/') }}
        header={<>
          <ScreenHeader kicker="Para después" title="Tu bóveda de lecturas" />
          <ChipRow options={options} value={options.some((o) => o.key === category) ? category : 'all'} onChange={setCategory} />
          <SortToggle value={sortOrder} onChange={setSortOrder} labels={['Guardados recientemente', 'Guardados primero']} />
        </>}
      />
    </Screen>
  );
}
