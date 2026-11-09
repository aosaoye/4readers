import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  Divider,
  fonts,
  gutter,
  IconButton,
  Screen,
  space,
  Text,
  toast,
  useTheme,
} from '@/ui';

type FollowTab = 'topics' | 'contacts' | 'suggested';

const TABS: { key: FollowTab; label: string }[] = [
  { key: 'topics', label: 'Temas' },
  { key: 'contacts', label: 'Tal vez los conozcas' },
  { key: 'suggested', label: 'Sugeridos' },
];

const CATEGORY_CHIPS = [
  'Noticias',
  'Deportes',
  'Negocios y Finanzas',
  'Ciencia y Tecnología',
  'Entretenimiento',
  'Inteligencia Artificial',
  'Criptomonedas',
  'Salud',
];

interface TopicGroupProfile {
  id: string;
  name: string;
  handle: string;
  badge?: 'blue' | 'gold' | 'gray';
  avatarBg: string;
  avatarText: string;
  avatarUrl: string;
}

interface TopicGroup {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  category: string;
  profiles: TopicGroupProfile[];
}

const TOPIC_GROUPS: TopicGroup[] = [
  {
    id: 'tech-ai',
    title: 'Noticias Tech e IA',
    subtitle: 'Avances tecnológicos, IA y noticias del sector.',
    count: 24,
    category: 'Noticias',
    profiles: [
      {
        id: 'sama',
        name: 'Sam Altm...',
        handle: '@sama',
        badge: 'blue',
        avatarBg: '#1E293B',
        avatarText: 'SA',
        avatarUrl: 'https://unavatar.io/twitter/sama',
      },
      {
        id: 'nasa',
        name: 'NASA',
        handle: '@NASA',
        badge: 'gray',
        avatarBg: '#0B3D91',
        avatarText: 'NA',
        avatarUrl: 'https://unavatar.io/twitter/NASA',
      },
      {
        id: 'karpathy',
        name: 'Andrej Ka...',
        handle: '@karpathy',
        badge: 'blue',
        avatarBg: '#065F46',
        avatarText: 'AK',
        avatarUrl: 'https://unavatar.io/twitter/karpathy',
      },
      {
        id: 'lexfridman',
        name: 'Lex Fridm...',
        handle: '@lexfridman',
        badge: 'blue',
        avatarBg: '#1F2937',
        avatarText: 'LF',
        avatarUrl: 'https://unavatar.io/twitter/lexfridman',
      },
    ],
  },
  {
    id: 'un-diplomats',
    title: 'Diplomáticos de la ONU y Asuntos Internacionales',
    subtitle: 'Funcionarios de alto nivel que comparten informes sobre derechos humanos y crisis globales.',
    count: 19,
    category: 'Noticias',
    profiles: [
      {
        id: 'guterres',
        name: 'António ...',
        handle: '@antoniogute...',
        badge: 'blue',
        avatarBg: '#374151',
        avatarText: 'AG',
        avatarUrl: 'https://unavatar.io/twitter/antonioguterres',
      },
      {
        id: 'unicef',
        name: 'UNICEF',
        handle: '@UNICEF',
        badge: 'blue',
        avatarBg: '#0284C7',
        avatarText: 'UN',
        avatarUrl: 'https://unavatar.io/twitter/UNICEF',
      },
      {
        id: 'unhumanrights',
        name: 'UN Huma...',
        handle: '@UNHumanRi...',
        badge: 'blue',
        avatarBg: '#1D4ED8',
        avatarText: 'HR',
        avatarUrl: 'https://unavatar.io/twitter/UNHumanRights',
      },
      {
        id: 'lagarde',
        name: 'Christine ...',
        handle: '@Lagarde',
        badge: 'blue',
        avatarBg: '#475569',
        avatarText: 'CL',
        avatarUrl: 'https://unavatar.io/twitter/Lagarde',
      },
    ],
  },
  {
    id: 'breaking-news',
    title: 'Noticias de Última Hora',
    subtitle: 'Actualizaciones en tiempo real de las noticias más importantes.',
    count: 25,
    category: 'Noticias',
    profiles: [
      {
        id: 'lavanguardia',
        name: 'La Vangu...',
        handle: '@LaVanguardia',
        badge: 'gold',
        avatarBg: '#1E3A8A',
        avatarText: 'V',
        avatarUrl: 'https://unavatar.io/twitter/LaVanguardia',
      },
      {
        id: 'elpais',
        name: 'EL PAÍS',
        handle: '@el_pais',
        badge: 'gold',
        avatarBg: '#18181B',
        avatarText: 'EP',
        avatarUrl: 'https://unavatar.io/twitter/el_pais',
      },
      {
        id: 'elmundo',
        name: 'EL MUNDO',
        handle: '@elmundoes',
        badge: 'gold',
        avatarBg: '#0284C7',
        avatarText: 'EM',
        avatarUrl: 'https://unavatar.io/twitter/elmundoes',
      },
      {
        id: 'nachoabad',
        name: 'Nacho Ab...',
        handle: '@Nacho_Abad',
        badge: 'gold',
        avatarBg: '#D97706',
        avatarText: 'NA',
        avatarUrl: 'https://unavatar.io/twitter/Nacho_Abad',
      },
    ],
  },
];

interface SuggestedUser {
  id: string;
  name: string;
  handle: string;
  bio: string;
  badge?: 'blue' | 'gold';
  avatarUrl?: string;
}

const SUGGESTED_USERS: SuggestedUser[] = [
  {
    id: 'hexsec',
    name: 'Hexsec Team',
    handle: '@Hexsecteam',
    bio: '🛡️ Learn Ethical Hacking ⚔️ Red Teaming & Pentesting ...',
    badge: 'blue',
    avatarUrl: 'https://unavatar.io/twitter/Hexsecteam',
  },
  {
    id: 'portswigger',
    name: 'PortSwigger Research',
    handle: '@PortSwiggerRes',
    bio: 'Web security research from the team at @PortSwigger',
    badge: 'blue',
    avatarUrl: 'https://unavatar.io/twitter/PortSwiggerRes',
  },
  {
    id: 'netsec',
    name: '/r/netsec',
    handle: '@_r_netsec',
    bio: 'Follow for new posts submitted to the netsec subreddit. Unofficial.',
    badge: 'blue',
    avatarUrl: 'https://unavatar.io/twitter/_r_netsec',
  },
  {
    id: 'hybe',
    name: 'HYBE OFFICIAL',
    handle: '@HYBEOFFICIALtwt',
    bio: '안녕하세요 하이브(HYBE)입니다.',
    badge: 'blue',
    avatarUrl: 'https://unavatar.io/twitter/HYBEOFFICIALtwt',
  },
  {
    id: 'synack',
    name: 'Synack Red Team',
    handle: '@SynackRedTeam',
    bio: 'Official handle for the Synack Red Team, the world\'s most skilled ethical hackers.',
    badge: 'blue',
    avatarUrl: 'https://unavatar.io/twitter/SynackRedTeam',
  },
];

interface ContactRecommendation {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
}

const CONTACT_RECOMMENDATIONS: ContactRecommendation[] = [
  {
    id: 'jase',
    name: 'jase',
    handle: '@jase__og',
    bio: 'cuando no rapeo escribo tonterias aquí',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  {
    id: 'gonzalo',
    name: 'Gonzalo Pérez García',
    handle: '@Gonzalo_7_',
    bio: 'ⓘ User is suspected to be a part of an online terrorist organization. Plea...',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  },
  {
    id: 'lavilla',
    name: 'Lavilla1515',
    handle: '@lavilla1515',
    bio: 'No hay na interesante loco 😜 ig: lavilla1515',
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
  },
  {
    id: 'sandra',
    name: 'Sandra',
    handle: '@sanndralora',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'slappy',
    name: 'slappy',
    handle: '@slappy_av',
    bio: 'INDUSTRY PLANT 🧿❤️ OUT NOW !!!! . Booking:ruben@adioscora...',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'jrm',
    name: 'JRM 🇪🇸',
    handle: '@jrm_es',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
];

function ReliableAvatar({
  url,
  fallbackBg,
  fallbackText,
  size = 62,
}: {
  url?: string;
  fallbackBg: string;
  fallbackText: string;
  size?: number;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: fallbackBg,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {url && !hasError ? (
        <Image
          source={{ uri: url }}
          style={{ width: size, height: size }}
          onError={() => setHasError(true)}
        />
      ) : (
        <Text style={{ color: '#FFFFFF', fontSize: size * 0.32, fontFamily: fonts.bold }}>
          {fallbackText}
        </Text>
      )}
    </View>
  );
}

export default function FollowScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const [activeTab, setActiveTab] = useState<FollowTab>('topics');
  const [selectedCategory, setSelectedCategory] = useState('Noticias');

  // Estado del flujo de contactos
  const [contactsGranted, setContactsGranted] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('+34 ');

  // Modales y vistas
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showSyncSheet, setShowSyncSheet] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Estados interactivos
  const [followedGroups, setFollowedGroups] = useState<Record<string, boolean>>({});
  const [followingUsers, setFollowingUsers] = useState<Record<string, boolean>>({});
  const [checkedContactIds, setCheckedContactIds] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string, count: number) => {
    setFollowedGroups((prev) => {
      const next = !prev[groupId];
      if (next) toast.success(`Siguiendo ${count} cuentas`);
      else toast.info('Tema no seguido');
      return { ...prev, [groupId]: next };
    });
  };

  const toggleUser = (userId: string, handle: string) => {
    setFollowingUsers((prev) => {
      const next = !prev[userId];
      if (next) toast.success(`Siguiendo a ${handle}`);
      else toast.info(`Dejaste de seguir a ${handle}`);
      return { ...prev, [userId]: next };
    });
  };

  const toggleContactCheck = (id: string) => {
    setCheckedContactIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Al pulsar "Permitir el acceso a los contact..."
  const handleAllowContacts = () => {
    setContactsGranted(true);
    // Si no tiene teléfono en la base de datos, mostramos la pantalla de Imagen 4
    if (!userPhone) {
      toast.info('Acceso concedido. Se requiere un teléfono para encontrar contactos.');
    } else {
      setShowRecommendations(true);
    }
  };

  // Al guardar el número de teléfono
  const handleSavePhone = () => {
    if (phoneInput.trim().length < 7) {
      toast.error('Introduce un número de teléfono válido');
      return;
    }
    setUserPhone(phoneInput.trim());
    setShowPhoneModal(false);
    setContactsGranted(true);
    toast.success('Teléfono añadido. Contactos sincronizados.');
    // Lleva a la pestaña de "Tal vez los conozcas" mostrando los contactos
    setActiveTab('contacts');
    setShowRecommendations(true);
  };

  // Al sincronizar desde el Bottom Sheet de Sugeridos
  const handleConfirmSync = () => {
    setShowSyncSheet(false);
    setContactsGranted(true);
    toast.success('Contactos sincronizados.');
    // Al darle sincronizar lleva a la página de sugeridos o tal vez los conozcas
    setActiveTab('contacts');
    setShowRecommendations(true);
  };

  const selectedCount = Object.values(checkedContactIds).filter(Boolean).length;

  const handleFinishRecommendations = () => {
    if (selectedCount > 0) {
      toast.success(`Siguiendo a ${selectedCount} personas`);
    }
    setShowRecommendations(false);
    setActiveTab('contacts');
  };

  // =========================================================================
  // VISTA: RECOMENDACIONES (IMAGEN 2 DEL MENSAJE / IMAGEN 5 ANTERIOR)
  // Con el título "Recomendaciones" alineado en la fila del botón de volver
  // =========================================================================
  if (showRecommendations) {
    return (
      <Screen edges={['bottom']}>
        {/* Cabecera: Flecha atrás y título "Recomendaciones" alineados en la misma fila */}
        <View
          style={[
            s.recommendationsHeaderRow,
            { paddingTop: Math.max(top, space.sm), backgroundColor: colors.bg },
          ]}
        >
          <IconButton
            name="arrow-left"
            label="Volver"
            onPress={() => {
              setShowRecommendations(false);
              setActiveTab('contacts');
            }}
          />
          <Text variant="heading" style={s.recommendationsHeaderTitle}>
            Recomendaciones
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            s.recommendationsContent,
            { paddingBottom: Math.max(bottom, space.lg) + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="body" style={s.recommendationsSubtitle}>
            Cuando sigues a alguien, verás sus Tweets en tu cronología de inicio.
          </Text>

          <Text variant="heading" style={s.recommendationsSectionHeader}>
            Personas que tal vez conozcas
          </Text>

          {/* Lista con checkboxes cuadrados a la derecha (Imagen 5 / Imagen 2) */}
          <View style={s.recommendationsList}>
            {CONTACT_RECOMMENDATIONS.map((person) => {
              const isChecked = Boolean(checkedContactIds[person.id]);
              return (
                <Pressable
                  key={person.id}
                  onPress={() => toggleContactCheck(person.id)}
                  style={s.recommendationRow}
                >
                  <Avatar name={person.name} avatarUrl={person.avatarUrl} size={44} />

                  <View style={s.recommendationMiddle}>
                    <Text variant="heading" style={s.recommendationName}>
                      {person.name}
                    </Text>
                    <Text variant="caption" style={s.recommendationHandle}>
                      {person.handle}
                    </Text>
                    {person.bio && (
                      <Text variant="body" style={s.recommendationBio} numberOfLines={2}>
                        {person.bio}
                      </Text>
                    )}
                  </View>

                  {/* Casilla cuadrada de selección (Imagen 5 / Imagen 2) */}
                  <View style={[s.squareCheckbox, isChecked && s.squareCheckboxChecked]}>
                    {isChecked && <Feather name="check" size={14} color="#FFFFFF" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Barra fija inferior: Descartar por ahora y Siguiente */}
        <View
          style={[
            s.recommendationsBottomBar,
            {
              paddingBottom: Math.max(bottom, space.md),
              backgroundColor: colors.bg,
              borderTopColor: isDark ? '#1C1F24' : colors.line,
            },
          ]}
        >
          {/* Pill button: Descartar por ahora (sin margin) */}
          <Pressable
            onPress={() => {
              setShowRecommendations(false);
              setActiveTab('contacts');
            }}
            style={s.dismissPillBtn}
            accessibilityRole="button"
          >
            <Text variant="label" style={s.dismissPillText}>
              Descartar por ahora
            </Text>
          </Pressable>

          {/* Pill button: Siguiente (sin margin) */}
          <Pressable
            onPress={handleFinishRecommendations}
            style={[s.nextPillBtn, selectedCount === 0 && s.nextPillBtnDisabled]}
            accessibilityRole="button"
          >
            <Text
              variant="label"
              style={[s.nextPillText, selectedCount === 0 && s.nextPillTextDisabled]}
            >
              Siguiente
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  // =========================================================================
  // VISTA PRINCIPAL: SEGUIR CON LAS 3 PESTAÑAS
  // =========================================================================
  return (
    <Screen edges={['bottom']}>
      {/* Cabecera superior: Flecha atrás + Título "Seguir" */}
      <View
        style={[
          s.headerBar,
          {
            paddingTop: Math.max(top, space.sm),
            backgroundColor: colors.bg,
            borderBottomColor: isDark ? '#1C1F24' : colors.line,
          },
        ]}
      >
        <View style={s.headerTopRow}>
          <IconButton
            name="arrow-left"
            label="Volver"
            onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}
          />
          <Text variant="heading" style={s.headerTitle}>
            Seguir
          </Text>
        </View>

        {/* Pestañas: Temas | Tal vez los conozcas | Sugeridos
            Ajustadas con anchura según contenido para que "Tal vez los conozcas" NUNCA se corte ni se parta */}
        <View style={s.tabsRow}>
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setActiveTab(t.key)}
                style={s.tabItem}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  variant="label"
                  numberOfLines={1}
                  style={[
                    s.tabText,
                    { color: isActive ? colors.ink : colors.muted },
                    isActive && s.tabTextActive,
                  ]}
                >
                  {t.label}
                </Text>
                {isActive && (
                  <View style={[s.tabIndicator, { backgroundColor: colors.ink }]} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: TEMAS (IDÉNTICO A LA IMAGEN 1 DE REFERENCIA) */}
      {/* Fila de chips horizontal al 100% como en Home (sin margen exterior que la corte) */}
      {/* ========================================================================= */}
      {activeTab === 'topics' && (
        <View style={{ flex: 1 }}>
          {/* Fila horizontal de chips: spans 100% width, exactamente como en Home */}
          <View style={s.chipsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.chipsScrollContent}
            >
              {CATEGORY_CHIPS.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      s.chip,
                      isSelected ? s.chipSelected : s.chipUnselected,
                      !isSelected && {
                        backgroundColor: isDark ? '#000000' : '#F4F4F5',
                        borderColor: isDark ? '#2F3336' : '#E5E7EB',
                      },
                    ]}
                  >
                    <Text
                      variant="label"
                      style={[
                        s.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.ink },
                        isSelected && { fontFamily: fonts.bold },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Bloques temáticos verticales */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={s.groupsScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.groupsContainer}>
              {TOPIC_GROUPS.map((group) => {
                const isFollowed = Boolean(followedGroups[group.id]);
                return (
                  <View key={group.id} style={s.groupCard}>
                    {/* Fila superior: Título del tema y Pill button Seguir X (SIN MARGIN) */}
                    <View style={s.groupHeaderRow}>
                      <View style={{ flex: 1, paddingRight: space.xs }}>
                        <Text variant="heading" style={s.groupTitle}>
                          {group.title}
                        </Text>
                        <Text variant="caption" style={s.groupSubtitle}>
                          {group.subtitle}
                        </Text>
                      </View>

                      {/* Pill button Seguir X: sin margin, estilo Home */}
                      <Pressable
                        onPress={() => toggleGroup(group.id, group.count)}
                        style={[
                          s.pillFollowBtn,
                          isFollowed && s.pillFollowBtnActive,
                        ]}
                        accessibilityRole="button"
                      >
                        <Text
                          variant="label"
                          style={[
                            s.pillFollowText,
                            isFollowed && s.pillFollowTextActive,
                          ]}
                        >
                          {isFollowed ? `Siguiendo ${group.count}` : `Seguir ${group.count}`}
                        </Text>
                      </Pressable>
                    </View>

                    {/* Fila de 4 perfiles encajados exactamente a lo ancho (Imagen 1) */}
                    <View style={s.fourProfilesRow}>
                      {group.profiles.map((profile) => (
                        <View key={profile.id} style={s.singleProfileCol}>
                          <ReliableAvatar
                            url={profile.avatarUrl}
                            fallbackBg={profile.avatarBg}
                            fallbackText={profile.avatarText}
                            size={62}
                          />

                          <View style={s.profileNameRow}>
                            <Text
                              variant="label"
                              numberOfLines={1}
                              style={s.profileName}
                            >
                              {profile.name}
                            </Text>
                            {profile.badge && (
                              <Feather
                                name="check-circle"
                                size={12}
                                color={
                                  profile.badge === 'gold'
                                    ? '#F59E0B'
                                    : profile.badge === 'gray'
                                      ? '#9CA3AF'
                                      : '#1D9BF0'
                                }
                              />
                            )}
                          </View>

                          <Text
                            variant="caption"
                            numberOfLines={1}
                            style={s.profileHandle}
                          >
                            {profile.handle}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: TAL VEZ LOS CONOZCAS (IMAGEN 3 -> IMAGEN 4) */}
      {/* ========================================================================= */}
      {activeTab === 'contacts' && (
        <>
          {!contactsGranted ? (
            /* Estado inicial (Imagen 3): Permitir acceso */
            <View style={s.centeredContent}>
              <Text variant="title" style={s.centeredTitle}>
                Encuentra a personas que conoces
              </Text>
              <Text variant="body" style={s.centeredSubtitle}>
                Conecta tu libreta de direcciones para encontrar personas que tal vez conozcas en X.
              </Text>

              {/* Pill button: sin margin */}
              <Pressable
                onPress={handleAllowContacts}
                style={s.centeredPillBtn}
                accessibilityRole="button"
              >
                <Text variant="label" style={s.centeredPillText}>
                  Permitir el acceso a los contact...
                </Text>
              </Pressable>
            </View>
          ) : (
            /* Estado con acceso pero sin teléfono registrado (IDÉNTICO A IMAGEN 4) */
            <View style={s.screenWrapperImage4}>
              <View style={s.centeredContentImage4}>
                {/* Icono de teléfono en círculo oscuro (Imagen 4) */}
                <View style={s.phoneIconCircle}>
                  <Feather name="phone" size={26} color="#8B98A5" />
                </View>

                <Text variant="title" style={s.centeredTitle}>
                  Encuentra a tus amigos
                </Text>
                <Text variant="body" style={s.centeredSubtitle}>
                  Añade un número de teléfono para ver a quién conoces en X
                </Text>
              </View>

              {/* Botón inferior fijo: Añadir número de teléfono (sin margin) */}
              <View
                style={[
                  s.bottomBtnContainer,
                  { paddingBottom: Math.max(bottom, space.lg) },
                ]}
              >
                <Pressable
                  onPress={() => setShowPhoneModal(true)}
                  style={s.fullWidthPillBtn}
                  accessibilityRole="button"
                >
                  <Text variant="label" style={s.fullWidthPillText}>
                    Añadir número de teléfono
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: SUGERIDOS (TRANSPARENTE SIN CARD, ABRE SHEET) */}
      {/* ========================================================================= */}
      {activeTab === 'suggested' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.suggestedContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Bloque superior TRANSPARENTE: NO ES UNA CARD, NO TIENE FONDO */}
          <View style={s.transparentBanner}>
            <Text variant="heading" style={s.bannerTitle}>
              Encontrar amigos
            </Text>
            <Text variant="body" style={s.bannerSubtitle}>
              Descubre a quiénes ya conoces en X. No te preocupes, podrás elegir a quién seguir.
            </Text>

            {/* Pill button Comenzar: sin margin */}
            <Pressable
              onPress={() => setShowSyncSheet(true)}
              style={s.smallPillBtn}
              accessibilityRole="button"
            >
              <Text variant="label" style={s.smallPillText}>
                Comenzar
              </Text>
            </Pressable>
          </View>

          <Text variant="heading" style={s.suggestedTitle}>
            Sugeridos para ti
          </Text>

          {/* Lista de perfiles sugeridos */}
          <View style={s.suggestedList}>
            {SUGGESTED_USERS.map((user, idx) => {
              const isFollowing = Boolean(followingUsers[user.id]);
              return (
                <View key={user.id}>
                  <View style={s.suggestedRow}>
                    <Avatar name={user.name} avatarUrl={user.avatarUrl} size={44} />

                    <View style={s.suggestedMiddle}>
                      <View style={s.suggestedNameRow}>
                        <Text variant="heading" style={s.suggestedName}>
                          {user.name}
                        </Text>
                        {user.badge && (
                          <Feather name="check-circle" size={13} color="#1D9BF0" />
                        )}
                      </View>
                      <Text variant="caption" style={s.suggestedHandle}>
                        {user.handle}
                      </Text>
                      <Text variant="body" style={s.suggestedBio}>
                        {user.bio}
                      </Text>
                    </View>

                    {/* Pill button Seguir: sin margin */}
                    <Pressable
                      onPress={() => toggleUser(user.id, user.handle)}
                      style={[
                        s.rowFollowBtn,
                        isFollowing && s.rowFollowBtnActive,
                      ]}
                      accessibilityRole="button"
                    >
                      <Text
                        variant="label"
                        style={[
                          s.rowFollowText,
                          isFollowing && s.rowFollowTextActive,
                        ]}
                      >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                      </Text>
                    </Pressable>
                  </View>
                  {idx < SUGGESTED_USERS.length - 1 && <Divider />}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* MODAL / SHEET: AÑADIR NÚMERO DE TELÉFONO */}
      {/* ========================================================================= */}
      <Modal
        visible={showPhoneModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPhoneModal(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable
            style={s.modalBackdrop}
            onPress={() => setShowPhoneModal(false)}
          />
          <View
            style={[
              s.sheetContainer,
              {
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                paddingBottom: Math.max(bottom, space.lg) + space.md,
              },
            ]}
          >
            <View style={s.sheetHandle} />

            <Text variant="heading" style={s.sheetTitle}>
              Añadir número de teléfono
            </Text>
            <Text variant="body" style={s.sheetSubtitle}>
              Introduce tu número para buscar contactos registrados en la base de datos y conectar con ellos.
            </Text>

            <View
              style={[
                s.phoneInputWrap,
                {
                  backgroundColor: isDark ? '#16181C' : '#F4F4F5',
                  borderColor: isDark ? '#2F3336' : '#E5E7EB',
                },
              ]}
            >
              <Feather name="phone" size={18} color="#71767B" />
              <TextInput
                style={[s.phoneInput, { color: colors.ink }]}
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
                placeholder="+34 600 000 000"
                placeholderTextColor="#71767B"
                autoFocus
              />
            </View>

            {/* Pill button: sin margin */}
            <Pressable
              onPress={handleSavePhone}
              style={s.fullWidthPillBtn}
              accessibilityRole="button"
            >
              <Text variant="label" style={s.fullWidthPillText}>
                Guardar y sincronizar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL / SHEET: SINCRONIZAR CONTACTOS */}
      {/* ========================================================================= */}
      <Modal
        visible={showSyncSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSyncSheet(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable
            style={s.modalBackdrop}
            onPress={() => setShowSyncSheet(false)}
          />
          <View
            style={[
              s.sheetContainer,
              {
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                paddingBottom: Math.max(bottom, space.lg) + space.md,
              },
            ]}
          >
            <View style={s.sheetHandle} />

            <Text variant="heading" style={s.sheetTitle}>
              Sincronizar contactos
            </Text>
            <Text variant="body" style={s.sheetSubtitle}>
              Sube tu libreta de direcciones para encontrar amigos en X y descubrir a quiénes puedes seguir.
            </Text>

            {/* Pill button: sin margin */}
            <Pressable
              onPress={handleConfirmSync}
              style={s.fullWidthPillBtn}
              accessibilityRole="button"
            >
              <Text variant="label" style={s.fullWidthPillText}>
                Sincronizar contactos
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const s = StyleSheet.create({
  headerBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTopRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xs,
    gap: space.md,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  tabsRow: {
    flexDirection: 'row',
    height: 44,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
  },
  tabItem: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 14.5,
    fontFamily: fonts.medium,
  },
  tabTextActive: {
    fontFamily: fonts.bold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    right: 2,
    height: 3,
    borderRadius: 1.5,
  },
  chipsWrapper: {
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
  chipsScrollContent: {
    paddingHorizontal: space.lg,
    alignItems: 'center',
    gap: space.sm,
  },
  chip: {
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
  },
  chipSelected: {
    backgroundColor: '#1D9BF0',
  },
  chipUnselected: {
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  groupsScrollContent: {
    paddingHorizontal: space.lg,
    paddingTop: space.xs,
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  groupsContainer: {
    gap: space.xl,
  },
  groupCard: {
    gap: space.md,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  groupTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  groupSubtitle: {
    color: '#71767B',
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
  },
  pillFollowBtn: {
    backgroundColor: '#FFFFFF',
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
  },
  pillFollowBtnActive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#536471',
  },
  pillFollowText: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  pillFollowTextActive: {
    color: '#FFFFFF',
  },
  fourProfilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.xs,
    paddingTop: space.xs,
  },
  singleProfileCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    maxWidth: 76,
  },
  profileName: {
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  profileHandle: {
    color: '#71767B',
    fontSize: 11,
    maxWidth: 76,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: gutter,
    paddingBottom: 60,
  },
  screenWrapperImage4: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
  },
  centeredContentImage4: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E2328',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  centeredTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  centeredSubtitle: {
    color: '#71767B',
    textAlign: 'center',
    marginTop: space.sm,
    maxWidth: 290,
    lineHeight: 22,
    fontSize: 15,
  },
  centeredPillBtn: {
    backgroundColor: '#FFFFFF',
    height: 46,
    paddingHorizontal: 28,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.xl,
    margin: 0,
  },
  centeredPillText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  bottomBtnContainer: {
    paddingTop: space.md,
  },
  fullWidthPillBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 26,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
  },
  fullWidthPillText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  transparentBanner: {
    paddingVertical: space.sm,
    gap: space.xs,
  },
  bannerTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  bannerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#71767B',
    marginBottom: space.xs,
  },
  smallPillBtn: {
    backgroundColor: '#FFFFFF',
    height: 38,
    paddingHorizontal: 26,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    margin: 0,
  },
  smallPillText: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  suggestedContent: {
    paddingHorizontal: gutter,
    paddingTop: space.sm,
    paddingBottom: space.xxxl,
    gap: space.md,
  },
  suggestedTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    marginTop: space.xs,
  },
  suggestedList: {
    gap: space.xs,
  },
  suggestedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: space.sm,
    gap: space.md,
  },
  suggestedMiddle: {
    flex: 1,
    gap: 2,
  },
  suggestedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestedName: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  suggestedHandle: {
    color: '#71767B',
    fontSize: 13,
  },
  suggestedBio: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: 2,
  },
  rowFollowBtn: {
    backgroundColor: '#FFFFFF',
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
  },
  rowFollowBtnActive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#536471',
  },
  rowFollowText: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  rowFollowTextActive: {
    color: '#FFFFFF',
  },
  recommendationsHeaderRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xs,
    gap: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1C1F24',
  },
  recommendationsHeaderTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  recommendationsContent: {
    paddingHorizontal: gutter,
    paddingTop: space.md,
  },
  recommendationsSubtitle: {
    color: '#71767B',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: space.md,
  },
  recommendationsSectionHeader: {
    fontSize: 18,
    fontFamily: fonts.bold,
    marginBottom: space.sm,
  },
  recommendationsList: {
    gap: space.lg,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  recommendationMiddle: {
    flex: 1,
    gap: 2,
  },
  recommendationName: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  recommendationHandle: {
    color: '#71767B',
    fontSize: 13,
  },
  recommendationBio: {
    fontSize: 13,
    color: '#71767B',
    marginTop: 2,
    lineHeight: 18,
  },
  squareCheckbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#71767B',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareCheckboxChecked: {
    backgroundColor: '#1D9BF0',
    borderColor: '#1D9BF0',
  },
  recommendationsBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dismissPillBtn: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#536471',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
  },
  dismissPillText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  nextPillBtn: {
    height: 42,
    paddingHorizontal: 24,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
  },
  nextPillBtnDisabled: {
    backgroundColor: '#272C30',
  },
  nextPillText: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  nextPillTextDisabled: {
    color: '#71767B',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  modalBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: gutter,
    paddingTop: space.md,
    gap: space.md,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#536471',
    alignSelf: 'center',
    marginBottom: space.xs,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#71767B',
    lineHeight: 20,
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 10,
    marginVertical: space.xs,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.medium,
    padding: 0,
  },
});
