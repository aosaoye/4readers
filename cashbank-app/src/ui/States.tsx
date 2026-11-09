import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { Button } from './Button';
import { Text } from './Text';
import { colors, gutter, radius, space } from './theme';

export function EmptyState({ icon = 'inbox', title, message, actionLabel, onAction }: {
  icon?: keyof typeof Feather.glyphMap; title: string; message?: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <View style={s.center}>
      <Feather name={icon} size={30} color={colors.faint} />
      <Text variant="heading" style={{ textAlign: 'center' }}>{title}</Text>
      {message && <Text variant="body" style={{ textAlign: 'center' }}>{message}</Text>}
      {actionLabel && <Button title={actionLabel} onPress={onAction} size="sm" style={{ marginTop: space.sm }} />}
    </View>
  );
}

/** Los mensajes del backend ya son seguros y en español: se muestran tal cual, con su sugerencia y su código de soporte. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const e = error instanceof ApiError ? error : null;
  return (
    <View style={s.center}>
      <Feather name={e?.isNetwork ? 'wifi-off' : 'alert-circle'} size={30} color={colors.faint} />
      <Text variant="heading" style={{ textAlign: 'center' }}>{e?.isNetwork ? 'Sin conexión' : 'Algo salió mal'}</Text>
      <Text variant="body" style={{ textAlign: 'center' }}>{e?.message ?? 'No pudimos cargar esta información.'}</Text>
      {e?.referenceId && <Text variant="caption">Código de soporte: {e.referenceId}</Text>}
      {onRetry && <Button title="Reintentar" onPress={onRetry} size="sm" variant="secondary" style={{ marginTop: space.sm }} />}
    </View>
  );
}

export function Banner({ tone = 'danger', title, message, details, actionLabel, onAction }: {
  tone?: 'danger' | 'warn' | 'success'; title?: string; message?: string; details?: string[]; actionLabel?: string; onAction?: () => void;
}) {
  const [bg, fg] = tone === 'danger' ? [colors.dangerSoft, colors.danger] : tone === 'warn' ? [colors.warnSoft, colors.warn] : [colors.successSoft, colors.success];
  return (
    <View style={[s.banner, { backgroundColor: bg }]} accessibilityRole="alert">
      {title && <Text variant="label" style={{ color: fg }}>{title}</Text>}
      {message && <Text variant="label" style={{ color: fg, fontFamily: 'Inter_400Regular' }}>{message}</Text>}
      {details?.map((d) => <Text key={d} variant="caption" style={{ color: fg }}>• {d}</Text>)}
      {actionLabel && <Button title={actionLabel} onPress={onAction} size="sm" style={{ alignSelf: 'flex-start', marginTop: space.xs }} />}
    </View>
  );
}

export const Spinner = () => <View style={s.center}><ActivityIndicator color={colors.ink} /></View>;

/** Esqueletos con la misma forma que PostRow: la lista aparece "armada" mientras llegan los datos. */
export function SkeletonRows({ count = 5 }: { count?: number }) {
  const o = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(o, { toValue: 0.5, duration: 700, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [o]);
  return (
    <Animated.View style={{ opacity: o }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={s.sk}>
          <View style={[s.skBox, { width: 140, height: 103 }]} />
          <View style={{ flex: 1, gap: space.md }}>
            <View style={[s.skBox, { height: 16, width: '90%' }]} />
            <View style={[s.skBox, { height: 16, width: '60%' }]} />
            <View style={[s.skBox, { height: 36, width: '50%', borderRadius: 18 }]} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xxxl },
  banner: { borderRadius: 100, paddingVertical: space.md, paddingHorizontal: space.xl, gap: space.xs },
  sk: { flexDirection: 'row', gap: space.lg, paddingHorizontal: gutter, paddingVertical: space.md },
  skBox: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
});
