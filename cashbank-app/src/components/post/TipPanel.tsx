import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { useTip } from '@/api/hooks';
import type { Post } from '@/api/types';
import { Banner, Button, Card, colors, fonts, space, Text, toast, useTheme } from '@/ui';

const TIP_OPTIONS = ['5', '10', '25', '50'];

/** Propina en fichas a quien escribió el artículo (la plataforma retiene una pequeña comisión). */
export function TipPanel({ post }: { post: Post }) {
  const { isDark, colors } = useTheme();
  const cardBg = isDark ? '#16181C' : '#FFFFFF';
  const borderCol = isDark ? '#2F3336' : '#E2E8F0';
  const chipBg = isDark ? '#202327' : '#F7F9F9';

  const [amount, setAmount] = useState('10');
  const tip = useTip(post.id);
  const err = tip.error instanceof ApiError ? tip.error : null;

  const handleSendTip = () => {
    tip.mutate(Number(amount), {
      onSuccess: (data) => {
        toast.success(
          `Enviaste ${data.tokensSent} fichas. El autor recibe ${data.tokensReceivedByAuthor}.`
        );
      },
      onError: (e) => {
        const error = e instanceof ApiError ? e : null;
        if (error?.code !== 'INSUFFICIENT_FUNDS') {
          toast.error(error?.message ?? 'No se pudo enviar la propina.');
        }
      },
    });
  };

  return (
    <Card style={{ gap: space.md, backgroundColor: cardBg, borderColor: borderCol }}>
      <Text variant="heading" style={{ color: isDark ? '#FFFFFF' : '#0F1419' }}>
        Apoya a {post.authorUsername ?? 'este autor'}
      </Text>

      {/* 4 botones de fichas con borde 100 distribuidos al 100% de ancho sin cortes ni scroll */}
      <View style={s.chipsRow}>
        {TIP_OPTIONS.map((n) => {
          const active = amount === n;
          return (
            <Pressable
              key={n}
              onPress={() => setAmount(n)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                s.chip,
                {
                  backgroundColor: active
                    ? (isDark ? '#FFFFFF' : '#0F1419')
                    : chipBg,
                  borderColor: active
                    ? (isDark ? '#FFFFFF' : '#0F1419')
                    : borderCol,
                },
              ]}
            >
              <Text
                variant="caption"
                style={[
                  s.chipText,
                  {
                    color: active
                      ? (isDark ? '#000000' : '#FFFFFF')
                      : (isDark ? '#A1A1AA' : '#536471'),
                  },
                ]}
              >
                {n} fichas
              </Text>
            </Pressable>
          );
        })}
      </View>

      {err && (
        <Banner
          tone={err.code === 'INSUFFICIENT_FUNDS' ? 'warn' : 'danger'}
          message={err.message}
          actionLabel={err.code === 'INSUFFICIENT_FUNDS' ? 'Ir a la Minitienda' : undefined}
          onAction={() => router.navigate('/store')}
        />
      )}

      <Button
        title={`Enviar propina · ${amount} fichas`}
        variant="secondary"
        loading={tip.isPending}
        onPress={handleSendTip}
      />
    </Card>
  );
}

const s = StyleSheet.create({
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  chip: {
    flex: 1,
    minHeight: 38,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  chipTextActive: {
    color: colors.onInk,
  },
  chipTextInactive: {
    color: colors.muted,
  },
});
