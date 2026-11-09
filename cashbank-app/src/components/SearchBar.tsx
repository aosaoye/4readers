import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, gutter, radius, space, Text } from '@/ui';

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
};

/**
 * Barra de búsqueda en forma de píldora:
 * - Si recibe `onPress`, actúa como disparador estilo Google que abre la pantalla dedicada `/search`.
 * - Si recibe `onChangeText`, renderiza el `TextInput` interactivo.
 */
export function SearchBar({
  value = '',
  onChangeText,
  onPress,
  autoFocus,
  placeholder = 'Buscar artículos, temas o autores…',
}: Props) {
  if (onPress) {
    return (
      <View style={s.outer}>
        <Pressable
          onPress={onPress}
          accessibilityRole="search"
          accessibilityLabel={placeholder}
          style={({ pressed }) => [s.box, pressed && { opacity: 0.75 }]}
        >
          <Feather name="search" size={18} color={colors.muted} />
          <Text variant="body" style={s.placeholderText} numberOfLines={1}>
            {value || placeholder}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.outer}>
      <View style={s.box}>
        <Feather name="search" size={18} color={colors.muted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel={placeholder}
          style={s.input}
        />
        {value.length > 0 && onChangeText && (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
          >
            <Feather name="x-circle" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  outer: {
    paddingHorizontal: gutter,
    paddingBottom: space.md,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 8,
  },
  placeholderText: {
    flex: 1,
    fontSize: 15,
    color: colors.faint,
  },
});
