import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ApiError } from '@/api/client';
import {
  useAdminPackages,
  useCategories,
  useCreateCategory,
  useCreatePackage,
  useTogglePackageStatus,
} from '@/api/hooks';
import { formatMoney } from '@/lib/format';
import { Badge, Banner, Button, Card, colors, Divider, Field, ListRow, Section, space, Text } from '@/ui';

const apiErr = (e: unknown) => (e instanceof ApiError ? e : null);

/** Pestaña 3 de administración: Gestión de paquetes de la Minitienda y categorías del blog. */
export function StoreAndCategoriesTab() {
  const packages = useAdminPackages();
  const togglePkg = useTogglePackageStatus();
  const createPkg = useCreatePackage();
  const categories = useCategories();
  const createCat = useCreateCategory();

  const [pkg, setPkg] = useState({
    name: '',
    description: '',
    tokensAmount: '100',
    bonusTokens: '10',
    price: '9.99',
    currency: 'EUR',
  });
  const [cat, setCat] = useState({ name: '', description: '' });

  const err = apiErr(togglePkg.error) ?? apiErr(createPkg.error) ?? apiErr(createCat.error);

  const submitPkg = () => {
    createPkg.mutate(
      {
        name: pkg.name.trim(),
        description: pkg.description.trim(),
        tokensAmount: Number(pkg.tokensAmount),
        bonusTokens: Number(pkg.bonusTokens || 0),
        price: Number(pkg.price),
        currency: pkg.currency.trim() || 'EUR',
      },
      {
        onSuccess: () =>
          setPkg({ name: '', description: '', tokensAmount: '100', bonusTokens: '10', price: '9.99', currency: 'EUR' }),
      },
    );
  };

  const submitCat = () => {
    createCat.mutate(
      { name: cat.name.trim(), description: cat.description.trim() || undefined },
      { onSuccess: () => setCat({ name: '', description: '' }) },
    );
  };

  return (
    <View style={{ gap: space.xl }}>
      {err && <Banner message={err.message} details={err.details} />}

      <Section title="Paquetes de la Minitienda">
        {packages.isPending ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <Card style={{ paddingHorizontal: 0, paddingVertical: space.xs }}>
            {(packages.data ?? []).map((p, i) => (
              <View key={p.id}>
                {i > 0 && <Divider />}
                <ListRow
                  title={p.name}
                  subtitle={`${p.totalTokensPerUnit} fichas · ${formatMoney(p.price, p.currency)}`}
                  right={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                      <Badge label={p.isActive ? 'Activo' : 'Inactivo'} tone={p.isActive ? 'success' : 'neutral'} />
                      <Button
                        title={p.isActive ? 'Pausar' : 'Activar'}
                        size="sm"
                        variant="secondary"
                        onPress={() => togglePkg.mutate({ id: p.id, isActive: !p.isActive })}
                      />
                    </View>
                  }
                  chevron={false}
                />
              </View>
            ))}
          </Card>
        )}

        <Card style={{ gap: space.md }}>
          <Text variant="heading">Nuevo paquete de fichas</Text>
          <Field
            label="Nombre del paquete"
            value={pkg.name}
            onChangeText={(v) => setPkg((s) => ({ ...s, name: v }))}
            placeholder="Ej. Pack Autor Verificado"
          />
          <Field
            label="Descripción"
            value={pkg.description}
            onChangeText={(v) => setPkg((s) => ({ ...s, description: v }))}
            placeholder="Mínimo 10 caracteres"
          />
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <View style={{ flex: 1 }}>
              <Field
                label="Fichas base"
                value={pkg.tokensAmount}
                onChangeText={(v) => setPkg((s) => ({ ...s, tokensAmount: v }))}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Fichas bono"
                value={pkg.bonusTokens}
                onChangeText={(v) => setPkg((s) => ({ ...s, bonusTokens: v }))}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <View style={{ flex: 1 }}>
              <Field
                label="Precio"
                value={pkg.price}
                onChangeText={(v) => setPkg((s) => ({ ...s, price: v }))}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Moneda"
                value={pkg.currency}
                onChangeText={(v) => setPkg((s) => ({ ...s, currency: v.toUpperCase() }))}
                autoCapitalize="characters"
              />
            </View>
          </View>
          <Button
            title="Crear paquete"
            icon="plus"
            loading={createPkg.isPending}
            disabled={pkg.name.trim().length < 3 || pkg.description.trim().length < 10}
            onPress={submitPkg}
          />
        </Card>
      </Section>

      <Section title="Categorías del blog">
        <Card style={{ paddingHorizontal: 0, paddingVertical: space.xs }}>
          {(categories.data ?? []).map((c, i) => (
            <View key={c.id}>
              {i > 0 && <Divider />}
              <ListRow title={c.name} subtitle={c.description ?? c.slug} chevron={false} />
            </View>
          ))}
        </Card>

        <Card style={{ gap: space.md }}>
          <Text variant="heading">Nueva categoría</Text>
          <Field
            label="Nombre de la categoría"
            value={cat.name}
            onChangeText={(v) => setCat((s) => ({ ...s, name: v }))}
            placeholder="Ej. Salud Basada en Evidencia"
          />
          <Field
            label="Descripción (opcional)"
            value={cat.description}
            onChangeText={(v) => setCat((s) => ({ ...s, description: v }))}
          />
          <Button
            title="Crear categoría"
            icon="plus"
            loading={createCat.isPending}
            disabled={cat.name.trim().length < 3}
            onPress={submitCat}
          />
        </Card>
      </Section>
    </View>
  );
}
