import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  CustomSwitch,
  fonts,
  gutter,
  Screen,
  space,
  Text,
  toast,
  useTheme,
} from '@/ui';

export default function NotificationsFiltersScreen() {
  const { isDark, colors } = useTheme();
  const { top } = useSafeAreaInsets();

  const [qualityFilter, setQualityFilter] = useState(true);

  return (
    <Screen edges={['bottom']} style={{ backgroundColor: isDark ? '#000000' : colors.bg }}>
      {/* Header estilo X con safe-area insets adecuado */}
      <View style={[s.headerRow, { paddingTop: Math.max(top, space.sm) + 4 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Atrás"
        >
          <Feather name="arrow-left" size={24} color={isDark ? '#FFFFFF' : colors.ink} />
        </Pressable>

        <Text variant="heading" style={[s.headerTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}>
          Filtros
        </Text>
      </View>

      <View style={s.content}>
        {/* Opción 1: Filtro de calidad (Imagen 3) */}
        <View style={s.filterRow}>
          <View style={s.filterTextWrap}>
            <Text
              variant="label"
              style={[s.filterTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}
            >
              Filtro de calidad
            </Text>
            <Text style={s.filterDesc}>
              Filtra el contenido de baja calidad de tus notificaciones. Esto no filtrará las notificaciones de personas que sigues o cuentas con las que has interactuado recientemente.{' '}
              <Text
                style={[s.moreInfoLink, { color: colors.accent }]}
                onPress={() => toast.info('El filtro de calidad oculta spam y respuestas duplicadas.')}
              >
                Más información
              </Text>
            </Text>
          </View>

          <View style={s.switchWrap}>
            <CustomSwitch
              value={qualityFilter}
              onValueChange={(val) => {
                setQualityFilter(val);
                toast.success(
                  val ? 'Filtro de calidad activado' : 'Filtro de calidad desactivado'
                );
              }}
              activeColor={colors.accent}
            />
          </View>
        </View>

        {/* Opción 2: Notificaciones silenciadas (Imagen 3 -> navega a Imagen 4) */}
        <Pressable
          onPress={() => router.push('/notifications-muted')}
          style={({ pressed }) => [s.navRow, pressed && s.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel="Notificaciones silenciadas"
        >
          <Text
            variant="heading"
            style={[s.navRowTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}
          >
            Notificaciones silenciadas
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
  content: {
    paddingTop: space.xs,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingVertical: space.md,
    gap: space.md,
  },
  filterTextWrap: {
    flex: 1,
    paddingRight: space.xs,
    gap: 4,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    lineHeight: 22,
  },
  filterDesc: {
    fontSize: 14,
    lineHeight: 19,
    color: '#71767B',
  },
  moreInfoLink: {
    color: colors.accent,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fonts.medium,
  },
  switchWrap: {
    paddingTop: 4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingVertical: 18,
  },
  navRowTitle: {
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  rowPressed: {
    opacity: 0.65,
  },
});
