import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, View } from 'react-native';
import { ApiError } from '@/api/client';
import { flat, useCheckout, useOrders, usePackages } from '@/api/hooks';
import { qk } from '@/api/keys';
import type { TokenPackage } from '@/api/types';
import { APP_SCHEME } from '@/config';
import { formatDateTime, formatMoney, orderStatusLabel, plural } from '@/lib/format';
import {
  Badge,
  Banner,
  Button,
  Card,
  ChipRow,
  colors,
  Divider,
  EmptyState,
  ErrorState,
  gutter,
  ListRow,
  NavHeader,
  Screen,
  ScreenHeader,
  SkeletonRows,
  space,
  Text,
} from '@/ui';

type Tab = 'packages' | 'orders';

function Packages({ header, onPurchased }: { header: ReactNode; onPurchased: () => void }) {
  const qc = useQueryClient();
  const packages = usePackages();
  const checkout = useCheckout();
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const buy = async (pkg: TokenPackage) => {
    setBuying(pkg.id);
    setError(null);
    try {
      const session = await checkout.mutateAsync({ packageId: pkg.id, quantity: 1 });
      await WebBrowser.openAuthSessionAsync(session.checkoutUrl, `${APP_SCHEME}://store/success`);
      await Promise.all([
        qc.invalidateQueries({ queryKey: qk.orders }),
        qc.invalidateQueries({ queryKey: qk.wallet }),
        qc.invalidateQueries({ queryKey: qk.me }),
      ]);
      onPurchased();
    } catch (e) {
      setError(e instanceof ApiError ? e : null);
    } finally {
      setBuying(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: space.xxxl }}>
      {header}
      <View style={{ paddingHorizontal: gutter, paddingTop: space.lg, gap: space.lg }}>
        {error && <Banner message={error.message} details={error.details} />}
        {packages.isPending ? (
          <SkeletonRows count={3} />
        ) : packages.error ? (
          <ErrorState error={packages.error} onRetry={packages.refetch} />
        ) : !packages.data.length ? (
          <EmptyState
            icon="shopping-bag"
            title="No hay paquetes disponibles"
            message="Vuelve a intentarlo más tarde."
          />
        ) : (
          packages.data.map((p) => (
            <Card key={p.id} style={{ gap: space.md }}>
              <Text variant="heading">{p.name}</Text>
              {!!p.description && (
                <Text variant="caption" style={{ fontSize: 13 }}>
                  {p.description}
                </Text>
              )}
              <Text variant="title" style={{ fontSize: 32 }}>
                {p.totalTokensPerUnit} fichas
              </Text>
              <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
                {p.bonusTokens > 0 && <Badge tone="accent" label={`+${p.bonusTokens} de regalo`} />}
                <Badge
                  label={`Alcanza para ${plural(p.estimatedVerificationsCount, 'verificación', 'verificaciones')}`}
                />
              </View>
              <Button
                title={`Comprar · ${formatMoney(p.price, p.currency)}`}
                loading={buying === p.id}
                disabled={!!buying}
                onPress={() => buy(p)}
              />
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Orders({ header }: { header: ReactNode }) {
  const q = useOrders();
  return (
    <FlatList
      data={flat(q.data)}
      keyExtractor={(o) => o.id}
      ItemSeparatorComponent={Divider}
      ListHeaderComponent={<View style={{ paddingBottom: space.md }}>{header}</View>}
      renderItem={({ item }) => {
        const [label, tone] = orderStatusLabel[item.status];
        return (
          <ListRow
            title={item.packageName ?? 'Paquete de fichas'}
            subtitle={`${formatDateTime(item.createdAt)} · ${item.tokensGranted} fichas`}
            right={
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge label={item.status === 'PENDING' ? 'Confirmando…' : label} tone={tone} />
                <Text variant="caption">{formatMoney(item.totalPaid, item.currency)}</Text>
              </View>
            }
          />
        );
      }}
      ListEmptyComponent={
        q.isPending ? (
          <SkeletonRows count={3} />
        ) : q.error ? (
          <ErrorState error={q.error} onRetry={q.refetch} />
        ) : (
          <EmptyState icon="credit-card" title="Aún no has comprado fichas" />
        )
      }
      ListFooterComponent={
        q.isFetchingNextPage ? <ActivityIndicator style={{ margin: space.xl }} color={colors.ink} /> : undefined
      }
      onEndReached={() => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()}
      onEndReachedThreshold={0.6}
      contentContainerStyle={{ paddingBottom: space.xxxl }}
    />
  );
}

export default function Store() {
  const qc = useQueryClient();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'orders' ? 'orders' : 'packages');
  const orders = useOrders();

  const pending = flat(orders.data).filter((o) => o.status === 'PENDING').length;
  const prev = useRef(pending);
  useEffect(() => {
    if (pending < prev.current) {
      qc.invalidateQueries({ queryKey: qk.wallet });
      qc.invalidateQueries({ queryKey: qk.me });
    }
    prev.current = pending;
  }, [pending, qc]);

  const scrollHeader = (
    <View style={{ gap: space.sm }}>
      <ScreenHeader kicker="Fichas" title="Fichas para verificar" />
      <ChipRow
        options={[
          { key: 'packages', label: 'Paquetes' },
          { key: 'orders', label: 'Compras' },
        ]}
        value={tab}
        onChange={setTab}
      />
    </View>
  );

  return (
    <Screen>
      <NavHeader title="Minitienda" />
      {tab === 'packages' ? (
        <Packages header={scrollHeader} onPurchased={() => setTab('orders')} />
      ) : (
        <Orders header={scrollHeader} />
      )}
    </Screen>
  );
}
