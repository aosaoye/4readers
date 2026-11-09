import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CustomSwitch,
  fonts,
  gutter,
  Screen,
  space,
  Text,
  toast,
  useTheme,
} from '@/ui';

interface MuteRule {
  id: string;
  label: string;
}

const MUTE_RULES: MuteRule[] = [
  { id: 'not_following', label: 'A las que no sigues' },
  { id: 'not_following_you', label: 'Que no te siguen' },
  { id: 'new_account', label: 'Cuya cuenta es nueva' },
  { id: 'default_avatar', label: 'Que aún usan la foto de perfil predeterminada' },
  { id: 'unconfirmed_email', label: 'Que no confirmaron su correo electrónico' },
  { id: 'unconfirmed_phone', label: 'Que no confirmaron su número de teléfono' },
];

export default function NotificationsMutedScreen() {
  const { isDark, colors } = useTheme();
  const { top } = useSafeAreaInsets();

  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({
    not_following: false,
    not_following_you: false,
    new_account: false,
    default_avatar: false,
    unconfirmed_email: false,
    unconfirmed_phone: false,
  });

  const toggleRule = (id: string) => {
    setMutedStates((prev) => {
      const nextVal = !prev[id];
      const rule = MUTE_RULES.find((r) => r.id === id);
      if (rule) {
        toast.info(
          nextVal
            ? `Silenciando notificaciones de personas: ${rule.label.toLowerCase()}`
            : `Filtro desactivado: ${rule.label.toLowerCase()}`
        );
      }
      return { ...prev, [id]: nextVal };
    });
  };

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
          Notificaciones silenciadas
        </Text>
      </View>

      <View style={s.content}>
        {/* Subtítulo de sección (Imagen 4) */}
        <Text style={s.sectionHeader}>
          Silencia notificaciones de personas:
        </Text>

        {/* Las 6 opciones con switches custom (Imagen 4) */}
        <View style={s.list}>
          {MUTE_RULES.map((rule) => {
            const isChecked = Boolean(mutedStates[rule.id]);
            return (
              <Pressable
                key={rule.id}
                onPress={() => toggleRule(rule.id)}
                style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                accessibilityRole="switch"
                accessibilityState={{ checked: isChecked }}
                accessibilityLabel={rule.label}
              >
                <Text
                  variant="body"
                  style={[s.rowLabel, { color: isDark ? '#FFFFFF' : colors.ink }]}
                >
                  {rule.label}
                </Text>

                <CustomSwitch
                  value={isChecked}
                  onValueChange={() => toggleRule(rule.id)}
                  activeColor={colors.accent}
                />
              </Pressable>
            );
          })}
        </View>
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
  sectionHeader: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#71767B',
    paddingHorizontal: gutter,
    paddingVertical: space.sm,
  },
  list: {
    paddingTop: 4,
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
  rowLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.regular,
  },
});
