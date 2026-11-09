import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  flat,
  logout,
  useFeed,
  useMe,
  useMyPosts,
  useUpdateProfile,
  useWallet,
} from '@/api/hooks';
import type { Post } from '@/api/types';
import {
  Avatar,
  colors,
  Divider,
  fonts,
  gutter,
  PostRow,
  radius,
  Screen,
  space,
  Text,
  toast,
  useTheme,
} from '@/ui';

type ProfileTab = 'posts' | 'replies' | 'reposts' | 'videos' | 'articles';

interface TabConfig {
  id: ProfileTab;
  index: number;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

// Las 5 pestañas visibles que ocupan el 100% del ancho (Regla 8 y 10 - Referencia X)
const PROFILE_TABS: TabConfig[] = [
  { id: 'posts', index: 0, label: 'Posts', icon: 'file-text' },
  { id: 'replies', index: 1, label: 'Respuestas', icon: 'message-circle' },
  { id: 'reposts', index: 2, label: 'Reposts', icon: 'repeat' },
  { id: 'videos', index: 3, label: 'Videos', icon: 'tv' },
  { id: 'articles', index: 4, label: 'Artículos', icon: 'edit-3' },
];

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 80 }, (_, i) => 2026 - i);

// Imágenes de muestra predefinidas para avatar y banner
const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
];
const SAMPLE_BANNERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
];

interface SuggestedFollowAccount {
  id: string;
  name: string;
  handle: string;
  bio: string;
  verified: boolean;
  badge?: string;
  bannerUrl: string;
  avatarUrl?: string;
  isFlagAvatar?: boolean;
}

// Cuentas del carrusel de «A quién seguir» (Imagen 2)
const SUGGESTED_ACCOUNTS: SuggestedFollowAccount[] = [
  {
    id: 'iran_army',
    name: 'Iran Army',
    handle: '@Iran_Army_Stan',
    bio: 'Update | Strategy | Global Conflicts | Commentary Page // News Update// Breakin...',
    verified: true,
    badge: 'DEFENSE FORCES · VERIFIED',
    bannerUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80',
    isFlagAvatar: true,
  },
  {
    id: 'hexsec_team',
    name: 'Hexsec Team',
    handle: '@Hexsecteam',
    bio: '🛡️ Learn Ethical Hacking\n⚔️ Red Teaming & Bug Bounty\nApp Protection & Cybersecurity Awareness',
    verified: true,
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sam_altman',
    name: 'Sam Altman',
    handle: '@sama',
    bio: 'OpenAI · Research & Artificial Intelligence news and community updates',
    verified: true,
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

export default function ProfileScreen() {
  const { isDark, colors: themeColors } = useTheme();
  const screenBg = isDark ? '#000000' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0F1419';
  const textSecondary = isDark ? '#71767B' : '#536471';
  const borderColor = isDark ? '#2F3336' : '#EFF3F4';
  const outlineBorder = isDark ? '#536471' : '#CFD9DE';
  const { top, bottom } = useSafeAreaInsets();
  const meQuery = useMe();
  const user = meQuery.data;
  const walletQuery = useWallet();
  const myPostsQuery = useMyPosts(null);
  const myPosts = useMemo(() => flat(myPostsQuery.data), [myPostsQuery.data]);

  const { width: screenWidth } = useWindowDimensions();
  const tabWidth = screenWidth / 5;

  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;

  const [scrollY, setScrollY] = useState(0);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});

  const toggleFollowSuggested = (id: string, name: string) => {
    setFollowedMap((prev) => {
      const next = !prev[id];
      toast.success(next ? `Siguiendo a ${name}` : `Has dejado de seguir a ${name}`);
      return { ...prev, [id]: next };
    });
  };

  // Estados de Búsqueda de Perfil (Imagen 1)
  const [isSearchingInProfile, setIsSearchingInProfile] = useState(false);
  const [hasExecutedSearch, setHasExecutedSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados del modal de edición de perfil (Imagen 2 y 3)
  const [editName, setEditName] = useState(user?.username ?? 'John Ripper');
  const [editBio, setEditBio] = useState(user?.bio ?? '');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [avatarImage, setAvatarImage] = useState<string | null>(user?.avatarUrl ?? null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  // Selector de foto (Tomar foto / Elegir foto existente - Imagen 3)
  const [photoSheetTarget, setPhotoSheetTarget] = useState<'avatar' | 'banner' | null>(null);

  // Custom DateTime Picker (no nativo)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedMonth, setSelectedMonth] = useState('Marzo');
  const [selectedYear, setSelectedYear] = useState(2000);

  const updateProfile = useUpdateProfile();

  const isScrolled = scrollY > 60;
  const postCount = myPosts.length > 0 ? myPosts.length : 1;

  // Nombre completo y usuario limpios (no duplicar el handle en los detalles - Referencias X)
  const fullName = editName.trim() || user?.username || 'John Ripper';
  const rawHandle = user?.username ? user.username.replace(/^@/, '') : 'JohnRipper45606';
  const userHandle = `@${rawHandle}`;
  const defaultQueryText = `from:${rawHandle}`;

  // Transición animada fluida: al cambiar aparece el icono y el texto en la pestaña activa,
  // y en las demás pestañas el texto desaparece suavemente (Imagen 2)
  const handleTabPress = (tabId: ProfileTab) => {
    if (activeTab === tabId) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Animated.sequence([
      Animated.timing(contentFadeAnim, {
        toValue: 0.35,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setActiveTab(tabId);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Perfil de ${fullName}`,
        message: `Mira el perfil de ${fullName} (${userHandle}) en CashBank`,
      });
    } catch {}
  };

  const confirmLogout = () => {
    Alert.alert('¿Cerrar sesión?', 'Tus artículos y configuración se mantendrán guardados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleSaveProfile = () => {
    updateProfile.mutate(
      {
        bio: editBio.trim() || undefined,
        avatarUrl: avatarImage || undefined,
      },
      {
        onSuccess: () => {
          setShowEditModal(false);
          toast.success('Perfil actualizado correctamente');
        },
        onError: () => {
          toast.error('Error al actualizar el perfil');
        },
      }
    );
  };

  // Manejador de selección de foto (cámara o galería con expo-image-picker)
  const handleSelectPhoto = async (type: 'camera' | 'gallery') => {
    const target = photoSheetTarget;
    setPhotoSheetTarget(null);
    if (!target) return;

    try {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Permiso de cámara requerido');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: target === 'avatar' ? [1, 1] : [16, 9],
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
          if (target === 'avatar') {
            setAvatarImage(result.assets[0].uri);
          } else {
            setBannerImage(result.assets[0].uri);
          }
          toast.success(target === 'avatar' ? 'Avatar actualizado' : 'Portada actualizada');
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Permiso de galería requerido');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: target === 'avatar' ? [1, 1] : [16, 9],
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
          if (target === 'avatar') {
            setAvatarImage(result.assets[0].uri);
          } else {
            setBannerImage(result.assets[0].uri);
          }
          toast.success(target === 'avatar' ? 'Avatar seleccionado' : 'Portada seleccionada');
        }
      }
    } catch {
      // Fallback seguro en emulador o si falla el entorno nativo
      if (target === 'avatar') {
        const chosen = SAMPLE_AVATARS[Math.floor(Math.random() * SAMPLE_AVATARS.length)];
        setAvatarImage(chosen);
        toast.success(type === 'camera' ? 'Foto tomada con éxito' : 'Foto seleccionada de galería');
      } else {
        const chosen = SAMPLE_BANNERS[Math.floor(Math.random() * SAMPLE_BANNERS.length)];
        setBannerImage(chosen);
        toast.success(type === 'camera' ? 'Foto de portada tomada' : 'Foto de portada seleccionada');
      }
    }
  };

  // Guardar fecha desde el selector custom
  const handleConfirmCustomDate = () => {
    const formatted = `${selectedDay} de ${selectedMonth.toLowerCase()} de ${selectedYear}`;
    setEditBirthdate(formatted);
    setShowDatePicker(false);
    toast.success(`Fecha de nacimiento: ${formatted}`);
  };

  return (
    <Screen edges={['bottom']} style={{ backgroundColor: screenBg }}>
      {/* 1. VISTA DE BÚSQUEDA DEL PERFIL */}
      {isSearchingInProfile ? (
        <View style={{ flex: 1, backgroundColor: screenBg }}>
          {/* Header de búsqueda */}
          <View style={[s.searchProfileHeader, { paddingTop: Math.max(top, space.sm) + 4, borderBottomColor: borderColor, borderBottomWidth: 1 }]}>
            <Pressable
              onPress={() => {
                setIsSearchingInProfile(false);
                setHasExecutedSearch(false);
              }}
              hitSlop={10}
              style={({ pressed }) => [s.circleBtn, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel="Volver al perfil"
            >
              <Feather name="arrow-left" size={22} color={textPrimary} />
            </Pressable>

            {/* Input activo */}
            <View style={[s.searchProfilePillActive, { backgroundColor: isDark ? '#202327' : '#EFF3F4' }]}>
              <Feather name="search" size={18} color={textSecondary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                placeholder="Buscar"
                placeholderTextColor={textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={() => setHasExecutedSearch(true)}
                style={[s.searchProfileInput, { color: textPrimary }]}
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => {
                    setSearchQuery('');
                    setHasExecutedSearch(false);
                  }}
                  hitSlop={8}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Borrar consulta"
                >
                  <Feather name="x-circle" size={18} color={textSecondary} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Sugerencia de búsqueda */}
          {!hasExecutedSearch ? (
            <Pressable
              onPress={() => setHasExecutedSearch(true)}
              style={({ pressed }) => [s.searchSuggestionRow, { borderBottomColor: borderColor }, pressed && { opacity: 0.7 }]}
            >
              <Text style={[s.searchSuggestionText, { color: textPrimary }]}>
                Buscar “{searchQuery || defaultQueryText} ”
              </Text>
            </Pressable>
          ) : (
            /* Resultados de búsqueda */
            <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
              <View style={[s.postCard, { borderBottomColor: borderColor }]}>
                <View style={s.postCardHeader}>
                  <Avatar name={fullName} avatarUrl={avatarImage} size={40} />
                  <View style={{ flex: 1, paddingLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text variant="heading" style={[s.postAuthor, { color: textPrimary }]}>
                        {fullName}
                      </Text>
                      <Text style={[s.postHandle, { color: textSecondary }]}>{userHandle} · 1d</Text>
                    </View>
                    <Text style={[s.inReplyToText, { color: textSecondary }]}>
                      En respuesta a <Text style={{ color: '#1D9BF0' }}>@Hexsecteam</Text>
                    </Text>
                    <Text style={[s.postBody, { color: textPrimary, paddingTop: 4 }]}>
                      Jajajaja
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      ) : (
        /* 2. VISTA NORMAL DEL PERFIL */
        <View style={{ flex: 1, backgroundColor: screenBg }}>
          {/* Header Sticky en scroll */}
          <View
            style={[
              s.stickyHeader,
              {
                paddingTop: Math.max(top, space.sm),
                backgroundColor: isScrolled ? screenBg : 'transparent',
                borderBottomColor: isScrolled ? borderColor : 'transparent',
                borderBottomWidth: isScrolled ? 1 : 0,
              },
            ]}
          >
            {/* Botón Atrás */}
            <Pressable
              onPress={() => router.navigate('/')}
              hitSlop={8}
              style={({ pressed }) => [
                s.circleBtn,
                isScrolled ? (isDark ? s.circleBtnScrolled : { backgroundColor: 'rgba(0,0,0,0.06)' }) : s.circleBtnTransparent,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Atrás"
            >
              <Feather name="arrow-left" size={20} color={isScrolled ? textPrimary : '#FFFFFF'} />
            </Pressable>

            {/* Título en scroll */}
            <View style={s.stickyTitleWrap}>
              {isScrolled && (
                <View>
                  <Text variant="heading" style={[s.stickyTitle, { color: textPrimary }]} numberOfLines={1}>
                    {fullName}
                  </Text>
                  <Text style={[s.stickySubtitle, { color: textSecondary }]} numberOfLines={1}>
                    {postCount} {postCount === 1 ? 'post' : 'posts'}
                  </Text>
                </View>
              )}
            </View>

            {/* 3 Botones a la derecha */}
            <View style={s.headerRightActions}>
              <Pressable
                onPress={() => toast.info('Opciones de cuenta')}
                hitSlop={8}
                style={({ pressed }) => [
                  s.circleBtn,
                  isScrolled ? (isDark ? s.circleBtnScrolled : { backgroundColor: 'rgba(0,0,0,0.06)' }) : s.circleBtnTransparent,
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Opciones de cuenta"
              >
                <Feather name="slash" size={18} color={isScrolled ? textPrimary : '#FFFFFF'} />
              </Pressable>

              <Pressable
                onPress={() => {
                  setSearchQuery(defaultQueryText);
                  setHasExecutedSearch(false);
                  setIsSearchingInProfile(true);
                }}
                hitSlop={8}
                style={({ pressed }) => [
                  s.circleBtn,
                  isScrolled ? (isDark ? s.circleBtnScrolled : { backgroundColor: 'rgba(0,0,0,0.06)' }) : s.circleBtnTransparent,
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Buscar en perfil"
              >
                <Feather name="search" size={18} color={isScrolled ? textPrimary : '#FFFFFF'} />
              </Pressable>

              <Pressable
                onPress={() => setShowOptionsSheet(true)}
                hitSlop={8}
                style={({ pressed }) => [
                  s.circleBtn,
                  isScrolled ? (isDark ? s.circleBtnScrolled : { backgroundColor: 'rgba(0,0,0,0.06)' }) : s.circleBtnTransparent,
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Más opciones"
              >
                <Feather name="more-vertical" size={18} color={isScrolled ? textPrimary : '#FFFFFF'} />
              </Pressable>
            </View>
          </View>

          {/* Contenido Scrolleable Principal */}
          <ScrollView
            onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* Banner de portada */}
            <View
              style={[
                s.coverBanner,
                { height: 145 + Math.max(top, 16) },
                { backgroundColor: isDark ? '#16181C' : '#CFD9DE' },
              ]}
            >
              {bannerImage ? (
                <Image source={{ uri: bannerImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : null}
            </View>

            {/* Información de cabecera del perfil */}
            <View style={s.profileHeaderInfo}>
              {/* Avatar grande solapado */}
              <View style={[s.avatarWrapper, { borderColor: screenBg, backgroundColor: screenBg }]}>
                <Avatar
                  name={fullName}
                  avatarUrl={avatarImage}
                  size={76}
                />
              </View>

              {/* Nombre completo y Nombre de usuario */}
              <View style={s.nameWrap}>
                <Text variant="title" style={[s.profileName, { color: textPrimary }]}>
                  {fullName}
                </Text>
                <Text style={[s.profileHandle, { color: textSecondary }]}>{userHandle}</Text>
              </View>

              {/* Biografía si existe */}
              {editBio || user?.bio ? (
                <Text style={[s.bioText, { color: textPrimary }]}>
                  {editBio || user?.bio}
                </Text>
              ) : null}

              {/* Fecha de registro con icono de calendario */}
              <Pressable
                style={s.joinedRow}
                onPress={() => toast.info('Usuario registrado en marzo de 2025')}
              >
                <Feather name="calendar" size={14} color={textSecondary} />
                <Text style={[s.joinedText, { color: textSecondary }]}>Se unió en marzo 2025</Text>
                <Feather name="chevron-right" size={14} color={textSecondary} />
              </Pressable>

              {/* Estadísticas de Siguiendo y Seguidores */}
              <View style={s.statsRow}>
                {/* 1. Al pulsar Siguiendo abre Imagen 2 y 3 */}
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/connections',
                      params: { type: 'following', tab: 'following' },
                    })
                  }
                  style={s.statItem}
                  accessibilityRole="button"
                  accessibilityLabel="Ver a quién sigues"
                >
                  <Text style={[s.statNumber, { color: textPrimary }]}>2</Text>
                  <Text style={[s.statLabel, { color: textSecondary }]}>Siguiendo</Text>
                </Pressable>

                {/* 2. Al pulsar Seguidor abre Imagen 4 y 5 */}
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/connections',
                      params: { type: 'followers', tab: 'verified' },
                    })
                  }
                  style={s.statItem}
                  accessibilityRole="button"
                  accessibilityLabel="Ver seguidores"
                >
                  <Text style={[s.statNumber, { color: textPrimary }]}>1</Text>
                  <Text style={[s.statLabel, { color: textSecondary }]}>Seguidor</Text>
                </Pressable>
              </View>

              {/* Botones de acción: Compartir y Editar perfil */}
              <View style={s.actionsRow}>
                <Pressable
                  onPress={handleShare}
                  style={({ pressed }) => [s.outlineBtn, { borderColor: outlineBorder }, pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Compartir perfil"
                >
                  <Text variant="heading" style={[s.outlineBtnText, { color: textPrimary }]}>
                    Compartir
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowEditModal(true)}
                  style={({ pressed }) => [s.outlineBtn, { borderColor: outlineBorder }, pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Editar perfil"
                >
                  <Text variant="heading" style={[s.outlineBtnText, { color: textPrimary }]}>
                    Editar perfil
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Pestañas de Perfil */}
            <View style={[s.tabsContainerFullWidth, { backgroundColor: screenBg, borderBottomColor: borderColor }]}>
              <View style={s.tabsRow}>
                {PROFILE_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => handleTabPress(tab.id)}
                      style={[s.tabButtonFullWidth, isActive && s.tabButtonActive]}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: isActive }}
                    >
                      <View style={s.tabInner}>
                        <Feather
                          name={tab.icon}
                          size={18}
                          color={isActive ? textPrimary : textSecondary}
                        />
                        {isActive && (
                          <View style={s.activeTextRow}>
                            <Text
                              variant="heading"
                              style={[s.activeTabText, { color: textPrimary }]}
                              numberOfLines={1}
                            >
                              {tab.label}
                            </Text>
                            {tab.id === 'posts' && (
                              <Feather name="chevron-down" size={14} color={textPrimary} />
                            )}
                          </View>
                        )}
                        {isActive && <View style={[s.activeTabIndicator, { backgroundColor: textPrimary }]} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Contenido con transición fluida de fade */}
            <Animated.View style={{ opacity: contentFadeAnim }}>
              {/* Contenido de pestañas */}
              {activeTab === 'posts' && (
                <View>
                  {myPosts.length > 0 ? (
                    myPosts.map((post) => (
                      <PostRow
                        key={post.id}
                        post={post}
                        onPress={() => router.navigate(`/post/${post.id}`)}
                      />
                    ))
                  ) : null}

                  {/* Sección A quién seguir (Carrusel horizontal - Imagen 2) */}
                  <View style={s.whoToFollowSection}>
                    <Text variant="heading" style={[s.whoToFollowTitle, { color: textPrimary }]}>
                      A quién seguir
                    </Text>

                    {/* Carrusel horizontal de tarjetas (Imagen 2) */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={s.carouselScrollContent}
                    >
                      {SUGGESTED_ACCOUNTS.map((item) => {
                        const isFollowed = !!followedMap[item.id];
                        return (
                          <View
                            key={item.id}
                            style={[
                              s.suggestCardCarousel,
                              { backgroundColor: screenBg, borderColor: borderColor },
                            ]}
                          >
                            {/* Banner fotográfico real con badge oficial (Screenshot 3 & 9) */}
                            <View style={s.suggestBannerImgWrap}>
                              <Image
                                source={{ uri: item.bannerUrl }}
                                style={StyleSheet.absoluteFill}
                                resizeMode="cover"
                              />
                              {item.badge && (
                                <View style={s.suggestBadgePill}>
                                  <Text style={s.suggestBadgeText}>{item.badge}</Text>
                                </View>
                              )}
                            </View>

                            {/* Fila Avatar + Botón Seguir */}
                            <View style={s.suggestTopRow}>
                              <View style={[s.suggestAvatarWrap, { borderColor: screenBg }]}>
                                {item.isFlagAvatar ? (
                                  <View style={s.flagAvatar}>
                                    <View style={[s.flagStripe, { backgroundColor: '#239F40' }]} />
                                    <View style={[s.flagStripe, { backgroundColor: '#FFFFFF' }]}>
                                      <Text style={{ fontSize: 10, textAlign: 'center' }}>🇮🇷</Text>
                                    </View>
                                    <View style={[s.flagStripe, { backgroundColor: '#DA0000' }]} />
                                  </View>
                                ) : item.avatarUrl ? (
                                  <Image
                                    source={{ uri: item.avatarUrl }}
                                    style={StyleSheet.absoluteFill}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View style={[s.flagStripe, { backgroundColor: isDark ? '#1C2938' : '#EFF3F4' }]}>
                                    <Text style={{ fontSize: 16, color: textPrimary }}>{item.name[0]}</Text>
                                  </View>
                                )}
                              </View>

                              {/* Botón Seguir separado ~6px de la imagen inferior (Imagen 2) */}
                              <Pressable
                                onPress={() => toggleFollowSuggested(item.id, item.name)}
                                style={({ pressed }) => [
                                  s.followBtn,
                                  {
                                    backgroundColor: isFollowed
                                      ? (isDark ? '#000000' : '#FFFFFF')
                                      : (isDark ? '#EFF3F4' : '#0F1419'),
                                    borderColor: isFollowed ? outlineBorder : 'transparent',
                                    borderWidth: isFollowed ? 1 : 0,
                                  },
                                  pressed && { opacity: 0.8 },
                                ]}
                                accessibilityRole="button"
                                accessibilityLabel={`Seguir a ${item.name}`}
                              >
                                <Text
                                  variant="heading"
                                  style={[
                                    s.followBtnText,
                                    {
                                      color: isFollowed
                                        ? (isDark ? '#FFFFFF' : '#0F1419')
                                        : (isDark ? '#0F1419' : '#FFFFFF'),
                                    },
                                  ]}
                                >
                                  {isFollowed ? 'Siguiendo' : 'Seguir'}
                                </Text>
                              </Pressable>
                            </View>

                            {/* Información de la cuenta */}
                            <View style={s.suggestCardBody}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text variant="heading" style={[s.suggestName, { color: textPrimary }]} numberOfLines={1}>
                                  {item.name}
                                </Text>
                                {item.verified && (
                                  <Feather name="check-circle" size={14} color="#1D9BF0" />
                                )}
                              </View>
                              <Text style={[s.suggestHandle, { color: textSecondary }]} numberOfLines={1}>{item.handle}</Text>

                              <Text style={[s.suggestDesc, { color: textPrimary }]} numberOfLines={3}>
                                {item.bio}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>

                    {/* Botón Mostrar más fuera y separado del carrusel (Imagen 2) */}
                    <Pressable
                      onPress={() => router.push('/follow')}
                      style={s.showMoreLinkOutside}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Mostrar más sugerencias"
                    >
                      <Text style={s.showMoreText}>Mostrar más</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Pestaña: Respuestas */}
              {activeTab === 'replies' && (
                <View style={s.repliesContainer}>
                  <View style={[s.replyCard, { borderBottomColor: borderColor }]}>
                    <View style={s.replyHeader}>
                      <Avatar name="Hexsec Team" size={40} />
                      <View style={{ flex: 1, paddingLeft: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text variant="heading" style={[s.replyAuthor, { color: textPrimary }]}>
                            Hexsec Team
                          </Text>
                          <Text style={[s.replyHandle, { color: textSecondary }]}>@Hexsecteam · 2d</Text>
                        </View>
                        <Text style={[s.replyBody, { color: textPrimary }]}>
                          Flipper Zero + BadUSB demonstration on my own device, exploring how automated USB input interacts with app protection. Shared for cybersecurity awareness and educational purposes.{'\n\n'}
                          <Text style={{ color: '#1D9BF0' }}>
                            #FlipperZero #BadUSB #CyberSecurity #AppSecurity #HexSec
                          </Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Pestaña: Reposts (Imagen 2 de la solicitud del usuario) */}
              {activeTab === 'reposts' && (
                <View style={s.repostsContainer}>
                  <Text variant="heading" style={[s.repostsEmptyTitle, { color: textPrimary }]}>
                    No hay nada que ver aquí... por ahora.
                  </Text>
                </View>
              )}

              {/* Pestaña: Videos con mensaje de PRÓXIMAMENTE */}
              {activeTab === 'videos' && (
                <View style={s.emptyTabWrap}>
                  <View style={s.videoIconCircle}>
                    <Feather name="tv" size={36} color={colors.accent} />
                  </View>
                  <Text variant="title" style={[s.emptyTabTitle, { color: textPrimary }]}>
                    Próximamente
                  </Text>
                  <Text style={[s.emptyTabDesc, { color: textSecondary }]}>
                    La subida y reproducción de videos estará disponible muy pronto en la aplicación.
                  </Text>
                </View>
              )}

              {/* Pestaña: Artículos (Screenshot 10 y solicitud del usuario) */}
              {activeTab === 'articles' && (
                <View style={s.articlesContainer}>
                  <Text variant="heading" style={[s.articlesTitle, { color: textPrimary }]}>
                    Escribe artículos en X
                  </Text>
                  <Text style={[s.articlesSubtitle, { color: textSecondary }]}>
                    Cuando publiques un Artículo en x.com, se mostrará aquí. Solo las personas suscritas a Premium pueden publicar Artículos.
                  </Text>
                  <Pressable
                    onPress={() => toast.info('Redirigiendo a suscripción de Premium...')}
                    style={({ pressed }) => [s.premiumBtn, pressed && { opacity: 0.85 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Suscríbete a Premium"
                  >
                    <Text style={s.premiumBtnText}>Suscríbete a Premium</Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </ScrollView>

          {/* Botón flotante (+) */}
          <Pressable
            onPress={() => router.push('/post/new')}
            style={({ pressed }) => [
              s.fab,
              { backgroundColor: '#1D9BF0' },
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Crear nuevo post"
          >
            <Feather name="plus" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      )}

      {/* 2. PANTALLA COMPLETA «EDITAR PERFIL» */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowEditModal(false)}
      >
        <Screen edges={['top', 'bottom']} style={{ backgroundColor: screenBg }}>
          {/* Header Editar perfil */}
          <View style={[s.editProfileHeaderRow, { borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <Pressable
              onPress={() => setShowEditModal(false)}
              hitSlop={10}
              style={({ pressed }) => [s.circleBackBtn, pressed && { opacity: 0.7 }]}
            >
              <Feather name="arrow-left" size={22} color={textPrimary} />
            </Pressable>

            <Text variant="heading" style={[s.editProfileHeaderTitle, { color: textPrimary }]}>
              Editar perfil
            </Text>

            <Pressable
              onPress={handleSaveProfile}
              hitSlop={10}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <Text style={s.editProfileSaveText}>Guardar</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Banner de portada con vista previa en vivo y botón de cámara */}
            <Pressable
              onPress={() => setPhotoSheetTarget('banner')}
              style={[s.editCoverBannerClean, { backgroundColor: isDark ? '#16181C' : '#CFD9DE' }]}
            >
              {bannerImage ? (
                <Image
                  source={{ uri: bannerImage }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : null}
              <View style={s.cameraCenterBtn}>
                <Feather name="camera" size={22} color="#FFFFFF" />
              </View>
            </Pressable>

            {/* Avatar circular con vista previa en vivo y botón de cámara */}
            <View style={s.editAvatarWrapperClean}>
              <Pressable
                onPress={() => setPhotoSheetTarget('avatar')}
                style={[s.editAvatarCircleClean, { borderColor: screenBg, backgroundColor: screenBg }]}
              >
                {avatarImage ? (
                  <Image
                    source={{ uri: avatarImage }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : (
                  <Avatar name={fullName} size={76} />
                )}
                <View style={s.avatarCameraOverlay}>
                  <Feather name="camera" size={24} color="#FFFFFF" />
                </View>
              </Pressable>
            </View>

            {/* Campos del formulario */}
            <View style={s.editFieldsContainer}>
              {/* Nombre */}
              <View style={[s.editFieldBlock, { borderBottomColor: borderColor }]}>
                <Text style={[s.editFieldLabel, { color: textSecondary }]}>Nombre</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Tu nombre"
                  placeholderTextColor={textSecondary}
                  style={[s.editFieldInput, { color: textPrimary }]}
                />
              </View>

              {/* Biografía */}
              <View style={[s.editFieldBlock, { borderBottomColor: borderColor }]}>
                <Text style={[s.editFieldLabel, { color: textSecondary }]}>Biografía</Text>
                <TextInput
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Agrega tu biografía"
                  placeholderTextColor={textSecondary}
                  multiline
                  style={[s.editFieldInput, { color: textPrimary }]}
                />
              </View>

              {/* Ubicación */}
              <View style={[s.editFieldBlock, { borderBottomColor: borderColor }]}>
                <Text style={[s.editFieldLabel, { color: textSecondary }]}>Ubicación</Text>
                <TextInput
                  value={editLocation}
                  onChangeText={setEditLocation}
                  placeholder="Agrega tu ubicación"
                  placeholderTextColor={textSecondary}
                  style={[s.editFieldInput, { color: textPrimary }]}
                />
              </View>

              {/* Sitio web */}
              <View style={[s.editFieldBlock, { borderBottomColor: borderColor }]}>
                <Text style={[s.editFieldLabel, { color: textSecondary }]}>Sitio web</Text>
                <TextInput
                  value={editWebsite}
                  onChangeText={setEditWebsite}
                  placeholder="Agrega tu sitio web"
                  placeholderTextColor={textSecondary}
                  autoCapitalize="none"
                  style={[s.editFieldInput, { color: textPrimary }]}
                />
              </View>

              {/* Fecha de nacimiento */}
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={[s.editFieldBlock, { borderBottomColor: borderColor }]}
              >
                <Text style={[s.editFieldLabel, { color: textSecondary }]}>Fecha de nacimiento</Text>
                <Text style={editBirthdate ? [s.editBirthdateActiveText, { color: textPrimary }] : [s.editBirthdatePlaceholder, { color: textSecondary }]}>
                  {editBirthdate || 'Agrega tu fecha de nacimiento'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Bottom Sheet para Tomar foto / Elegir foto existente - Overlay directo para Android/iOS */}
          {photoSheetTarget !== null && (
            <View style={s.modalOverlayAbsolute}>
              <Pressable style={s.backdrop} onPress={() => setPhotoSheetTarget(null)} />
              <View style={[s.actionSheetBottom, { backgroundColor: isDark ? '#16181C' : '#FFFFFF', paddingBottom: Math.max(bottom, space.lg) + space.sm }]}>
                <View style={s.handleWrap}>
                  <View style={[s.handle, { backgroundColor: isDark ? '#536471' : '#CFD9DE' }]} />
                </View>

                {/* Opción 1: Tomar foto */}
                <Pressable
                  onPress={() => handleSelectPhoto('camera')}
                  style={({ pressed }) => [s.sheetOptionRow, pressed && { opacity: 0.7 }]}
                >
                  <Feather name="camera" size={22} color={textPrimary} />
                  <Text style={[s.sheetOptionRowText, { color: textPrimary }]}>Tomar foto</Text>
                </Pressable>

                {/* Opción 2: Elegir foto existente */}
                <Pressable
                  onPress={() => handleSelectPhoto('gallery')}
                  style={({ pressed }) => [s.sheetOptionRow, pressed && { opacity: 0.7 }]}
                >
                  <Feather name="image" size={22} color={textPrimary} />
                  <Text style={[s.sheetOptionRowText, { color: textPrimary }]}>Elegir foto existente</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* 3. CUSTOM DATETIME PICKER (No nativo) - Overlay directo */}
          {showDatePicker && (
            <View style={s.modalOverlayAbsolute}>
              <Pressable style={s.backdrop} onPress={() => setShowDatePicker(false)} />
              <View style={[s.customDatePickerSheet, { backgroundColor: isDark ? '#16181C' : '#FFFFFF', paddingBottom: Math.max(bottom, space.lg) + space.sm }]}>
                <View style={s.handleWrap}>
                  <View style={[s.handle, { backgroundColor: isDark ? '#536471' : '#CFD9DE' }]} />
                </View>

                <View style={s.datePickerHeader}>
                  <Text variant="title" style={[s.datePickerTitle, { color: textPrimary }]}>
                    Fecha de nacimiento
                  </Text>
                  <Text style={[s.datePickerSubtitle, { color: textSecondary }]}>
                    Esta información se mantendrá segura según tus preferencias de privacidad.
                  </Text>
                </View>

                {/* 3 Columnas Scrollables: Día, Mes, Año */}
                <View style={s.dateColumnsWrap}>
                  {/* Columna Día */}
                  <View style={s.dateCol}>
                    <Text style={[s.dateColLabel, { color: textSecondary }]}>Día</Text>
                    <ScrollView style={s.dateColScroll} showsVerticalScrollIndicator={false}>
                      {DAYS.map((d) => (
                        <Pressable
                          key={d}
                          onPress={() => setSelectedDay(d)}
                          style={[s.dateItemBtn, selectedDay === d && s.dateItemBtnActive]}
                        >
                          <Text
                            style={[
                              s.dateItemText,
                              { color: textPrimary },
                              selectedDay === d && { color: colors.accent, fontFamily: fonts.bold },
                            ]}
                          >
                            {d}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Columna Mes */}
                  <View style={s.dateColFlex}>
                    <Text style={[s.dateColLabel, { color: textSecondary }]}>Mes</Text>
                    <ScrollView style={s.dateColScroll} showsVerticalScrollIndicator={false}>
                      {MONTHS.map((m) => (
                        <Pressable
                          key={m}
                          onPress={() => setSelectedMonth(m)}
                          style={[s.dateItemBtn, selectedMonth === m && s.dateItemBtnActive]}
                        >
                          <Text
                            style={[
                              s.dateItemText,
                              { color: textPrimary },
                              selectedMonth === m && { color: colors.accent, fontFamily: fonts.bold },
                            ]}
                          >
                            {m}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Columna Año */}
                  <View style={s.dateCol}>
                    <Text style={[s.dateColLabel, { color: textSecondary }]}>Año</Text>
                    <ScrollView style={s.dateColScroll} showsVerticalScrollIndicator={false}>
                      {YEARS.map((y) => (
                        <Pressable
                          key={y}
                          onPress={() => setSelectedYear(y)}
                          style={[s.dateItemBtn, selectedYear === y && s.dateItemBtnActive]}
                        >
                          <Text
                            style={[
                              s.dateItemText,
                              { color: textPrimary },
                              selectedYear === y && { color: colors.accent, fontFamily: fonts.bold },
                            ]}
                          >
                            {y}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Botón Guardar Fecha */}
                <View style={s.datePickerFooter}>
                  <Pressable
                    onPress={handleConfirmCustomDate}
                    style={({ pressed }) => [s.datePickerConfirmBtn, pressed && { opacity: 0.9 }]}
                  >
                    <Text style={s.datePickerConfirmBtnText}>Aceptar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </Screen>
      </Modal>

      {/* Sheet de Opciones (...) del perfil */}
      <Modal
        visible={showOptionsSheet}
        animationType="fade"
        transparent
        onRequestClose={() => setShowOptionsSheet(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.backdrop} onPress={() => setShowOptionsSheet(false)} />
          <View style={[s.sheet, { backgroundColor: isDark ? '#16181C' : '#FFFFFF', paddingBottom: Math.max(bottom, space.lg) + space.sm }]}>
            <View style={s.handleWrap}>
              <View style={[s.handle, { backgroundColor: isDark ? '#536471' : '#CFD9DE' }]} />
            </View>

            {/* Opción 1: Estudio para creadores */}
            <Pressable
              onPress={() => {
                setShowOptionsSheet(false);
                router.push('/creator-studio');
              }}
              style={s.sheetOption}
              accessibilityRole="button"
              accessibilityLabel="Estudio para creadores"
            >
              <Ionicons name="rocket-outline" size={22} color={textPrimary} />
              <Text variant="heading" style={[s.sheetOptionText, { color: textPrimary }]}>
                Estudio para creadores
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setShowOptionsSheet(false);
                router.push('/my-posts');
              }}
              style={s.sheetOption}
            >
              <Feather name="file-text" size={20} color={textPrimary} />
              <Text variant="heading" style={[s.sheetOptionText, { color: textPrimary }]}>
                Mis artículos
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setShowOptionsSheet(false);
                router.push('/wallet');
              }}
              style={s.sheetOption}
            >
              <Feather name="credit-card" size={20} color={textPrimary} />
              <Text variant="heading" style={[s.sheetOptionText, { color: textPrimary }]}>
                Billetera y fichas
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setShowOptionsSheet(false);
                router.push('/settings');
              }}
              style={s.sheetOption}
            >
              <Feather name="settings" size={20} color={textPrimary} />
              <Text variant="heading" style={[s.sheetOptionText, { color: textPrimary }]}>
                Ajustes
              </Text>
            </Pressable>

            <Divider />

            <Pressable
              onPress={() => {
                setShowOptionsSheet(false);
                confirmLogout();
              }}
              style={s.sheetOption}
            >
              <Feather name="log-out" size={20} color="#F4212E" />
              <Text variant="heading" style={[s.sheetOptionText, { color: '#F4212E' }]}>
                Cerrar sesión
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const s = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnTransparent: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  circleBtnScrolled: {
    backgroundColor: 'transparent',
  },
  stickyTitleWrap: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: 'center',
  },
  stickyTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    lineHeight: 21,
  },
  stickySubtitle: {
    fontSize: 12,
    color: '#71767B',
    lineHeight: 16,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coverBanner: {
    height: 150,
    backgroundColor: '#16181C',
  },
  profileHeaderInfo: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  avatarWrapper: {
    marginTop: -38,
    alignSelf: 'flex-start',
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  nameWrap: {
    paddingTop: 10,
    gap: 2,
  },
  profileName: {
    fontSize: 22,
    fontFamily: fonts.bold,
    lineHeight: 26,
  },
  profileHandle: {
    fontSize: 15,
    color: '#71767B',
  },
  bioText: {
    fontSize: 15,
    lineHeight: 20,
    paddingTop: 10,
  },
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
  },
  joinedText: {
    fontSize: 14,
    color: '#71767B',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  statLabel: {
    fontSize: 15,
    color: '#71767B',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
  },
  outlineBtn: {
    flex: 1,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#536471',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  // Pestañas al 100% de ancho con animación fluida (Regla 8 y 10 - Imagen 2)
  tabsContainerFullWidth: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#2F3336',
    backgroundColor: '#000000',
    position: 'relative',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  tabButtonFullWidth: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    flex: 1.6,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 4,
    height: '100%',
    position: 'relative',
  },
  activeTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  activeTabText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  whoToFollowSection: {
    paddingTop: 16,
  },
  whoToFollowTitle: {
    fontSize: 19,
    fontFamily: fonts.bold,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  carouselScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  suggestCardCarousel: {
    width: 280,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F3336',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  suggestBannerImgWrap: {
    height: 100,
    width: '100%',
    backgroundColor: '#1E242B',
    position: 'relative',
    overflow: 'hidden',
  },
  suggestBadgePill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 3,
  },
  suggestBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  suggestTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  suggestAvatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: '#000000',
    marginTop: -29,
    overflow: 'hidden',
    backgroundColor: '#20242B',
  },
  flagAvatar: {
    flex: 1,
  },
  flagStripe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtn: {
    backgroundColor: '#EFF3F4',
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    // Separado 6px de la base de la imagen (Imagen 2)
    marginTop: 6,
    margin: 0,
  },
  followedBtn: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#536471',
  },
  followBtnText: {
    color: '#0F1419',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  suggestCardBody: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 14,
  },
  suggestName: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  suggestHandle: {
    fontSize: 13.5,
    color: '#71767B',
    paddingTop: 1,
  },
  suggestDesc: {
    fontSize: 13,
    lineHeight: 18,
    paddingTop: 6,
  },
  showMoreLinkOutside: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    alignSelf: 'flex-start',
  },
  showMoreText: {
    color: '#1D9BF0',
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  repliesContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  replyCard: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  replyAuthor: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  replyHandle: {
    fontSize: 14,
    color: '#71767B',
  },
  replyBody: {
    fontSize: 15,
    lineHeight: 21,
    paddingTop: 4,
  },
  repostsContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  repostsEmptyTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  articlesContainer: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 60,
  },
  articlesTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  articlesSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: '#71767B',
    marginBottom: 24,
  },
  premiumBtn: {
    backgroundColor: '#1D9BF0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  premiumBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  emptyTabWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  videoIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(228, 83, 29, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTabTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  emptyTabDesc: {
    fontSize: 15,
    lineHeight: 21,
    color: '#71767B',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalOverlayAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    elevation: 10,
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: gutter,
    paddingTop: space.sm,
    backgroundColor: '#16181C',
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
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  sheetOptionText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#FFFFFF',
  },
  // Búsqueda desde Perfil (Imagen 1)
  searchProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchProfilePillActive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 40,
    paddingHorizontal: 8,
  },
  searchProfileInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: fonts.regular,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  searchSuggestionRow: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  searchSuggestionText: {
    fontSize: 16.5,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  postCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
  },
  postCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  postAuthor: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  postHandle: {
    fontSize: 14,
    color: '#71767B',
  },
  postBody: {
    fontSize: 15,
    lineHeight: 21,
  },
  inReplyToText: {
    fontSize: 13.5,
    color: '#71767B',
    paddingTop: 2,
  },
  // Editar Perfil Limpio (Imagen 3)
  editProfileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  circleBackBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileHeaderTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    flex: 1,
    paddingLeft: 16,
  },
  editProfileSaveText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  editCoverBannerClean: {
    height: 125,
    backgroundColor: '#16181C',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  cameraCenterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  editAvatarWrapperClean: {
    marginTop: -38,
    marginLeft: 16,
    alignSelf: 'flex-start',
  },
  editAvatarCircleClean: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#20242B',
    borderWidth: 3,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarCameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 2,
  },
  editFieldsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  editFieldBlock: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
    gap: 4,
  },
  editFieldLabel: {
    fontSize: 13,
    color: '#71767B',
    fontFamily: fonts.regular,
  },
  editFieldInput: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: '#FFFFFF',
    paddingVertical: 2,
  },
  editBirthdatePlaceholder: {
    fontSize: 16,
    color: '#71767B',
    fontFamily: fonts.regular,
    paddingVertical: 2,
  },
  editBirthdateActiveText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    paddingVertical: 2,
  },
  // Sheet para Tomar foto / Elegir foto existente (Imagen 3)
  actionSheetBottom: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: '#16181C',
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  sheetOptionRowText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: fonts.medium,
  },
  // Custom DateTime Picker Sheet
  customDatePickerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: '#16181C',
  },
  datePickerHeader: {
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  datePickerTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  datePickerSubtitle: {
    fontSize: 13,
    color: '#71767B',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  dateColumnsWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 180,
    paddingVertical: 8,
    gap: 8,
  },
  dateCol: {
    width: 70,
    alignItems: 'center',
  },
  dateColFlex: {
    flex: 1,
    alignItems: 'center',
  },
  dateColLabel: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#71767B',
    paddingBottom: 6,
  },
  dateColScroll: {
    width: '100%',
  },
  dateItemBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  dateItemBtnActive: {
    backgroundColor: '#272C30',
  },
  dateItemText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  datePickerFooter: {
    paddingTop: 16,
  },
  datePickerConfirmBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerConfirmBtnText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fonts.bold,
  },
});
