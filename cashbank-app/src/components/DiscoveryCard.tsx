import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Post } from '@/api/types';
import { readingMinutes } from '@/lib/format';
import { colors, Cover, fonts, radius, space, Text } from '@/ui';

type Props = {
  post: Post;
  width?: number;
};

/**
 * Tarjeta vertical para carruseles horizontales (Explorar / Destacados):
 * portada, categoría en mayúsculas, titular y autor con sello verificado.
 */
export function DiscoveryCard({ post, width = 236 }: Props) {
  const mins = readingMinutes(post.content);
  const sourcesCount = post.sources?.length ?? 0;

  return (
    <Pressable
      onPress={() => router.navigate(`/post/${post.id}`)}
      accessibilityRole="button"
      style={({ pressed }) => [s.card, { width }, pressed && { opacity: 0.8 }]}
    >
      <Cover seed={post.categoryId} imageUrl={post.coverImageUrl} style={s.cover} />
      <View style={s.body}>
        <View style={s.metaRow}>
          <Text variant="caption" numberOfLines={1} style={s.kicker}>
            {(post.categoryName ?? 'Artículo').toUpperCase()}
          </Text>
          <Text variant="caption">
            · {mins} min{sourcesCount > 0 ? ` · ${sourcesCount} f.` : ''}
          </Text>
        </View>
        <Text variant="heading" numberOfLines={3} style={s.title}>
          {post.title}
        </Text>
        <View style={s.authorRow}>
          <Text variant="caption" numberOfLines={1} style={{ flexShrink: 1, color: colors.ink }}>
            @{post.authorUsername ?? 'autor'}
          </Text>
          {post.isVerified && <Feather name="check-circle" size={13} color={colors.success} />}
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  cover: {
    width: '100%',
    height: 132,
  },
  body: {
    padding: space.md,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kicker: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.accent,
    flexShrink: 1,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
});
