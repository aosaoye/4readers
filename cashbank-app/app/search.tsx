import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { flat, useCategories, useFeed, useMyFollowing } from '@/api/hooks';
import { PostList } from '@/components';
import {
  Avatar,
  Chip,
  colors,
  Divider,
  fonts,
  gutter,
  IconButton,
  radius,
  Screen,
  space,
  Text,
  useTheme,
} from '@/ui';

/**
 * Pantalla dedicada de búsqueda estilo Google:
 * - Se abre con el teclado enfocado en la barra superior.
 * - Sin texto: muestra sugerencias rápidas de búsqueda, temas y autores.
 * - Al escribir: filtra en tiempo real artículos, categorías y autores.
 */
export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const { isDark, colors: themeColors } = useTheme();
  const { top } = useSafeAreaInsets();

  const categories = useCategories();
  const followingQuery = useMyFollowing();
  const q = query.trim();

  const searchFeed = useFeed({
    categoryId: null,
    sortOrder: 'DESC',
    verifiedOnly: false,
    search: q || undefined,
  });

  const allPosts = useMemo(() => flat(searchFeed.data), [searchFeed.data]);
  const catList = categories.data ?? [];
  const followingList = useMemo(() => flat(followingQuery.data), [followingQuery.data]);

  const authors = useMemo(() => {
    const map = new Map<string, { username: string; avatarUrl?: string | null; verifiedCount: number }>();
    for (const f of followingList) {
      map.set(f.username, { username: f.username, avatarUrl: f.avatarUrl, verifiedCount: 0 });
    }
    for (const p of allPosts) {
      if (!p.authorUsername) continue;
      const cur = map.get(p.authorUsername) ?? { username: p.authorUsername, verifiedCount: 0 };
      if (p.isVerified) cur.verifiedCount += 1;
      map.set(p.authorUsername, cur);
    }
    return [...map.values()];
  }, [allPosts, followingList]);

  const qLower = q.toLowerCase();

  const matchingCategories = useMemo(() => {
    if (!qLower) return catList;
    return catList.filter(
      (c) => c.name.toLowerCase().includes(qLower) || (c.description ?? '').toLowerCase().includes(qLower),
    );
  }, [catList, qLower]);

  const matchingAuthors = useMemo(() => {
    if (!qLower) return authors;
    return authors.filter((a) => a.username.toLowerCase().includes(qLower));
  }, [authors, qLower]);

  const matchingPosts = useMemo(() => {
    if (!qLower) return allPosts;
    return allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(qLower) ||
        p.summary.toLowerCase().includes(qLower) ||
        (p.authorUsername ?? '').toLowerCase().includes(qLower) ||
        (p.categoryName ?? '').toLowerCase().includes(qLower),
    );
  }, [allPosts, qLower]);

  return (
    <Screen edges={['bottom']} style={{ backgroundColor: isDark ? '#000000' : themeColors.bg }}>
      {/* Cabecera estilo X: Botón circular atrás + Input de búsqueda transparente (Imagen 1) */}
      <View style={[s.topBar, { paddingTop: Math.max(top, space.sm) + 4 }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.navigate('/explore'))}
          hitSlop={10}
          style={({ pressed }) => [s.circleBackBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Feather name="arrow-left" size={20} color={isDark ? '#FFFFFF' : themeColors.ink} />
        </Pressable>

        <View style={s.inputBox}>
          <Feather name="search" size={20} color="#71767B" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Buscar"
            placeholderTextColor="#71767B"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={[s.input, { color: isDark ? '#FFFFFF' : themeColors.ink }]}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Borrar texto"
            >
              <Feather name="x-circle" size={18} color="#71767B" />
            </Pressable>
          )}
        </View>
      </View>
      <Divider />

      <PostList
        posts={matchingPosts}
        pending={searchFeed.isPending}
        error={searchFeed.error}
        hasNextPage={!q && searchFeed.hasNextPage}
        isFetchingNextPage={searchFeed.isFetchingNextPage}
        fetchNextPage={searchFeed.fetchNextPage}
        onRefresh={() => searchFeed.refetch()}
        empty={{
          icon: 'search',
          title: q ? `Sin resultados para "${q}"` : 'Explora todo el catálogo',
          message: q
            ? 'Prueba con otra palabra clave, tema o nombre de autor.'
            : 'Escribe arriba para buscar por titular, resumen, categoría o autor.',
        }}
        header={
          <View style={{ gap: space.lg, paddingTop: space.md, paddingBottom: space.sm }}>
            {/* Sugerencias rápidas estilo Google cuando aún no se ha escrito o coinciden temas */}
            {!q && catList.length > 0 && (
              <View>
                <Text variant="kicker" style={{ paddingHorizontal: gutter, paddingBottom: space.xs }}>
                  Búsquedas sugeridas
                </Text>
                {catList.slice(0, 5).map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setQuery(c.name)}
                    style={({ pressed }) => [s.suggestionRow, pressed && { opacity: 0.7 }]}
                  >
                    <View style={s.suggestionLeft}>
                      <Feather name="search" size={16} color={colors.muted} />
                      <Text variant="body">{c.name}</Text>
                    </View>
                    <Feather name="arrow-up-left" size={16} color={colors.muted} />
                  </Pressable>
                ))}
              </View>
            )}

            {/* Temas coincidentes */}
            {matchingCategories.length > 0 && (
              <View style={{ paddingHorizontal: gutter, gap: space.sm }}>
                <Text variant="kicker">Temas</Text>
                <View style={s.chipsWrap}>
                  {matchingCategories.map((c) => (
                    <Chip
                      key={c.id}
                      label={c.name}
                      onPress={() => router.navigate(`/category/${c.id}`)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Autores coincidentes */}
            {matchingAuthors.length > 0 && (
              <View style={{ gap: space.sm }}>
                <Text variant="kicker" style={{ paddingHorizontal: gutter }}>
                  Autores
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingHorizontal: gutter, gap: space.sm }}
                >
                  {matchingAuthors.map((a) => (
                    <Pressable
                      key={a.username}
                      onPress={() => router.navigate(`/author/${a.username}`)}
                      style={({ pressed }) => [s.authorPill, pressed && { opacity: 0.75 }]}
                    >
                      <Avatar name={a.username} avatarUrl={a.avatarUrl} size={28} />
                      <Text variant="label" style={{ fontSize: 13 }}>
                        @{a.username}
                      </Text>
                      {a.verifiedCount > 0 && (
                        <Feather name="check-circle" size={13} color={colors.success} />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={{ paddingHorizontal: gutter, paddingTop: space.xs }}>
              <Text variant="heading">
                {q ? `Resultados (${matchingPosts.length})` : 'Publicaciones recientes'}
              </Text>
            </View>
          </View>
        }
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: gutter,
    paddingBottom: space.sm,
  },
  circleBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E2328',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 42,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 17,
    paddingVertical: 0,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingVertical: 12,
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flex: 1,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  authorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
});
