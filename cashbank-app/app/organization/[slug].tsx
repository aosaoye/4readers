import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, View } from 'react-native';
import { flat, useFeed, useOrganization } from '@/api/hooks';
import { PostList } from '@/components';
import { formatDate } from '@/lib/format';
import {
  Avatar,
  Badge,
  Card,
  ErrorState,
  gutter,
  IconButton,
  NavHeader,
  Screen,
  space,
  Spinner,
  Text,
} from '@/ui';

export default function OrganizationScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const orgQuery = useOrganization(slug);
  const org = orgQuery.data;
  const posts = useFeed({
    categoryId: null,
    sortOrder: 'DESC',
    verifiedOnly: false,
    organizationId: org?.id ?? '__loading__',
  });

  if (!org) {
    return (
      <Screen>
        <NavHeader title="Organización" />
        {orgQuery.isPending ? <Spinner /> : <ErrorState error={orgQuery.error} onRetry={orgQuery.refetch} />}
      </Screen>
    );
  }

  return (
    <Screen>
      <NavHeader
        title={org.name}
        right={
          org.websiteUrl ? (
            <IconButton
              name="external-link"
              label="Visitar sitio web oficial"
              onPress={() => WebBrowser.openBrowserAsync(org.websiteUrl!)}
            />
          ) : undefined
        }
      />
      <PostList
        posts={flat(posts.data)}
        pending={posts.isPending}
        error={posts.error}
        hasNextPage={posts.hasNextPage}
        isFetchingNextPage={posts.isFetchingNextPage}
        fetchNextPage={posts.fetchNextPage}
        onRefresh={() => Promise.all([orgQuery.refetch(), posts.refetch()])}
        empty={{ title: 'Aún no tiene artículos publicados' }}
        header={
          <View style={{ paddingHorizontal: gutter, paddingTop: space.md, paddingBottom: space.lg, gap: space.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
              <Avatar name={org.name} avatarUrl={org.logoUrl} size={64} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
                  <Text variant="title" style={{ fontSize: 26, lineHeight: 30 }}>
                    {org.name}
                  </Text>
                  {org.isVerifiedBrand && <Badge label="Marca verificada" tone="success" />}
                </View>
                <Text variant="caption">
                  @{org.slug} · Registrada el {formatDate(org.createdAt)}
                </Text>
              </View>
            </View>

            {org.bio ? <Text variant="body">{org.bio}</Text> : null}

            {org.members && org.members.length > 0 && (
              <Card style={{ gap: space.sm }}>
                <Text variant="label">Equipo editorial ({org.members.length})</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
                  {org.members.map((m) => (
                    <Pressable
                      key={m.id}
                      disabled={!m.username}
                      onPress={() => m.username && router.navigate(`/author/${m.username}`)}
                    >
                      <Badge label={`${m.username ? `@${m.username}` : 'Miembro'} · ${m.role}`} />
                    </Pressable>
                  ))}
                </View>
              </Card>
            )}

            <Text variant="heading">Publicaciones de {org.name}</Text>
          </View>
        }
      />
    </Screen>
  );
}
