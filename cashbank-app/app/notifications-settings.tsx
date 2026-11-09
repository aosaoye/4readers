import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  gutter,
  Screen,
  space,
  Text,
  useTheme,
} from '@/ui';

export default function NotificationsSettingsScreen() {
  const { isDark, colors: themeColors } = useTheme();
  const { top } = useSafeAreaInsets();

  return (
    <Screen edges={['bottom']} style={{ backgroundColor: isDark ? '#000000' : themeColors.bg }}>
      {/* Header estilo X con safe-area insets adecuado (evita colisión con status bar) */}
      <View style={[s.headerRow, { paddingTop: Math.max(top, space.sm) + 4 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Atrás"
        >
          <Feather name="arrow-left" size={24} color={isDark ? '#FFFFFF' : themeColors.ink} />
        </Pressable>

        <Text variant="heading" style={[s.headerTitle, { color: isDark ? '#FFFFFF' : themeColors.ink }]}>
          Notificaciones
        </Text>
      </View>

      {/* Lista de navegación principal (Imagen 2) */}
      <View style={s.listContainer}>
        {/* Opción 1: Filtros */}
        <Pressable
          onPress={() => router.push('/notifications-filters')}
          style={({ pressed }) => [s.row, pressed && s.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel="Filtros"
        >
          <View style={s.iconWrap}>
            <Feather name="sliders" size={22} color={isDark ? '#FFFFFF' : themeColors.ink} />
          </View>
          <Text variant="heading" style={[s.rowTitle, { color: isDark ? '#FFFFFF' : themeColors.ink }]}>
            Filtros
          </Text>
          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>

        {/* Opción 2: Preferencias */}
        <Pressable
          onPress={() => router.push('/notifications-preferences')}
          style={({ pressed }) => [s.row, pressed && s.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel="Preferencias"
        >
          <View style={s.iconWrap}>
            <Feather name="bell" size={22} color={isDark ? '#FFFFFF' : themeColors.ink} />
          </View>
          <Text variant="heading" style={[s.rowTitle, { color: isDark ? '#FFFFFF' : themeColors.ink }]}>
            Preferencias
          </Text>
          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: gutter,
    paddingBottom: space.md,
    gap: space.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    lineHeight: 26,
  },
  listContainer: {
    paddingTop: space.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: gutter,
    paddingVertical: 18,
    gap: space.lg,
  },
  rowPressed: {
    opacity: 0.65,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: fonts.medium,
  },
});
