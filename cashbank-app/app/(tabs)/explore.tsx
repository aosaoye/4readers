import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { flat, useCategories, useFeed, useMe } from '@/api/hooks';
import type { Post } from '@/api/types';
import { readingMinutes } from '@/lib/format';
import { parseRepost } from '@/lib/reposts';
import {
  Avatar,
  colors,
  Cover,
  Divider,
  ErrorState,
  fonts,
  gutter,
  IconButton,
  PostRow,
  radius,
  Screen,
  SkeletonRows,
  space,
  Text,
  useTheme,
} from '@/ui';

export default function Explore() {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark, colors: themeColors } = useTheme();
  const { top } = useSafeAreaInsets();
  const me = useMe().data;
  const categories = useCategories();
  const catList = categories.data ?? [];

  const isCategoryTab = activeTab !== 'explore' && activeTab !== 'trends';
  const feed = useFeed({
    categoryId: isCategoryTab ? activeTab : null,
    sortOrder: 'DESC',
    verifiedOnly: activeTab === 'trends' ? true : false,
  });
  const fallbackFeed = useFeed({
    categoryId: null,
    sortOrder: 'DESC',
    verifiedOnly: false,
  });

  const feedPosts = useMemo(() => flat(feed.data), [feed.data]);
  const allPosts = useMemo(() => flat(fallbackFeed.data), [fallbackFeed.data]);
  const trendsList = useMemo(
    () => (feedPosts.length > 0 ? feedPosts : allPosts),
    [feedPosts, allPosts],
  );

  const tabs = useMemo(
    () => [
      { key: 'explore', label: 'Explorar', icon: 'compass' as const },
      { key: 'trends', label: 'Tendencias', icon: 'trending-up' as const },
      ...catList.map((c) => ({
        key: c.id,
        label: c.name,
        icon: 'file-text' as const,
      })),
    ],
    [catList],
  );

  // Construye elementos de tendencia reales a partir de publicaciones y temas de la API
  const exploreTrendItems = useMemo(() => {
    const items: {
      id: string;
      kicker: string;
      title: string;
      subtitle: string;
      onPress: () => void;
    }[] = [];

    for (const p of allPosts.slice(0, 8)) {
      const meta = parseRepost(p);
      items.push({
        id: `post-${p.id}`,
        kicker: `${p.categoryName ?? 'Actualidad'} · Tendencia`,
        title: p.title,
        subtitle: `@${meta.originalAuthor} · ${p.sources?.length ?? 0} fuentes · ${readingMinutes(p.content)} min`,
        onPress: () => router.navigate(`/post/${p.id}`),
      });
    }

    for (const c of catList) {
      if (items.length >= 10) break;
      items.push({
        id: `cat-${c.id}`,
        kicker: 'Tema en CashBank · Tendencia',
        title: `#${c.name.replace(/\s+/g, '')}`,
        subtitle: c.description ?? `Publicaciones verificadas sobre ${c.name}`,
        onPress: () => setActiveTab(c.id),
      });
    }

    return items;
  }, [allPosts, catList]);

  const matchingSearchPosts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const qLower = searchQuery.trim().toLowerCase();
    return allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(qLower) ||
        p.summary.toLowerCase().includes(qLower) ||
        (p.authorUsername ?? '').toLowerCase().includes(qLower) ||
        (p.categoryName ?? '').toLowerCase().includes(qLower),
    );
  }, [allPosts, searchQuery]);

  return (
    <Screen edges={['bottom']}>
      {/* Cabecera dinámica: al comenzar a escribir muestra el diseño exacto de la Imagen 1 */}
      {isSearching ? (
        <View style={[s.searchActiveBar, { paddingTop: Math.max(top, space.sm) + 4 }]}>
          <Pressable
            onPress={() => {
              setIsSearching(false);
              setSearchQuery('');
            }}
            hitSlop={10}
            style={({ pressed }) => [
              s.circleBackBtn,
              { backgroundColor: themeColors.surfaceSubtle },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Volver a explorar"
          >
            <Feather name="arrow-left" size={20} color={themeColors.text} />
          </Pressable>

          <View style={s.searchInputRow}>
            <Feather name="search" size={20} color="#71767B" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              placeholder="Buscar"
              placeholderTextColor="#71767B"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={[s.searchInput, { color: themeColors.text }]}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Borrar texto"
              >
                <Feather name="x-circle" size={18} color="#71767B" />
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        <View style={[s.headerBar, { paddingTop: Math.max(top, space.sm) + 4 }]}>
          <Pressable
            onPress={() => router.navigate('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Ir a tu perfil"
          >
            <Avatar name={me?.username ?? 'Tú'} avatarUrl={me?.avatarUrl} size={34} />
          </Pressable>

          <Pressable
            onPress={() => setIsSearching(true)}
            accessibilityRole="search"
            accessibilityLabel="Buscar"
            style={({ pressed }) => [
              s.searchPill,
              { backgroundColor: themeColors.surfaceSubtle },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Feather name="search" size={16} color={themeColors.textMuted} />
            <Text
              variant="body"
              style={[s.searchPillText, { color: themeColors.textMuted }]}
              numberOfLines={1}
            >
              Buscar
            </Text>
          </Pressable>

          <View style={{ position: 'relative' }}>
            <IconButton
              name="settings"
              label="Ajustes de Explorar"
              onPress={() => router.push('/explore-settings')}
            />
            <View style={s.settingsDot} />
          </View>
        </View>
      )}

      {isSearching ? (
        <View style={{ flex: 1 }}>
          <FlatList
            data={searchQuery.trim().length > 0 ? matchingSearchPosts : allPosts.slice(0, 10)}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <PostRow
                post={item}
                onPress={() => router.navigate(`/post/${item.id}`)}
              />
            )}
            ListHeaderComponent={
              searchQuery.trim().length === 0 ? (
                <View style={s.searchHeaderWrap}>
                  <Text variant="heading" style={s.searchHeaderTitle}>
                    Tendencias recientes
                  </Text>
                </View>
              ) : undefined
            }
            ListEmptyComponent={
              <View style={s.emptySearchWrap}>
                <Text variant="body" style={{ color: '#71767B', textAlign: 'center' }}>
                  No se encontraron resultados para "{searchQuery}"
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 110 }}
          />
        </View>
      ) : (
        <>
          {/* Barra horizontal de pestañas con subrayado (Explorar | Tendencias | Categorías de la API) */}
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.tabsScroll}
            >
              {tabs.map((t) => {
                const active = activeTab === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setActiveTab(t.key)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    style={s.tabItem}
                  >
                    <View style={s.tabLabelRow}>
                      {active && <Feather name={t.icon} size={15} color={colors.ink} />}
                      <Text
                        variant="label"
                        style={[
                          s.tabText,
                          { color: active ? colors.ink : colors.muted },
                          active && { fontFamily: fonts.bold },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </View>
                    <View style={[s.tabIndicator, active && s.tabIndicatorActive]} />
                  </Pressable>
                );
              })}
            </ScrollView>
            <Divider />
          </View>

          {/* Contenido según la pestaña activa */}
          {activeTab === 'explore' ? (
            <FlatList
              data={exploreTrendItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={item.onPress}
                  style={({ pressed }) => [s.trendRow, pressed && { opacity: 0.7 }]}
                >
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text variant="caption" style={s.trendKicker}>
                      {item.kicker}
                    </Text>
                    <Text variant="heading" numberOfLines={2} style={s.trendTitle}>
                      {item.title}
                    </Text>
                    <Text variant="caption" numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <Feather name="more-vertical" size={16} color={colors.muted} />
                </Pressable>
              )}
              ListEmptyComponent={
                fallbackFeed.isPending ? (
                  <SkeletonRows count={5} />
                ) : fallbackFeed.error ? (
                  <ErrorState error={fallbackFeed.error} onRetry={fallbackFeed.refetch} />
                ) : (
                  <View style={s.emptyEditorial}>
                    <Text variant="display" style={s.emptyTitle}>
                      No hay nada que ver aquí... por ahora.
                    </Text>
                  </View>
                )
              }
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  tintColor={colors.ink}
                  onRefresh={() => {
                    categories.refetch();
                    fallbackFeed.refetch();
                  }}
                />
              }
              contentContainerStyle={{ paddingBottom: 110 }}
            />
          ) : activeTab === 'trends' ? (
            <FlatList
              data={trendsList}
              keyExtractor={(p) => p.id}
              ListHeaderComponent={
                <View style={s.bannerWrap}>
                  <View style={s.bannerCard}>
                    <Cover
                      seed={trendsList[0]?.categoryId ?? 'global-trends'}
                      imageUrl={trendsList[0]?.coverImageUrl}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={s.bannerOverlay}>
                      <Text variant="title" style={s.bannerTitle}>
                        Tendencias globales
                      </Text>
                      <Text variant="body" style={s.bannerSub}>
                        Las publicaciones más populares y verificadas
                      </Text>
                      <Pressable
                        onPress={() =>
                          trendsList[0]
                            ? router.navigate(`/post/${trendsList[0].id}`)
                            : router.push('/search')
                        }
                        style={({ pressed }) => [s.bannerBtn, pressed && { opacity: 0.8 }]}
                      >
                        <Text variant="label" style={{ color: '#FFFFFF', fontSize: 13 }}>
                          Explorar
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              }
              renderItem={({ item, index }) => {
                const meta = parseRepost(item);
                return (
                  <Pressable
                    onPress={() => router.navigate(`/post/${item.id}`)}
                    style={({ pressed }) => [s.trendRow, pressed && { opacity: 0.7 }]}
                  >
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text variant="caption" style={s.trendKicker}>
                        {index + 1} · {item.categoryName ?? 'Actualidad'} · Tendencia
                      </Text>
                      <Text variant="heading" numberOfLines={2} style={s.trendTitle}>
                        {item.title}
                      </Text>
                      <Text variant="caption">
                        @{meta.originalAuthor}
                        {item.isVerified ? ' · Verificado' : ''}
                      </Text>
                    </View>
                    <Feather name="more-vertical" size={16} color={colors.muted} />
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                feed.isPending ? (
                  <SkeletonRows count={5} />
                ) : (
                  <View style={s.emptyEditorial}>
                    <Text variant="display" style={s.emptyTitle}>
                      No hay nada que ver aquí... por ahora.
                    </Text>
                  </View>
                )
              }
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  tintColor={colors.ink}
                  onRefresh={() => {
                    feed.refetch();
                    fallbackFeed.refetch();
                  }}
                />
              }
              contentContainerStyle={{ paddingBottom: 110 }}
            />
          ) : (
            /* Pestañas dinámicas por Categoría (Imagen 3) */
            <FlatList
              data={feedPosts}
              keyExtractor={(p: Post) => p.id}
              ItemSeparatorComponent={Divider}
              renderItem={({ item }) => (
                <PostRow post={item} onPress={() => router.navigate(`/post/${item.id}`)} />
              )}
              ListEmptyComponent={
                feed.isPending ? (
                  <SkeletonRows count={4} />
                ) : feed.error ? (
                  <ErrorState error={feed.error} onRetry={feed.refetch} />
                ) : (
                  <View style={s.emptyEditorial}>
                    <Text variant="display" style={s.emptyTitle}>
                      No hay nada que ver aquí... por ahora.
                    </Text>
                  </View>
                )
              }
              ListFooterComponent={
                feed.isFetchingNextPage ? (
                  <ActivityIndicator style={{ margin: space.xl }} color={colors.ink} />
                ) : undefined
              }
              onEndReached={() => feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage()}
              onEndReachedThreshold={0.6}
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  tintColor={colors.ink}
                  onRefresh={() => {
                    feed.refetch();
                  }}
                />
              }
              contentContainerStyle={{ paddingBottom: 110 }}
            />
          )}
        </>
      )}

      {/* Botón flotante (+) en la esquina inferior derecha */}
      <Pressable
        onPress={() => router.push('/post/new')}
        accessibilityRole="button"
        accessibilityLabel="Escribir nuevo artículo"
        style={({ pressed }) => [s.fab, pressed && { opacity: 0.85 }]}
      >
        <Feather name="plus" size={26} color={colors.onInk} />
      </Pressable>
    </Screen>
  );
}

const s = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: gutter,
    paddingBottom: space.sm,
    minHeight: 52,
  },
  searchActiveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: gutter,
    paddingBottom: space.sm,
    minHeight: 56,
  },
  circleBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E2328',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 17,
    paddingVertical: 0,
  },
  searchHeaderWrap: {
    paddingHorizontal: gutter,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  searchHeaderTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  emptySearchWrap: {
    padding: space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: '#1E2328',
    paddingHorizontal: 16,
  },
  searchPillText: {
    fontSize: 15,
    color: '#71767B',
  },
  settingsDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  tabsScroll: {
    paddingHorizontal: gutter,
    gap: space.xl,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space.sm,
    height: 44,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 14,
  },
  tabIndicator: {
    height: 3,
    width: '100%',
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: colors.accent,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: gutter,
    paddingVertical: 14,
  },
  trendKicker: {
    fontFamily: fonts.semibold,
    color: colors.muted,
    fontSize: 13,
  },
  trendTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  bannerWrap: {
    paddingHorizontal: gutter,
    paddingTop: space.md,
    paddingBottom: space.xs,
  },
  bannerCard: {
    height: 158,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18, 16, 15, 0.42)',
    padding: space.lg,
    justifyContent: 'space-between',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    lineHeight: 19,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  emptyEditorial: {
    paddingHorizontal: gutter + 8,
    paddingTop: 48,
  },
  emptyTitle: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  fab: {
    position: 'absolute',
    right: gutter,
    bottom: space.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
});
