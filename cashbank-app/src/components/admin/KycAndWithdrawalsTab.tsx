import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ApiError } from '@/api/client';
import {
  useAdminKyc,
  useAdminWithdrawals,
  useApproveWithdrawal,
  usePayWithdrawal,
  useRejectWithdrawal,
  useReviewKyc,
} from '@/api/hooks';
import type { KycStatus, WithdrawalStatus } from '@/api/types';
import { formatDate, formatMoney, kycLabel, withdrawalLabel } from '@/lib/format';
import { Badge, Banner, Button, Card, ChipRow, colors, Field, Section, space, Text } from '@/ui';

const KYC_FILTERS: { key: KycStatus; label: string }[] = [
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'APPROVED', label: 'Aprobados' },
  { key: 'REJECTED', label: 'Rechazados' },
];

const WD_FILTERS: { key: WithdrawalStatus; label: string }[] = [
  { key: 'PENDING', label: 'Por aprobar' },
  { key: 'APPROVED', label: 'Por pagar' },
  { key: 'PAID', label: 'Pagados' },
  { key: 'REJECTED', label: 'Rechazados' },
];

const apiErr = (e: unknown) => (e instanceof ApiError ? e : null);

/** Pestaña 1 de administración: Verificación de identidad (KYC) y cola FIFO de retiros. */
export function KycAndWithdrawalsTab() {
  const [kycStatus, setKycStatus] = useState<KycStatus>('PENDING');
  const [wdStatus, setWdStatus] = useState<WithdrawalStatus>('PENDING');
  const [kycRef, setKycRef] = useState('KYC-VERIFICADO');
  const [payRef, setPayRef] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const kycList = useAdminKyc(kycStatus);
  const reviewKyc = useReviewKyc();
  const wdList = useAdminWithdrawals(wdStatus);
  const approveWd = useApproveWithdrawal();
  const payWd = usePayWithdrawal();
  const rejectWd = useRejectWithdrawal();

  const err =
    apiErr(reviewKyc.error) ??
    apiErr(approveWd.error) ??
    apiErr(payWd.error) ??
    apiErr(rejectWd.error);

  return (
    <View style={{ gap: space.xl }}>
      {err && <Banner message={err.message} details={err.details} />}

      <Section title="Verificaciones de identidad (KYC)">
        <View style={{ marginHorizontal: -20 }}>
          <ChipRow options={KYC_FILTERS} value={kycStatus} onChange={setKycStatus} />
        </View>
        <Field
          label="Referencia de revisión KYC"
          value={kycRef}
          onChangeText={setKycRef}
          hint="Se adjunta al aprobar o rechazar una solicitud KYC."
        />
        {kycList.isPending ? (
          <ActivityIndicator color={colors.ink} />
        ) : (kycList.data ?? []).length === 0 ? (
          <Card>
            <Text variant="body">No hay solicitudes KYC en este estado.</Text>
          </Card>
        ) : (
          (kycList.data ?? []).map((item) => {
            const [label, tone] = kycLabel[item.kycStatus];
            return (
              <Card key={item.userId} style={{ gap: space.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="heading">@{item.username ?? item.userId.slice(0, 8)}</Text>
                    {item.email && <Text variant="caption">{item.email}</Text>}
                  </View>
                  <Badge label={label} tone={tone} />
                </View>
                <Text variant="caption">
                  Destino: {item.payoutDestination ?? 'Sin configurar'}
                  {item.kycReference ? ` · Ref: ${item.kycReference}` : ''}
                </Text>
                <View style={{ flexDirection: 'row', gap: space.sm }}>
                  <Button
                    title="Aprobar KYC"
                    size="sm"
                    icon="check"
                    loading={reviewKyc.isPending}
                    onPress={() =>
                      reviewKyc.mutate({
                        userId: item.userId,
                        status: 'APPROVED',
                        reference: kycRef.trim() || undefined,
                      })
                    }
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Rechazar"
                    size="sm"
                    variant="secondary"
                    loading={reviewKyc.isPending}
                    onPress={() =>
                      reviewKyc.mutate({
                        userId: item.userId,
                        status: 'REJECTED',
                        reference: kycRef.trim() || undefined,
                      })
                    }
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            );
          })
        )}
      </Section>

      <Section title="Cola FIFO de retiros">
        <View style={{ marginHorizontal: -20 }}>
          <ChipRow options={WD_FILTERS} value={wdStatus} onChange={setWdStatus} />
        </View>
        {wdList.isPending ? (
          <ActivityIndicator color={colors.ink} />
        ) : (wdList.data ?? []).length === 0 ? (
          <Card>
            <Text variant="body">No hay retiros en este estado.</Text>
          </Card>
        ) : (
          (wdList.data ?? []).map((w) => {
            const [label, tone] = withdrawalLabel[w.status];
            return (
              <Card key={w.id} style={{ gap: space.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="heading">
                      {formatMoney(w.payoutAmount, w.currency)} · {w.tokensAmount} fichas
                    </Text>
                    <Text variant="caption">
                      @{w.username ?? w.userId?.slice(0, 8) ?? 'usuario'} · {formatDate(w.createdAt)}
                    </Text>
                  </View>
                  <Badge label={label} tone={tone} />
                </View>
                <Text variant="caption">Destino de pago: {w.destination}</Text>
                {w.externalReference && <Text variant="caption">Referencia de pago: {w.externalReference}</Text>}
                {w.rejectionReason && <Text variant="caption" color="danger">Motivo: {w.rejectionReason}</Text>}

                {w.status === 'APPROVED' && (
                  <Field
                    label="Referencia de pago (PayPal / Transferencia)"
                    value={payRef[w.id] ?? ''}
                    onChangeText={(v) => setPayRef((p) => ({ ...p, [w.id]: v }))}
                    placeholder="Ej. PAYPAL-TX-99281"
                  />
                )}

                {(w.status === 'PENDING' || w.status === 'APPROVED') && (
                  <Field
                    label="Motivo en caso de rechazo"
                    value={rejectReason[w.id] ?? ''}
                    onChangeText={(v) => setRejectReason((p) => ({ ...p, [w.id]: v }))}
                    placeholder="Ej. Cuenta de destino inválida"
                  />
                )}

                <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
                  {w.status === 'PENDING' && (
                    <Button
                      title="1. Aprobar retiro"
                      size="sm"
                      icon="check"
                      loading={approveWd.isPending}
                      onPress={() => approveWd.mutate(w.id)}
                    />
                  )}
                  {w.status === 'APPROVED' && (
                    <Button
                      title="2. Marcar pagado"
                      size="sm"
                      icon="dollar-sign"
                      loading={payWd.isPending}
                      disabled={!(payRef[w.id] ?? '').trim()}
                      onPress={() =>
                        payWd.mutate({ id: w.id, externalReference: (payRef[w.id] ?? '').trim() })
                      }
                    />
                  )}
                  {(w.status === 'PENDING' || w.status === 'APPROVED') && (
                    <Button
                      title="Rechazar y devolver fichas"
                      size="sm"
                      variant="secondary"
                      loading={rejectWd.isPending}
                      onPress={() => {
                        const reason = (rejectReason[w.id] ?? '').trim() || 'Rechazado por administración';
                        rejectWd.mutate({ id: w.id, reason });
                      }}
                    />
                  )}
                </View>
              </Card>
            );
          })
        )}
      </Section>
    </View>
  );
}
