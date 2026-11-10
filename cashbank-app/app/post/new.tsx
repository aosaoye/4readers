import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useCategories,
  useCreatePost,
  useMe,
  usePost,
  useUpdatePost,
} from '@/api/hooks';
import { AudienceModal, type AudienceType } from '@/components/compose/AudienceModal';
import { GifModal } from '@/components/compose/GifModal';
import { LocationModal } from '@/components/compose/LocationModal';
import { PollData, PollEditor } from '@/components/compose/PollEditor';
import { SpaceConfig, SpacesModal } from '@/components/compose/SpacesModal';
import {
  Avatar,
  fonts,
  gutter,
  radius,
  space,
  Text,
  toast,
  useTheme,
} from '@/ui';

interface ThreadPost {
  id: string;
  text: string;
  images: string[];
  gifUrl?: string;
  location?: string;
  poll?: PollData | null;
  spaceConfig?: SpaceConfig | null;
}

/**
 * Indicador circular de progreso de caracteres estilo X (Imagen 3 del usuario).
 * Llena el arco azul proporcionalmente y se vuelve naranja/rojo al aproximarse al límite.
 */
function CircularProgressMeter({
  progress,
  charsLeft,
}: {
  progress: number;
  charsLeft: number;
}) {
  const size = 24;
  const strokeWidth = 2.5;
  const isNearLimit = charsLeft <= 20;
  const isOver = charsLeft < 0;
  const strokeColor = isOver ? '#F4212E' : isNearLimit ? '#FFAD1F' : '#1D9BF0';

  const clamped = Math.min(1, Math.max(0, progress));
  const deg = Math.round(clamped * 360);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Pista circular gris de fondo */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#38444D',
          position: 'absolute',
        }}
      />
      {/* Arco de progreso dinámico proporcional */}
      {clamped > 0 && (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderTopColor: strokeColor,
            borderRightColor: clamped >= 0.25 ? strokeColor : 'transparent',
            borderBottomColor: clamped >= 0.5 ? strokeColor : 'transparent',
            borderLeftColor: clamped >= 0.75 ? strokeColor : 'transparent',
            position: 'absolute',
            transform: [{ rotate: `${deg}deg` }],
          }}
        />
      )}
      {/* Cuenta regresiva cuando quedan 20 caracteres o menos */}
      {isNearLimit && (
        <Text
          style={{
            fontSize: 9,
            fontFamily: fonts.bold,
            color: strokeColor,
            textAlign: 'center',
          }}
        >
          {charsLeft}
        </Text>
      )}
    </View>
  );
}

export default function NewPostScreen() {
  const { edit, mode } = useLocalSearchParams<{ edit?: string; mode?: string }>();
  const editing = !!edit;
  const existing = usePost(edit ?? '', editing);

  useEffect(() => {
    if (mode === 'article') {
      router.replace('/post/article');
    }
  }, [mode]);

  const { isDark } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const me = useMe().data;
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data ?? [];

  const createPost = useCreatePost();
  const updatePost = useUpdatePost(edit ?? '');

  // Detectar teclado activo para que la barra de herramientas flote exactamente arriba (Imagen 4)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Estado del hilo de posts (conectar varios posts)
  const [posts, setPosts] = useState<ThreadPost[]>([
    {
      id: '1',
      text: existing.data?.content || '',
      images: existing.data?.coverImageUrl ? [existing.data.coverImageUrl] : [],
      poll: null,
      spaceConfig: null,
    },
  ]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Audiencia de respuestas
  const [audience, setAudience] = useState<AudienceType>('everyone');
  const [showAudienceModal, setShowAudienceModal] = useState(false);

  // Modales de adjuntos
  const [showSpacesModal, setShowSpacesModal] = useState(false);
  const [showGifModal, setShowGifModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Categoría seleccionada
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const scrollRef = useRef<any>(null);

  // Actualizar post activo
  const updateActivePost = (updater: (prev: ThreadPost) => ThreadPost) => {
    setPosts((prev) => {
      const next = [...prev];
      next[focusedIndex] = updater(next[focusedIndex]);
      return next;
    });
  };

  // Conectar varios posts (Thread / Hilo)
  const addThreadPost = () => {
    const newId = String(Date.now());
    setPosts((prev) => [
      ...prev,
      { id: newId, text: '', images: [], poll: null, spaceConfig: null },
    ]);
    const nextIdx = posts.length;
    setFocusedIndex(nextIdx);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const removeThreadPost = (idx: number) => {
    if (posts.length <= 1) return;
    setPosts((prev) => prev.filter((_, i) => i !== idx));
    setFocusedIndex((prev) => Math.max(0, prev - 1));
  };

  // 1. Añadir imágenes desde Galería
  const handlePickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Se requiere permiso para acceder a las fotos');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map((a) => a.uri).filter(Boolean);
        updateActivePost((p) => ({
          ...p,
          images: [...p.images, ...uris].slice(0, 4),
        }));
        toast.success(uris.length === 1 ? 'Imagen añadida' : `${uris.length} imágenes añadidas`);
      }
    } catch {
      toast.error('Error al seleccionar imagen');
    }
  };

  // 2. Capturar con la Cámara
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Se requiere permiso de cámara');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const uri = result.assets[0].uri;
        updateActivePost((p) => ({
          ...p,
          images: [...p.images, uri].slice(0, 4),
        }));
        toast.success('Foto tomada');
      }
    } catch {
      toast.error('Error al abrir la cámara');
    }
  };

  // 3. Encuesta / Lista (Imagen 2)
  const handleTogglePoll = () => {
    updateActivePost((p) => ({
      ...p,
      poll: p.poll
        ? null
        : {
            options: ['', ''],
            duration: '1 día',
          },
    }));
  };

  // Límite dinámico según suscripción Premium o Freemium (Imagen 3 del usuario)
  const isPremium = Boolean(me?.isVerified);
  const maxChars = isPremium ? 4000 : 280;

  const currentActivePost = posts[focusedIndex] || posts[0];
  const totalCharsInActive = currentActivePost?.text.length ?? 0;
  const charsLeft = maxChars - totalCharsInActive;
  const progress = Math.min(1, Math.max(0, totalCharsInActive / maxChars));
  const isFull = totalCharsInActive >= maxChars;

  // Restricciones de adjuntos según Imagen 4:
  // Si hay un Espacio o el texto se llena al 100%:
  // NO se pueden añadir imágenes, cámara, otro espacio, GIF ni listas. Solo texto y ubicación.
  const hasSpace = Boolean(currentActivePost?.spaceConfig);
  const hasMedia = (currentActivePost?.images?.length ?? 0) > 0 || Boolean(currentActivePost?.gifUrl);
  const hasPoll = Boolean(currentActivePost?.poll);

  const isMediaDisabled = hasSpace || isFull;
  const isSpaceDisabled = hasSpace || hasMedia || hasPoll || isFull;

  // Publicar post(s)
  const isSubmitting = createPost.isPending || updatePost.isPending;

  const hasContent = posts.some(
    (p) =>
      p.text.trim().length > 0 ||
      p.images.length > 0 ||
      p.gifUrl ||
      p.poll ||
      p.spaceConfig
  );

  const handlePublish = async () => {
    if (!hasContent) {
      toast.error('Escribe algo para publicar');
      return;
    }

    const catId =
      selectedCategoryId ||
      categories[0]?.id ||
      '00000000-0000-0000-0000-000000000000';

    try {
      if (editing && edit) {
        const primary = posts[0];
        let editContent = primary.text;
        if (primary.gifUrl) {
          editContent += `\n\n![GIF](${primary.gifUrl})`;
        }
        await updatePost.mutateAsync({
          title: primary.text.slice(0, 60) || 'Publicación',
          summary: primary.text.length > 80 ? primary.text.slice(0, 120) + '...' : 'Publicación de autor',
          content: editContent,
          coverImageUrl: primary.images[0] || undefined,
        });
        toast.success('Publicación actualizada');
        router.back();
        return;
      }

      // Si es un hilo de varios posts conectados
      for (let i = 0; i < posts.length; i++) {
        const p = posts[i];
        let fullContent = p.text;

        // Anexar encuesta si existe
        if (p.poll) {
          const validOpts = p.poll.options.filter((o) => o.trim().length > 0);
          if (validOpts.length > 0) {
            fullContent += `\n\n📊 Encuesta (${p.poll.duration}):\n` + validOpts.map((o) => `• ${o}`).join('\n');
          }
        }

        // Anexar ubicación si existe
        if (p.location) {
          fullContent += `\n\n📍 ${p.location}`;
        }

        // Anexar Espacio de audio si existe
        if (p.spaceConfig) {
          fullContent += `\n\n🎙️ Espacio: "${p.spaceConfig.title}" (${p.spaceConfig.scheduledAt ? `Programado: ${p.spaceConfig.scheduledAt}` : 'En directo'})`;
        }

        // El GIF va DENTRO del post (entre el contenido), NUNCA en el banner
        if (p.gifUrl) {
          fullContent += `\n\n![GIF](${p.gifUrl})`;
        }

        // Imágenes adicionales dentro del post
        if (p.images.length > 0) {
          p.images.forEach((img) => {
            fullContent += `\n\n![Imagen](${img})`;
          });
        }

        const cleanText = p.text.trim();
        const rawTitle = cleanText.split('\n')[0] || (p.spaceConfig?.title ?? 'Publicación');
        const title = rawTitle.length >= 10 ? rawTitle.slice(0, 80) : `${rawTitle} (Actualización)`;
        // Summary limpio de metadatos (evita duplicar el contenido del post)
        const summary = cleanText.length > 80 ? cleanText.slice(0, 120) + '...' : `Publicado por @${me?.username ?? 'autor'}`;

        await createPost.mutateAsync({
          categoryId: catId,
          title,
          summary,
          content: fullContent.length >= 50 ? fullContent : `${fullContent}\n\n[Publicado desde 4readers móvil]`,
          // El banner es SOLO para fotos reales de portada, NUNCA para GIFs
          coverImageUrl: p.images.length > 0 ? p.images[0] : undefined,
        });
      }

      toast.success(posts.length > 1 ? '¡Hilo publicado con éxito!' : '¡Publicado con éxito!');
      router.navigate('/');
    } catch {
      toast.error('No se pudo publicar. Revisa los datos.');
    }
  };

  const screenBg = isDark ? '#000000' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0F1419';
  const textSecondary = '#71767B';
  const lineCol = isDark ? '#2F3336' : '#CFD9DE';

  const audienceInfo = useMemo<{ label: string; icon: keyof typeof Feather.glyphMap }>(() => {
    switch (audience) {
      case 'verified':
        return { label: 'Solo cuentas verificadas pueden responder', icon: 'check-circle' };
      case 'following':
        return { label: 'Las cuentas que sigues pueden responder', icon: 'user-check' };
      case 'mentioned':
        return { label: 'Solo las personas mencionadas pueden responder', icon: 'at-sign' };
      case 'following_of_following':
        return { label: 'Cuentas a las que sigues y siguen pueden responder', icon: 'users' };
      default:
        return { label: 'Cualquier persona puede responder', icon: 'globe' };
    }
  }, [audience]);

  return (
    <View style={[{ flex: 1, backgroundColor: screenBg, paddingTop: Math.max(top, 10) }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Cabecera estilo X: [X] a la izquierda, [Publicar] azul redondeado a la derecha */}
        <View style={s.topHeader}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={24} color={textPrimary} />
          </Pressable>

          <View style={s.headerRightSide}>
            <Pressable
              onPress={() => router.push('/post/article')}
              style={({ pressed }) => [
                s.articleModeBtn,
                { borderColor: lineCol, backgroundColor: isDark ? '#16181C' : '#F7F9F9' },
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Escribir artículo con formato enriquecido"
            >
              <Feather name="file-text" size={13} color="#1D9BF0" />
              <Text style={[s.articleModeBtnText, { color: textPrimary }]}>Artículo</Text>
            </Pressable>

            <Pressable
              onPress={handlePublish}
              disabled={!hasContent || isSubmitting}
              style={({ pressed }) => [
                s.publishBtn,
                (!hasContent || isSubmitting) && s.publishBtnDisabled,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Publicar"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={s.publishBtnText}>
                  {posts.length > 1 ? 'Publicar todo' : 'Publicar'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Lista de posts conectados (Threads) */}
        <ScrollView
          ref={scrollRef}
          style={s.scrollView}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {posts.map((postItem, idx) => {
            const isLast = idx === posts.length - 1;

            return (
              <View key={postItem.id} style={s.postRowWrapper}>
                {/* Columna Izquierda: Avatar y línea conectora del hilo */}
                <View style={s.avatarColumn}>
                  <Avatar
                    name={me?.username ?? 'Tú'}
                    avatarUrl={me?.avatarUrl}
                    size={40}
                  />
                  {!isLast && <View style={[s.threadLine, { backgroundColor: lineCol }]} />}
                </View>

                {/* Columna Derecha: Entrada de texto, adjuntos y herramientas */}
                <View style={s.contentColumn}>
                  {posts.length > 1 && (
                    <View style={s.threadHeaderInfo}>
                      <Text style={s.threadIndexText}>Post {idx + 1} de {posts.length}</Text>
                      {idx > 0 && (
                        <Pressable
                          onPress={() => removeThreadPost(idx)}
                          hitSlop={8}
                          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                        >
                          <Feather name="x" size={16} color="#71767B" />
                        </Pressable>
                      )}
                    </View>
                  )}

                  {/* TextInput principal: ¿Qué está pasando? (Imagen 2 y 4) */}
                  <TextInput
                    value={postItem.text}
                    onChangeText={(t) =>
                      updateActivePost((p) => ({ ...p, text: t }))
                    }
                    onFocus={() => setFocusedIndex(idx)}
                    autoFocus={idx === 0}
                    multiline
                    maxLength={maxChars}
                    placeholder={idx === 0 ? '¿Qué está pasando?' : 'Añade otro post...'}
                    placeholderTextColor={textSecondary}
                    style={[s.mainTextInput, { color: textPrimary }]}
                  />

                  {/* Tarjeta violeta de Espacio de Audio (Imagen 4) */}
                  {postItem.spaceConfig && (
                    <View style={s.purpleSpaceCard}>
                      <View style={s.spaceHostRow}>
                        <View style={s.spaceHostAvatarWrap}>
                          {me?.avatarUrl ? (
                            <Image source={{ uri: me.avatarUrl }} style={s.spaceHostAvatarImg} />
                          ) : (
                            <Feather name="user" size={13} color="#FFFFFF" />
                          )}
                        </View>
                        <Text style={s.spaceHostNameText} numberOfLines={1}>
                          {me?.username || 'John Ripper'}
                        </Text>
                        <View style={s.spaceHostBadge}>
                          <Text style={s.spaceHostBadgeText}>Anfitrión</Text>
                        </View>
                        <View style={{ flex: 1 }} />
                        <Pressable
                          onPress={() => updateActivePost((p) => ({ ...p, spaceConfig: null }))}
                          hitSlop={8}
                          style={s.removeSpaceBtn}
                          accessibilityLabel="Quitar Espacio"
                        >
                          <Feather name="x" size={14} color="#FFFFFF" />
                        </Pressable>
                      </View>

                      <Text style={s.purpleSpaceTitle}>
                        {postItem.spaceConfig.title || 'Tu Espacio'}
                      </Text>

                      <View style={s.spaceTimeRow}>
                        <Feather name="calendar" size={14} color="#FFFFFF" />
                        <Text style={s.spaceTimeText}>
                          {postItem.spaceConfig.scheduledAt || 'Hoy a las 7:00 a. m.'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Previsualización de imágenes adjuntas (1 a 4) */}
                  {postItem.images.length > 0 && (
                    <View
                      style={[
                        s.imagesGrid,
                        postItem.images.length > 1 && s.imagesGridMulti,
                      ]}
                    >
                      {postItem.images.map((imgUri, imgIdx) => (
                        <View
                          key={imgUri + imgIdx}
                          style={[
                            s.imageBox,
                            postItem.images.length === 1 && s.imageBoxSingle,
                            postItem.images.length > 1 && s.imageBoxHalf,
                          ]}
                        >
                          <Image source={{ uri: imgUri }} style={s.attachedImage} />
                          <Pressable
                            onPress={() => {
                              updateActivePost((p) => ({
                                ...p,
                                images: p.images.filter((_, i) => i !== imgIdx),
                              }));
                            }}
                            style={s.removeImageBtn}
                            hitSlop={6}
                          >
                            <Feather name="x" size={14} color="#FFFFFF" />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Previsualización de GIF */}
                  {postItem.gifUrl && (
                    <View style={s.gifPreviewBox}>
                      <Image source={{ uri: postItem.gifUrl }} style={s.gifPreviewImg} />
                      <View style={s.gifBadge}>
                        <Text style={s.gifBadgeText}>GIF</Text>
                      </View>
                      <Pressable
                        onPress={() => updateActivePost((p) => ({ ...p, gifUrl: undefined }))}
                        style={s.removeImageBtn}
                      >
                        <Feather name="x" size={14} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  )}

                  {/* Previsualización de Ubicación */}
                  {postItem.location && (
                    <View style={s.locationChip}>
                      <Feather name="map-pin" size={13} color="#1D9BF0" />
                      <Text style={s.locationChipText}>{postItem.location}</Text>
                      <Pressable
                        onPress={() => updateActivePost((p) => ({ ...p, location: undefined }))}
                        hitSlop={6}
                      >
                        <Feather name="x" size={13} color="#71767B" />
                      </Pressable>
                    </View>
                  )}

                  {/* Editor de Encuesta (Imagen 2) */}
                  {postItem.poll && (
                    <PollEditor
                      poll={postItem.poll}
                      onChange={(updated) => updateActivePost((p) => ({ ...p, poll: updated }))}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Contenedor inferior de herramientas: Fijado firmemente sobre el teclado (Imagen 4) */}
        <View style={{ paddingBottom: isKeyboardVisible ? 0 : Math.max(bottom, 8) }}>
          {/* Selector de audiencia: "Cualquier persona puede responder" (Imagen 2 y 4) */}
          <View style={s.audienceRow}>
            <Pressable
              onPress={() => setShowAudienceModal(true)}
              style={({ pressed }) => [s.audienceBtn, pressed && { opacity: 0.7 }]}
            >
              <Feather name={audienceInfo.icon} size={15} color="#1D9BF0" />
              <Text style={s.audienceText}>{audienceInfo.label}</Text>
            </Pressable>
          </View>

          {/* Barra inferior de herramientas (Imagen 4) */}
          <View style={[s.toolbarContainer, { borderTopColor: lineCol }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.toolbarScroll}
            >
              {/* 1. Galería de imágenes (Deshabilitada si hay Espacio o texto lleno, Imagen 4) */}
              <Pressable
                onPress={isMediaDisabled ? undefined : handlePickImages}
                disabled={isMediaDisabled}
                hitSlop={8}
                style={({ pressed }) => [s.toolBtn, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Añadir imágenes"
              >
                <Feather
                  name="image"
                  size={21}
                  color={isMediaDisabled ? '#536471' : '#1D9BF0'}
                />
              </Pressable>

              {/* 2. Capturar con Cámara (Deshabilitada si hay Espacio, Imagen 4) */}
              <Pressable
                onPress={isMediaDisabled ? undefined : handleTakePhoto}
                disabled={isMediaDisabled}
                hitSlop={8}
                style={({ pressed }) => [s.toolBtn, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Capturar con la cámara"
              >
                <Feather
                  name="camera"
                  size={21}
                  color={isMediaDisabled ? '#536471' : '#1D9BF0'}
                />
              </Pressable>

              {/* 3. Voces / Espacio de audio (Deshabilitado si ya hay espacio o media, Imagen 4) */}
              <Pressable
                onPress={isSpaceDisabled ? undefined : () => setShowSpacesModal(true)}
                disabled={isSpaceDisabled}
                hitSlop={8}
                style={({ pressed }) => [s.toolBtn, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Crear un Espacio de voz"
              >
                <View style={s.liveIconWrap}>
                  <MaterialCommunityIcons
                    name="broadcast"
                    size={21}
                    color={isSpaceDisabled ? '#536471' : '#1D9BF0'}
                  />
                </View>
              </Pressable>

              {/* 4. GIFs (Deshabilitado si hay Espacio, Imagen 4) */}
              <Pressable
                onPress={isMediaDisabled ? undefined : () => setShowGifModal(true)}
                disabled={isMediaDisabled}
                hitSlop={8}
                style={({ pressed }) => [s.toolBtn, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Añadir GIF"
              >
                <View style={[s.gifPill, isMediaDisabled && { borderColor: '#536471' }]}>
                  <Text style={[s.gifPillText, isMediaDisabled && { color: '#536471' }]}>GIF</Text>
                </View>
              </Pressable>

              {/* 5. Listas / Encuestas (Deshabilitado si hay Espacio, Imagen 4) */}
              <Pressable
                onPress={isMediaDisabled ? undefined : handleTogglePoll}
                disabled={isMediaDisabled}
                hitSlop={8}
                style={({ pressed }) => [s.toolBtn, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Añadir encuesta"
              >
                <Feather
                  name="bar-chart-2"
                  size={21}
                  color={isMediaDisabled ? '#536471' : '#1D9BF0'}
                />
              </Pressable>

              {/* 6. Insertar ubicaciones (SIEMPRE DISPONIBLE en Imagen 4) */}
              <Pressable
                onPress={() => setShowLocationModal(true)}
                hitSlop={8}
                style={({ pressed }) => [s.toolBtn, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Insertar ubicación"
              >
                <Feather name="map-pin" size={21} color="#1D9BF0" />
              </Pressable>

              {/* 7. Flag / Categoría (Deshabilitado si hay Espacio, Imagen 4) */}
              <Pressable
                onPress={
                  isMediaDisabled
                    ? undefined
                    : () => {
                        const curIdx = categories.findIndex((c) => c.id === selectedCategoryId);
                        const nextCat = categories[(curIdx + 1) % (categories.length || 1)];
                        if (nextCat) {
                          setSelectedCategoryId(nextCat.id);
                          toast.info(`Categoría: ${nextCat.name}`);
                        }
                      }
                }
                disabled={isMediaDisabled}
                hitSlop={8}
                style={({ pressed }) => [s.toolBtn, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Elegir categoría o flag"
              >
                <Feather
                  name="flag"
                  size={20}
                  color={isMediaDisabled ? '#536471' : '#1D9BF0'}
                />
              </Pressable>
            </ScrollView>

            {/* Lado derecho: Indicador circular (Imagen 3) y Conectar posts (+) */}
            <View style={s.toolbarRightSide}>
              {/* Indicador circular de caracteres según plan Freemium vs Premium (Imagen 3) */}
              <CircularProgressMeter progress={progress} charsLeft={charsLeft} />

              <View style={[s.verticalDivider, { backgroundColor: lineCol }]} />

              {/* Botón (+) Conectar varios posts (Hilo / Threads, siempre activo) */}
              <Pressable
                onPress={addThreadPost}
                hitSlop={8}
                style={({ pressed }) => [s.toolBtn, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Conectar otro post a este hilo"
              >
                <Feather name="plus-circle" size={24} color="#1D9BF0" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* MODALES ADJUNTOS */}
        <AudienceModal
          visible={showAudienceModal}
          selected={audience}
          onSelect={setAudience}
          onClose={() => setShowAudienceModal(false)}
        />

        <SpacesModal
          visible={showSpacesModal}
          onClose={() => setShowSpacesModal(false)}
          onConfirm={(config) => {
            updateActivePost((p) => {
              const spaceLink = config.spaceUrl || 'https://x.com/i/spaces/1broAmaIEnPMBL';
              const reminderText = `Definir un recordatorio para mi próximo Espacio.\n${spaceLink}`;
              return {
                ...p,
                spaceConfig: config,
                text: config.shouldPostAnnouncement
                  ? reminderText
                  : (p.text.trim() ? p.text : reminderText),
              };
            });
          }}
        />

        <GifModal
          visible={showGifModal}
          onClose={() => setShowGifModal(false)}
          onSelectGif={(url) => updateActivePost((p) => ({ ...p, gifUrl: url }))}
        />

        <LocationModal
          visible={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onSelectLocation={(loc) => updateActivePost((p) => ({ ...p, location: loc }))}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingVertical: space.sm,
  },
  headerRightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  articleModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  articleModeBtnText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  publishBtn: {
    backgroundColor: '#1D9BF0',
    paddingHorizontal: 18,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: gutter,
    paddingTop: space.sm,
    paddingBottom: 20,
  },
  postRowWrapper: {
    flexDirection: 'row',
    marginBottom: space.md,
  },
  avatarColumn: {
    alignItems: 'center',
    width: 44,
    marginRight: 10,
  },
  threadLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
    borderRadius: 1,
  },
  contentColumn: {
    flex: 1,
    paddingTop: 2,
  },
  threadHeaderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  threadIndexText: {
    fontSize: 12,
    color: '#71767B',
    fontFamily: fonts.medium,
  },
  mainTextInput: {
    fontSize: 18,
    fontFamily: fonts.regular,
    lineHeight: 24,
    minHeight: 60,
    textAlignVertical: 'top',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  purpleSpaceCard: {
    backgroundColor: '#7C5CFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  spaceHostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  spaceHostAvatarWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  spaceHostAvatarImg: {
    width: '100%',
    height: '100%',
  },
  spaceHostNameText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: fonts.bold,
    marginRight: 8,
  },
  spaceHostBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  spaceHostBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  removeSpaceBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleSpaceTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: fonts.bold,
    marginBottom: 10,
  },
  spaceTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spaceTimeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  imagesGrid: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: 10,
    gap: 6,
  },
  imagesGridMulti: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageBox: {
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#16181C',
  },
  imageBoxSingle: {
    width: '100%',
    height: 220,
  },
  imageBoxHalf: {
    width: '48.5%',
    height: 140,
  },
  attachedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifPreviewBox: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: '#16181C',
  },
  gifPreviewImg: {
    width: '100%',
    height: '100%',
  },
  gifBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gifBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(29, 155, 240, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginTop: 8,
  },
  locationChipText: {
    fontSize: 13,
    color: '#1D9BF0',
    fontFamily: fonts.medium,
  },
  audienceRow: {
    paddingHorizontal: gutter,
    paddingVertical: 8,
  },
  audienceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  audienceText: {
    fontSize: 14,
    color: '#1D9BF0',
    fontFamily: fonts.bold,
  },
  toolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolbarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toolBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifPill: {
    borderWidth: 1.5,
    borderColor: '#1D9BF0',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifPillText: {
    color: '#1D9BF0',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  toolbarRightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8,
  },
  verticalDivider: {
    width: 1,
    height: 22,
  },
});
