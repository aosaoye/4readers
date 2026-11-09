import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import {
  flat,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/api/hooks';
import type { NotificationItem } from '@/api/types';
import { formatRelativeDate } from '@/lib/format';
import {
  Avatar,
  Button,
  colors,
  Divider,
  ErrorState,
  fonts,
  gutter,
  IconButton,
  radius,
  Screen,
  SkeletonRows,
  space,
  Text,
} from '@/ui';

type NotifTab = 'all' | 'mentions' | 'verified';

const TABS: { key: NotifTab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'all', label: 'Todas', icon: 'bell' },
  { key: 'mentions', label: 'Menciones', icon: 'at-sign' },
  { key: 'verified', label: 'Verificado', icon: 'check-circle' },
];

function getNotifVisual(type: string): {
  icon: keyof typeof Feather.glyphMap;
  color: string;
} {
  const t = type.toUpperCase();
  if (t.includes('VERIF') || t.includes('CERT')) return { icon: 'shield', color: colors.success };
  if (t.includes('FOLLOW')) return { icon: 'user-plus', color: colors.accent };
  if (t.includes('COMMENT') || t.includes('CORRECTION')) return { icon: 'message-circle', color: colors.accent };
  if (t.includes('TIP') || t.includes('UNLOCK')) return { icon: 'zap', color: colors.warn };
  if (t.includes('WITHDRAWAL') || t.includes('KYC') || t.includes('BONUS')) {
    return { icon: 'award', color: colors.success };
  }
  return { icon: 'star', color: colors.accent };
}

export default function NotificationsScreen() {
  const [tab, setTab] = useState<NotifTab>('all');
  const q = useNotifications();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const allItems = useMemo(() => flat(q.data), [q.data]);
  const hasUnread = allItems.some((n) => !n.isRead);

  const filteredItems = useMemo(() => {
    if (tab === 'all') return allItems;
    if (tab === 'mentions') {
      return allItems.filter((n) => {
        const t = n.type.toUpperCase();
        return (
          t.includes('COMMENT') ||
          t.includes('CORRECTION') ||
          t.includes('FOLLOW') ||
          t.includes('TIP') ||
          t.includes('MENTION')
        );
      });
    }
    return allItems.filter((n) => {
      const t = n.type.toUpperCase();
      return (
        t.includes('VERIF') ||
        t.includes('POST') ||
        t.includes('KYC') ||
        t.includes('WITHDRAWAL') ||
        t.includes('BONUS') ||
        t.includes('SLA')
      );
    });
  }, [allItems, tab]);

  const openNotification = (n: NotificationItem) => {
    if (!n.isRead) markOne.mutate(n.id);
    const t = n.type.toUpperCase();
    if (n.referenceId && (t.includes('COMMENT') || t.includes('CORRECTION'))) {
      router.navigate({ pathname: '/post/[id]/comments', params: { id: n.referenceId } });
    } else if (n.referenceId && (t.includes('POST') || t.includes('TIP') || t.includes('VERIF') || t.includes('UNLOCK'))) {
      router.navigate(`/post/${n.referenceId}`);
    } else if (t.includes('WITHDRAWAL') || t.includes('KYC')) {
      router.navigate('/payouts');
    } else if (t.includes('BONUS') || t.includes('WALLET')) {
      router.navigate('/wallet');
    }
  };

  return (
    <Screen>
      {/* Cabecera estilo referencia: atrás a la izquierda, título centrado, acción a la derecha */}
      <View style={s.headerBar}>
        <View style={s.headerSide}>
          <IconButton
            name="arrow-left"
            label="Volver"
            onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}
          />
        </View>

        <Text variant="heading" style={s.headerTitle}>
          Notificaciones
        </Text>

        <View style={[s.headerSide, { justifyContent: 'flex-end' }]}>
          <IconButton
            name={hasUnread ? 'check-circle' : 'settings'}
            label={hasUnread ? 'Marcar todas como leídas' : 'Ajustes de notificaciones'}
            active={hasUnread}
            onPress={() => (hasUnread ? markAll.mutate() : router.push('/notifications-settings'))}
          />
        </View>
      </View>

      {/* Pestañas de ancho completo con indicador inferior (Todas | Menciones | Verificado) */}
      <View style={s.tabsBar}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={s.tabItem}
            >
              <View style={s.tabLabelRow}>
                {active && <Feather name={t.icon} size={15} color={colors.ink} />}
                <Text
                  variant="label"
                  style={[
                    s.tabText,
                    { color: active ? colors.ink : colors.muted },
                    active && { fontFamily: fonts.bold },
                  ]}
                >
                  {t.label}
                </Text>
              </View>
              <View style={[s.tabIndicator, active && s.tabIndicatorActive]} />
            </Pressable>
          );
        })}
      </View>
      <Divider />

      <FlatList
        data={filteredItems}
        keyExtractor={(x) => x.id}
        ItemSeparatorComponent={Divider}
        renderItem={({ item }) => {
          const visual = getNotifVisual(item.type);
          return (
            <Pressable
              onPress={() => openNotification(item)}
              style={({ pressed }) => [
                s.notifRow,
                !item.isRead && s.notifUnread,
                pressed && { opacity: 0.75 },
              ]}
            >
              {/* Columna izquierda con icono semántico (como la estrella o el icono de seguidor en Imagen 1) */}
              <View style={s.leftIconCol}>
                <Feather name={visual.icon} size={20} color={visual.color} />
              </View>

              {/* Columna central con Avatar, título, tiempo relativo y cuerpo */}
              <View style={s.notifContent}>
                <View style={s.notifTopRow}>
                  <Avatar name={item.title} size={34} />
                  {!item.isRead && <View style={s.unreadDot} />}
                </View>

                <View style={s.titleTimeRow}>
                  <Text variant="heading" numberOfLines={1} style={{ fontSize: 15, flexShrink: 1 }}>
                    {item.title}
                  </Text>
                  <Text variant="caption">· {formatRelativeDate(item.createdAt)}</Text>
                </View>

                <Text variant="body" style={{ fontSize: 15, lineHeight: 21 }}>
                  {item.body}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          q.isPending ? (
            <SkeletonRows count={4} />
          ) : q.error ? (
            <ErrorState error={q.error} onRetry={q.refetch} />
          ) : tab === 'mentions' ? (
            /* Estado vacío de Menciones (Imagen 2) */
            <View style={s.emptyEditorial}>
              <Text variant="display" style={s.emptyTitle}>
                Únete a la conversación
              </Text>
              <Text variant="body" style={s.emptyBody}>
                Cuando alguien en CashBank comente tus artículos, sugiera una corrección respaldada por fuentes, te siga o te envíe una propina, lo verás aquí.
              </Text>
            </View>
          ) : tab === 'verified' ? (
            /* Estado vacío de Verificado (Imagen 3) */
            <View style={s.emptyEditorial}>
              <Text variant="display" style={s.emptyTitle}>
                No hay nada para ver aquí... por ahora
              </Text>
              <Text variant="body" style={s.emptyBody}>
                Dictámenes de verificación de tus fuentes, certificados oficiales, propinas verificadas y cobros: cuando provenga de una auditoría verificada, lo verás aquí.{' '}
                <Text
                  variant="body"
                  color="accent"
                  onPress={() => router.push('/my-posts')}
                  style={{ fontFamily: fonts.semibold }}
                >
                  Ver mis artículos
                </Text>
              </Text>
              <Text variant="body" style={s.emptyBody}>
                ¿Aún no has verificado tus publicaciones? Consigue fichas para auditar tus fuentes y obtener el sello oficial portable.
              </Text>
              <View style={{ alignSelf: 'flex-start', paddingTop: space.xs }}>
                <Button
                  title="Obtener fichas"
                  onPress={() => router.push('/store')}
                />
              </View>
            </View>
          ) : (
            /* Estado vacío de Todas */
            <View style={s.emptyEditorial}>
              <Text variant="display" style={s.emptyTitle}>
                No hay nada para ver aquí... por ahora
              </Text>
              <Text variant="body" style={s.emptyBody}>
                Aquí recibirás alertas en tiempo real cuando un moderador audite tus fuentes, otros lectores comenten tus artículos o recibas propinas y cobros.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          q.isFetchingNextPage ? (
            <ActivityIndicator style={{ margin: space.xl }} color={colors.ink} />
          ) : undefined
        }
        onEndReached={() => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()}
        onEndReachedThreshold={0.6}
        refreshControl={
          <RefreshControl
            refreshing={false}
            tintColor={colors.ink}
            onRefresh={() => {
              q.refetch();
            }}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Botón flotante (+) en la esquina inferior derecha como en las 3 capturas */}
      <Pressable
        onPress={() => router.push('/post/new')}
        accessibilityRole="button"
        accessibilityLabel="Escribir nuevo artículo"
        style={({ pressed }) => [s.fab, pressed && { opacity: 0.85 }]}
      >
        <Feather name="plus" size={26} color={colors.onInk} />
      </Pressable>
    </Screen>
  );
}

const s = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    height: 54,
  },
  headerSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minWidth: 84,
  },
  headerTitle: {
    fontSize: 19,
    textAlign: 'center',
  },
  tabsBar: {
    flexDirection: 'row',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space.sm,
    height: 46,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 14,
  },
  tabIndicator: {
    height: 3,
    width: '72%',
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: colors.accent,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingHorizontal: gutter,
    paddingVertical: space.lg,
  },
  notifUnread: {
    backgroundColor: colors.surface,
  },
  leftIconCol: {
    width: 32,
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  notifContent: {
    flex: 1,
    gap: 6,
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  titleTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  emptyEditorial: {
    paddingHorizontal: gutter + 8,
    paddingTop: 44,
    gap: space.lg,
  },
  emptyTitle: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  fab: {
    position: 'absolute',
    right: gutter,
    bottom: space.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
});
