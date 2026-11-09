import { useState } from 'react';
import { View } from 'react-native';
import { flat, useMyPosts } from '@/api/hooks';
import { PostList } from '@/components/PostList';
import { postStatusLabel, verificationLabel } from '@/lib/format';
import { Badge, ChipRow, NavHeader, Screen, ScreenHeader } from '@/ui';

const FILTERS = [
  { key: 'all', label: 'Todos' }, { key: 'UNVERIFIED', label: 'Sin verificar' },
  { key: 'PENDING', label: 'En revisión' }, { key: 'VERIFIED', label: 'Verificados' },
];

export default function MyPosts() {
  const [status, setStatus] = useState('all');
  const q = useMyPosts(status === 'all' ? null : status);
  return (
    <Screen>
      <NavHeader title="Mis artículos" />
      <PostList
        posts={flat(q.data)} pending={q.isPending} error={q.error}
        hasNextPage={q.hasNextPage} isFetchingNextPage={q.isFetchingNextPage} fetchNextPage={q.fetchNextPage}
        onRefresh={() => q.refetch()}
        badge={(p) => {
          const [label, tone] = p.status === 'REJECTED' ? postStatusLabel.REJECTED : verificationLabel[p.verificationStatus];
          return <Badge label={label} tone={tone} />;
        }}
        empty={{ title: 'Aún no has publicado', message: 'Publicar es gratis. Cuando quieras, pide la insignia de verificación desde cada artículo.' }}
        header={<><ScreenHeader kicker="Autoría" title="Lo que has escrito" /><ChipRow options={FILTERS} value={status} onChange={setStatus} />
          <View style={{ height: 8 }} /></>}
      />
    </Screen>
  );
}
