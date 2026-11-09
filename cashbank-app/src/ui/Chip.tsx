import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from './Text';
import { colors, gutter, radius } from './theme';

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[s.chip, active && s.active]}
    >
      <Text variant="caption" style={{ fontSize: 13, lineHeight: 18, color: active ? colors.onInk : colors.muted }}>
        {label}
      </Text>
    </Pressable>
  );
}

type Option<K extends string> = { key: K; label: string };
/** Fila horizontal de chips: filtros, categorías, ordenación y pestañas internas comparten este componente. */
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
        <Chip key={o.key} label={o.label} active={o.key === value} onPress={() => onChange(o.key)} />
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
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
});
