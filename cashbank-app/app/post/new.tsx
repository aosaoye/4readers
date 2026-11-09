import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ApiError } from '@/api/client';
import {
  flat,
  useCategories,
  useCreatePost,
  useMyOrganizations,
  usePost,
  useUpdatePost,
  useWallet,
} from '@/api/hooks';
import { Errors, hasErrors, rules } from '@/lib/validation';
import {
  Badge,
  Banner,
  Button,
  Card,
  ChipRow,
  Field,
  FormScroll,
  NavHeader,
  Screen,
  Section,
  space,
  Stepper,
  Text,
} from '@/ui';

const emptySource = () => ({ title: '', url: '', publisher: '' });
type SourceErrors = Errors<'title' | 'url' | 'publisher'>[];

const STEPS = [
  { title: 'Titular' },
  { title: 'Contenido' },
  { title: 'Fuentes' },
];

/** Formulario por pasos (Stepper) para publicar y editar (`/post/new?edit=<id>`) sin scroll excesivo. */
export default function PostEditor() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = !!edit;
  const categories = useCategories();
  const orgsQuery = useMyOrganizations();
  const wallet = useWallet();
  const existing = usePost(edit ?? '', editing);
  const create = useCreatePost();
  const update = useUpdatePost(edit ?? '');
  const mutation = editing ? update : create;

  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    categoryId: '',
    organizationId: '',
    title: '',
    summary: '',
    coverImageUrl: '',
    content: '',
    unlockPriceTokens: '',
  });
  const [sources, setSources] = useState([emptySource()]);
  const [errors, setErrors] = useState<Errors<keyof typeof f>>({});
  const [srcErrors, setSrcErrors] = useState<SourceErrors>([]);
  const [hydrated, setHydrated] = useState(false);

  const myOrgs = flat(orgsQuery.data);

  useEffect(() => {
    const p = existing.data;
    if (editing && p && !hydrated) {
      setF({
        categoryId: p.categoryId,
        organizationId: p.organizationId ?? '',
        title: p.title,
        summary: p.summary,
        coverImageUrl: p.coverImageUrl ?? '',
        content: p.content,
        unlockPriceTokens: p.unlockPriceTokens ? String(p.unlockPriceTokens) : '',
      });
      setSources(
        p.sources.length
          ? p.sources.map((s) => ({ title: s.title, url: s.url, publisher: s.publisher }))
          : [emptySource()],
      );
      setHydrated(true);
    }
  }, [editing, existing.data, hydrated]);

  const set = (k: keyof typeof f) => (v: string) => {
    setF((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };
  const setSource = (i: number, k: keyof ReturnType<typeof emptySource>) => (v: string) =>
    setSources((s) => s.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const apiError = mutation.error instanceof ApiError ? mutation.error : null;

  const validateStep0 = () => {
    const e = {
      categoryId: rules.category(f.categoryId),
      title: rules.title(f.title),
      summary: rules.summary(f.summary),
      coverImageUrl: f.coverImageUrl.trim() ? rules.sourceUrl(f.coverImageUrl) : undefined,
    };
    setErrors((prev) => ({ ...prev, ...e }));
    return !hasErrors(e);
  };

  const validateStep1 = () => {
    const priceRaw = f.unlockPriceTokens.trim();
    const priceNum = priceRaw ? Number(priceRaw) : 0;
    const priceErr =
      priceRaw && (!Number.isInteger(priceNum) || priceNum < 0 || priceNum > 5000)
        ? 'El precio debe ser un entero entre 0 y 5000 fichas.'
        : undefined;
    const e = { content: rules.content(f.content), unlockPriceTokens: priceErr };
    setErrors((prev) => ({ ...prev, ...e }));
    return !hasErrors(e);
  };

  const goToStep = (target: number) => {
    if (target === step) return;
    if (target < step) {
      setStep(target);
      return;
    }
    if (step === 0 && !validateStep0()) return;
    if (target === 2 && !validateStep1()) {
      setStep(1);
      return;
    }
    setStep(target);
  };

  const nextStep = () => {
    if (step === 0 && validateStep0()) setStep(1);
    else if (step === 1 && validateStep1()) setStep(2);
  };

  const submit = () => {
    if (!validateStep0()) {
      setStep(0);
      return;
    }
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    const filled = sources.filter((s) => s.title || s.url || s.publisher);
    const se: SourceErrors = sources.map((s) =>
      s.title || s.url || s.publisher
        ? {
            title: rules.sourceTitle(s.title),
            url: rules.sourceUrl(s.url),
            publisher: rules.publisher(s.publisher),
          }
        : {},
    );
    setSrcErrors(se);
    if (se.some(hasErrors)) return;

    const unlockTokens = f.unlockPriceTokens.trim() ? Number(f.unlockPriceTokens.trim()) : undefined;
    const body = {
      categoryId: f.categoryId,
      organizationId: f.organizationId || undefined,
      title: f.title.trim(),
      summary: f.summary.trim(),
      coverImageUrl: f.coverImageUrl.trim() || undefined,
      content: f.content.trim(),
      unlockPriceTokens: unlockTokens,
      sources: filled.map((s) => ({ title: s.title.trim(), url: s.url.trim(), publisher: s.publisher.trim() })),
      acknowledgeBadgeLoss: editing && existing.data?.isVerified ? true : undefined,
    };
    if (editing) update.mutate(body, { onSuccess: () => router.back() });
    else {
      const { acknowledgeBadgeLoss: _unused, ...rest } = body;
      create.mutate(
        { ...rest, sources: rest.sources.length ? rest.sources : undefined },
        { onSuccess: (p) => router.replace(`/post/${p.id}`) },
      );
    }
  };

  const selectedCategoryName = (categories.data ?? []).find((c) => c.id === f.categoryId)?.name;
  const filledSourcesCount = sources.filter((s) => s.title.trim() || s.url.trim() || s.publisher.trim()).length;

  return (
    <Screen>
      <NavHeader
        title={editing ? 'Editar artículo' : 'Escribir un artículo'}
        onBack={step > 0 ? () => setStep((s) => s - 1) : undefined}
      />
      <Stepper steps={STEPS} current={step} onSelect={goToStep} />

      <FormScroll>
        {apiError && <Banner message={apiError.message} details={apiError.details} />}

        {step === 0 && (
          <>
            <Section title="Categoría">
              <View style={{ marginHorizontal: -20 }}>
                <ChipRow
                  options={(categories.data ?? []).map((c) => ({ key: c.id, label: c.name }))}
                  value={f.categoryId}
                  onChange={set('categoryId')}
                />
              </View>
              {errors.categoryId && <Text variant="caption" color="danger">{errors.categoryId}</Text>}
            </Section>

            {myOrgs.length > 0 && (
              <Section title="Publicar en nombre de">
                <View style={{ marginHorizontal: -20 }}>
                  <ChipRow
                    options={[
                      { key: '', label: 'Cuenta personal' },
                      ...myOrgs.map((o) => ({ key: o.id, label: o.name })),
                    ]}
                    value={f.organizationId}
                    onChange={set('organizationId')}
                  />
                </View>
              </Section>
            )}

            <Field
              label="Título"
              value={f.title}
              onChangeText={set('title')}
              error={errors.title}
              maxLength={180}
              hint={`${f.title.trim().length}/180 caracteres (mínimo 10).`}
            />

            <Field
              label="Resumen"
              value={f.summary}
              onChangeText={set('summary')}
              error={errors.summary}
              multiline
              maxLength={350}
              hint={`${f.summary.trim().length}/350 caracteres (entre 20 y 350).`}
              style={{ minHeight: 96 }}
            />

            <Field
              label="Imagen de portada (https:// opcional)"
              value={f.coverImageUrl}
              onChangeText={set('coverImageUrl')}
              error={errors.coverImageUrl}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="https://"
              hint="Si lo dejas vacío se generará una portada artística según la categoría."
            />

            <Button
              title="Continuar al contenido"
              icon="arrow-right"
              onPress={nextStep}
              disabled={editing && !hydrated}
            />
          </>
        )}

        {step === 1 && (
          <>
            <Field
              label="Contenido del artículo"
              value={f.content}
              onChangeText={set('content')}
              error={errors.content}
              multiline
              hint={`${f.content.trim().length} caracteres escritos (mínimo 50).`}
              style={{ minHeight: 240 }}
            />

            <Field
              label="Precio de acceso exclusivo (fichas, opcional)"
              value={f.unlockPriceTokens}
              onChangeText={set('unlockPriceTokens')}
              error={errors.unlockPriceTokens}
              keyboardType="number-pad"
              placeholder="0 (acceso libre y gratuito)"
              hint="Deja 0 o vacío para lectura abierta, o indica entre 1 y 5000 fichas para artículo premium."
            />

            <View style={{ flexDirection: 'row', gap: space.md }}>
              <Button
                title="Atrás"
                variant="secondary"
                onPress={() => setStep(0)}
                style={{ flex: 1 }}
              />
              <Button
                title="Continuar a fuentes"
                icon="arrow-right"
                onPress={nextStep}
                style={{ flex: 2 }}
              />
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Card style={{ gap: space.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="label">{editing ? 'Revisión final' : 'Publicar es gratis'}</Text>
                <Badge
                  label={filledSourcesCount > 0 ? `${filledSourcesCount} fuente(s)` : 'Sin fuentes'}
                  tone={filledSourcesCount > 0 ? 'success' : 'neutral'}
                />
              </View>
              <Text variant="caption">
                {editing
                  ? 'Si el moderador pidió aclaraciones, después podrás reenviarlo sin pagar de nuevo.'
                  : `Para conseguir la insignia de verificación añade enlaces https:// y solicítala desde el artículo${wallet.data ? ` (${wallet.data.verificationCost} fichas)` : ''}.`}
              </Text>
            </Card>

            <Section
              title="Fuentes (opcionales para publicar)"
              action={
                <Button
                  title="Agregar"
                  size="sm"
                  variant="secondary"
                  icon="plus"
                  onPress={() => setSources((s) => [...s, emptySource()])}
                />
              }
            >
              {sources.map((s, i) => (
                <Card key={i} style={{ gap: space.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text variant="label">Fuente #{i + 1}</Text>
                    {sources.length > 1 && (
                      <Button
                        title="Quitar"
                        size="sm"
                        variant="ghost"
                        onPress={() => {
                          setSources((x) => x.filter((_, j) => j !== i));
                          setSrcErrors((x) => x.filter((_, j) => j !== i));
                        }}
                      />
                    )}
                  </View>
                  <Field
                    label="Título de la fuente"
                    value={s.title}
                    onChangeText={setSource(i, 'title')}
                    error={srcErrors[i]?.title}
                  />
                  <Field
                    label="Medio o editorial"
                    value={s.publisher}
                    onChangeText={setSource(i, 'publisher')}
                    error={srcErrors[i]?.publisher}
                  />
                  <Field
                    label="Enlace (https://)"
                    value={s.url}
                    onChangeText={setSource(i, 'url')}
                    error={srcErrors[i]?.url}
                    autoCapitalize="none"
                    keyboardType="url"
                    placeholder="https://"
                  />
                </Card>
              ))}
            </Section>

            <View style={{ flexDirection: 'row', gap: space.md }}>
              <Button
                title="Atrás"
                variant="secondary"
                onPress={() => setStep(1)}
                style={{ flex: 1 }}
              />
              <Button
                title={editing ? 'Guardar cambios' : 'Publicar'}
                icon="check"
                onPress={submit}
                loading={mutation.isPending}
                disabled={editing && !hydrated}
                style={{ flex: 2 }}
              />
            </View>
          </>
        )}
      </FormScroll>
    </Screen>
  );
}
