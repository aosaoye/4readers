import { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { flat, useTransactions, useWallet } from '@/api/hooks';
import type { TransactionType } from '@/api/types';
import { formatDateTime, txLabel } from '@/lib/format';
import { Card, ChipRow, colors, Divider, EmptyState, ErrorState, gutter, ListRow, NavHeader, Screen, ScreenHeader, SkeletonRows, space, Text } from '@/ui';

const FILTERS = [
  { key: 'all', label: 'Todos' }, { key: 'CREDIT_PURCHASE', label: 'Compras' }, { key: 'DEBIT_VERIFICATION', label: 'Verificaciones' }, { key: 'TIP_RECEIVED', label: 'Propinas' },
  { key: 'REFUND_POST', label: 'Reembolsos' }, { key: 'BONUS', label: 'Bonos' },
];
const sign = (t: TransactionType) => (t === 'DEBIT_POST' || t === 'DEBIT_VERIFICATION' || t === 'TIP_SENT' || t === 'WITHDRAWAL_HOLD' ? -1 : 1);

export default function WalletScreen() {
  const [type, setType] = useState('all');
  const wallet = useWallet();
  const q = useTransactions(type === 'all' ? null : type);
  const rows = flat(q.data);

  return (
    <Screen>
      <NavHeader title="Movimientos" />
      <FlatList
        data={rows}
        keyExtractor={(t) => t.id}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={
          <View style={{ gap: space.lg, paddingBottom: space.lg }}>
            <ScreenHeader kicker="Billetera" title="Tus fichas" />
            <View style={{ paddingHorizontal: gutter }}>
              <Card tone="solid" style={{ gap: 4 }}>
                <Text variant="label" style={{ color: colors.onInkSecondary }}>Saldo actual</Text>
                <Text variant="display" style={{ color: colors.onInk }}>{wallet.data?.tokenBalance ?? '–'}</Text>
              </Card>
            </View>
            <ChipRow options={FILTERS} value={type} onChange={setType} />
          </View>
        }
        renderItem={({ item }) => {
          const n = sign(item.type) * item.tokensAmount;
          return (
            <ListRow
              title={txLabel[item.type]}
              subtitle={`${item.description} · ${formatDateTime(item.createdAt)}`}
              right={<View style={{ alignItems: 'flex-end' }}>
                <Text variant="heading" style={{ color: n < 0 ? colors.ink : colors.success }}>{n > 0 ? `+${n}` : n}</Text>
                <Text variant="caption">saldo {item.balanceAfter}</Text>
              </View>}
            />
          );
        }}
        ListEmptyComponent={q.isPending ? <SkeletonRows count={4} /> : q.error ? <ErrorState error={q.error} onRetry={q.refetch} /> : <EmptyState icon="list" title="Sin movimientos" message="Cuando compres o gastes fichas, lo verás aquí." />}
        ListFooterComponent={q.isFetchingNextPage ? <ActivityIndicator style={{ margin: space.xl }} color={colors.ink} /> : undefined}
        onEndReached={() => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()}
        onEndReachedThreshold={0.6}
      />
    </Screen>
  );
}
