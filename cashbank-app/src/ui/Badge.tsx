// src/ui/Badge.tsx
import React from 'react';
import { View } from 'react-native';
import type { Tone } from '@/lib/format';
import { Text } from './Text';
import { radius, useTheme } from './theme';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { colors } = useTheme();

  const tones: Record<Tone, [string, string]> = {
    neutral: [colors.surfaceSubtle, colors.textSecondary],
    accent: [colors.primarySoft, colors.accent],
    success: [colors.successSoft, colors.success],
    warn: [colors.warningSoft, colors.warning],
    danger: [colors.dangerSoft, colors.danger],
  };

  const [bg, fg] = tones[tone] ?? tones.neutral;

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text variant="caption" style={{ color: fg, fontFamily: 'Inter_500Medium' }}>
        {label}
      </Text>
    </View>
  );
}
