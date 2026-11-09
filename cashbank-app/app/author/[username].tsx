import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Share, View } from 'react-native';
import { flat, useAuthor, useAuthorPosts, useFollowAuthor, useMe, useUnfollowAuthor } from '@/api/hooks';
import { PostList } from '@/components';
import { API_URL } from '@/config';
import { formatDate } from '@/lib/format';
import { Avatar, Badge, Button, Card, ErrorState, gutter, IconButton, NavHeader, Screen, space, Spinner, Text } from '@/ui';

const Stat = ({ value, label }: { value: string; label: string }) => (
  <View style={{ flex: 1, gap: 2 }}>
    <Text variant="title" style={{ fontSize: 22, lineHeight: 26 }}>
      {value}
    </Text>
    <Text variant="caption">{label}</Text>
  </View>
);

/** Perfil público: la reputación sale de verificaciones reales, permite seguir al autor y evita apilar pantallas en bucle. */
export default function AuthorScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const me = useMe().data;
  const author = useAuthor(username);
  const posts = useAuthorPosts(author.data?.id);
  const follow = useFollowAuthor(username);
  const unfollow = useUnfollowAuthor(username);
  const a = author.data;

  if (!a) {
    return (
      <Screen>
        <NavHeader title="Autor" />
        {author.isPending ? <Spinner /> : <ErrorState error={author.error} onRetry={author.refetch} />}
      </Screen>
    );
  }

  const publicProfileUrl = `${API_URL}/u/${encodeURIComponent(a.username)}`;
  const isMe = me?.id === a.id || me?.username === a.username;
  const isFollowing = Boolean(a.isFollowedByMe);

  return (
    <Screen>
      <NavHeader
        title={`@${a.username}`}
        right={
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <IconButton
              name="external-link"
              label="Abrir perfil web público"
              onPress={() => WebBrowser.openBrowserAsync(publicProfileUrl)}
            />
            <IconButton
              name="share-2"
              label="Compartir perfil del autor"
              onPress={() =>
                Share.share({
                  title: `${a.username} en CashBank`,
                  message: `Perfil verificado de ${a.username}: ${publicProfileUrl}`,
                  url: publicProfileUrl,
                })
              }
            />
          </View>
        }
      />
      <PostList
        posts={flat(posts.data)}
        pending={posts.isPending}
        error={posts.error}
        hasNextPage={posts.hasNextPage}
        isFetchingNextPage={posts.isFetchingNextPage}
        fetchNextPage={posts.fetchNextPage}
        onRefresh={() => Promise.all([author.refetch(), posts.refetch()])}
        onOpen={(post) =>
          router.navigate({
            pathname: '/post/[id]',
            params: { id: post.id, fromAuthor: a.username },
          })
        }
        empty={{ title: 'Aún no ha publicado' }}
        header={
          <View style={{ paddingHorizontal: gutter, paddingTop: space.md, paddingBottom: space.lg, gap: space.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
              <Avatar name={a.username} avatarUrl={a.avatarUrl} size={68} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
                  <Text variant="title" style={{ fontSize: 28, lineHeight: 32 }}>
                    @{a.username}
                  </Text>
                  {a.verifiedPosts > 0 && <Badge label="Autor verificado" tone="success" />}
                </View>
                <Text variant="caption">Miembro desde {formatDate(a.memberSince)}</Text>
              </View>
            </View>

            {a.bio ? <Text variant="body">{a.bio}</Text> : null}

            {!isMe && (
              <Button
                title={isFollowing ? 'Siguiendo · Dejar de seguir' : 'Seguir autor'}
                variant={isFollowing ? 'secondary' : 'primary'}
                icon={isFollowing ? 'user-check' : 'user-plus'}
                loading={follow.isPending || unfollow.isPending}
                onPress={() => (isFollowing ? unfollow.mutate() : follow.mutate())}
              />
            )}

            <Card style={{ flexDirection: 'row', gap: space.sm }}>
              <Stat value={String(a.followersCount ?? 0)} label="seguidores" />
              <Stat value={String(a.publishedPosts)} label="publicados" />
              <Stat value={String(a.verifiedPosts)} label="verificados" />
              <Stat value={a.averageTrustScore == null ? '–' : `${a.averageTrustScore}/100`} label="confianza" />
            </Card>

            <Text variant="heading">Obras publicadas</Text>
          </View>
        }
      />
    </Screen>
  );
}
