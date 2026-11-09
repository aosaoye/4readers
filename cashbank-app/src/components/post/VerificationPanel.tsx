import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Share } from 'react-native';
import { ApiError } from '@/api/client';
import { useClaimSlaRefund, useRequestVerification, useWallet } from '@/api/hooks';
import type { Post } from '@/api/types';
import { API_URL } from '@/config';
import { formatDateTime } from '@/lib/format';
import { Banner, Button, Card, space, Text } from '@/ui';

/** Panel solo para el autor: aquí se compra la insignia (publicar ya fue gratis). */
export function VerificationPanel({ post }: { post: Post }) {
  const verify = useRequestVerification(post.id);
  const claimSla = useClaimSlaRefund(post.id);
  const wallet = useWallet();
  const cost = wallet.data?.verificationCost;
  const err = verify.error instanceof ApiError ? verify.error : null;
  const slaErr = claimSla.error instanceof ApiError ? claimSla.error : null;
  const notes = [...(post.verifications ?? [])].reverse().find((v) => v.verdict === 'NEEDS_CLARIFICATION')?.notes;
  const edit = () => router.push(`/post/new?edit=${post.id}`);

  if (post.status === 'REJECTED') {
    return (
      <Banner
        title="Rechazado en la verificación"
        message="Este artículo ya no es público."
        details={post.verifications?.slice(-1).map((v) => v.notes)}
      />
    );
  }
  if (post.verificationStatus === 'PENDING') {
    return (
      <Card style={{ gap: space.sm }}>
        <Text variant="heading">En revisión</Text>
        <Text variant="body">Un moderador está contrastando tus fuentes. El resultado aparecerá aquí.</Text>
        {post.slaDeadlineAt && (
          <Text variant="caption">
            Plazo máximo garantizado (SLA): {formatDateTime(post.slaDeadlineAt)}
          </Text>
        )}
        {slaErr && <Banner message={slaErr.message} />}
        {post.isSlaBreached && (
          <Button
            title="Reclamar reembolso por SLA vencido"
            variant="secondary"
            icon="rotate-ccw"
            loading={claimSla.isPending}
            onPress={() => claimSla.mutate()}
          />
        )}
      </Card>
    );
  }
  if (post.verificationStatus === 'VERIFIED') {
    const certUrl = `${API_URL}/v/${post.id}`;
    const badgeUrl = `${API_URL}/v/${post.id}/badge.svg`;
    const widgetUrl = `${API_URL}/v/${post.id}/widget`;
    const shareBadgeSnippets = () =>
      Share.share({
        title: `Certificado CashBank · ${post.title}`,
        message: [
          `Certificado público: ${certUrl}`,
          '',
          `HTML:`,
          `<a href="${certUrl}" target="_blank" rel="noopener"><img src="${badgeUrl}" alt="Verificado por CashBank" /></a>`,
          '',
          `Markdown:`,
          `[![Verificado por CashBank](${badgeUrl})](${certUrl})`,
          '',
          `Iframe:`,
          `<iframe src="${widgetUrl}" width="360" height="120" style="border:0;overflow:hidden" loading="lazy"></iframe>`,
        ].join('\n'),
        url: certUrl,
      });
    const editAndRevoke = () =>
      Alert.alert(
        '¿Editar y retirar la insignia?',
        'El sello certifica el texto actual. Si lo editas, la insignia se retira y recuperarla cuesta una nueva verificación.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Editar', style: 'destructive', onPress: edit },
        ],
      );
    return (
      <Card style={{ gap: space.md }}>
        <Text variant="heading">Tienes la insignia de verificación</Text>
        <Text variant="body">
          Tu certificado público y tu sello portable ya están activos para enlazar o incrustar en tu web, WordPress, Substack o newsletter.
        </Text>
        <Button
          title="Abrir certificado público (/v/:id)"
          icon="external-link"
          onPress={() => WebBrowser.openBrowserAsync(certUrl)}
        />
        <Button
          title="Compartir sello (HTML / Markdown / Iframe)"
          variant="secondary"
          icon="share-2"
          onPress={shareBadgeSnippets}
        />
        <Button title="Editar (retira la insignia)" variant="ghost" onPress={editAndRevoke} />
      </Card>
    );
  }

  const again = post.verificationStatus === 'NEEDS_CLARIFICATION';
  const noSources = post.sources.length === 0;
  return (
    <Card style={{ gap: space.md }}>
      <Text variant="heading">{again ? 'El moderador pide aclaraciones' : 'Consigue la insignia de verificación'}</Text>
      {again && notes && <Banner tone="warn" message={notes} />}
      <Text variant="body">
        {again
          ? 'Edita tu artículo y reenvíalo: no se cobra de nuevo.'
          : 'Un moderador contrasta tus fuentes y obtienes un certificado público que puedes compartir.'}
      </Text>
      {err && (
        <Banner
          tone={err.code === 'INSUFFICIENT_FUNDS' ? 'warn' : 'danger'}
          message={err.message}
          actionLabel={err.code === 'INSUFFICIENT_FUNDS' ? 'Ir a la Minitienda' : undefined}
          onAction={() => router.navigate('/store')}
        />
      )}
      {noSources && !again && (
        <Text variant="caption">Necesitas al menos una fuente https:// para pedir la verificación.</Text>
      )}
      <Button
        title={again ? 'Reenviar a verificación' : `Solicitar verificación${cost ? ` · ${cost} fichas` : ''}`}
        onPress={() => verify.mutate()}
        loading={verify.isPending}
        disabled={noSources}
      />
      <Button title="Editar artículo" variant="secondary" onPress={edit} />
    </Card>
  );
}
