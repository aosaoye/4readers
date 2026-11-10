import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMe } from '@/api/hooks';
import { CustomSwitch, fonts, radius, space, Text, toast, useTheme } from '@/ui';

export interface SpaceConfig {
  title: string;
  topics: string[];
  record: boolean;
  scheduledAt?: string;
  isLive?: boolean;
  shouldPostAnnouncement?: boolean;
  spaceUrl?: string;
}

interface SpacesModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (config: SpaceConfig) => void;
}

type SpaceStep = 'intro' | 'create' | 'schedule' | 'scheduled_success';

const SPACES_INTRO_SEEN_KEY = '@spaces_intro_seen';

const MONTH_NAMES = [
  'enero',
  'febrer',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agost',
  'septie',
  'octubr',
  'novie',
  'diciem',
];

const AVAILABLE_TOPICS = [
  'Deportes',
  'Fútbol',
  'Real Madrid',
  'Barcelona',
  'La Liga',
  'Atletico Madrid',
  'Formula 1',
  'Liga de Campeones de la UEFA',
  'Sevilla FC',
  'NBA',
  'Athletic Club',
  'Real Betis',
  'Ciclismo',
  'Valencia',
  'Team Heretics',
  'Real Sociedad',
  'Baloncesto',
  'Valladolid',
  'Fútbol americano',
  'Atletismo',
  'Premier League',
  'Levante',
  'Celta Vigo',
  'Voleibol',
  'Rugby',
  'Tenis',
  'Pádel',
  'Tecnología',
  'Inteligencia Artificial',
  'Criptomonedas',
];

export function SpacesModal({ visible, onClose, onConfirm }: SpacesModalProps) {
  const { isDark } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const { data: me } = useMe();

  const [step, setStep] = useState<SpaceStep>('create');
  const [hasCheckedIntro, setHasCheckedIntro] = useState(false);

  // Form states
  const [topicInput, setTopicInput] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [recordSpace, setRecordSpace] = useState(true);
  const [showTopicsSheet, setShowTopicsSheet] = useState(false);

  // Sheet de "Editar Espacio" (Imagen 1 del usuario)
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editTitleInput, setEditTitleInput] = useState('');

  // DatePicker states (con año calculado automáticamente del año actual)
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedDay, setSelectedDay] = useState(10);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(10); // Noviembre (0-based)
  const [selectedHour, setSelectedHour] = useState(7);
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedAmPm, setSelectedAmPm] = useState<'a. m.' | 'p. m.'>('a. m.');

  // Sincronizar input de edición al cambiar el título principal
  useEffect(() => {
    setEditTitleInput(topicInput);
  }, [topicInput]);

  // Verificar si ya se mostró la pantalla de intro ("Graba tu Espacio", Imagen 2)
  useEffect(() => {
    if (!visible) return;
    let isMounted = true;
    AsyncStorage.getItem(SPACES_INTRO_SEEN_KEY)
      .then((val) => {
        if (!isMounted) return;
        if (val === 'true') {
          setStep('create');
        } else {
          setStep('intro');
        }
        setHasCheckedIntro(true);
      })
      .catch(() => {
        if (isMounted) {
          setStep('create');
          setHasCheckedIntro(true);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [visible]);

  // Descartar onboarding y guardar para que NO vuelva a aparecer jamás
  const handleDismissIntro = async () => {
    try {
      await AsyncStorage.setItem(SPACES_INTRO_SEEN_KEY, 'true');
    } catch {
      // Ignorar error de almacenamiento
    }
    setStep('create');
  };

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

  // Al pulsar "Programar" en Imagen 4 -> Abre pantalla de confirmación Imagen 5
  const handleScheduleConfirm = () => {
    setStep('scheduled_success');
  };

  const scheduledDateLabel = useMemo(() => {
    const monthName = MONTH_NAMES[selectedMonthIdx] || 'novie';
    return `${selectedDay} ${monthName} ${currentYear} · ${selectedHour}:${selectedMinute} ${selectedAmPm}`;
  }, [selectedDay, selectedMonthIdx, currentYear, selectedHour, selectedMinute, selectedAmPm]);

  const scheduledShortLabel = useMemo(() => {
    return `Hoy a las ${selectedHour}:${selectedMinute}`;
  }, [selectedHour, selectedMinute]);

  const scheduledFullLabel = useMemo(() => {
    return `Hoy a las ${selectedHour}:${selectedMinute} ${selectedAmPm}`;
  }, [selectedHour, selectedMinute, selectedAmPm]);

  // Al pulsar "Postear" en confirmación -> Llena el post como en Imagen 2 y 4
  const handleFinishAndPost = () => {
    const title = topicInput.trim() || 'Tu Espacio';
    const spaceUrl = 'https://x.com/i/spaces/1broAmaIEnPMBL';
    onConfirm({
      title,
      topics: selectedTopics,
      record: recordSpace,
      scheduledAt: scheduledFullLabel,
      isLive: false,
      shouldPostAnnouncement: true,
      spaceUrl,
    });
    toast.success('¡Espacio programado! Añadido a tu publicación');
    onClose();
  };

  // Guardar cambios desde "Editar Espacio" (Imagen 1)
  const handleSaveEditChanges = () => {
    setTopicInput(editTitleInput);
    setShowEditSheet(false);
    toast.success('Cambios del Espacio guardados');
  };

  // Cancelar Espacio programado desde "Editar Espacio" (Imagen 1)
  const handleCancelScheduledSpace = () => {
    setShowEditSheet(false);
    setTopicInput('');
    setSelectedTopics([]);
    setStep('create');
    toast.info('Espacio programado cancelado');
  };

  const handleShareLink = async () => {
    const title = topicInput.trim() || 'Tu Espacio';
    try {
      await Share.share({
        message: `¡Únete a mi Espacio en 4readers: "${title}" programado para el ${scheduledDateLabel}! 🎙️✨ https://x.com/i/spaces/1broAmaIEnPMBL`,
      });
    } catch {
      // Compartir cancelado
    }
  };

  const handleCopyLink = () => {
    toast.success('¡Enlace del Espacio copiado al portapapeles!');
  };

  // Controles de DatePicker interactivo (Imagen 4)
  const stepDay = (delta: number) => {
    setSelectedDay((prev) => {
      let next = prev + delta;
      if (next < 1) next = 31;
      if (next > 31) next = 1;
      return next;
    });
  };

  const stepMonth = (delta: number) => {
    setSelectedMonthIdx((prev) => {
      let next = prev + delta;
      if (next < 0) next = 11;
      if (next > 11) next = 0;
      return next;
    });
  };

  const stepHour = (delta: number) => {
    setSelectedHour((prev) => {
      let next = prev + delta;
      if (next < 1) next = 12;
      if (next > 12) next = 1;
      return next;
    });
  };

  const stepMinute = () => {
    const mins = ['00', '05', '10', '15', '20', '30', '45'];
    setSelectedMinute((prev) => {
      const idx = mins.indexOf(prev);
      return idx === -1 || idx === mins.length - 1 ? mins[0] : mins[idx + 1];
    });
  };

  const toggleAmPm = () => {
    setSelectedAmPm((prev) => (prev === 'a. m.' ? 'p. m.' : 'a. m.'));
  };

  const modalBg = isDark ? '#000000' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0F1419';
  const textSecondary = '#71767B';
  const sheetBg = isDark ? '#000000' : '#FFFFFF';
  const chipBg = isDark ? '#16181C' : '#EFF3F4';
  const chipBorder = isDark ? '#2F3336' : '#CFD9DE';

  const hostName = me?.username || 'John Ripper';

  if (!hasCheckedIntro) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View
        style={[
          s.container,
          {
            backgroundColor: modalBg,
            paddingTop: Math.max(top, 10),
            paddingBottom: Math.max(bottom, 16),
          },
        ]}
      >
        {/* =========================================================================
            1. PANTALLA DE INTRO / ONBOARDING (Imagen 2) - SE MUESTRA UNA SOLA VEZ
           ========================================================================= */}
        {step === 'intro' && (
          <View style={{ flex: 1 }}>
            <View style={s.navRow}>
              <Pressable onPress={onClose} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                <Text style={s.navCancel}>Cancelar</Text>
              </Pressable>
              <Text style={[s.navTitle, { color: textPrimary }]}>Crea tu Espacio</Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={s.introContent} showsVerticalScrollIndicator={false}>
              {/* Banner visual tipo ilustración morada de X */}
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

              {/* Lista de beneficios exactos de la Imagen 2 */}
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
                onPress={handleDismissIntro}
                style={({ pressed }) => [s.purpleBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={s.purpleBtnText}>Entendido</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}

        {/* =========================================================================
            2. CREA TU ESPACIO PRINCIPAL (Fondo traslúcido o activo en Imagen 3 y 4)
           ========================================================================= */}
        {step === 'create' && (
          <View style={s.createContainer}>
            <View style={s.navRow}>
              <Pressable onPress={onClose} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                <Text style={s.navCancel}>Cancelar</Text>
              </Pressable>
              <Text style={[s.navTitle, { color: textPrimary }]}>Crea tu Espacio</Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={s.createScroll} showsVerticalScrollIndicator={false}>
              {/* Input tema principal: "¿De qué quieres hablar?" */}
              <View style={s.inputRow}>
                <TextInput
                  value={topicInput}
                  onChangeText={setTopicInput}
                  autoFocus
                  placeholder="¿De qué quieres hablar?"
                  placeholderTextColor={textSecondary}
                  style={[s.topicInput, { color: textPrimary }]}
                />
                <View style={s.inputCircleIcon}>
                  <Feather name="circle" size={22} color={textSecondary} />
                </View>
              </View>

              {/* Botón azul "Añadir Temas" que despliega el Bottom Sheet de Imagen 3 */}
              <Pressable
                onPress={() => setShowTopicsSheet(true)}
                style={({ pressed }) => [s.addTopicsBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={s.addTopicsText}>Añadir Temas</Text>
              </Pressable>

              {/* Temas actualmente seleccionados */}
              {selectedTopics.length > 0 && (
                <View style={s.selectedChipsWrap}>
                  {selectedTopics.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => toggleTopic(t)}
                      style={[s.topicChipActive, { backgroundColor: '#7C5CFC' }]}
                    >
                      <Text style={s.topicChipActiveText}>{t} ✕</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Fila Switch Grabar Espacio */}
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

            {/* Bottom Actions: Botón "Iniciar ahora" y Botón Calendario para programar */}
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
                  accessibilityLabel="Programar tu Espacio"
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

        {/* =========================================================================
            3. PROGRAMA TU ESPACIO CON DATEPICKER DE RUEDA (Imagen 4)
           ========================================================================= */}
        {step === 'schedule' && (
          <View style={s.scheduleContainer}>
            <View style={s.navRow}>
              <Pressable onPress={() => setStep('create')} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                <Text style={s.navCancel}>Cancelar</Text>
              </Pressable>
              <Text style={[s.navTitle, { color: textPrimary }]}>Crea tu Espacio</Text>
              <View style={{ width: 60 }} />
            </View>

            {/* Fondo simulado de la pantalla detrás como en Imagen 4 */}
            <View style={{ opacity: 0.35, paddingHorizontal: 4 }}>
              <Text style={[s.topicInput, { color: textPrimary }]}>
                {topicInput || '¿De qué quieres hablar?'}
              </Text>
              <Text style={s.addTopicsText}>Añadir Temas</Text>
              <View style={[s.recordRow, { marginTop: 16 }]}>
                <Text style={[s.recordLabel, { color: textPrimary }]}>Grabar Espacio</Text>
                <CustomSwitch value={recordSpace} onValueChange={() => {}} activeColor="#1D9BF0" />
              </View>
            </View>

            <View style={{ flex: 1 }} />

            {/* Bottom Sheet "Programa tu Espacio" (Imagen 4) */}
            <View style={[s.scheduleSheet, { backgroundColor: isDark ? '#000000' : '#FFFFFF', borderTopColor: isDark ? '#2F3336' : '#CFD9DE' }]}>
              <View style={s.sheetHandle} />

              <Text style={[s.scheduleHeading, { color: textPrimary }]}>Programa tu Espacio</Text>

              {/* Rueda / Columnas de Fecha y Hora (Imagen 4) */}
              <View style={s.pickerContainer}>
                {/* Fila fantasma superior (anterior) */}
                <View style={s.pickerRowGhost}>
                  <Pressable onPress={() => stepDay(-1)} style={s.pickerCol}>
                    <Text style={s.pickerGhostText}>{selectedDay - 1 < 1 ? 31 : selectedDay - 1}</Text>
                  </Pressable>
                  <Pressable onPress={() => stepMonth(-1)} style={s.pickerColWide}>
                    <Text style={s.pickerGhostText}>
                      {MONTH_NAMES[selectedMonthIdx - 1 < 0 ? 11 : selectedMonthIdx - 1]}
                    </Text>
                  </Pressable>
                  <View style={s.pickerColYear} />
                  <Pressable onPress={() => stepHour(-1)} style={s.pickerCol}>
                    <Text style={s.pickerGhostText}>{selectedHour - 1 < 1 ? 12 : selectedHour - 1}</Text>
                  </Pressable>
                  <View style={s.pickerColSep} />
                  <View style={s.pickerColMinute} />
                  <View style={s.pickerColAmPm} />
                </View>

                {/* FILA ACTIVA CENTRAL HIGHLIGHTED (Imagen 4) */}
                <View
                  style={[
                    s.pickerRowActive,
                    {
                      borderTopColor: isDark ? '#2F3336' : '#E1E8ED',
                      borderBottomColor: isDark ? '#2F3336' : '#E1E8ED',
                    },
                  ]}
                >
                  {/* Día */}
                  <Pressable onPress={() => stepDay(1)} style={s.pickerCol}>
                    <Text style={[s.pickerActiveText, { color: textPrimary }]}>{selectedDay}</Text>
                  </Pressable>

                  {/* Mes */}
                  <Pressable onPress={() => stepMonth(1)} style={s.pickerColWide}>
                    <Text style={[s.pickerActiveText, { color: textPrimary }]}>
                      {MONTH_NAMES[selectedMonthIdx]}
                    </Text>
                  </Pressable>

                  {/* Año (Se calcula y actualiza AUTOMÁTICAMENTE según el año actual 2026) */}
                  <View style={s.pickerColYear}>
                    <Text style={[s.pickerActiveText, { color: textPrimary }]}>{currentYear}</Text>
                  </View>

                  {/* Hora */}
                  <Pressable onPress={() => stepHour(1)} style={s.pickerCol}>
                    <Text style={[s.pickerActiveText, { color: textPrimary }]}>{selectedHour}</Text>
                  </Pressable>

                  {/* Separador dos puntos */}
                  <Text style={[s.pickerActiveText, { color: textPrimary, marginHorizontal: 2 }]}>:</Text>

                  {/* Minuto */}
                  <Pressable onPress={stepMinute} style={s.pickerColMinute}>
                    <Text style={[s.pickerActiveText, { color: textPrimary }]}>{selectedMinute}</Text>
                  </Pressable>

                  {/* a. m. / p. m. */}
                  <Pressable onPress={toggleAmPm} style={s.pickerColAmPm}>
                    <Text style={[s.pickerActiveText, { color: textPrimary }]}>{selectedAmPm}</Text>
                  </Pressable>
                </View>

                {/* Fila fantasma inferior (siguiente) */}
                <View style={s.pickerRowGhost}>
                  <Pressable onPress={() => stepDay(1)} style={s.pickerCol}>
                    <Text style={s.pickerGhostText}>{selectedDay + 1 > 31 ? 1 : selectedDay + 1}</Text>
                  </Pressable>
                  <Pressable onPress={() => stepMonth(1)} style={s.pickerColWide}>
                    <Text style={s.pickerGhostText}>
                      {MONTH_NAMES[selectedMonthIdx + 1 > 11 ? 0 : selectedMonthIdx + 1]}
                    </Text>
                  </Pressable>
                  <View style={s.pickerColYear} />
                  <Pressable onPress={() => stepHour(1)} style={s.pickerCol}>
                    <Text style={s.pickerGhostText}>{selectedHour + 1 > 12 ? 1 : selectedHour + 1}</Text>
                  </Pressable>
                  <View style={s.pickerColSep} />
                  <Pressable onPress={stepMinute} style={s.pickerColMinute}>
                    <Text style={s.pickerGhostText}>01</Text>
                  </Pressable>
                  <Pressable onPress={toggleAmPm} style={s.pickerColAmPm}>
                    <Text style={s.pickerGhostText}>p. m.</Text>
                  </Pressable>
                </View>
              </View>

              {/* Botón morado "Programar" (Imagen 4) */}
              <Pressable
                onPress={handleScheduleConfirm}
                style={({ pressed }) => [s.purpleBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={s.purpleBtnText}>Programar</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* =========================================================================
            4. PANTALLA DE ÉXITO Y CONFIRMACIÓN PROGRAMADA (Imagen 5 / Fondo de Imagen 1)
           ========================================================================= */}
        {step === 'scheduled_success' && (
          <View style={s.successContainer}>
            {/* Botón superior de cierre X */}
            <View style={s.successHeader}>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
              >
                <Feather name="x" size={24} color={textPrimary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={s.successBody} showsVerticalScrollIndicator={false}>
              {/* Checkmark circular morado / azul */}
              <View style={s.checkCircle}>
                <Feather name="check" size={24} color="#FFFFFF" />
              </View>

              {/* Título principal de Imagen 5 */}
              <Text style={[s.successHeading, { color: textPrimary }]}>
                Tu Espacio está programado.{'\n'}¡Ahora anúncialo!
              </Text>

              {/* Tarjeta violeta de previsualización del Espacio (Imagen 5 y Fondo de Imagen 1) */}
              <View style={s.purpleCard}>
                <View style={s.hostRow}>
                  <View style={s.hostAvatarWrap}>
                    {me?.avatarUrl ? (
                      <Image source={{ uri: me.avatarUrl }} style={s.hostAvatarImg} />
                    ) : (
                      <Feather name="user" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={s.hostNameText} numberOfLines={1}>
                    {hostName}
                  </Text>
                  <View style={s.hostBadge}>
                    <Text style={s.hostBadgeText}>Anfitrión</Text>
                  </View>
                </View>

                <Text style={s.spaceCardTitle} numberOfLines={2}>
                  {topicInput.trim() || 'Tu Espacio'}
                </Text>

                <View style={s.spaceTimeRow}>
                  <Feather name="calendar" size={16} color="#FFFFFF" />
                  <Text style={s.spaceTimeText}>{scheduledShortLabel}</Text>
                </View>
              </View>

              {/* 4 Botones circulares de acciones rápidas (Imagen 5) */}
              <View style={s.quickActionsRow}>
                {/* 1. Postear (Abre la composición de post como en Imagen 2 y 4) */}
                <Pressable
                  onPress={handleFinishAndPost}
                  style={({ pressed }) => [s.actionItem, pressed && { opacity: 0.75 }]}
                >
                  <View style={[s.actionCircle, { backgroundColor: isDark ? '#202327' : '#EFF3F4' }]}>
                    <Feather name="edit-3" size={22} color={textPrimary} />
                  </View>
                  <Text style={[s.actionText, { color: textPrimary }]}>Postear</Text>
                </Pressable>

                {/* 2. Chat */}
                <Pressable
                  onPress={() => toast.info('Listo para compartir por Chat')}
                  style={({ pressed }) => [s.actionItem, pressed && { opacity: 0.75 }]}
                >
                  <View style={[s.actionCircle, { backgroundColor: isDark ? '#202327' : '#EFF3F4' }]}>
                    <Feather name="message-circle" size={22} color={textPrimary} />
                  </View>
                  <Text style={[s.actionText, { color: textPrimary }]}>Chat</Text>
                </Pressable>

                {/* 3. Copiar enlace */}
                <Pressable
                  onPress={handleCopyLink}
                  style={({ pressed }) => [s.actionItem, pressed && { opacity: 0.75 }]}
                >
                  <View style={[s.actionCircle, { backgroundColor: isDark ? '#202327' : '#EFF3F4' }]}>
                    <Feather name="link" size={22} color={textPrimary} />
                  </View>
                  <Text style={[s.actionText, { color: textPrimary }]}>Copiar enlace</Text>
                </Pressable>

                {/* 4. Compartir por... */}
                <Pressable
                  onPress={handleShareLink}
                  style={({ pressed }) => [s.actionItem, pressed && { opacity: 0.75 }]}
                >
                  <View style={[s.actionCircle, { backgroundColor: isDark ? '#202327' : '#EFF3F4' }]}>
                    <Feather name="share-2" size={22} color={textPrimary} />
                  </View>
                  <Text style={[s.actionText, { color: textPrimary }]}>Compartir por...</Text>
                </Pressable>
              </View>
            </ScrollView>

            {/* Botón inferior "Editar" -> Abre "Editar Espacio" (Imagen 1) */}
            <View style={s.successBottomBar}>
              <Pressable
                onPress={() => {
                  setEditTitleInput(topicInput);
                  setShowEditSheet(true);
                }}
                style={({ pressed }) => [
                  s.editOutlineBtn,
                  {
                    backgroundColor: isDark ? '#000000' : '#FFFFFF',
                    borderColor: isDark ? '#333639' : '#CFD9DE',
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[s.editBtnText, { color: textPrimary }]}>Editar</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* =========================================================================
            5. MODAL BOTTOM SHEET "AÑADIR TEMAS" (Imagen 3)
           ========================================================================= */}
        <Modal
          visible={showTopicsSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTopicsSheet(false)}
        >
          <Pressable style={s.topicsOverlay} onPress={() => setShowTopicsSheet(false)}>
            <Pressable
              style={[s.topicsSheet, { backgroundColor: sheetBg }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={s.sheetHandle} />

              <Text style={[s.topicsTitle, { color: textPrimary }]}>Añadir Temas</Text>
              <Text style={s.topicsSubtitle}>
                Ayuda a las personas que siguen Temas a descubrir tu Espacio. Selecciona un máximo de 3.
              </Text>

              <Text style={[s.categoryHeading, { color: textPrimary }]}>Deportes</Text>

              <ScrollView
                style={{ maxHeight: 360 }}
                contentContainerStyle={s.topicsChipsWrap}
                showsVerticalScrollIndicator={false}
              >
                {AVAILABLE_TOPICS.map((t) => {
                  const isSelected = selectedTopics.includes(t);
                  return (
                    <Pressable
                      key={t}
                      onPress={() => toggleTopic(t)}
                      style={[
                        s.topicPill,
                        {
                          backgroundColor: isSelected ? (isDark ? '#FFFFFF' : '#0F1419') : chipBg,
                          borderColor: isSelected ? 'transparent' : chipBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.topicPillText,
                          {
                            color: isSelected ? (isDark ? '#000000' : '#FFFFFF') : textPrimary,
                            fontFamily: isSelected ? fonts.bold : fonts.medium,
                          },
                        ]}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Contador y botón Guardar de Imagen 3 */}
              <View style={s.topicsFooter}>
                <Text style={s.topicsCounter}>
                  {selectedTopics.length} seleccionados (máx. 3)
                </Text>

                <Pressable
                  onPress={() => setShowTopicsSheet(false)}
                  style={({ pressed }) => [
                    s.saveTopicsBtn,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#0F1419',
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text
                    style={[
                      s.saveTopicsText,
                      { color: isDark ? '#000000' : '#FFFFFF' },
                    ]}
                  >
                    Guardar
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* =========================================================================
            6. MODAL BOTTOM SHEET "EDITAR ESPACIO" (Imagen 1 del usuario)
           ========================================================================= */}
        <Modal
          visible={showEditSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowEditSheet(false)}
        >
          <Pressable style={s.topicsOverlay} onPress={() => setShowEditSheet(false)}>
            <Pressable
              style={[s.editSheet, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={s.sheetHandle} />

              <Text style={[s.editTitle, { color: textPrimary }]}>Editar Espacio</Text>

              {/* Sección Nombre */}
              <View style={s.editFieldSection}>
                <Text style={[s.editFieldLabel, { color: textPrimary }]}>Nombre</Text>
                <TextInput
                  value={editTitleInput}
                  onChangeText={setEditTitleInput}
                  placeholder="¿De qué quieres hablar?"
                  placeholderTextColor={textSecondary}
                  style={[s.editFieldInput, { color: textPrimary }]}
                />
              </View>

              {/* Sección Hora */}
              <View style={s.editFieldSection}>
                <Text style={[s.editFieldLabel, { color: textPrimary }]}>Hora</Text>
                <Pressable
                  onPress={() => {
                    setShowEditSheet(false);
                    setStep('schedule');
                  }}
                  style={s.editTimeTouchable}
                >
                  <Text style={[s.editTimeValue, { color: textSecondary }]}>
                    {scheduledShortLabel}
                  </Text>
                </Pressable>
              </View>

              {/* Enlace Añadir Temas */}
              <Pressable
                onPress={() => setShowTopicsSheet(true)}
                style={({ pressed }) => [s.editAddTopicsBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={s.editAddTopicsText}>Añadir Temas</Text>
              </Pressable>

              {/* Fila Switch Grabar Espacio */}
              <View style={s.editRecordRow}>
                <Text style={[s.editRecordLabel, { color: textPrimary }]}>Grabar Espacio</Text>
                <CustomSwitch
                  value={recordSpace}
                  onValueChange={setRecordSpace}
                  activeColor="#1D9BF0"
                />
              </View>

              {/* Nota recordatorio */}
              <Text style={s.editReminderNote}>
                Recibirás un recordatorio para iniciar tu Espacio a la hora programada.
              </Text>

              {/* Botón Guardar cambios */}
              <Pressable
                onPress={handleSaveEditChanges}
                style={({ pressed }) => [s.saveEditBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={s.saveEditText}>Guardar cambios</Text>
              </Pressable>

              {/* Botón Cancelar Espacio programado */}
              <Pressable
                onPress={handleCancelScheduledSpace}
                style={({ pressed }) => [s.cancelScheduledBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={s.cancelScheduledText}>Cancelar Espacio programado</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topicInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: fonts.bold,
    paddingVertical: 4,
  },
  inputCircleIcon: {
    paddingLeft: 8,
  },
  addTopicsBtn: {
    marginBottom: 14,
  },
  addTopicsText: {
    fontSize: 16,
    color: '#1D9BF0',
    fontFamily: fonts.medium,
  },
  selectedChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  topicChipActive: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  topicChipActiveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: fonts.bold,
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
  },
  scheduleSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#71767B',
    alignSelf: 'center',
    marginBottom: 18,
  },
  scheduleHeading: {
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  pickerRowGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.28,
    height: 38,
  },
  pickerGhostText: {
    fontSize: 15,
    color: '#71767B',
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  pickerRowActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  pickerActiveText: {
    fontSize: 17,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  pickerCol: {
    minWidth: 32,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  pickerColWide: {
    minWidth: 70,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  pickerColYear: {
    minWidth: 54,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  pickerColMinute: {
    minWidth: 32,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  pickerColAmPm: {
    minWidth: 50,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  pickerColSep: {
    width: 2,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  successHeader: {
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  successBody: {
    paddingTop: 10,
    alignItems: 'center',
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C5CFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successHeading: {
    fontSize: 22,
    fontFamily: fonts.bold,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 24,
  },
  purpleCard: {
    width: '100%',
    backgroundColor: '#7C5CFC',
    borderRadius: 18,
    padding: 18,
    marginBottom: 32,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostAvatarWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  hostAvatarImg: {
    width: '100%',
    height: '100%',
  },
  hostNameText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: fonts.bold,
    marginRight: 8,
    maxWidth: 160,
  },
  hostBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  hostBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  spaceCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: fonts.bold,
    marginBottom: 16,
  },
  spaceTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spaceTimeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8,
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  successBottomBar: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  editOutlineBtn: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  topicsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  topicsSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  topicsTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    marginBottom: 6,
  },
  topicsSubtitle: {
    fontSize: 14,
    color: '#71767B',
    lineHeight: 19,
    fontFamily: fonts.regular,
    marginBottom: 16,
  },
  categoryHeading: {
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 12,
  },
  topicsChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 16,
  },
  topicPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  topicPillText: {
    fontSize: 14,
  },
  topicsFooter: {
    paddingTop: 12,
    gap: 12,
  },
  topicsCounter: {
    fontSize: 14,
    color: '#71767B',
    fontFamily: fonts.regular,
  },
  saveTopicsBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveTopicsText: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  editSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
  },
  editTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: 20,
  },
  editFieldSection: {
    marginBottom: 18,
  },
  editFieldLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 6,
  },
  editFieldInput: {
    fontSize: 16,
    fontFamily: fonts.regular,
    paddingVertical: 2,
  },
  editTimeTouchable: {
    paddingVertical: 2,
  },
  editTimeValue: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  editAddTopicsBtn: {
    marginBottom: 18,
  },
  editAddTopicsText: {
    fontSize: 16,
    color: '#1D9BF0',
    fontFamily: fonts.medium,
  },
  editRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 12,
  },
  editRecordLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  editReminderNote: {
    fontSize: 14,
    color: '#71767B',
    lineHeight: 20,
    fontFamily: fonts.regular,
    marginBottom: 22,
  },
  saveEditBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C5CFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveEditText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  cancelScheduledBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelScheduledText: {
    color: '#F4212E',
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});
