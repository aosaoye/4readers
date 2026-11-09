// src/ui/Button.tsx
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { radius, useTheme } from './theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light' | 'outline' | 'danger';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  label?: string;
  title?: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | string;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
}

export function Button({
  label,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  ...props
}: ButtonProps) {
  const { colors, spacing } = useTheme();
  const text = label ?? title ?? '';

  const bgMap: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.surfaceSubtle,
    ghost: 'transparent',
    light: colors.surface,
    outline: 'transparent',
    danger: colors.danger,
  };

  const textMap: Record<ButtonVariant, string> = {
    primary: colors.primaryForeground,
    secondary: colors.text,
    ghost: colors.primary,
    light: colors.text,
    outline: colors.text,
    danger: '#FFFFFF',
  };

  const isSmall = size === 'sm';
  const fgColor = textMap[variant] || colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.base,
        isSmall ? s.sm : s.md,
        {
          backgroundColor: bgMap[variant],
          borderColor: variant === 'outline' || variant === 'secondary' ? colors.border : 'transparent',
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={fgColor} />
      ) : (
        <View style={s.content}>
          {icon && <Feather name={icon} size={isSmall ? 15 : 18} color={fgColor} />}
          <Text
            variant="label"
            style={{
              color: fgColor,
              fontSize: isSmall ? 13 : 15,
              fontWeight: '600',
            }}
          >
            {text}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export interface IconButtonProps {
  name: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  label: string;
  tone?: 'plain' | 'filled' | 'onImage';
  active?: boolean;
}

export function IconButton({
  name,
  onPress,
  label,
  tone = 'plain',
  active,
}: IconButtonProps) {
  const { colors } = useTheme();
  const fg = active ? colors.accent : tone === 'onImage' ? '#FFFFFF' : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        s.icon,
        tone === 'filled' && {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
        tone === 'onImage' && {
          backgroundColor: active ? '#FFFFFF' : 'rgba(0,0,0,0.32)',
        },
        pressed && { opacity: 0.6 },
      ]}
    >
      <Feather name={name} size={21} color={fg} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  md: {
    height: 50,
    paddingHorizontal: 22,
  },
  sm: {
    height: 36,
    paddingHorizontal: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
