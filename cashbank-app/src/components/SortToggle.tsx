import { Feather } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import type { SortOrder } from '@/api/types';
import { colors, gutter, space, Text } from '@/ui';

/** El "Sorting Items" del diseño. */
export function SortToggle({
  value,
  onChange,
  labels = ['Más recientes', 'Más antiguos'],
}: {
  value: SortOrder;
  onChange: (v: SortOrder) => void;
  labels?: [string, string];
}) {
  return (
    <Pressable
      onPress={() => onChange(value === 'DESC' ? 'ASC' : 'DESC')}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        paddingHorizontal: gutter,
        paddingVertical: space.sm,
      }}
    >
      <Feather name="sliders" size={16} color={colors.muted} />
      <Text variant="caption" style={{ fontSize: 14 }}>
        {value === 'DESC' ? labels[0] : labels[1]}
      </Text>
    </Pressable>
  );
}
