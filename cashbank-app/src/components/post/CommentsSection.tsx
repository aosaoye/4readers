import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';
import { flat, total, useMe, usePostComments, useResolveComment } from '@/api/hooks';
import type { Post } from '@/api/types';
import { formatRelativeDate } from '@/lib/format';
import { Avatar, Badge, Button, Card, colors, radius, Section, space, Text, useTheme } from '@/ui';

/**
 * Sección de comentarios y solicitudes de corrección:
 * - Al pulsar la barra de respuesta abre la pantalla dedicada `/post/[id]/comment` estilo X / Twitter.
 * - Muestra las respuestas y fuentes verificables aportadas por los lectores.
 */
export function CommentsSection({ post }: { post: Post }) {
  const { isDark, colors } = useTheme();
  const subtleBg = isDark ? '#16181C' : '#F7F9F9';
  const borderColor = isDark ? '#2F3336' : '#E2E8F0';
  const promptTextColor = isDark ? '#71767B' : '#536471';

  const me = useMe().data;
  const commentsQuery = usePostComments(post.id);
  const resolveComment = useResolveComment(post.id);

  const comments = flat(commentsQuery.data);
  const count = total(commentsQuery.data) || comments.length;
  const canResolve =
    !!me && (me.id === post.authorId || me.role === 'MODERATOR' || me.role === 'ADMIN');

  const openComposer = (mode?: 'correction') => {
    router.push({
      pathname: '/post/[id]/comment',
      params: { id: post.id, ...(mode ? { mode } : {}) },
    });
  };

  return (
    <Section
      title={`Respuestas (${count})`}
      action={
        <Button
          title="Sugerir corrección"
          size="sm"
          variant="secondary"
          icon="link-2"
          onPress={() => openComposer('correction')}
        />
      }
    >
      {/* Barra disparadora estilo Twitter que lleva a la pantalla dedicada de respuesta */}
      <Pressable
        onPress={() => openComposer()}
        accessibilityRole="button"
        accessibilityLabel="Publicar tu respuesta"
        style={({ pressed }) => [
          s.promptBar,
          { backgroundColor: subtleBg, borderColor },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Avatar name={me?.username ?? 'Tú'} avatarUrl={me?.avatarUrl} size={36} />
        <Text variant="body" style={[s.promptText, { color: promptTextColor }]} numberOfLines={1}>
          Publicar tu respuesta…
        </Text>
        <View style={[s.replyPill, { backgroundColor: isDark ? '#FFFFFF' : '#0F1419' }]}>
          <Text variant="label" style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 13 }}>
            Responder
          </Text>
        </View>
      </Pressable>

      {/* Lista de comentarios y correcciones */}
      {comments.length === 0 ? (
        <Card style={{ backgroundColor: subtleBg, borderColor }}>
          <Text variant="caption">
            Aún no hay respuestas. Toca arriba para publicar la primera o aportar una fuente verificable.
          </Text>
        </Card>
      ) : (
        <View style={{ gap: space.md }}>
          {comments.map((c) => (
            <Card key={c.id} style={{ gap: space.sm }}>
              <View style={s.commentHeader}>
                <Pressable
                  disabled={!c.authorUsername}
                  onPress={() => c.authorUsername && router.navigate(`/author/${c.authorUsername}`)}
                  style={s.authorRow}
                >
                  <Avatar name={c.authorUsername ?? '?'} avatarUrl={c.authorAvatarUrl} size={32} />
                  <View style={{ flex: 1 }}>
                    <Text variant="label" style={{ fontSize: 13 }}>
                      @{c.authorUsername ?? 'usuario'}
                    </Text>
                    <Text variant="caption">{formatRelativeDate(c.createdAt)}</Text>
                  </View>
                </Pressable>

                {c.isCorrectionRequest && (
                  <Badge
                    label={c.isResolved ? 'Corrección atendida' : 'Corrección sugerida'}
                    tone={c.isResolved ? 'success' : 'warn'}
                  />
                )}
              </View>

              <Text variant="body">{c.content}</Text>

              {c.sourceUrl && (
                <Pressable
                  onPress={() => WebBrowser.openBrowserAsync(c.sourceUrl!)}
                  style={s.sourceLink}
                  accessibilityRole="link"
                >
                  <Feather name="external-link" size={14} color={colors.accent} />
                  <Text variant="caption" color="accent" numberOfLines={1} style={{ flex: 1 }}>
                    {c.sourceUrl}
                  </Text>
                </Pressable>
              )}

              {c.isCorrectionRequest && !c.isResolved && canResolve && (
                <View style={{ paddingTop: space.xs }}>
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
            </Card>
          ))}

          {commentsQuery.hasNextPage && (
            <Button
              title="Ver más respuestas"
              variant="secondary"
              loading={commentsQuery.isFetchingNextPage}
              onPress={() => commentsQuery.fetchNextPage()}
            />
          )}
        </View>
      )}
    </Section>
  );
}

const s = StyleSheet.create({
  promptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  promptText: {
    flex: 1,
    fontSize: 15,
    color: colors.faint,
  },
  replyPill: {
    backgroundColor: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  commentHeader: {
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
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.md,
  },
});
