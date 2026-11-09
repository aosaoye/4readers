import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from './theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light';
type Props = {
  title: string; onPress?: () => void; variant?: Variant; size?: 'md' | 'sm';
  loading?: boolean; disabled?: boolean; icon?: keyof typeof Feather.glyphMap; style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled, icon, style }: Props) {
  const fg = variant === 'primary' ? colors.onInk : variant === 'ghost' ? colors.accent : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        s.base, size === 'sm' ? s.sm : s.md,
        variant === 'primary' && s.primary, variant === 'secondary' && s.secondary, variant === 'light' && { backgroundColor: colors.surface },
        (pressed || disabled) && { opacity: disabled ? 0.45 : 0.75 }, style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : (
        <View style={s.content}>
          {icon && <Feather name={icon} size={18} color={fg} />}
          <Text variant="label" style={{ color: fg, fontSize: 15 }}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

type IconProps = {
  name: keyof typeof Feather.glyphMap; onPress?: () => void; label: string;
  /** "onImage": blanco sobre una portada. "filled": círculo claro. */
  tone?: 'plain' | 'filled' | 'onImage'; active?: boolean;
};
export function IconButton({ name, onPress, label, tone = 'plain', active }: IconProps) {
  const fg = active ? colors.accent : tone === 'onImage' ? '#fff' : colors.ink;
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8}
      style={({ pressed }) => [
        s.icon,
        tone === 'filled' && { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.bg },
        tone === 'onImage' && { backgroundColor: active ? '#fff' : 'rgba(0,0,0,0.32)' },
        pressed && { opacity: 0.6 },
      ]}
    >
      <Feather name={name} size={21} color={fg} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  md: { height: 52, paddingHorizontal: 24 },
  sm: { height: 38, paddingHorizontal: 16 },
  primary: { backgroundColor: colors.ink },
  secondary: { borderWidth: 1, borderColor: colors.line },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
