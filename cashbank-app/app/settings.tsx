import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Card,
  colors,
  Divider,
  fonts,
  FormScroll,
  ListRow,
  NavHeader,
  radius,
  Screen,
  Section,
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
  icon: keyof typeof Feather.glyphMap;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    key: 'system',
    title: 'Automático (Sistema)',
    subtitle: 'Sigue el tema claro u oscuro configurado en tu dispositivo.',
    icon: 'smartphone',
  },
  {
    key: 'light',
    title: 'Modo Claro',
    subtitle: 'Fondo blanco puro y elementos luminosos.',
    icon: 'sun',
  },
  {
    key: 'dark',
    title: 'Modo Oscuro',
    subtitle: 'Fondo negro puro (#000000) y contraste calibrado.',
    icon: 'moon',
  },
];

export default function SettingsScreen() {
  const { mode, setMode } = useTheme();

  const handleSelectMode = async (selected: ThemeMode) => {
    if (selected === mode) return;
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
    <Screen>
      <NavHeader title="Ajustes" />
      <FormScroll>
        {/* Sección de Aspecto y Tema */}
        <Section title="Aspecto">
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {THEME_OPTIONS.map((opt, idx) => {
              const active = mode === opt.key;
              return (
                <View key={opt.key}>
                  <Pressable
                    onPress={() => handleSelectMode(opt.key)}
                    style={({ pressed }) => [
                      s.optionRow,
                      active && s.optionRowActive,
                      pressed && { opacity: 0.75 },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <View style={s.iconBox}>
                      <Feather
                        name={opt.icon}
                        size={20}
                        color={active ? colors.accent : colors.muted}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        variant="heading"
                        style={[s.optionTitle, active && { color: colors.accent }]}
                      >
                        {opt.title}
                      </Text>
                      <Text variant="caption">{opt.subtitle}</Text>
                    </View>
                    <View style={[s.radioCircle, active && s.radioCircleActive]}>
                      {active && <View style={s.radioDot} />}
                    </View>
                  </Pressable>
                  {idx < THEME_OPTIONS.length - 1 && <Divider />}
                </View>
              );
            })}
          </Card>
        </Section>

        {/* Sección de Cronologías e Inicio */}
        <Section title="Inicio y temas">
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <ListRow
              icon="layout"
              title="Cronologías"
              subtitle="Personaliza las pestañas fijadas en tu feed"
              onPress={() => router.push('/timelines')}
            />
          </Card>
        </Section>

        {/* Sección de Notificaciones y Cuenta */}
        <Section title="Preferencias">
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <ListRow
              icon="bell"
              title="Notificaciones"
              subtitle="Alertas de menciones, cobros y veredictos"
              onPress={() => router.push('/notifications')}
            />
            <Divider />
            <ListRow
              icon="user"
              title="Perfil de autor"
              subtitle="Editar biografía y avatar público"
              onPress={() => router.push('/profile')}
            />
          </Card>
        </Section>
      </FormScroll>
    </Screen>
  );
}

const s = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
    gap: space.md,
  },
  optionRowActive: {
    backgroundColor: colors.surfaceAlt,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
});
