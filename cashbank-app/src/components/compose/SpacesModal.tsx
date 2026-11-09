import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomSwitch, fonts, radius, space, Text, toast, useTheme } from '@/ui';

export interface SpaceConfig {
  title: string;
  topics: string[];
  record: boolean;
  scheduledAt?: string;
  isLive?: boolean;
}

interface SpacesModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (config: SpaceConfig) => void;
}

type SpaceStep = 'intro' | 'create' | 'schedule';

const AVAILABLE_TOPICS = [
  'Tecnología',
  'Criptomonedas',
  'Economía',
  'Inteligencia Artificial',
  'Startups',
  'Deportes',
  'Cultura',
  'Periodismo',
];

export function SpacesModal({ visible, onClose, onConfirm }: SpacesModalProps) {
  const { isDark, colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();

  const [step, setStep] = useState<SpaceStep>('intro');
  const [topicInput, setTopicInput] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Tecnología']);
  const [recordSpace, setRecordSpace] = useState(true);
  const [showTopicsPicker, setShowTopicsPicker] = useState(false);

  // Fecha y hora programada (Imagen 5)
  const [scheduledDay, setScheduledDay] = useState('10 novie 2026');
  const [scheduledTime, setScheduledTime] = useState('12:00 a. m.');

  const toggleTopic = (t: string) => {
    if (selectedTopics.includes(t)) {
      setSelectedTopics((prev) => prev.filter((x) => x !== t));
    } else {
      if (selectedTopics.length < 3) {
        setSelectedTopics((prev) => [...prev, t]);
      } else {
        toast.info('Máximo 3 temas');
      }
    }
  };

  const handleStartNow = () => {
    const title = topicInput.trim() || 'Espacio en directo';
    onConfirm({
      title,
      topics: selectedTopics,
      record: recordSpace,
      isLive: true,
    });
    toast.success('¡Espacio creado e iniciado!');
    onClose();
  };

  const handleScheduleConfirm = () => {
    const title = topicInput.trim() || 'Espacio programado';
    onConfirm({
      title,
      topics: selectedTopics,
      record: recordSpace,
      scheduledAt: `${scheduledDay} · ${scheduledTime}`,
      isLive: false,
    });
    toast.success(`Espacio programado para el ${scheduledDay}`);
    onClose();
  };

  const modalBg = isDark ? '#000000' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0F1419';
  const textSecondary = '#71767B';

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[s.container, { backgroundColor: modalBg, paddingTop: Math.max(top, 10), paddingBottom: Math.max(bottom, 16) }]}>
        {/* Cabecera común */}
        <View style={s.navRow}>
          <Pressable
            onPress={() => {
              if (step === 'schedule') setStep('create');
              else if (step === 'create') setStep('intro');
              else onClose();
            }}
            hitSlop={10}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Text style={s.navCancel}>Cancelar</Text>
          </Pressable>

          <Text style={[s.navTitle, { color: textPrimary }]}>
            {step === 'schedule' ? 'Programa tu Espacio' : 'Crea tu Espacio'}
          </Text>

          <View style={{ width: 60 }} />
        </View>

        {/* 1. INTRO / ONBOARDING (Imagen 3) */}
        {step === 'intro' && (
          <ScrollView contentContainerStyle={s.introContent} showsVerticalScrollIndicator={false}>
            {/* Banner visual tipo ilustración de X */}
            <View style={s.introBanner}>
              <View style={s.birdCircle}>
                <Feather name="mic" size={42} color="#FFFFFF" />
              </View>
              <View style={s.recBadge}>
                <View style={s.recDot} />
                <Text style={s.recText}>REC</Text>
                <Text style={s.recSubText}>Graba tu Espacio</Text>
              </View>
            </View>

            <Text style={[s.introHeading, { color: textPrimary }]}>Graba tu Espacio</Text>
            <Text style={s.introSubheading}>
              Grábalo ahora para que cualquiera pueda escucharlo
            </Text>

            {/* Lista de beneficios (Imagen 3) */}
            <View style={s.benefitsList}>
              <View style={s.benefitRow}>
                <Feather name="star" size={20} color="#7856FF" style={s.benefitIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.benefitTitle, { color: textPrimary }]}>Amplía tu audiencia</Text>
                  <Text style={s.benefitDesc}>
                    Si alguien se perdió tu Espacio en directo, puede escuchar la grabación pública en cualquier momento.
                  </Text>
                </View>
              </View>

              <View style={s.benefitRow}>
                <Feather name="edit-3" size={20} color="#7856FF" style={s.benefitIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.benefitTitle, { color: textPrimary }]}>Comparte tu grabación</Text>
                  <Text style={s.benefitDesc}>
                    Postea tu Espacio grabado para que continúe la conversación.
                  </Text>
                </View>
              </View>

              <View style={s.benefitRow}>
                <Feather name="globe" size={20} color="#7856FF" style={s.benefitIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.benefitTitle, { color: textPrimary }]}>Cualquiera puede escuchar</Text>
                  <Text style={s.benefitDesc}>
                    Cualquiera puede reproducir y compartir la grabación pública.
                  </Text>
                </View>
              </View>
            </View>

            <Text style={s.disclaimerText}>
              4readers conserva copias de los Espacios durante un tiempo limitado para revisarlos en busca de spam y usos indebidos.{' '}
              <Text style={{ color: '#1D9BF0' }}>Más información</Text>
            </Text>

            <Pressable
              onPress={() => setStep('create')}
              style={({ pressed }) => [s.purpleBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={s.purpleBtnText}>Entendido</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* 2. CREA TU ESPACIO CONFIG (Imagen 4) */}
        {step === 'create' && (
          <View style={s.createContainer}>
            <ScrollView contentContainerStyle={s.createScroll} showsVerticalScrollIndicator={false}>
              {/* Input tema principal */}
              <TextInput
                value={topicInput}
                onChangeText={setTopicInput}
                autoFocus
                placeholder="¿De qué quieres hablar?"
                placeholderTextColor={textSecondary}
                style={[s.topicInput, { color: textPrimary }]}
              />

              {/* Botón / Selector de Temas */}
              <Pressable
                onPress={() => setShowTopicsPicker(!showTopicsPicker)}
                style={({ pressed }) => [s.addTopicsBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={s.addTopicsText}>
                  {showTopicsPicker ? '▲ Ocultar Temas' : '+ Añadir Temas'}
                </Text>
              </Pressable>

              {/* Chips de temas seleccionados o disponibles */}
              <View style={s.chipsWrap}>
                {AVAILABLE_TOPICS.map((t) => {
                  const isSelected = selectedTopics.includes(t);
                  if (!showTopicsPicker && !isSelected) return null;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => toggleTopic(t)}
                      style={[
                        s.topicChip,
                        isSelected
                          ? { backgroundColor: '#7856FF', borderColor: '#7856FF' }
                          : { backgroundColor: isDark ? '#16181C' : '#EFF3F4', borderColor: 'transparent' },
                      ]}
                    >
                      <Text
                        style={[
                          s.topicChipText,
                          { color: isSelected ? '#FFFFFF' : textPrimary },
                        ]}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Switch Grabar Espacio (Imagen 4) */}
              <View style={s.recordRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[s.recordLabel, { color: textPrimary }]}>Grabar Espacio</Text>
                  <Feather name="info" size={16} color="#1D9BF0" />
                </View>
                <CustomSwitch
                  value={recordSpace}
                  onValueChange={setRecordSpace}
                  activeColor="#1D9BF0"
                />
              </View>
            </ScrollView>

            {/* Bottom Actions (Imagen 4) */}
            <View style={s.createBottomBar}>
              <View style={s.bottomBtnRow}>
                <Pressable
                  onPress={handleStartNow}
                  style={({ pressed }) => [s.startNowBtn, pressed && { opacity: 0.85 }]}
                >
                  <Text style={s.startNowText}>Iniciar ahora</Text>
                </Pressable>

                <Pressable
                  onPress={() => setStep('schedule')}
                  hitSlop={8}
                  style={({ pressed }) => [
                    s.calendarBtn,
                    { borderColor: isDark ? '#2F3336' : '#CFD9DE' },
                    pressed && { opacity: 0.7 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Programar Espacio"
                >
                  <Feather name="calendar" size={22} color={textPrimary} />
                </Pressable>
              </View>

              <Pressable
                onPress={() => toast.info('Explorando salas de audio en directo')}
                hitSlop={8}
                style={{ alignSelf: 'center', marginTop: space.sm }}
              >
                <Text style={s.discoverLink}>Descubre los Espacios</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* 3. PROGRAMA TU ESPACIO (Imagen 5) */}
        {step === 'schedule' && (
          <View style={s.scheduleContainer}>
            <View style={s.scheduleBody}>
              <Text style={[s.scheduleHeading, { color: textPrimary }]}>
                Programa tu Espacio
              </Text>
              <Text style={s.scheduleSubheading}>
                Elige la fecha y la hora en que deseas transmitir en vivo.
              </Text>

              {/* Rueda / Selectores de fecha simulada con presets de alta fidelidad (Imagen 5) */}
              <View style={[s.pickerBox, { backgroundColor: isDark ? '#16181C' : '#F7F9F9' }]}>
                <View style={s.pickerRowGhost}>
                  <Text style={s.pickerGhostText}>9  octubr  11</Text>
                </View>
                <View style={[s.pickerRowActive, { borderTopColor: '#7856FF', borderBottomColor: '#7856FF' }]}>
                  <Text style={[s.pickerActiveText, { color: textPrimary }]}>
                    {scheduledDay}    {scheduledTime}
                  </Text>
                </View>
                <View style={s.pickerRowGhost}>
                  <Text style={s.pickerGhostText}>11  diciem  01 p. m.</Text>
                </View>
              </View>

              {/* Presets rápidos */}
              <View style={s.quickPresetsRow}>
                {['Hoy 20:00', 'Mañana 12:00', 'En 2 días'].map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => {
                      setScheduledDay(p);
                      setScheduledTime('18:00');
                    }}
                    style={[s.presetChip, { backgroundColor: isDark ? '#202327' : '#EFF3F4' }]}
                  >
                    <Text style={[s.presetText, { color: textPrimary }]}>{p}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleScheduleConfirm}
              style={({ pressed }) => [s.purpleBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={s.purpleBtnText}>Programar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  navCancel: {
    fontSize: 16,
    color: '#71767B',
    fontFamily: fonts.regular,
  },
  navTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  introContent: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  introBanner: {
    width: '100%',
    height: 190,
    borderRadius: 20,
    backgroundColor: '#351F5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  birdCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#7856FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recBadge: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F4212E',
  },
  recText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  recSubText: {
    color: '#E1E8ED',
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  introHeading: {
    fontSize: 26,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: 8,
  },
  introSubheading: {
    fontSize: 16,
    color: '#71767B',
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginBottom: 28,
  },
  benefitsList: {
    width: '100%',
    gap: 20,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  benefitIcon: {
    marginTop: 2,
  },
  benefitTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 3,
  },
  benefitDesc: {
    fontSize: 14,
    color: '#71767B',
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#71767B',
    lineHeight: 18,
    fontFamily: fonts.regular,
    marginBottom: 24,
    textAlign: 'center',
  },
  purpleBtn: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7856FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  createContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  createScroll: {
    paddingTop: 16,
  },
  topicInput: {
    fontSize: 24,
    fontFamily: fonts.bold,
    marginBottom: 16,
    paddingVertical: 4,
  },
  addTopicsBtn: {
    marginBottom: 14,
  },
  addTopicsText: {
    fontSize: 16,
    color: '#1D9BF0',
    fontFamily: fonts.medium,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  topicChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  recordLabel: {
    fontSize: 17,
    fontFamily: fonts.medium,
  },
  createBottomBar: {
    paddingTop: 12,
  },
  bottomBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  startNowBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7856FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startNowText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  calendarBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverLink: {
    fontSize: 15,
    color: '#1D9BF0',
    fontFamily: fonts.medium,
  },
  scheduleContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  scheduleBody: {
    alignItems: 'center',
  },
  scheduleHeading: {
    fontSize: 22,
    fontFamily: fonts.bold,
    marginBottom: 6,
    textAlign: 'center',
  },
  scheduleSubheading: {
    fontSize: 15,
    color: '#71767B',
    textAlign: 'center',
    marginBottom: 24,
  },
  pickerBox: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  pickerRowGhost: {
    opacity: 0.35,
  },
  pickerGhostText: {
    fontSize: 16,
    color: '#71767B',
    fontFamily: fonts.regular,
  },
  pickerRowActive: {
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 20,
    width: '90%',
    alignItems: 'center',
  },
  pickerActiveText: {
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  quickPresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  presetText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
});
