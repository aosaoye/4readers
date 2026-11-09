import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';
import { ApiError } from '@/api/client';
import { useUnlockPost, useWallet } from '@/api/hooks';
import type { Post } from '@/api/types';
import { Banner, Button, Card, colors, space, Text } from '@/ui';

/** Panel para desbloquear un artículo premium pagando fichas al autor. */
export function PremiumUnlockPanel({ post }: { post: Post }) {
  const unlock = useUnlockPost(post.id);
  const wallet = useWallet();
  const price = post.unlockPriceTokens ?? 0;
  const err = unlock.error instanceof ApiError ? unlock.error : null;

  return (
    <Card tone="solid" style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Feather name="lock" size={20} color={colors.onInk} />
        <Text variant="heading" style={{ color: colors.onInk }}>
          Artículo exclusivo · {price} fichas
        </Text>
      </View>
      <Text variant="body" style={{ color: colors.onInkSecondary }}>
        Desbloquea el desarrollo completo de esta investigación y apoya directamente a{' '}
        {post.authorUsername ? `@${post.authorUsername}` : 'su autor'}. El acceso queda activo para siempre en tu cuenta.
      </Text>
      {wallet.data && (
        <Text variant="caption" style={{ color: colors.onInkSecondary }}>
          Tu saldo disponible: {wallet.data.tokenBalance} fichas
        </Text>
      )}
      {err && (
        <Banner
          tone={err.code === 'INSUFFICIENT_FUNDS' ? 'warn' : 'danger'}
          message={err.message}
          actionLabel={err.code === 'INSUFFICIENT_FUNDS' ? 'Ir a la Minitienda' : undefined}
          onAction={() => router.navigate('/store')}
        />
      )}
      <Button
        title={`Desbloquear por ${price} fichas`}
        variant="light"
        icon="unlock"
        loading={unlock.isPending}
        onPress={() => unlock.mutate()}
      />
    </Card>
  );
}
