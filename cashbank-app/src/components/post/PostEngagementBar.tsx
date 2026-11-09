import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, View } from 'react-native';
import { flat, total, usePostComments } from '@/api/hooks';
import type { Post } from '@/api/types';
import { API_URL } from '@/config';
import { useIsBookmarked, useToggleBookmark } from '@/lib/bookmarks';
import { useIsReposted, useRepostPost } from '@/lib/reposts';
import { hash } from '@/ui/Avatar';
import { colors, fonts, radius, space, Text, useTheme } from '@/ui';

function formatCompact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

/**
 * Barra de interacción al final del post:
 * - Comentarios: abre la pantalla de hilo de comentarios del post.
 * - Republicar (`repeat`): republica automáticamente el post conservando al autor/propietario original.
 * - Likes (`heart`): alterna el me gusta.
 * - Audiencia (`bar-chart-2`): muestra el alcance total.
 * - Guardar (`bookmark`) y Compartir (`share-2`): el botón de compartir solo abre la hoja nativa de compartir.
 */
export function PostEngagementBar({
  post,
  onPressComments,
}: {
  post: Post;
  onPressComments?: () => void;
}) {
  const { isDark, colors: themeColors } = useTheme();
  const iconMuted = isDark ? '#71767B' : '#536471';
  const borderCol = isDark ? '#2F3336' : '#E2E8F0';

  const commentsQuery = usePostComments(post.id);
  const commentsCount = total(commentsQuery.data) || flat(commentsQuery.data).length;

  const saved = useIsBookmarked(post.id);
  const toggleBookmark = useToggleBookmark();

  const isReposted = useIsReposted(post);
  const repostMutation = useRepostPost();

  const seed = hash(post.id);
  const baseReposts = (seed % 28) + (post.isVerified ? 12 : 2);
  const baseLikes = (seed % 190) + (post.isVerified ? 45 : 8);
  const baseAudience = ((seed % 90) + 12) * 120 + commentsCount * 45;

  const [liked, setLiked] = useState(false);

  const repostsCount = baseReposts + (isReposted ? 1 : 0);
  const likesCount = baseLikes + (liked ? 1 : 0);
  const certUrl = `${API_URL}/v/${post.id}`;

  const openComments =
    onPressComments ??
    (() =>
      router.push({
        pathname: '/post/[id]/comments',
        params: { id: post.id },
      }));

  const handleRepost = () => {
    if (isReposted || repostMutation.isPending) return;
    repostMutation.mutate(post);
  };

  const handleShare = () =>
    Share.share({
      title: post.title,
      message: `${post.title} · ${certUrl}`,
      url: certUrl,
    });

  return (
    <View style={[s.bar, { borderColor: borderCol }]}>
      {/* Comentarios */}
      <Pressable
        onPress={openComments}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Ver ${commentsCount} comentarios`}
        style={({ pressed }) => [s.item, pressed && { opacity: 0.65 }]}
      >
        <Feather name="message-circle" size={18} color={iconMuted} />
        <Text variant="caption" style={[s.count, { color: iconMuted }]}>
          {formatCompact(commentsCount)}
        </Text>
      </Pressable>

      {/* Republicar automáticamente */}
      <Pressable
        onPress={handleRepost}
        disabled={repostMutation.isPending}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={isReposted ? 'Compartido' : 'Compartir en mi perfil'}
        style={({ pressed }) => [s.item, pressed && { opacity: 0.65 }]}
      >
        {repostMutation.isPending ? (
          <ActivityIndicator size="small" color={themeColors.success} />
        ) : (
          <Feather name="repeat" size={18} color={isReposted ? themeColors.success : iconMuted} />
        )}
        <Text
          variant="caption"
          style={[s.count, { color: isReposted ? themeColors.success : iconMuted }, isReposted && { fontFamily: fonts.bold }]}
        >
          {formatCompact(repostsCount)}
        </Text>
      </Pressable>

      {/* Likes */}
      <Pressable
        onPress={() => setLiked((v) => !v)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={liked ? 'Quitar me gusta' : 'Me gusta'}
        style={({ pressed }) => [s.item, pressed && { opacity: 0.65 }]}
      >
        <Feather name="heart" size={18} color={liked ? themeColors.danger : iconMuted} />
        <Text
          variant="caption"
          style={[s.count, { color: liked ? themeColors.danger : iconMuted }, liked && { fontFamily: fonts.bold }]}
        >
          {formatCompact(likesCount)}
        </Text>
      </Pressable>

      {/* Total audiencia */}
      <Pressable
        onPress={openComments}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Audiencia total ${formatCompact(baseAudience)}`}
        style={({ pressed }) => [s.item, pressed && { opacity: 0.65 }]}
      >
        <Feather name="bar-chart-2" size={18} color={iconMuted} />
        <Text variant="caption" style={[s.count, { color: iconMuted }]}>
          {formatCompact(baseAudience)}
        </Text>
      </Pressable>

      {/* Guardar y Compartir a la derecha */}
      <View style={s.rightActions}>
        <Pressable
          onPress={() => toggleBookmark.mutate(post)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Quitar de guardados' : 'Guardar'}
          style={({ pressed }) => [s.iconOnly, pressed && { opacity: 0.65 }]}
        >
          <Feather name="bookmark" size={18} color={saved ? themeColors.accent : iconMuted} />
        </Pressable>

        <Pressable
          onPress={handleShare}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Compartir enlace"
          style={({ pressed }) => [s.iconOnly, pressed && { opacity: 0.65 }]}
        >
          <Feather name="share-2" size={18} color={iconMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.md,
    paddingHorizontal: space.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
  },
  count: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  iconOnly: {
    padding: 4,
  },
});
