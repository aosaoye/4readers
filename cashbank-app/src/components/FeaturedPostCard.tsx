import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { Post } from '@/api/types';
import { formatRelativeDate } from '@/lib/format';
import { parseRepost } from '@/lib/reposts';
import { Avatar, Badge, Cover, fonts, gutter, radius, space, Text, useTheme } from '@/ui';
import { PostEngagementBar } from './post';

type Props = {
  post?: Post;
  posts?: Post[];
};

const SCREEN_W = Dimensions.get('window').width;
const GAP = 14;

function HeroCardItem({ item, width }: { item: Post; width: number }) {
  const { colors: themeColors } = useTheme();
  const repostMeta = parseRepost(item);
  const ownerUsername = repostMeta.originalAuthor;

  return (
    <Pressable
      onPress={() => router.navigate(`/post/${item.id}`)}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.card,
        {
          width,
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
        pressed && { opacity: 0.94 },
      ]}
    >
      {repostMeta.isRepost && repostMeta.repostedBy && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Feather name="repeat" size={13} color={themeColors.success} />
          <Text
            variant="caption"
            style={{ color: themeColors.success, fontFamily: fonts.semibold }}
          >
            Compartido por @{repostMeta.repostedBy}
          </Text>
        </View>
      )}

      {/* Cabecera del autor original + categoría */}
      <View style={s.header}>
        <Pressable
          disabled={!ownerUsername}
          onPress={() => ownerUsername && router.navigate(`/author/${ownerUsername}`)}
          style={s.authorRow}
        >
          <Avatar name={ownerUsername ?? item.categoryName ?? '?'} size={40} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text
                variant="label"
                numberOfLines={1}
                style={{ flexShrink: 1, color: themeColors.text }}
              >
                {ownerUsername}
              </Text>
              {item.isVerified && (
                <Feather
                  name="check-circle"
                  size={15}
                  color={themeColors.success}
                  accessibilityLabel="Verificado"
                />
              )}
            </View>
            <Text
              variant="caption"
              style={{ color: themeColors.textMuted }}
            >
              {formatRelativeDate(item.publishedAt ?? item.createdAt)}
            </Text>
          </View>
        </Pressable>
        {item.categoryName ? <Badge label={item.categoryName} /> : null}
      </View>

      {/* Titular y resumen */}
      <View style={{ gap: 6 }}>
        <Text
          variant="heading"
          style={[s.title, { color: themeColors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          variant="body"
          numberOfLines={2}
          style={{ fontSize: 14, lineHeight: 20, color: themeColors.textSecondary }}
        >
          {repostMeta.cleanSummary}
        </Text>
      </View>

      {/* Portada con insignia flotante */}
      <View style={s.coverWrap}>
        <Cover seed={item.categoryId} imageUrl={item.coverImageUrl} style={s.cover} />
        <View style={s.coverBadges}>
          {item.isVerified ? (
            <Badge label="Certificado verificado" tone="success" />
          ) : (
            <Badge label="Publicación abierta" />
          )}
          {item.isPremium && (
            <Badge
              label={item.isLocked ? `Premium · ${item.unlockPriceTokens} fichas` : 'Premium'}
              tone="accent"
            />
          )}
        </View>
      </View>

      {/* Barra inferior con comentarios, compartidos, likes, total audiencia y guardar */}
      <PostEngagementBar post={item} />
    </Pressable>
  );
}

/**
 * Carrusel horizontal de tarjetas destacadas con asomo de la siguiente tarjeta a la derecha.
 */
export function FeaturedPostCard({ post, posts }: Props) {
  const deck = useMemo(() => {
    if (posts && posts.length > 0) return posts;
    return post ? [post] : [];
  }, [post, posts]);

  if (deck.length === 0) return null;

  // Si hay más de 1 tarjeta, cada tarjeta deja ver 28px de la siguiente a la derecha al deslizar
  const cardWidth = deck.length > 1 ? SCREEN_W - gutter * 2 - 28 : SCREEN_W - gutter * 2;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={cardWidth + GAP}
      snapToAlignment="start"
      contentContainerStyle={s.carouselContent}
    >
      {deck.map((item) => (
        <HeroCardItem key={item.id} item={item} width={cardWidth} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  carouselContent: {
    paddingHorizontal: gutter,
    paddingTop: space.md,
    paddingBottom: space.sm,
    gap: GAP,
  },
  card: {
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flex: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  coverWrap: {
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  cover: {
    height: 168,
    width: '100%',
    borderRadius: radius.md,
  },
  coverBadges: {
    position: 'absolute',
    left: space.md,
    bottom: space.md,
    flexDirection: 'row',
    gap: space.xs,
    flexWrap: 'wrap',
  },
});
