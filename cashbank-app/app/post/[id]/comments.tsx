import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import {
  flat,
  useAuthor,
  useFollowAuthor,
  useMe,
  usePost,
  usePostComments,
  useResolveComment,
  useUnfollowAuthor,
} from '@/api/hooks';
import { PostEngagementBar } from '@/components';
import { formatDateTime, formatRelativeDate } from '@/lib/format';
import { parseRepost } from '@/lib/reposts';
import {
  Avatar,
  Badge,
  Button,
  colors,
  Divider,
  EmptyState,
  ErrorState,
  fonts,
  gutter,
  NavHeader,
  radius,
  Screen,
  SkeletonRows,
  space,
  Spinner,
  Text,
} from '@/ui';

/**
 * Pantalla dedicada de hilo y comentarios del post (estilo X / Twitter, Imagen 1):
 * - Muestra el resumen del post arriba con su fecha/hora y la barra de interacción.
 * - Lista todas las respuestas y solicitudes de corrección debajo.
 * - Incluye la barra inferior fija "Postea tu respuesta" que abre el compositor `/post/[id]/comment`.
 */
export default function PostCommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useMe().data;
  const postQuery = usePost(id);
  const commentsQuery = usePostComments(id);
  const resolveComment = useResolveComment(id);

  const post = postQuery.data;
  const repostMeta = post ? parseRepost(post) : null;
  const authorUsername = repostMeta?.originalAuthor ?? post?.authorUsername ?? '';
  const authorQuery = useAuthor(authorUsername);
  const follow = useFollowAuthor(authorUsername);
  const unfollow = useUnfollowAuthor(authorUsername);

  if (!post) {
    return (
      <Screen>
        <NavHeader title="Post" />
        {postQuery.isPending ? <Spinner /> : <ErrorState error={postQuery.error} onRetry={postQuery.refetch} />}
      </Screen>
    );
  }

  const comments = flat(commentsQuery.data);
  const isMyPost = me?.id === post.authorId;
  const isFollowing = Boolean(authorQuery.data?.isFollowedByMe);
  const canResolve =
    !!me && (me.id === post.authorId || me.role === 'MODERATOR' || me.role === 'ADMIN');

  const openComposer = (mode?: 'correction') => {
    router.push({
      pathname: '/post/[id]/comment',
      params: { id: post.id, ...(mode ? { mode } : {}) },
    });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <NavHeader title="Post" />
      <Divider />

      <FlatList
        data={comments}
        keyExtractor={(c) => c.id}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={
          <View style={s.postHeader}>
            {repostMeta?.isRepost && repostMeta.repostedBy && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="repeat" size={13} color={colors.success} />
                <Text variant="caption" style={{ color: colors.success, fontFamily: fonts.semibold }}>
                  Compartido por @{repostMeta.repostedBy}
                </Text>
              </View>
            )}
            {/* Fila de propietario/autor original estilo Imagen 1 */}
            <View style={s.authorRow}>
              <Pressable
                disabled={!authorUsername}
                onPress={() => authorUsername && router.navigate(`/author/${authorUsername}`)}
                style={s.authorLeft}
              >
                <Avatar
                  name={authorUsername || '?'}
                  avatarUrl={authorQuery.data?.avatarUrl}
                  size={44}
                />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text variant="heading" numberOfLines={1}>
                      {authorUsername || 'Autor'}
                    </Text>
                    {post.isVerified && <Feather name="check-circle" size={14} color={colors.success} />}
                  </View>
                  <Text variant="caption">@{authorUsername || 'autor'}</Text>
                </View>
              </Pressable>

              {me?.username !== authorUsername && !!authorUsername && (
                <Button
                  title={isFollowing ? 'Siguiendo' : 'Seguir'}
                  size="sm"
                  variant={isFollowing ? 'secondary' : 'primary'}
                  loading={follow.isPending || unfollow.isPending}
                  onPress={() => (isFollowing ? unfollow.mutate() : follow.mutate())}
                />
              )}
            </View>

            {/* Titular y extracto del post */}
            <Pressable onPress={() => router.navigate(`/post/${post.id}`)} style={{ gap: 6 }}>
              <Text variant="heading" style={{ fontSize: 18, lineHeight: 24 }}>
                {post.title}
              </Text>
              <Text variant="body" style={{ color: colors.ink }}>
                {repostMeta?.cleanSummary ?? post.summary}
              </Text>
            </Pressable>

            {/* Fecha y hora estilo Imagen 1 ("12:35 · 07 nov 26") */}
            <Text variant="caption" style={{ paddingTop: 2 }}>
              {formatDateTime(post.publishedAt ?? post.createdAt)}
            </Text>

            {/* Barra de interacción de 5 bloques */}
            <PostEngagementBar post={post} onPressComments={() => openComposer()} />
          </View>
        }
        renderItem={({ item: c }) => (
          <View style={s.commentRow}>
            <Pressable
              disabled={!c.authorUsername}
              onPress={() => c.authorUsername && router.navigate(`/author/${c.authorUsername}`)}
            >
              <Avatar name={c.authorUsername ?? '?'} avatarUrl={c.authorAvatarUrl} size={38} />
            </Pressable>

            <View style={{ flex: 1, gap: 6 }}>
              <View style={s.commentMeta}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Text variant="label" numberOfLines={1}>
                    @{c.authorUsername ?? 'usuario'}
                  </Text>
                  <Text variant="caption">· {formatRelativeDate(c.createdAt)}</Text>
                </View>
                {c.isCorrectionRequest && (
                  <Badge
                    label={c.isResolved ? 'Atendida' : 'Corrección'}
                    tone={c.isResolved ? 'success' : 'warn'}
                  />
                )}
              </View>

              <Text variant="body" style={{ color: colors.ink }}>
                {c.content}
              </Text>

              {c.sourceUrl && (
                <Pressable
                  onPress={() => WebBrowser.openBrowserAsync(c.sourceUrl!)}
                  style={s.sourceLink}
                  accessibilityRole="link"
                >
                  <Feather name="external-link" size={13} color={colors.accent} />
                  <Text variant="caption" color="accent" numberOfLines={1} style={{ flex: 1 }}>
                    {c.sourceUrl}
                  </Text>
                </Pressable>
              )}

              {c.isCorrectionRequest && !c.isResolved && canResolve && (
                <View style={{ alignSelf: 'flex-start', paddingTop: 2 }}>
                  <Button
                    title="Marcar corrección como atendida"
                    size="sm"
                    variant="secondary"
                    icon="check"
                    loading={resolveComment.isPending && resolveComment.variables === c.id}
                    onPress={() => resolveComment.mutate(c.id)}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          commentsQuery.isPending ? (
            <SkeletonRows count={3} />
          ) : commentsQuery.error ? (
            <ErrorState error={commentsQuery.error} onRetry={commentsQuery.refetch} />
          ) : (
            <EmptyState
              icon="message-circle"
              title="Sé la primera persona en responder"
              message="Pulsa abajo en 'Postea tu respuesta' para comentar o aportar una fuente verificable."
            />
          )
        }
        ListFooterComponent={
          commentsQuery.isFetchingNextPage ? (
            <ActivityIndicator style={{ margin: space.xl }} color={colors.ink} />
          ) : undefined
        }
        onEndReached={() =>
          commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage && commentsQuery.fetchNextPage()
        }
        onEndReachedThreshold={0.6}
        refreshControl={
          <RefreshControl
            refreshing={false}
            tintColor={colors.ink}
            onRefresh={() => {
              postQuery.refetch();
              commentsQuery.refetch();
            }}
          />
        }
        contentContainerStyle={{ paddingBottom: space.xxl }}
      />

      {/* Barra inferior acoplada estilo Imagen 1 ("Postea tu respuesta") */}
      <View style={s.bottomComposerWrap}>
        <Pressable
          onPress={() => openComposer()}
          accessibilityRole="button"
          accessibilityLabel="Postea tu respuesta"
          style={({ pressed }) => [s.bottomPill, pressed && { opacity: 0.8 }]}
        >
          <Avatar name={me?.username ?? 'Tú'} avatarUrl={me?.avatarUrl} size={30} />
          <Text variant="body" style={s.bottomPlaceholder} numberOfLines={1}>
            Postea tu respuesta
          </Text>
          <View style={s.bottomIcons}>
            <Pressable
              onPress={() => openComposer('correction')}
              hitSlop={8}
              accessibilityLabel="Sugerir corrección con fuente"
            >
              <Feather name="link-2" size={18} color={colors.muted} />
            </Pressable>
            <Feather name="maximize-2" size={17} color={colors.muted} />
          </View>
        </Pressable>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  postHeader: {
    paddingHorizontal: gutter,
    paddingTop: space.md,
    gap: space.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flex: 1,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingHorizontal: gutter,
    paddingVertical: space.md,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: space.md,
    paddingVertical: 5,
    borderRadius: radius.md,
  },
  bottomComposerWrap: {
    paddingHorizontal: gutter,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
  bottomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    height: 46,
  },
  bottomPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: colors.faint,
  },
  bottomIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingRight: 4,
  },
});
