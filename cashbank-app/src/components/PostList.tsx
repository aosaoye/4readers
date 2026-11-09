import { router } from 'expo-router';
import { ReactNode, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import type { Post } from '@/api/types';
import { colors, Divider, EmptyState, ErrorState, PostRow, SkeletonRows, space } from '@/ui';
import { SortToggle } from './SortToggle';

export { SortToggle };

type Props = {
  posts: Post[];
  pending?: boolean;
  error?: unknown;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  onRefresh?: () => Promise<unknown>;
  header?: ReactNode;
  empty: { title: string; message?: string; icon?: any; actionLabel?: string; onAction?: () => void };
  badge?: (post: Post) => ReactNode;
  onOpen?: (post: Post) => void;
};

/**
 * Lista única para Inicio, categorías, guardados, mis artículos y moderación.
 * Usa `router.navigate` por defecto para evitar apilamiento infinito de pantallas.
 */
export function PostList(p: Props) {
  const [manual, setManual] = useState(false);
  const open = p.onOpen ?? ((post: Post) => router.navigate(`/post/${post.id}`));
  return (
    <FlatList
      data={p.posts}
      keyExtractor={(x) => x.id}
      ItemSeparatorComponent={Divider}
      renderItem={({ item }) => <PostRow post={item} onPress={() => open(item)} badge={p.badge?.(item)} />}
      ListHeaderComponent={<View>{p.header}</View>}
      ListEmptyComponent={
        p.pending ? (
          <SkeletonRows />
        ) : p.error ? (
          <ErrorState error={p.error} onRetry={p.onRefresh} />
        ) : (
          <EmptyState {...p.empty} />
        )
      }
      ListFooterComponent={
        p.isFetchingNextPage ? <ActivityIndicator style={{ margin: space.xl }} color={colors.ink} /> : undefined
      }
      onEndReached={() => p.hasNextPage && !p.isFetchingNextPage && p.fetchNextPage?.()}
      onEndReachedThreshold={0.6}
      refreshControl={
        p.onRefresh ? (
          <RefreshControl
            refreshing={manual}
            tintColor={colors.ink}
            onRefresh={async () => {
              setManual(true);
              try {
                await p.onRefresh!();
              } finally {
                setManual(false);
              }
            }}
          />
        ) : undefined
      }
      initialNumToRender={8}
      windowSize={7}
      contentContainerStyle={{ paddingBottom: space.xxl }}
      keyboardShouldPersistTaps="handled"
    />
  );
}
