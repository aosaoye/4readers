import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
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

export default function NotificationsPreferencesScreen() {
  const { isDark, colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'push' | 'email' | null>(null);

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
          Preferencias
        </Text>
      </View>

      <View style={s.content}>
        {/* Fila 1: Notificaciones push (Imagen 5) */}
        <Pressable
          onPress={() => setActiveSheet('push')}
          style={({ pressed }) => [s.row, pressed && s.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel="Notificaciones push"
        >
          <Text
            variant="heading"
            style={[s.rowTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}
          >
            Notificaciones push
          </Text>
          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>

        {/* Fila 2: Notificaciones de correo electrónico (Imagen 5) */}
        <Pressable
          onPress={() => setActiveSheet('email')}
          style={({ pressed }) => [s.row, pressed && s.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel="Notificaciones de correo electrónico"
        >
          <Text
            variant="heading"
            style={[s.rowTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}
          >
            Notificaciones de correo electrónico
          </Text>
          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>
      </View>

      {/* Sheet de configuración para Push o Email */}
      <Modal
        visible={activeSheet !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveSheet(null)}
      >
        <View style={s.overlay}>
          <Pressable style={s.backdrop} onPress={() => setActiveSheet(null)} />
          <View
            style={[
              s.sheet,
              {
                backgroundColor: isDark ? '#16181C' : '#FFFFFF',
                paddingBottom: Math.max(bottom, space.lg) + space.sm,
              },
            ]}
          >
            <View style={s.handleWrap}>
              <View style={s.handle} />
            </View>

            <View style={s.sheetHeader}>
              <Text variant="title" style={[s.sheetTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}>
                {activeSheet === 'push' ? 'Notificaciones push' : 'Notificaciones por correo'}
              </Text>
              <Text style={s.sheetDesc}>
                {activeSheet === 'push'
                  ? 'Recibe notificaciones en tu dispositivo sobre menciones, propinas y actividad relevante.'
                  : 'Recibe resúmenes periódicos, noticias y actualizaciones en tu bandeja de entrada.'}
              </Text>
            </View>

            <View style={s.toggleRow}>
              <Text
                variant="label"
                style={[s.toggleLabel, { color: isDark ? '#FFFFFF' : colors.ink }]}
              >
                {activeSheet === 'push' ? 'Activar notificaciones push' : 'Activar correos informativos'}
              </Text>

              <CustomSwitch
                value={activeSheet === 'push' ? pushEnabled : emailEnabled}
                onValueChange={(val) => {
                  if (activeSheet === 'push') {
                    setPushEnabled(val);
                    toast.success(val ? 'Notificaciones push activadas' : 'Notificaciones push desactivadas');
                  } else {
                    setEmailEnabled(val);
                    toast.success(val ? 'Correos activados' : 'Correos desactivados');
                  }
                }}
                activeColor={colors.accent}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingVertical: 18,
  },
  rowPressed: {
    opacity: 0.65,
  },
  rowTitle: {
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: gutter,
    paddingTop: space.sm,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3E444E',
  },
  sheetHeader: {
    paddingTop: space.xs,
    paddingBottom: space.md,
    gap: 4,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  sheetDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: '#71767B',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.md,
  },
  toggleLabel: {
    fontSize: 15,
    fontFamily: fonts.medium,
    flex: 1,
    paddingRight: space.md,
  },
});
