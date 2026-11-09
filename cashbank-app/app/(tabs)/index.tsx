import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { flat, useCategories, useFeed, useMe } from '@/api/hooks';
import type { SortOrder } from '@/api/types';
import { FeaturedPostCard } from '@/components/FeaturedPostCard';
import { HomeHeader, SnoozeTopicsSheet } from '@/components/home';
import { PostList } from '@/components/PostList';
import { SortToggle } from '@/components/SortToggle';
import {
  ALL_SYSTEM_TOPICS,
  usePinnedTimelines,
  useSnoozedTopics,
} from '@/lib/timelines';
import { Chip, gutter, Screen, space } from '@/ui';

export default function Home() {
  const [activeTab, setActiveTab] = useState('for-you');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [snoozeSheetVisible, setSnoozeSheetVisible] = useState(false);

  const me = useMe().data;
  const categories = useCategories();
  const { timelines: pinnedTimelines } = usePinnedTimelines();
  const { isSnoozed, snoozedMap } = useSnoozedTopics();

  // Si la pestaña activa era un tema fijado y el usuario lo eliminó, vuelve a "Para ti"
  useEffect(() => {
    if (activeTab !== 'for-you' && activeTab !== 'following') {
      const exists = pinnedTimelines.some((t) => t.id === activeTab);
      if (!exists) {
        setActiveTab('for-you');
      }
    }
  }, [pinnedTimelines, activeTab]);

  // Encuentra la categoría del backend para la pestaña seleccionada
  const activePinned = useMemo(
    () => pinnedTimelines.find((t) => t.id === activeTab),
    [pinnedTimelines, activeTab]
  );

  const categoryId = useMemo(() => {
    if (activeTab === 'for-you' || activeTab === 'following') return null;
    if (activePinned?.categoryId) return activePinned.categoryId;
    if (!activePinned) return null;
    const match = (categories.data ?? []).find(
      (c) =>
        c.id === activePinned.id ||
        c.name.toLowerCase() === activePinned.name.toLowerCase() ||
        c.name.toLowerCase().includes(activePinned.name.toLowerCase()) ||
        activePinned.name.toLowerCase().includes(c.name.toLowerCase())
    );
    return match?.id ?? null;
  }, [activeTab, activePinned, categories.data]);

  const feed = useFeed({
    categoryId,
    sortOrder,
    verifiedOnly,
    followingOnly: activeTab === 'following',
  });

  const rawPosts = useMemo(() => flat(feed.data), [feed.data]);

  // En "Para ti", filtra los artículos de temas aplazados temporalmente
  const allPosts = useMemo(() => {
    if (activeTab !== 'for-you') return rawPosts;
    return rawPosts.filter((p) => {
      const catName = p.categoryName?.toLowerCase() ?? '';
      for (const [topicId] of Object.entries(snoozedMap)) {
        if (isSnoozed(topicId)) {
          const topic = ALL_SYSTEM_TOPICS.find((t) => t.id === topicId);
          if (topic) {
            const tName = topic.name.toLowerCase();
            if (catName.includes(tName) || tName.includes(catName)) {
              return false;
            }
          }
        }
      }
      return true;
    });
  }, [rawPosts, activeTab, snoozedMap, isSnoozed]);

  // Mazo de hasta 5 artículos destacados para la pila interactiva
  const featuredDeck = useMemo(() => {
    if (allPosts.length === 0) return [];
    const verified = allPosts.filter((p) => p.isVerified);
    return (verified.length > 0 ? verified : allPosts).slice(0, 5);
  }, [allPosts]);

  const username = me?.username ?? 'lector';

  return (
    <Screen edges={['bottom']}>
      {/* Cabecera estilo X: Avatar, Monograma X, Ajustes y Pestañas: Para ti v, Siguiendo, Fijados y + */}
      <HomeHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSnooze={() => setSnoozeSheetVisible(true)}
        pinnedTimelines={pinnedTimelines}
        username={username}
        avatarUrl={me?.avatarUrl}
      />

      <PostList
        posts={allPosts}
        pending={feed.isPending}
        error={feed.error}
        hasNextPage={feed.hasNextPage}
        isFetchingNextPage={feed.isFetchingNextPage}
        fetchNextPage={feed.fetchNextPage}
        onRefresh={() => feed.refetch()}
        empty={{
          title:
            activeTab === 'following'
              ? 'Aún no sigues a ningún autor'
              : activeTab !== 'for-you' && activePinned
                ? `Aún no hay artículos en ${activePinned.name}`
                : 'Aún no hay artículos aquí',
          message:
            activeTab === 'following'
              ? 'Sigue a autores en la sección Explorar para ver sus artículos aquí.'
              : 'Publica el primero: es gratis.',
          actionLabel: 'Escribir un artículo',
          onAction: () => router.push('/post/new'),
        }}
        header={
          <>
            {/* Carrusel interactivo de destacados */}
            {featuredDeck.length > 0 && activeTab === 'for-you' && (
              <View style={{ paddingTop: space.md }}>
                <FeaturedPostCard posts={featuredDeck} />
              </View>
            )}

            {/* Barra de filtros secundarios */}
            <View style={s.filterRow}>
              <SortToggle value={sortOrder} onChange={setSortOrder} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
                <Chip
                  label="Verificados"
                  active={verifiedOnly}
                  onPress={() => setVerifiedOnly((v) => !v)}
                />
              </View>
            </View>
          </>
        }
      />

      {/* Bottom Sheet para Aplazar Temas */}
      <SnoozeTopicsSheet
        visible={snoozeSheetVisible}
        onClose={() => setSnoozeSheetVisible(false)}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingTop: space.sm,
    paddingBottom: space.xs,
    gap: space.xs,
  },
});
