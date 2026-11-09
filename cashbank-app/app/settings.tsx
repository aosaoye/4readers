import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CustomSwitch,
  fonts,
  gutter,
  Screen,
  space,
  Text,
  type ThemeMode,
  toast,
  useTheme,
} from '@/ui';

interface ThemeOption {
  key: ThemeMode;
  title: string;
  subtitle: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    key: 'system',
    title: 'Automático (Sistema)',
    subtitle: 'Sigue el tema claro u oscuro configurado en tu dispositivo.',
  },
  {
    key: 'light',
    title: 'Modo Claro',
    subtitle: 'Fondo blanco puro y elementos luminosos.',
  },
  {
    key: 'dark',
    title: 'Modo Oscuro',
    subtitle: 'Fondo negro puro (#09090B) y contraste calibrado.',
  },
];

export default function SettingsScreen() {
  const { mode, setMode, isDark, colors } = useTheme();
  const { top } = useSafeAreaInsets();

  const handleToggleMode = async (selected: ThemeMode) => {
    if (mode === selected) return;
    await setMode(selected);
    const label =
      selected === 'system'
        ? 'Tema automático del sistema activado'
        : selected === 'dark'
          ? 'Modo oscuro activado'
          : 'Modo claro activado';
    toast.success(label);
  };

  return (
    <Screen edges={['bottom']} style={{ backgroundColor: isDark ? '#000000' : colors.bg }}>
      {/* Header estilo Image 2 con back button y título */}
      <View style={[s.headerRow, { paddingTop: Math.max(top, space.sm) + 4 }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}
          hitSlop={12}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Atrás"
        >
          <Feather name="arrow-left" size={24} color={isDark ? '#FFFFFF' : colors.ink} />
        </Pressable>

        <Text variant="heading" style={[s.headerTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}>
          Ajustes
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Sección: Aspecto */}
        <Text style={s.sectionHeader}>Aspecto</Text>

        <View style={s.list}>
          {THEME_OPTIONS.map((opt) => {
            const isChecked = mode === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => handleToggleMode(opt.key)}
                style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                accessibilityRole="switch"
                accessibilityState={{ checked: isChecked }}
                accessibilityLabel={opt.title}
              >
                <View style={s.rowTextWrap}>
                  <Text style={[s.rowTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}>
                    {opt.title}
                  </Text>
                  <Text style={[s.rowSubtitle, { color: colors.muted }]}>
                    {opt.subtitle}
                  </Text>
                </View>

                <CustomSwitch
                  value={isChecked}
                  onValueChange={() => handleToggleMode(opt.key)}
                  activeColor={colors.accent}
                />
              </Pressable>
            );
          })}
        </View>

        {/* Sección: Inicio y temas */}
        <Text style={s.sectionHeader}>Inicio y temas</Text>

        <View style={s.list}>
          <Pressable
            onPress={() => router.push('/timelines')}
            style={({ pressed }) => [s.row, pressed && s.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel="Cronologías"
          >
            <View style={s.rowTextWrap}>
              <Text style={[s.rowTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}>
                Cronologías
              </Text>
              <Text style={[s.rowSubtitle, { color: colors.muted }]}>
                Personaliza las pestañas fijadas en tu feed
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        </View>

        {/* Sección: Preferencias */}
        <Text style={s.sectionHeader}>Preferencias</Text>

        <View style={s.list}>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={({ pressed }) => [s.row, pressed && s.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
          >
            <View style={s.rowTextWrap}>
              <Text style={[s.rowTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}>
                Notificaciones
              </Text>
              <Text style={[s.rowSubtitle, { color: colors.muted }]}>
                Alertas de menciones, cobros y veredictos
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/profile')}
            style={({ pressed }) => [s.row, pressed && s.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel="Perfil de autor"
          >
            <View style={s.rowTextWrap}>
              <Text style={[s.rowTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}>
                Perfil de autor
              </Text>
              <Text style={[s.rowSubtitle, { color: colors.muted }]}>
                Editar biografía y avatar público
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        </View>
      </ScrollView>
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
  sectionHeader: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#71767B',
    paddingHorizontal: gutter,
    paddingTop: space.lg,
    paddingBottom: space.xs,
  },
  list: {
    paddingTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingVertical: 14,
    gap: space.md,
  },
  rowPressed: {
    opacity: 0.8,
  },
  rowTextWrap: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.medium,
  },
  rowSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
});
