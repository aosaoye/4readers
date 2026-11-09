import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ComponentRef, useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSnoozedTopics, type TimelineItem } from '@/lib/timelines';
import { Avatar, fonts, space, Text, useTheme } from '@/ui';

/** Icono animado con cross-fade fluido entre chevron-down y clock */
function TabSnoozeIcon({
  isSnoozed,
  color,
}: {
  isSnoozed: boolean;
  color: string;
}) {
  const anim = useRef(new Animated.Value(isSnoozed ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isSnoozed ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isSnoozed, anim]);

  return (
    <View style={s.tabIconContainer}>
      <Animated.View
        style={[
          s.tabIconAbs,
          {
            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            transform: [
              {
                scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }),
              },
            ],
          },
        ]}
      >
        <Feather name="chevron-down" size={14} color={color} />
      </Animated.View>
      <Animated.View
        style={[
          s.tabIconAbs,
          {
            opacity: anim,
            transform: [
              {
                scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
              },
            ],
          },
        ]}
      >
        <Feather name="clock" size={13} color={color} />
      </Animated.View>
    </View>
  );
}

interface HomeHeaderProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSnooze: () => void;
  pinnedTimelines: TimelineItem[];
  username?: string;
  avatarUrl?: string | null;
}

export function HomeHeader({
  activeTab,
  onSelectTab,
  onOpenSnooze,
  pinnedTimelines,
  username,
  avatarUrl,
}: HomeHeaderProps) {
  const { top } = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { snoozedCount } = useSnoozedTopics();
  const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const activeColor = colors.text;
  const inactiveColor = colors.textMuted;

  // Sanitiza las cronologías fijadas para asegurar que nunca se filtren datos nulos ni las fijas de sistema
  const validPinnedTimelines = useMemo(
    () =>
      (pinnedTimelines ?? []).filter(
        (t) =>
          t &&
          typeof t.id === 'string' &&
          t.id !== 'for-you' &&
          t.id !== 'following' &&
          Boolean(t.name)
      ),
    [pinnedTimelines]
  );

  // Si hay pocas categorías (<= 2 fijadas), ocupan el ancho completo (width 100%) sin dejar el + a la mitad
  const isFewCategories = validPinnedTimelines.length <= 2;

  // Garantiza que cuando se vuelve al inicio o a Para ti / Siguiendo, nunca se quede desplazado al final mostrando solo el "+"
  useEffect(() => {
    if (activeTab === 'for-you' || activeTab === 'following') {
      scrollViewRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [activeTab, validPinnedTimelines]);

  return (
    <View
      style={[
        s.container,
        {
          paddingTop: Math.max(top, space.sm),
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Barra superior: Avatar a la izquierda, centro limpio (sin Twitter), Notificaciones y Seguir (user-plus) a la derecha */}
      <View style={s.topBar}>
        <Pressable
          onPress={() => router.navigate('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Ver tu perfil"
          hitSlop={8}
          style={s.avatarBtn}
        >
          <Avatar name={username ?? 'lector'} avatarUrl={avatarUrl} size={34} />
        </Pressable>

        <View style={s.centerSpacer} />

        <View style={s.topBarActions}>
          {/* Botón de notificaciones */}
          <Pressable
            onPress={() => router.push('/notifications')}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
            hitSlop={8}
            style={s.topBarBtn}
          >
            <Feather name="bell" size={20} color={colors.ink} />
          </Pressable>

          {/* Botón user-plus (estilo Twitter/X) que abre la pantalla Seguir */}
          <Pressable
            onPress={() => router.push('/follow')}
            accessibilityRole="button"
            accessibilityLabel="Seguir a personas y temas"
            hitSlop={8}
            style={s.topBarBtn}
          >
            <Feather name="user-plus" size={20} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      {/* Fila de pestañas: Cuando hay pocas categorías, se expanden al 100% del ancho y el + queda al extremo derecho */}
      {isFewCategories ? (
        <View style={s.fullWidthTabsRow}>
          <View style={s.expandedTabsGroup}>
            {/* Pestaña: Para ti */}
            <Pressable
              onPress={() => {
                if (activeTab === 'for-you') {
                  onOpenSnooze();
                } else {
                  onSelectTab('for-you');
                }
              }}
              style={s.tabExpandedItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'for-you' }}
            >
              <View style={s.tabLabelRow}>
                <Text
                  variant="heading"
                  style={[
                    s.tabText,
                    activeTab === 'for-you' && s.tabTextActive,
                    { color: activeTab === 'for-you' ? activeColor : inactiveColor },
                  ]}
                >
                  Para ti
                </Text>
                <Pressable
                  onPress={onOpenSnooze}
                  hitSlop={8}
                  accessibilityLabel="Aplazar temas de Para ti"
                >
                  <TabSnoozeIcon
                    isSnoozed={snoozedCount > 0}
                    color={activeTab === 'for-you' ? activeColor : inactiveColor}
                  />
                </Pressable>
              </View>
              {activeTab === 'for-you' && (
                <View style={[s.indicator, { backgroundColor: activeColor }]} />
              )}
            </Pressable>

            {/* Pestaña: Siguiendo */}
            <Pressable
              onPress={() => onSelectTab('following')}
              style={s.tabExpandedItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'following' }}
            >
              <Text
                variant="heading"
                style={[
                  s.tabText,
                  activeTab === 'following' && s.tabTextActive,
                  { color: activeTab === 'following' ? activeColor : inactiveColor },
                ]}
              >
                Siguiendo
              </Text>
              {activeTab === 'following' && (
                <View style={[s.indicator, { backgroundColor: activeColor }]} />
              )}
            </Pressable>

            {/* Pestañas fijadas si las hay */}
            {validPinnedTimelines.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSelectTab(item.id)}
                  style={s.tabExpandedItem}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    variant="heading"
                    style={[
                      s.tabText,
                      isActive && s.tabTextActive,
                      { color: isActive ? activeColor : inactiveColor },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {isActive && (
                    <View style={[s.indicator, { backgroundColor: activeColor }]} />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Botón "+" fijado en el extremo derecho */}
          <Pressable
            onPress={() => router.push('/timelines')}
            style={s.plusBtnRightEdge}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Gestionar cronologías y añadir categorías"
          >
            <Feather name="plus" size={19} color={inactiveColor} />
          </Pressable>
        </View>
      ) : (
        /* Cuando hay muchas categorías (> 2 fijadas), se desplaza horizontalmente con scroll */
        <View style={s.tabsWrapper}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabsScrollContent}
          >
            {/* Pestaña: Para ti */}
            <Pressable
              onPress={() => {
                if (activeTab === 'for-you') {
                  onOpenSnooze();
                } else {
                  onSelectTab('for-you');
                }
              }}
              style={s.tabItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'for-you' }}
            >
              <View style={s.tabLabelRow}>
                <Text
                  variant="heading"
                  style={[
                    s.tabText,
                    activeTab === 'for-you' && s.tabTextActive,
                    { color: activeTab === 'for-you' ? activeColor : inactiveColor },
                  ]}
                >
                  Para ti
                </Text>
                <Pressable
                  onPress={onOpenSnooze}
                  hitSlop={8}
                  accessibilityLabel="Aplazar temas de Para ti"
                >
                  <TabSnoozeIcon
                    isSnoozed={snoozedCount > 0}
                    color={activeTab === 'for-you' ? activeColor : inactiveColor}
                  />
                </Pressable>
              </View>
              {activeTab === 'for-you' && (
                <View style={[s.indicator, { backgroundColor: activeColor }]} />
              )}
            </Pressable>

            {/* Pestaña: Siguiendo */}
            <Pressable
              onPress={() => onSelectTab('following')}
              style={s.tabItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'following' }}
            >
              <Text
                variant="heading"
                style={[
                  s.tabText,
                  activeTab === 'following' && s.tabTextActive,
                  { color: activeTab === 'following' ? activeColor : inactiveColor },
                ]}
              >
                Siguiendo
              </Text>
              {activeTab === 'following' && (
                <View style={[s.indicator, { backgroundColor: activeColor }]} />
              )}
            </Pressable>

            {/* Pestañas fijadas */}
            {validPinnedTimelines.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSelectTab(item.id)}
                  style={s.tabItem}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    variant="heading"
                    style={[
                      s.tabText,
                      isActive && s.tabTextActive,
                      { color: isActive ? activeColor : inactiveColor },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {isActive && (
                    <View style={[s.indicator, { backgroundColor: activeColor }]} />
                  )}
                </Pressable>
              );
            })}

            {/* Botón "+" al final del scroll */}
            <Pressable
              onPress={() => router.push('/timelines')}
              style={s.plusBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Gestionar cronologías y añadir categorías"
            >
              <Feather name="plus" size={19} color={inactiveColor} />
            </Pressable>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSpacer: {
    flex: 1,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  topBarBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthTabsRow: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingLeft: space.md,
    paddingRight: space.xs,
  },
  expandedTabsGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  tabExpandedItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 2,
  },
  plusBtnRightEdge: {
    height: '100%',
    paddingHorizontal: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsWrapper: {
    height: 46,
  },
  tabsScrollContent: {
    paddingHorizontal: space.lg,
    alignItems: 'center',
    gap: space.lg,
  },
  tabItem: {
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 4,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabText: {
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  tabTextActive: {
    fontFamily: fonts.bold,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    borderRadius: 1.5,
  },
  plusBtn: {
    height: 46,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainer: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIconAbs: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
