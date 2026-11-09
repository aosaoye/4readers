// src/components/home/SnoozeTopicsSheet.tsx
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSnoozedTopics } from '@/lib/timelines';
import { CustomSwitch, fonts, space, Text, toast, useTheme } from '@/ui';

interface SnoozeTopicsSheetProps {
  visible: boolean;
  onClose: () => void;
}

// Las 9 categorías exactas del diseño de referencia
const SNOOZE_CATEGORIES: { id: string; name: string; icon: keyof typeof Feather.glyphMap }[] = [
  { id: 'politica', name: 'Política', icon: 'archive' },
  { id: 'deportes', name: 'Deportes', icon: 'disc' },
  { id: 'negocios-finanzas', name: 'Negocios y finanzas', icon: 'briefcase' },
  { id: 'ciencia-tecnologia', name: 'Ciencia y tecnología', icon: 'aperture' },
  { id: 'entretenimiento-arte', name: 'Entretenimiento y arte', icon: 'film' },
  { id: 'inteligencia-artificial', name: 'Inteligencia artificial', icon: 'cpu' },
  { id: 'juegos', name: 'Juegos', icon: 'play-circle' },
  { id: 'criptomonedas', name: 'Criptomonedas', icon: 'dollar-sign' },
  { id: 'videos', name: 'Videos', icon: 'video' },
];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function SnoozeTopicsSheet({ visible, onClose }: SnoozeTopicsSheetProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const {
    snoozedMap,
    setSnoozedTopics,
    resetSnoozes,
    snoozedCount: committedCount,
  } = useSnoozedTopics();

  // Estado local en borrador: hasta que el usuario NO pulse "Silenciar X temas", NO se aplica ni cambia "Para ti"
  const [draftMap, setDraftMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (visible) {
      const now = Date.now();
      const initial: Record<string, number> = {};
      Object.entries(snoozedMap).forEach(([k, exp]) => {
        if (exp > now) initial[k] = exp;
      });
      setDraftMap(initial);
    }
  }, [visible, snoozedMap]);

  const toggleDraft = (id: string) => {
    setDraftMap((prev) => {
      const next = { ...prev };
      if (next[id] && next[id] > Date.now()) {
        delete next[id];
      } else {
        next[id] = Date.now() + ONE_DAY_MS;
      }
      return next;
    });
  };

  const draftCount = Object.values(draftMap).filter((exp) => exp > Date.now()).length;

  // Al pulsar "Silenciar X temas" se guardan los cambios de forma definitiva y se cierra
  const handleApplySnooze = () => {
    setSnoozedTopics(draftMap);
    toast.success(
      `${draftCount} ${draftCount === 1 ? 'tema silenciado' : 'temas silenciados'} durante 1 día`
    );
    onClose();
  };

  // Al pulsar "Restablecer" se eliminan todos los silenciamientos
  const handleReset = () => {
    setDraftMap({});
    resetSnoozes();
    toast.info('Se han restablecido todos los temas');
    onClose();
  };

  const sheetBg = isDark ? '#09090B' : '#FFFFFF';
  const sheetBorder = isDark ? '#27272A' : '#E2E8F0';
  const handleBg = isDark ? '#3F3F46' : '#CBD5E1';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        {/* Tocar fuera cierra la hoja sin aplicar cambios no guardados */}
        <Pressable style={s.backdrop} onPress={onClose} />

        {/* Hoja modal con fondo claro u oscuro según el tema */}
        <View
          style={[
            s.sheet,
            {
              backgroundColor: sheetBg,
              borderTopColor: sheetBorder,
              paddingBottom: Math.max(bottom, space.lg) + space.sm,
            },
          ]}
        >
          {/* Indicador superior de arrastre */}
          <View style={s.handleWrap}>
            <View style={[s.handle, { backgroundColor: handleBg }]} />
          </View>

          {/* Encabezado con excelente contraste en light y dark */}
          <View style={s.header}>
            <Text variant="title" style={[s.title, { color: colors.text }]}>
              Aplazar temas
            </Text>
            <Text variant="body" style={[s.subtitle, { color: colors.textSecondary }]}>
              Selecciona temas para ocultar durante 1 día
            </Text>
          </View>

          {/* Las 9 categorías con iconos y switches reactivos */}
          <View style={s.listContainer}>
            {SNOOZE_CATEGORIES.map((topic) => {
              const active = Boolean(draftMap[topic.id] && draftMap[topic.id] > Date.now());
              return (
                <View key={topic.id} style={s.topicRow}>
                  <View style={s.topicLeft}>
                    <Feather name={topic.icon} size={23} color={colors.text} />
                    <Text
                      variant="label"
                      style={{
                        fontSize: 16.5,
                        lineHeight: 22,
                        fontFamily: fonts.medium,
                        color: colors.text,
                      }}
                    >
                      {topic.name}
                    </Text>
                  </View>

                  <CustomSwitch
                    value={active}
                    onValueChange={() => toggleDraft(topic.id)}
                    activeColor="#F4212E"
                  />
                </View>
              );
            })}
          </View>

          {/* Botón dinámico con alto contraste garantizado */}
          <View style={s.footer}>
            {draftCount > 0 ? (
              <Pressable
                onPress={handleApplySnooze}
                style={({ pressed }) => [
                  s.actionButton,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#0F172A',
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Silenciar ${draftCount} temas`}
              >
                <Text
                  variant="heading"
                  style={{
                    color: isDark ? '#000000' : '#FFFFFF',
                    fontSize: 16.5,
                    fontFamily: fonts.bold,
                  }}
                >
                  Silenciar {draftCount} {draftCount === 1 ? 'tema' : 'temas'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleReset}
                disabled={committedCount === 0}
                style={({ pressed }) => [
                  s.actionButton,
                  {
                    backgroundColor:
                      committedCount === 0
                        ? isDark
                          ? '#18181B'
                          : '#F1F5F9'
                        : isDark
                        ? '#27272A'
                        : '#E2E8F0',
                    borderWidth: 1,
                    borderColor: isDark ? '#27272A' : '#E2E8F0',
                    opacity: committedCount === 0 ? 0.5 : pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Restablecer temas"
              >
                <Text
                  variant="heading"
                  style={{
                    color:
                      committedCount === 0
                        ? isDark
                          ? '#71717A'
                          : '#94A3B8'
                        : isDark
                        ? '#FFFFFF'
                        : '#0F172A',
                    fontSize: 16.5,
                    fontFamily: fonts.bold,
                  }}
                >
                  Restablecer
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingTop: space.sm,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: space.xl,
    paddingTop: 4,
    paddingBottom: 10,
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: space.xl,
    paddingTop: 6,
    paddingBottom: 6,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8.5,
  },
  topicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  footer: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
  },
  actionButton: {
    height: 52,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
