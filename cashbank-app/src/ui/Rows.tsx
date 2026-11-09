// src/ui/Rows.tsx
import { Feather } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Post } from '@/api/types';
import { formatRelativeDate, readingMinutes } from '@/lib/format';
import { parseRepost } from '@/lib/reposts';
import { Avatar } from './Avatar';
import { Cover } from './Cover';
import { Text } from './Text';
import { fonts, gutter, radius, space, useTheme } from './theme';

/** La fila de artículo del diseño. La usan Inicio, Explorar, Guardados, Mis artículos y Moderación. */
export function PostRow({
  post,
  onPress,
  badge,
}: {
  post: Post;
  onPress: () => void;
  badge?: ReactNode;
}) {
  const { colors } = useTheme();
  const mins = readingMinutes(post.content);
  const sourcesCount = post.sources?.length ?? 0;
  const repostMeta = parseRepost(post);
  const ownerUsername = repostMeta.originalAuthor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.post, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
    >
      <Cover seed={post.categoryId} imageUrl={post.coverImageUrl} style={s.thumb} />
      <View style={{ flex: 1, gap: 6, justifyContent: 'space-between' }}>
        {repostMeta.isRepost && repostMeta.repostedBy && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Feather name="repeat" size={12} color={colors.success} />
            <Text
              variant="caption"
              style={{ color: colors.success, fontFamily: fonts.semibold }}
            >
              Compartido por @{repostMeta.repostedBy}
            </Text>
          </View>
        )}

        <View style={s.metaRow}>
          {post.categoryName ? (
            <View style={[s.catPill, { backgroundColor: colors.surfaceSubtle }]}>
              <Text
                variant="caption"
                numberOfLines={1}
                style={[s.catText, { color: colors.textSecondary }]}
              >
                {post.categoryName}
              </Text>
            </View>
          ) : null}
          {post.isPremium && (
            <View style={[s.catPill, { backgroundColor: colors.primarySoft }]}>
              <Text
                variant="caption"
                numberOfLines={1}
                style={[s.catText, { color: colors.accent }]}
              >
                {post.isLocked ? `🔒 ${post.unlockPriceTokens ?? ''} fichas` : 'Premium'}
              </Text>
            </View>
          )}
          <Text variant="caption" tone="muted">
            {mins} min
          </Text>
          {sourcesCount > 0 && (
            <Text variant="caption" tone="muted">
              · {sourcesCount} {sourcesCount === 1 ? 'fuente' : 'fuentes'}
            </Text>
          )}
        </View>

        <Text variant="heading" numberOfLines={2} style={{ color: colors.text }}>
          {post.title}
        </Text>

        <View style={s.author}>
          <Avatar name={ownerUsername ?? post.categoryName ?? '?'} size={34} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text
                variant="label"
                numberOfLines={1}
                style={{ flexShrink: 1, fontSize: 13, color: colors.textSecondary }}
              >
                {post.organizationName
                  ? `${ownerUsername} · ${post.organizationName}`
                  : ownerUsername}
              </Text>
              {post.isVerified && (
                <Feather
                  name="check-circle"
                  size={14}
                  color={colors.success}
                  accessibilityLabel="Verificado"
                />
              )}
            </View>
            <Text variant="caption" tone="muted">
              {formatRelativeDate(post.publishedAt ?? post.createdAt)}
            </Text>
          </View>
          {badge ?? <Feather name="chevron-right" size={20} color={colors.textMuted} />}
        </View>
      </View>
    </Pressable>
  );
}

type RowProps = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Feather.glyphMap;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
};

/** Fila genérica de lista: perfil, movimientos, compras, categorías, paquetes. */
export function ListRow({
  title,
  subtitle,
  icon,
  right,
  onPress,
  chevron,
  destructive,
}: RowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {icon && (
        <View style={[s.iconWrap, { backgroundColor: colors.surfaceSubtle }]}>
          <Feather
            name={icon}
            size={20}
            color={destructive ? colors.danger : colors.text}
          />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text
          variant="heading"
          style={[{ color: destructive ? colors.danger : colors.text }]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            variant="caption"
            tone="muted"
            style={{ marginTop: 2 }}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {(chevron ?? !!onPress) && (
        <Feather name="chevron-right" size={22} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
      }}
    />
  );
}

const s = StyleSheet.create({
  post: {
    flexDirection: 'row',
    gap: space.lg,
    paddingHorizontal: gutter,
    paddingVertical: space.md,
  },
  thumb: {
    width: 126,
    height: 112,
    borderRadius: radius.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  catPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  catText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: gutter,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
