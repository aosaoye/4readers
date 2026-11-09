// src/ui/Chip.tsx
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from './Text';
import { gutter, radius, useTheme } from './theme';

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[
        s.chip,
        {
          backgroundColor: active ? colors.text : colors.surface,
          borderColor: active ? colors.text : colors.border,
        },
      ]}
    >
      <Text
        variant="caption"
        style={{
          fontSize: 13,
          lineHeight: 18,
          fontWeight: active ? '600' : '400',
          color: active ? colors.textInverse : colors.textSecondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type Option<K extends string> = { key: K; label: string };

/** Fila horizontal de chips: filtros, categorías, ordenación y pestañas internas. */
export function ChipRow<K extends string>({
  options,
  value,
  onChange,
  style,
  contentContainerStyle,
}: {
  options: Option<K>[];
  value: K;
  onChange: (k: K) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[s.scroll, style]}
      contentContainerStyle={[s.row, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((o) => (
        <Chip
          key={o.key}
          label={o.label}
          active={o.key === value}
          onPress={() => onChange(o.key)}
        />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    paddingHorizontal: gutter,
    paddingVertical: 4,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
