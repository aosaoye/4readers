import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { flat, useModerationQueue } from '@/api/hooks';
import { Badge, Button, Card, colors, Divider, EmptyState, ListRow, Section, space } from '@/ui';

/** Pestaña 2 de administración: Cola de moderación con enlace directo a la pantalla de revisión y prechequeo. */
export function ModerationTab() {
  const q = useModerationQueue(true);
  const posts = flat(q.data);

  return (
    <Section
      title="Artículos pendientes de verificación"
      action={
        <Button
          title="Actualizar"
          size="sm"
          variant="secondary"
          icon="refresh-cw"
          onPress={() => q.refetch()}
        />
      }
    >
      {q.isPending ? (
        <ActivityIndicator color={colors.ink} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="check-circle"
          title="Todo al día"
          message="No hay artículos esperando verificación en la cola."
        />
      ) : (
        <Card style={{ paddingHorizontal: 0, paddingVertical: space.xs }}>
          {posts.map((p, i) => (
            <View key={p.id}>
              {i > 0 && <Divider />}
              <ListRow
                title={p.title}
                subtitle={`@${p.authorUsername ?? 'autor'} · ${p.sources.length} fuente(s)`}
                right={<Badge label="Revisar" tone="warn" />}
                onPress={() => router.navigate(`/moderation/${p.id}`)}
              />
            </View>
          ))}
        </Card>
      )}
    </Section>
  );
}
