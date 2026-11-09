import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { ApiError } from '@/api/client';
import { useAdminUsers, useChangeUserRole, useChangeWalletStatus, useGrantBonus, useVerifyOrganizationBrand } from '@/api/hooks';
import type { UserRole, WalletStatus } from '@/api/types';
import { roleLabel } from '@/lib/format';
import { Badge, Banner, Button, Card, Chip, colors, Field, Section, space, Text } from '@/ui';

const ROLES: UserRole[] = ['USER', 'MODERATOR', 'ADMIN'];
const WALLET_STATES: WalletStatus[] = ['ACTIVE', 'FROZEN', 'SUSPENDED'];
const apiErr = (e: unknown) => (e instanceof ApiError ? e : null);

/** Pestaña 4 de administración: Usuarios, roles, estado de billetera y bonos para Autores Fundadores. */
export function UsersAndBonusTab() {
  const users = useAdminUsers();
  const changeRole = useChangeUserRole();
  const changeWallet = useChangeWalletStatus();
  const grantBonus = useGrantBonus();
  const verifyBrand = useVerifyOrganizationBrand();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUsername, setSelectedUsername] = useState('');
  const [amount, setAmount] = useState('100');
  const [reason, setReason] = useState('Dotación de Autor Fundador CashBank');
  const [orgId, setOrgId] = useState('');

  const err =
    apiErr(changeRole.error) ??
    apiErr(changeWallet.error) ??
    apiErr(grantBonus.error) ??
    apiErr(verifyBrand.error);

  const submitBonus = () => {
    const n = Number(amount);
    if (!selectedUserId.trim() || !Number.isInteger(n) || n <= 0) return;
    grantBonus.mutate(
      { userId: selectedUserId.trim(), tokensAmount: n, reason: reason.trim() },
      {
        onSuccess: () =>
          Alert.alert('Bono acreditado', `Se acreditaron ${n} fichas gratis a ${selectedUsername || selectedUserId}.`),
      },
    );
  };

  return (
    <View style={{ gap: space.xl }}>
      {err && <Banner message={err.message} details={err.details} />}

      <Section title="Bono para Autores Fundadores">
        <Card tone="solid" style={{ gap: space.md }}>
          <Text variant="label" style={{ color: colors.onInkSecondary }}>
            Acreditación directa en el libro mayor
          </Text>
          <Text variant="body" style={{ color: colors.onInk }}>
            {selectedUsername
              ? `Usuario seleccionado: @${selectedUsername}`
              : 'Toca "Elegir para bono" en cualquier usuario inferior o pega su UUID.'}
          </Text>
        </Card>

        <Card style={{ gap: space.md }}>
          <Field
            label="UUID del usuario"
            value={selectedUserId}
            onChangeText={setSelectedUserId}
            autoCapitalize="none"
            placeholder="Selecciona un usuario abajo"
          />
          <Field
            label="Fichas a acreditar"
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
          />
          <Field
            label="Motivo en el historial"
            value={reason}
            onChangeText={setReason}
          />
          <Button
            title="Acreditar fichas gratis"
            icon="gift"
            loading={grantBonus.isPending}
            disabled={!selectedUserId.trim() || reason.trim().length < 5}
            onPress={submitBonus}
          />
        </Card>
      </Section>

      <Section title="Sello de Marca Oficial Verificada">
        <Card style={{ gap: space.md }}>
          <Field
            label="UUID de la Organización / Medio / Empresa"
            value={orgId}
            onChangeText={setOrgId}
            autoCapitalize="none"
            placeholder="00000000-0000-0000-0000-000000000000"
          />
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button
              title="Otorgar sello"
              icon="check-circle"
              loading={verifyBrand.isPending}
              disabled={!orgId.trim()}
              onPress={() =>
                verifyBrand.mutate(
                  { id: orgId.trim(), isVerifiedBrand: true },
                  { onSuccess: (o) => Alert.alert('Marca verificada', `${o.name} ahora tiene el sello oficial.`) },
                )
              }
              style={{ flex: 1 }}
            />
            <Button
              title="Retirar"
              variant="secondary"
              loading={verifyBrand.isPending}
              disabled={!orgId.trim()}
              onPress={() =>
                verifyBrand.mutate(
                  { id: orgId.trim(), isVerifiedBrand: false },
                  { onSuccess: (o) => Alert.alert('Sello retirado', `Se retiró el sello de ${o.name}.`) },
                )
              }
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      </Section>

      <Section
        title="Usuarios, roles y billeteras"
        action={
          <Button
            title="Recargar"
            size="sm"
            variant="secondary"
            icon="refresh-cw"
            onPress={() => users.refetch()}
          />
        }
      >
        {users.isPending ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          (users.data ?? []).map((u) => (
            <Card key={u.id} style={{ gap: space.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="heading">@{u.username}</Text>
                  <Text variant="caption">{u.email}</Text>
                </View>
                <Badge label={`${u.wallet?.tokenBalance ?? 0} fichas`} />
              </View>

              <View style={{ gap: space.xs }}>
                <Text variant="caption">Rol ({roleLabel[u.role]})</Text>
                <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
                  {ROLES.map((r) => (
                    <Chip
                      key={r}
                      label={r}
                      active={u.role === r}
                      onPress={() => u.role !== r && changeRole.mutate({ userId: u.id, role: r })}
                    />
                  ))}
                </View>
              </View>

              {u.wallet && (
                <View style={{ gap: space.xs }}>
                  <Text variant="caption">Estado de billetera</Text>
                  <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
                    {WALLET_STATES.map((st) => (
                      <Chip
                        key={st}
                        label={st}
                        active={u.wallet?.status === st}
                        onPress={() =>
                          u.wallet?.status !== st && changeWallet.mutate({ userId: u.id, status: st })
                        }
                      />
                    ))}
                  </View>
                </View>
              )}

              <Button
                title="Elegir para bono fundador"
                size="sm"
                variant="secondary"
                icon="award"
                onPress={() => {
                  setSelectedUserId(u.id);
                  setSelectedUsername(u.username);
                }}
              />
            </Card>
          ))
        )}
      </Section>
    </View>
  );
}
