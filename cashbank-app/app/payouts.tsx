import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { ApiError } from '@/api/client';
import {
  flat, useCancelWithdrawal, usePayoutSummary, useRequestKyc, useRequestWithdrawal, useSetPayoutDestination, useWithdrawals,
} from '@/api/hooks';
import { formatDate, formatMoney, kycLabel, withdrawalLabel } from '@/lib/format';
import { Badge, Banner, Button, Card, colors, Divider, ErrorState, Field, FormScroll, ListRow, NavHeader, Screen, ScreenHeader, Section, space, Spinner, Text } from '@/ui';

const err = (e: unknown) => (e instanceof ApiError ? e : null);

/** Cobros: convierte en dinero las fichas GANADAS (propinas y recompensas). Las fichas compradas no se retiran. */
export default function Payouts() {
  const summary = usePayoutSummary();
  const history = useWithdrawals();
  const kyc = useRequestKyc();
  const dest = useSetPayoutDestination();
  const withdraw = useRequestWithdrawal();
  const cancel = useCancelWithdrawal();
  const [destination, setDestination] = useState<string | null>(null);
  const [tokens, setTokens] = useState('');

  const s = summary.data;
  if (!s) return <Screen><NavHeader title="Cobros" />{summary.isPending ? <Spinner /> : <ErrorState error={summary.error} onRetry={summary.refetch} />}</Screen>;

  const destValue = destination ?? s.payoutDestination ?? '';
  const n = Number(tokens);
  const valid = Number.isInteger(n) && n >= s.minPayoutTokens && n <= s.availableTokens;
  const ready = s.kycStatus === 'APPROVED' && !!s.payoutDestination;
  const [kycText, kycTone] = kycLabel[s.kycStatus];
  const rows = flat(history.data);

  const confirmCancel = (id: string) =>
    Alert.alert('¿Cancelar este retiro?', 'Las fichas volverán a tu saldo.', [
      { text: 'No', style: 'cancel' }, { text: 'Cancelar retiro', style: 'destructive', onPress: () => cancel.mutate(id) },
    ]);

  return (
    <Screen>
      <NavHeader title="Cobros" />
      <FormScroll>
        <ScreenHeader flush kicker="Tus ganancias" title="Cobra lo que ganas" />

        <Card tone="solid" style={{ gap: space.sm }}>
          <Text variant="label" style={{ color: colors.onInkSecondary }}>Disponible para retirar</Text>
          <Text variant="display" style={{ color: colors.onInk }}>{formatMoney(s.availableAmount, s.currency)}</Text>
          <Text variant="caption" style={{ color: colors.onInkSecondary }}>{s.availableTokens} fichas ganadas · 1 ficha = {formatMoney(s.centsPerToken / 100, s.currency)}</Text>
          {s.maturingTokens > 0 && <Text variant="caption" style={{ color: colors.onInkSecondary }}>{s.maturingTokens} fichas más se liberan tras {s.holdDays} días de espera.</Text>}
        </Card>
        <Text variant="caption">Solo se retiran fichas ganadas con propinas y revisiones. Las fichas que compras no son retirables.</Text>

        <Section title="Verificación de identidad" action={<Badge label={kycText} tone={kycTone} />}>
          {s.kycStatus === 'APPROVED' ? <Text variant="body">Tu identidad está verificada.</Text> : (
            <>
              <Text variant="body">Es obligatoria para cobrar. Un administrador revisará tu identidad; te lo mostramos aquí cuando termine.</Text>
              {err(kyc.error) && <Banner message={err(kyc.error)!.message} />}
              {s.kycStatus !== 'PENDING' && <Button title={s.kycStatus === 'REJECTED' ? 'Volver a solicitar' : 'Solicitar verificación'} variant="secondary" onPress={() => kyc.mutate(undefined)} loading={kyc.isPending} />}
            </>
          )}
        </Section>

        <Section title="Dónde cobrar">
          <Field label="Destino de cobro" value={destValue} onChangeText={setDestination} autoCapitalize="none"
            hint="Por ejemplo, tu cuenta de PayPal. No podrás cambiarlo mientras tengas retiros en curso." />
          {err(dest.error) && <Banner message={err(dest.error)!.message} details={err(dest.error)!.details} />}
          <Button title="Guardar destino" variant="secondary" onPress={() => dest.mutate(destValue.trim())} loading={dest.isPending}
            disabled={destValue.trim().length < 5 || destValue.trim() === (s.payoutDestination ?? '')} />
        </Section>

        <Section title="Retirar">
          <Field label="Fichas a retirar" value={tokens} onChangeText={setTokens} keyboardType="number-pad" maxLength={7}
            hint={valid ? `Recibirás ${formatMoney((n * s.centsPerToken) / 100, s.currency)}` : `Mínimo ${s.minPayoutTokens} fichas.`} />
          {err(withdraw.error) && <Banner message={err(withdraw.error)!.message} />}
          {withdraw.isSuccess && <Banner tone="success" message="Solicitud enviada. Un administrador la revisará y te pagará." />}
          {!ready && <Text variant="caption">Para retirar necesitas identidad verificada y un destino de cobro.</Text>}
          <Button title="Solicitar retiro" onPress={() => withdraw.mutate(n, { onSuccess: () => setTokens('') })} loading={withdraw.isPending} disabled={!ready || !valid} />
        </Section>

        <Section title="Historial">
          {history.isPending ? <ActivityIndicator color={colors.ink} /> : rows.length === 0 ? <Text variant="body">Aún no has solicitado retiros.</Text> : (
            <Card style={{ paddingHorizontal: 0, paddingVertical: space.xs }}>
              {rows.map((r, i) => {
                const [label, tone] = withdrawalLabel[r.status];
                return (
                  <View key={r.id}>
                    {i > 0 && <Divider />}
                    <ListRow
                      title={formatMoney(r.payoutAmount, r.currency)}
                      subtitle={`${r.tokensAmount} fichas · ${formatDate(r.createdAt)}${r.rejectionReason ? `\n${r.rejectionReason}` : ''}${r.externalReference ? `\nRef. ${r.externalReference}` : ''}`}
                      right={<Badge label={label} tone={tone} />}
                      onPress={r.status === 'PENDING' ? () => confirmCancel(r.id) : undefined}
                      chevron={false}
                    />
                  </View>
                );
              })}
              {history.hasNextPage && <Button title="Ver más" size="sm" variant="ghost" onPress={() => history.fetchNextPage()} loading={history.isFetchingNextPage} />}
            </Card>
          )}
          {rows.some((r) => r.status === 'PENDING') && <Text variant="caption">Toca un retiro en revisión para cancelarlo.</Text>}
        </Section>
      </FormScroll>
    </Screen>
  );
}
