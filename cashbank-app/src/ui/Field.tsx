import { Feather } from '@expo/vector-icons';
import { type ComponentRef, forwardRef, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { useFormScroll } from './FormScroll';
import { Text } from './Text';
import { colors, fonts, radius } from './theme';

type Props = TextInputProps & { label?: string; error?: string; hint?: string; secure?: boolean };

/** EL campo de texto de la app: login, registro, publicar artículo, fuentes y revisión usan este mismo. */
export const Field = forwardRef<ComponentRef<typeof TextInput>, Props>(function Field(
  { label, error, hint, secure, multiline, style, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);
  const wrapRef = useRef<ComponentRef<typeof View>>(null);
  const formScroll = useFormScroll();

  const scrollIntoView = () => {
    if (!formScroll || !wrapRef.current) return;
    wrapRef.current.measureInWindow((_x: number, y: number, _w: number, h: number) => {
      if (typeof y === 'number' && typeof h === 'number') {
        formScroll.ensureVisible(y, h);
      }
    });
  };

  return (
    <View ref={wrapRef} collapsable={false} style={{ gap: 6 }}>
      {label && <Text variant="label">{label}</Text>}
      <View style={[s.box, focused && s.focus, !!error && s.error]}>
        <TextInput
          ref={ref}
          {...rest}
          multiline={multiline}
          secureTextEntry={hidden}
          placeholderTextColor={colors.faint}
          onFocus={(e) => {
            setFocused(true);
            scrollIntoView();
            setTimeout(scrollIntoView, 220);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          accessibilityLabel={label}
          style={[s.input, multiline && s.multiline, style]}
        />
        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
          >
            <Feather name={hidden ? 'eye' : 'eye-off'} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
  },
  focus: { borderColor: colors.ink },
  error: { borderColor: colors.danger },
  input: {
    flex: 1,
    minHeight: 52,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 150,
    textAlignVertical: 'top',
    paddingTop: 14,
    lineHeight: 23,
  },
});
