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

export default function ExploreSettingsScreen() {
  const { isDark, colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();

  const [grokStories, setGrokStories] = useState(false);
  const [localContent, setLocalContent] = useState(true);
  const [showWidgetModal, setShowWidgetModal] = useState(false);

  return (
    <Screen edges={['bottom']} style={{ backgroundColor: isDark ? '#000000' : colors.bg }}>
      {/* Header estilo X: Atrás alineado con título centrado y espaciado safe area */}
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

        <Text
          variant="heading"
          style={[s.headerTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}
        >
          Explorar
        </Text>

        <View style={s.backBtn} />
      </View>

      <View style={s.content}>
        {/* Opción 1: Mostrarme historias graciosas de Grok (Imagen 3) */}
        <View style={s.row}>
          <View style={s.textCol}>
            <Text
              variant="heading"
              style={[s.itemTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}
            >
              Mostrarme historias graciosas de Grok
            </Text>
          </View>

          <CustomSwitch
            value={grokStories}
            onValueChange={(val) => {
              setGrokStories(val);
              toast.info(
                val
                  ? 'Historias graciosas de Grok activadas'
                  : 'Historias graciosas de Grok desactivadas'
              );
            }}
            activeColor={colors.accent}
          />
        </View>

        {/* Opción 2: Muéstrame contenido local (Imagen 3) */}
        <View style={s.row}>
          <View style={s.textCol}>
            <Text
              variant="heading"
              style={[s.itemTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}
            >
              Muéstrame contenido local
            </Text>
            <Text style={s.itemDesc}>
              Si activas esta opción, podrás ver lo que sucede a tu alrededor en este momento.
            </Text>
          </View>

          <CustomSwitch
            value={localContent}
            onValueChange={(val) => {
              setLocalContent(val);
              toast.info(
                val
                  ? 'Mostrando contenido local en Explorar'
                  : 'Contenido local desactivado'
              );
            }}
            activeColor={colors.accent}
          />
        </View>

        {/* Opción 3: Añadir la herramienta Destacados de Noticias de X (Imagen 3) */}
        <Pressable
          onPress={() => setShowWidgetModal(true)}
          style={({ pressed }) => [s.row, pressed && s.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel="Añadir la herramienta Destacados de Noticias de X"
        >
          <View style={s.textCol}>
            <Text
              variant="heading"
              style={[s.itemTitle, { color: isDark ? '#FFFFFF' : colors.ink }]}
            >
              Añadir la herramienta Destacados de Noticias de X
            </Text>
            <Text style={s.itemDesc}>
              Visualiza las historias principales de Explorar en tu pantalla de inicio.
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>
      </View>

      {/* Modal para herramienta Destacados de Noticias */}
      <Modal
        visible={showWidgetModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowWidgetModal(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.backdrop} onPress={() => setShowWidgetModal(false)} />
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
                Destacados de Noticias de X
              </Text>
              <Text style={s.sheetDesc}>
                ¿Deseas anclar el widget de Destacados de Noticias a tu pantalla de inicio para acceder directamente a las tendencias?
              </Text>
            </View>

            <View style={s.modalButtonsRow}>
              <Pressable
                onPress={() => setShowWidgetModal(false)}
                style={({ pressed }) => [
                  s.btnSecondary,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={s.btnSecondaryText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowWidgetModal(false);
                  toast.success('Widget de Destacados añadido a la pantalla de inicio');
                }}
                style={({ pressed }) => [
                  s.btnPrimary,
                  { backgroundColor: colors.accent },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={s.btnPrimaryText}>Añadir</Text>
              </Pressable>
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
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingBottom: space.md,
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
    textAlign: 'center',
  },
  content: {
    paddingTop: space.xs,
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
    opacity: 0.7,
  },
  textCol: {
    flex: 1,
    paddingRight: space.xs,
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    lineHeight: 22,
  },
  itemDesc: {
    fontSize: 14,
    lineHeight: 19,
    color: '#71767B',
  },
  modalOverlay: {
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
    gap: 6,
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
  modalButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: space.md,
    paddingTop: space.md,
  },
  btnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  btnSecondaryText: {
    color: '#71767B',
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  btnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 999,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});
