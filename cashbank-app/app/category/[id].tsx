import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { flat, useCategories, useFeed } from '@/api/hooks';
import type { SortOrder } from '@/api/types';
import { PostList, SortToggle } from '@/components';
import { Chip, gutter, NavHeader, Screen, ScreenHeader, Text } from '@/ui';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const category = useCategories().data?.find((c) => c.id === id);
  const name = category?.name ?? 'Categoría';
  const feed = useFeed({ categoryId: id, sortOrder, verifiedOnly });

  return (
    <Screen>
      <NavHeader title="Explorar" />
      <PostList
        posts={flat(feed.data)}
        pending={feed.isPending}
        error={feed.error}
        hasNextPage={feed.hasNextPage}
        isFetchingNextPage={feed.isFetchingNextPage}
        fetchNextPage={feed.fetchNextPage}
        onRefresh={() => feed.refetch()}
        empty={{
          title: 'Sin artículos en este tema',
          message: 'Sé la primera persona en publicar aquí.',
        }}
        header={
          <>
            <ScreenHeader kicker="Tema" title={name} />
            {category?.description && (
              <View style={{ paddingHorizontal: gutter, paddingBottom: 8 }}>
                <Text variant="body">{category.description}</Text>
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingRight: gutter,
              }}
            >
              <SortToggle value={sortOrder} onChange={setSortOrder} />
              <Chip
                label="Solo verificados"
                active={verifiedOnly}
                onPress={() => setVerifiedOnly((v) => !v)}
              />
            </View>
          </>
        }
      />
    </Screen>
  );
}
