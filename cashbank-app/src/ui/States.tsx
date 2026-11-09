// src/ui/States.tsx
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { Button } from './Button';
import { Text } from './Text';
import { gutter, radius, space, useTheme } from './theme';

export function EmptyState({
  icon = 'inbox',
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={s.center}>
      <Feather name={icon} size={30} color={colors.textMuted} />
      <Text variant="heading" style={{ textAlign: 'center', color: colors.text }}>
        {title}
      </Text>
      {message && (
        <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
          {message}
        </Text>
      )}
      {actionLabel && (
        <Button
          title={actionLabel}
          onPress={onAction}
          size="sm"
          style={{ marginTop: space.sm }}
        />
      )}
    </View>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();
  const e = error instanceof ApiError ? error : null;

  return (
    <View style={s.center}>
      <Feather
        name={e?.isNetwork ? 'wifi-off' : 'alert-circle'}
        size={30}
        color={colors.textMuted}
      />
      <Text variant="heading" style={{ textAlign: 'center', color: colors.text }}>
        {e?.isNetwork ? 'Sin conexión' : 'Algo salió mal'}
      </Text>
      <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
        {e?.message ?? 'No pudimos cargar esta información.'}
      </Text>
      {e?.referenceId && (
        <Text variant="caption" tone="muted">
          Código de soporte: {e.referenceId}
        </Text>
      )}
      {onRetry && (
        <Button
          title="Reintentar"
          onPress={onRetry}
          size="sm"
          variant="secondary"
          style={{ marginTop: space.sm }}
        />
      )}
    </View>
  );
}

export function Banner({
  tone = 'danger',
  title,
  message,
  details,
  actionLabel,
  onAction,
}: {
  tone?: 'danger' | 'warn' | 'success';
  title?: string;
  message?: string;
  details?: string[];
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();

  const tones = {
    danger: [colors.dangerSoft, colors.danger],
    warn: [colors.warningSoft, colors.warning],
    success: [colors.successSoft, colors.success],
  };

  const [bg, fg] = tones[tone] ?? tones.danger;

  return (
    <View style={[s.banner, { backgroundColor: bg }]} accessibilityRole="alert">
      {title && (
        <Text variant="label" style={{ color: fg, fontWeight: '600' }}>
          {title}
        </Text>
      )}
      {message && (
        <Text variant="label" style={{ color: fg, fontFamily: 'Inter_400Regular' }}>
          {message}
        </Text>
      )}
      {details?.map((d) => (
        <Text key={d} variant="caption" style={{ color: fg }}>
          • {d}
        </Text>
      ))}
      {actionLabel && (
        <Button
          title={actionLabel}
          onPress={onAction}
          size="sm"
          style={{ alignSelf: 'flex-start', marginTop: space.xs }}
        />
      )}
    </View>
  );
}

export function Spinner() {
  const { colors } = useTheme();
  return (
    <View style={s.center}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

/** Esqueletos con la misma forma que PostRow. */
export function SkeletonRows({ count = 5 }: { count?: number }) {
  const { colors } = useTheme();
  const o = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(o, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(o, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    a.start();
    return () => a.stop();
  }, [o]);

  return (
    <Animated.View style={{ opacity: o }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={s.sk}>
          <View
            style={[
              s.skBox,
              { width: 126, height: 112, backgroundColor: colors.surfaceSubtle },
            ]}
          />
          <View style={{ flex: 1, gap: space.md }}>
            <View
              style={[
                s.skBox,
                { height: 16, width: '90%', backgroundColor: colors.surfaceSubtle },
              ]}
            />
            <View
              style={[
                s.skBox,
                { height: 16, width: '60%', backgroundColor: colors.surfaceSubtle },
              ]}
            />
            <View
              style={[
                s.skBox,
                {
                  height: 34,
                  width: '50%',
                  borderRadius: 17,
                  backgroundColor: colors.surfaceSubtle,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    padding: space.xxxl,
  },
  banner: {
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    gap: space.xs,
  },
  sk: {
    flexDirection: 'row',
    gap: space.lg,
    paddingHorizontal: gutter,
    paddingVertical: space.md,
  },
  skBox: {
    borderRadius: radius.sm,
  },
});
