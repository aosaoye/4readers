// src/ui/TabBar.tsx
import { Feather } from '@expo/vector-icons';
import { router, type Tabs } from 'expo-router';
import React, { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { fonts, useTheme } from './theme';

type BottomTabBarProps = NonNullable<ComponentProps<typeof Tabs>['tabBar']> extends (
  props: infer P
) => any
  ? P
  : never;

const TABS: Record<string, { label: string; icon: keyof typeof Feather.glyphMap }> = {
  index: { label: 'Inicio', icon: 'home' },
  explore: { label: 'Explorar', icon: 'search' },
  saved: { label: 'Guardados', icon: 'bookmark' },
  profile: { label: 'Perfil', icon: 'user' },
};

/** Barra inferior adaptada de forma 100% reactiva a Light y Dark mode. */
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const barBg = isDark ? colors.background : colors.surface;
  const barBorder = colors.border;
  const inactiveColor = colors.textMuted;
  const activeColor = colors.accent || '#E4531D';

  return (
    <View
      style={[
        s.bar,
        {
          backgroundColor: barBg,
          borderTopColor: barBorder,
          paddingBottom: Math.max(bottom, 10),
        },
      ]}
    >
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === i;
        const color = focused ? activeColor : inactiveColor;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            style={s.item}
            onPress={() => {
              const e = emitter.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !e.defaultPrevented) {
                if (navigateToTab) navigateToTab(route.key);
                else router.navigate(route.name === 'index' ? '/' : (`/${route.name}` as never));
              }
            }}
          >
            <View style={s.iconBox}>
              <Feather name={tab.icon} size={23} color={color} />
              <Text
                variant="caption"
                style={{
                  color,
                  fontFamily: focused ? fonts.bold : fonts.medium,
                  fontSize: 11,
                }}
              >
                {tab.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 4,
  },
});
