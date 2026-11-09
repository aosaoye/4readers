import { router } from 'expo-router';
import { flat, useMe, useModerationQueue } from '@/api/hooks';
import { PostList } from '@/components/PostList';
import { NavHeader, Screen, ScreenHeader } from '@/ui';

export default function ModerationQueue() {
  const role = useMe().data?.role;
  const q = useModerationQueue(role === 'MODERATOR' || role === 'ADMIN');
  return (
    <Screen>
      <NavHeader title="Moderación" />
      <PostList
        posts={flat(q.data)} pending={q.isPending} error={q.error}
        hasNextPage={q.hasNextPage} isFetchingNextPage={q.isFetchingNextPage} fetchNextPage={q.fetchNextPage}
        onRefresh={() => q.refetch()}
        onOpen={(p) => router.push(`/moderation/${p.id}`)}
        empty={{ icon: 'check-circle', title: 'Todo al día', message: 'No hay artículos esperando verificación.' }}
        header={<ScreenHeader kicker="Pendientes" title="Por verificar" />}
      />
    </Screen>
  );
}
