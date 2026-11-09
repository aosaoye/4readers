// src/ui/Text.tsx
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { ColorName, defaultColor, type, TypeVariant, useTheme } from './theme';

export type TextVariant = TypeVariant | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'xxl';

export interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: ColorName | string;
  tone?: 'default' | 'secondary' | 'muted' | 'inverse' | 'primary' | 'danger' | 'success' | ColorName;
  weight?: '300' | '400' | '500' | '600' | '700';
}

export function Text({
  variant = 'body',
  color,
  tone,
  weight,
  style,
  children,
  ...props
}: AppTextProps) {
  const { colors, typography } = useTheme();

  // Resolver estilo base según variant
  let baseStyle: TextStyle = {};
  if (variant in type) {
    baseStyle = type[variant as TypeVariant];
  } else if (variant in typography) {
    baseStyle = typography[variant as keyof typeof typography];
  }

  // Resolver color de texto
  let resolvedColor: string = colors.text;

  if (color) {
    resolvedColor = (colors as any)[color] ?? color;
  } else if (tone) {
    const toneMap: Record<string, string> = {
      default: colors.text,
      secondary: colors.textSecondary,
      muted: colors.textMuted,
      inverse: colors.textInverse,
      primary: colors.primary,
      danger: colors.danger,
      success: colors.success,
    };
    resolvedColor = toneMap[tone] ?? (colors as any)[tone] ?? colors.text;
  } else if (variant in type) {
    const fallbackName = defaultColor[variant as TypeVariant];
    resolvedColor = colors[fallbackName] ?? colors.text;
  }

  return (
    <RNText
      style={[
        baseStyle,
        { color: resolvedColor },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
