import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { View } from 'react-native';
import { ApiError } from '@/api/client';
import { usePost, usePrecheckSources, useVerifyPost } from '@/api/hooks';
import type { DomainTrustTier, VerifyPostInput } from '@/api/types';
import { Errors, hasErrors, rules } from '@/lib/validation';
import { Badge, Banner, Button, Card, Chip, ChipRow, ErrorState, Field, FormScroll, ListRow, NavHeader, Screen, Section, space, Spinner, Text } from '@/ui';

const VERDICTS: { key: VerifyPostInput['verdict']; label: string }[] = [
  { key: 'VERIFIED', label: 'Verificado' }, { key: 'FAKE_REJECTED', label: 'Falso' }, { key: 'NEEDS_CLARIFICATION', label: 'Necesita aclaración' },
];

const TIER_LABEL: Record<DomainTrustTier, [string, 'success' | 'neutral' | 'warn']> = {
  HIGH_TRUST: ['Dominio de alta confianza', 'success'],
  STANDARD: ['Dominio estándar', 'neutral'],
  SHORTENER_OR_RISKY: ['Acortador / Riesgoso', 'warn'],
};

export default function Review() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, isPending, error, refetch } = usePost(id);
  const verify = useVerifyPost(id);
  const precheck = usePrecheckSources(id);
  const [verdict, setVerdict] = useState<VerifyPostInput['verdict']>('VERIFIED');
  const [score, setScore] = useState('80');
  const [notes, setNotes] = useState('');
  const [refund, setRefund] = useState(false);
  const [errors, setErrors] = useState<Errors<'score' | 'notes'>>({});
  const apiError = verify.error instanceof ApiError ? verify.error : null;
  const precheckError = precheck.error instanceof ApiError ? precheck.error : null;
  const report = precheck.data;

  if (!post) return <Screen><NavHeader title="Revisión" />{isPending ? <Spinner /> : <ErrorState error={error} onRetry={refetch} />}</Screen>;

  const runPrecheck = () => {
    precheck.mutate(undefined, {
      onSuccess: (res) => setScore(String(res.suggestedTrustScore)),
    });
  };

  const submit = () => {
    const n = Number(score);
    const e = { score: Number.isInteger(n) && n >= 0 && n <= 100 ? undefined : 'Escribe un número entero entre 0 y 100.', notes: rules.notes(notes) };
    setErrors(e);
    if (hasErrors(e)) return;
    verify.mutate({ verdict, notes: notes.trim(), trustScore: n, refundTokens: verdict === 'FAKE_REJECTED' ? refund : undefined }, { onSuccess: () => router.back() });
  };

  return (
    <Screen>
      <NavHeader title="Revisión" />
      <FormScroll>
        <Text variant="title" style={{ fontSize: 28, lineHeight: 32 }}>{post.title}</Text>
        <Text variant="caption">Por {post.authorUsername ?? 'Autor'} · {post.categoryName}</Text>
        <Text variant="heading">{post.summary}</Text>
        <Text variant="body" selectable>{post.content}</Text>

        <Section
          title="Fuentes a verificar"
          action={
            post.sources.length > 0 ? (
              <Button
                title="Prechequear fuentes"
                size="sm"
                variant="secondary"
                icon="shield"
                loading={precheck.isPending}
                onPress={runPrecheck}
              />
            ) : undefined
          }
        >
          {precheckError && <Banner message={precheckError.message} details={precheckError.details} />}
          {report && (
            <Banner
              tone={report.unreachableCount === 0 ? 'success' : 'warn'}
              title={`Prechequeo: ${report.reliableCount}/${report.totalSources} fuentes fiables`}
              message={`Confianza sugerida: ${report.suggestedTrustScore}/100${report.unreachableCount > 0 ? ` · ${report.unreachableCount} inaccesible(s)` : ''}`}
            />
          )}
          <Card style={{ paddingHorizontal: 0, paddingVertical: space.xs }}>
            {post.sources.map((s) => {
              const checked = report?.sources.find((item) => item.sourceId === s.id);
              const [tierText, tierTone] = checked ? TIER_LABEL[checked.domainTier] : [null, 'neutral' as const];
              return (
                <View key={s.id}>
                  <ListRow
                    icon="external-link"
                    title={s.title}
                    subtitle={`${s.publisher} · ${s.url}${checked ? `\n${checked.reason}` : ''}`}
                    right={
                      checked ? (
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <Badge label={checked.isReliable ? 'Fiable' : 'Revisar'} tone={checked.isReliable ? 'success' : 'warn'} />
                          {tierText && <Badge label={tierText} tone={tierTone} />}
                        </View>
                      ) : s.isReliable ? (
                        <Badge label="Fiable" tone="success" />
                      ) : undefined
                    }
                    onPress={() => WebBrowser.openBrowserAsync(s.url)}
                  />
                </View>
              );
            })}
          </Card>
        </Section>

        <Section title="Tu dictamen">
          {apiError && <Banner message={apiError.message} details={apiError.details} />}
          <View style={{ marginHorizontal: -20 }}><ChipRow options={VERDICTS} value={verdict} onChange={setVerdict} /></View>
          <Field label="Nivel de confianza (0–100)" value={score} onChangeText={setScore} error={errors.score} keyboardType="number-pad" maxLength={3} />
          <Field label="Notas de revisión" value={notes} onChangeText={setNotes} error={errors.notes} multiline hint="Explica qué verificaste. Mínimo 10 caracteres." style={{ minHeight: 100 }} />
          {verdict === 'FAKE_REJECTED' && <View style={{ flexDirection: 'row' }}><Chip label="Reembolsar fichas al autor" active={refund} onPress={() => setRefund((r) => !r)} /></View>}
          <Button title="Enviar dictamen" onPress={submit} loading={verify.isPending} />
        </Section>
      </FormScroll>
    </Screen>
  );
}
