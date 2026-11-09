// src/ui/Layout.tsx
import { router } from 'expo-router';
import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from './Button';
import { Text } from './Text';
import { gutter, radius, space, useTheme } from './theme';

export function Screen({
  children,
  edges = ['top'],
  style,
}: {
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

/** Cabecera grande de las pestañas: kicker naranja + título display. */
export function ScreenHeader({
  kicker,
  title,
  right,
  flush,
}: {
  kicker: string;
  title: string;
  right?: ReactNode;
  flush?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[s.header, flush && { paddingHorizontal: 0, paddingTop: 0 }]}>
      <View style={{ flex: 1 }}>
        <Text variant="kicker" style={{ color: colors.accent }}>{kicker}</Text>
        <Text variant="display" style={{ marginTop: space.sm, color: colors.text }}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

/** Cabecera de las pantallas apiladas: botón atrás siempre visible + título en negrita con elipsis sin chocar. */
export function NavHeader({
  title,
  right,
  onImage,
  solidSurface,
  onBack,
}: {
  title: string;
  right?: ReactNode;
  onImage?: boolean;
  solidSurface?: boolean;
  onBack?: () => void;
}) {
  const { colors } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/');
    }
  };

  return (
    <View
      style={[
        s.nav,
        solidSurface && {
          backgroundColor: colors.surface,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <IconButton
        name="chevron-left"
        label="Volver"
        tone={onImage ? 'onImage' : 'plain'}
        onPress={handleBack}
      />
      <Text
        variant="heading"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          flex: 1,
          marginRight: space.xs,
          color: onImage ? '#FFFFFF' : colors.text,
        }}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}

/** Hoja con esquinas grandes (detalle del artículo, formularios). */
export function Sheet({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={[s.sheet, { backgroundColor: colors.surfaceElevated }, style]}>
      {children}
    </View>
  );
}

export function Card({
  children,
  tone = 'soft',
  style,
}: {
  children: ReactNode;
  tone?: 'soft' | 'solid';
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        s.card,
        {
          backgroundColor: tone === 'solid' ? colors.primary : colors.surface,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <View style={{ gap: space.md }}>
      <View style={s.sectionHeader}>
        <Text variant="heading" style={{ flex: 1 }}>
          {title}
        </Text>
        {action ? <View style={{ flexShrink: 0 }}>{action}</View> : null}
      </View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: gutter,
    paddingTop: space.lg,
    paddingBottom: space.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    height: 52,
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: gutter,
  },
  card: {
    borderRadius: radius.lg,
    padding: space.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
});
