import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSnoozedTopics } from '@/lib/timelines';
import { colors, CustomSwitch, fonts, isDark, space, Text, toast } from '@/ui';

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
  const { snoozedMap, setSnoozedTopics, resetSnoozes, snoozedCount: committedCount } = useSnoozedTopics();

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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        {/* Tocar fuera cierra la hoja sin aplicar cambios no guardados */}
        <Pressable style={s.backdrop} onPress={onClose} />

        {/* Hoja modal con fondo completamente negro (#000000) igual que el body */}
        <View
          style={[
            s.sheet,
            {
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
              paddingBottom: Math.max(bottom, space.lg) + space.sm,
            },
          ]}
        >
          {/* Indicador superior de arrastre */}
          <View style={s.handleWrap}>
            <View style={s.handle} />
          </View>

          {/* Encabezado con mejor jerarquía visual */}
          <View style={s.header}>
            <Text variant="title" style={s.title}>
              Aplazar temas
            </Text>
            <Text variant="body" style={s.subtitle}>
              Selecciona temas para ocultar durante 1 día
            </Text>
          </View>

          {/* Las 9 categorías con iconos de 23px y switches grandes de 52x32px */}
          <View style={s.listContainer}>
            {SNOOZE_CATEGORIES.map((topic) => {
              const active = Boolean(draftMap[topic.id] && draftMap[topic.id] > Date.now());
              return (
                <View key={topic.id} style={s.topicRow}>
                  <View style={s.topicLeft}>
                    <Feather
                      name={topic.icon}
                      size={23}
                      color={isDark ? '#FFFFFF' : colors.ink}
                    />
                    <Text
                      variant="label"
                      style={{
                        fontSize: 16.5,
                        lineHeight: 22,
                        fontFamily: fonts.medium,
                        color: isDark ? '#FFFFFF' : colors.ink,
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

          {/* Botón dinámico: si hay temas seleccionados en borrador muestra "Silenciar X temas" blanco con texto negro */}
          <View style={s.footer}>
            {draftCount > 0 ? (
              <Pressable
                onPress={handleApplySnooze}
                style={({ pressed }) => [
                  s.actionButton,
                  s.silenceButton,
                  pressed && { opacity: 0.9 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Silenciar ${draftCount} temas`}
              >
                <Text
                  variant="heading"
                  style={s.silenceButtonText}
                >
                  Silenciar {draftCount} {draftCount === 1 ? 'tema' : 'temas'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleReset}
                disabled={committedCount === 0}
                style={[
                  s.actionButton,
                  committedCount === 0 ? s.resetButtonDisabled : s.resetButtonActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Restablecer temas"
              >
                <Text
                  variant="heading"
                  style={[
                    s.resetButtonText,
                    committedCount > 0 && { color: isDark ? '#FFFFFF' : '#000000' },
                  ]}
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
    borderColor: isDark ? '#1C1F24' : '#E5E7EB',
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
    backgroundColor: '#3E444E',
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
    color: '#71767B',
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
  // Switch grande de 52x32px idéntico a la imagen de referencia del usuario
  switchTrack: {
    width: 52,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    position: 'relative',
  },
  switchThumb: {
    position: 'absolute',
    top: 1,
    left: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2.5,
    elevation: 3,
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
  silenceButton: {
    backgroundColor: '#FFFFFF',
  },
  silenceButtonText: {
    color: '#000000',
    fontSize: 16.5,
    fontFamily: fonts.bold,
  },
  resetButtonActive: {
    backgroundColor: isDark ? '#2C3440' : '#E5E7EB',
  },
  resetButtonDisabled: {
    backgroundColor: isDark ? '#20242B' : '#E5E7EB',
    opacity: 0.4,
  },
  resetButtonText: {
    color: '#8E9AA8',
    fontSize: 16.5,
    fontFamily: fonts.bold,
  },
});
