// src/ui/Field.tsx
import { Feather } from '@expo/vector-icons';
import React, { ComponentRef, forwardRef, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useFormScroll } from './FormScroll';
import { Text } from './Text';
import { fonts, radius, useTheme } from './theme';

export interface FieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  secure?: boolean;
}

/** Campo de texto unificado y reactivo al tema actual (Light / Dark). */
export const Field = forwardRef<ComponentRef<typeof TextInput>, FieldProps>(function Field(
  { label, error, hint, secure, multiline, style, onFocus, onBlur, ...rest },
  ref
) {
  const { colors, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(Boolean(secure));
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
    <View ref={wrapRef} collapsable={false} style={{ gap: 6, marginBottom: 12 }}>
      {label ? (
        <Text variant="label" style={{ color: colors.text, fontWeight: '600' }}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          s.box,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error
              ? colors.danger
              : focused
              ? colors.primary
              : colors.inputBorder,
          },
        ]}
      >
        <TextInput
          ref={ref}
          {...rest}
          multiline={multiline}
          secureTextEntry={hidden}
          placeholderTextColor={colors.inputPlaceholder}
          selectionColor={colors.primary}
          onFocus={(e) => {
            setFocused(true);
            scrollIntoView();
            setTimeout(scrollIntoView, 220);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={label}
          style={[
            s.input,
            { color: colors.text },
            multiline && s.multiline,
            style,
          ]}
        />

        {secure ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
          >
            <Feather
              name={hidden ? 'eye' : 'eye-off'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    minHeight: 50,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: 14,
    lineHeight: 22,
  },
});
