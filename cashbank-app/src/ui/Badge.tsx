import { View } from 'react-native';
import type { Tone } from '@/lib/format';
import { colors, radius } from './theme';
import { Text } from './Text';

const tones: Record<Tone, [string, string]> = {
  neutral: [colors.surfaceAlt, colors.muted], accent: [colors.accentSoft, colors.accent],
  success: [colors.successSoft, colors.success], warn: [colors.warnSoft, colors.warn], danger: [colors.dangerSoft, colors.danger],
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const [bg, fg] = tones[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text variant="caption" style={{ color: fg, fontFamily: 'Inter_500Medium' }}>{label}</Text>
    </View>
  );
}
