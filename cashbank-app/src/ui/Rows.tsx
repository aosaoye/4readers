import { Feather } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Post } from '@/api/types';
import { formatRelativeDate, readingMinutes } from '@/lib/format';
import { parseRepost } from '@/lib/reposts';
import { Avatar } from './Avatar';
import { Cover } from './Cover';
import { Text } from './Text';
import { colors, fonts, gutter, radius, space } from './theme';

/** La fila de artículo del diseño. La usan Inicio, Explorar, Guardados, Mis artículos y Moderación. */
export function PostRow({ post, onPress, badge }: { post: Post; onPress: () => void; badge?: ReactNode }) {
  const mins = readingMinutes(post.content);
  const sourcesCount = post.sources?.length ?? 0;
  const repostMeta = parseRepost(post);
  const ownerUsername = repostMeta.originalAuthor;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.post, pressed && { opacity: 0.7 }]} accessibilityRole="button">
      <Cover seed={post.categoryId} imageUrl={post.coverImageUrl} style={s.thumb} />
      <View style={{ flex: 1, gap: 6, justifyContent: 'space-between' }}>
        {repostMeta.isRepost && repostMeta.repostedBy && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Feather name="repeat" size={12} color={colors.success} />
            <Text variant="caption" style={{ color: colors.success, fontFamily: fonts.semibold }}>
              Compartido por @{repostMeta.repostedBy}
            </Text>
          </View>
        )}
        <View style={s.metaRow}>
          {post.categoryName ? (
            <View style={s.catPill}>
              <Text variant="caption" numberOfLines={1} style={s.catText}>{post.categoryName}</Text>
            </View>
          ) : null}
          {post.isPremium && (
            <View style={[s.catPill, { backgroundColor: colors.accentSoft }]}>
              <Text variant="caption" numberOfLines={1} style={[s.catText, { color: colors.accent }]}>
                {post.isLocked ? `🔒 ${post.unlockPriceTokens ?? ''} fichas` : 'Premium'}
              </Text>
            </View>
          )}
          <Text variant="caption">{mins} min</Text>
          {sourcesCount > 0 && <Text variant="caption">· {sourcesCount} {sourcesCount === 1 ? 'fuente' : 'fuentes'}</Text>}
        </View>

        <Text variant="heading" numberOfLines={2}>{post.title}</Text>

        <View style={s.author}>
          <Avatar name={ownerUsername ?? post.categoryName ?? '?'} size={34} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text variant="label" color="muted" numberOfLines={1} style={{ flexShrink: 1, fontSize: 13 }}>
                {post.organizationName ? `${ownerUsername} · ${post.organizationName}` : ownerUsername}
              </Text>
              {post.isVerified && <Feather name="check-circle" size={14} color={colors.success} accessibilityLabel="Verificado" />}
            </View>
            <Text variant="caption">{formatRelativeDate(post.publishedAt ?? post.createdAt)}</Text>
          </View>
          {badge ?? <Feather name="chevron-right" size={20} color={colors.muted} />}
        </View>
      </View>
    </Pressable>
  );
}

type RowProps = {
  title: string; subtitle?: string; icon?: keyof typeof Feather.glyphMap; right?: ReactNode;
  onPress?: () => void; chevron?: boolean; destructive?: boolean;
};
/** Fila genérica de lista: perfil, movimientos, compras, categorías, paquetes. */
export function ListRow({ title, subtitle, icon, right, onPress, chevron, destructive }: RowProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]} accessibilityRole={onPress ? 'button' : undefined}>
      {icon && (
        <View style={s.iconWrap}><Feather name={icon} size={20} color={destructive ? colors.danger : colors.ink} /></View>
      )}
      <View style={{ flex: 1 }}>
        <Text variant="heading" style={destructive && { color: colors.danger }} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text variant="caption" style={{ marginTop: 2 }} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {right}
      {(chevron ?? !!onPress) && <Feather name="chevron-right" size={22} color={colors.muted} />}
    </Pressable>
  );
}

export const Divider = () => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.line }} />;

const s = StyleSheet.create({
  post: { flexDirection: 'row', gap: space.lg, paddingHorizontal: gutter, paddingVertical: space.md },
  thumb: { width: 126, height: 112, borderRadius: radius.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  catPill: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  catText: { fontFamily: fonts.medium, fontSize: 11, color: colors.ink },
  author: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, paddingHorizontal: gutter },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
