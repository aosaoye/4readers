import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useAuthor,
  useFollowAuthor,
  useMe,
  usePost,
  useUnfollowAuthor,
} from '@/api/hooks';
import {
  CommentsSection,
  PostEngagementBar,
  PremiumUnlockPanel,
  TipPanel,
  VerificationPanel,
} from '@/components';
import { API_URL } from '@/config';
import { useIsBookmarked, useToggleBookmark } from '@/lib/bookmarks';
import { formatDate, postStatusLabel, readingMinutes, verificationLabel } from '@/lib/format';
import { parseRepost } from '@/lib/reposts';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Cover,
  ErrorState,
  fonts,
  FormScrollContext,
  IconButton,
  ListRow,
  NavHeader,
  radius,
  Screen,
  Section,
  Sheet,
  space,
  Spinner,
  Text,
  useKeyboardScroll,
  useTheme,
} from '@/ui';

/**
 * Renderizador de contenido que permite insertar GIFs e imágenes DENTRO del post,
 * chips de ubicación, tarjetas de espacio y encuestas sin duplicar texto.
 */
function PostContentRenderer({
  content,
  isDark,
  textPrimary,
  subtleBg,
  borderColor,
}: {
  content: string;
  isDark: boolean;
  textPrimary: string;
  subtleBg: string;
  borderColor: string;
}) {
  const lines = content.split('\n');

  return (
    <View style={{ gap: 12 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // 1. Detectar GIF o Imagen con formato ![GIF](url) o ![Imagen](url)
        const mediaMatch = trimmed.match(/^!\[(GIF|Imagen|image|.*?)\]\((https?:\/\/[^\s\)]+)\)$/i);
        if (mediaMatch) {
          const type = mediaMatch[1].toUpperCase();
          const uri = mediaMatch[2];
          const isGif = type.includes('GIF') || uri.toLowerCase().includes('.gif');

          return (
            <View key={idx} style={[s.inlineMediaCard, { backgroundColor: subtleBg, borderColor }]}>
              <Image source={{ uri }} style={s.inlineMediaImg} resizeMode="cover" />
              {isGif && (
                <View style={s.inlineGifBadge}>
                  <Text style={s.inlineGifBadgeText}>GIF</Text>
                </View>
              )}
            </View>
          );
        }

        // 2. URL de imagen o GIF suelta
        if (/^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)(\?[^\s]*)?$/i.test(trimmed)) {
          const isGif = trimmed.toLowerCase().includes('.gif');
          return (
            <View key={idx} style={[s.inlineMediaCard, { backgroundColor: subtleBg, borderColor }]}>
              <Image source={{ uri: trimmed }} style={s.inlineMediaImg} resizeMode="cover" />
              {isGif && (
                <View style={s.inlineGifBadge}>
                  <Text style={s.inlineGifBadgeText}>GIF</Text>
                </View>
              )}
            </View>
          );
        }

        // 3. Etiqueta de ubicación
        if (trimmed.startsWith('📍')) {
          return (
            <View key={idx} style={[s.inlineLocationTag, { backgroundColor: isDark ? '#16181C' : '#EFF3F4' }]}>
              <Feather name="map-pin" size={14} color="#1D9BF0" />
              <Text style={[s.inlineLocationText, { color: textPrimary }]}>{trimmed.replace(/^📍\s*/, '')}</Text>
            </View>
          );
        }

        // 4. Tarjeta de Espacio de voz
        if (trimmed.startsWith('🎙️')) {
          return (
            <View key={idx} style={[s.inlineSpaceCard, { backgroundColor: isDark ? '#201633' : '#F5F3FF', borderColor: '#7856FF' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="radio" size={16} color="#7856FF" />
                <Text style={s.inlineSpaceTagText}>ESPACIO DE AUDIO</Text>
              </View>
              <Text style={[s.inlineSpaceTitle, { color: textPrimary }]}>{trimmed.replace(/^🎙️\s*/, '')}</Text>
            </View>
          );
        }

        // 5. Encuesta / Lista
        if (trimmed.startsWith('📊 Encuesta') || trimmed.startsWith('•')) {
          return (
            <View key={idx} style={[s.inlinePollCard, { backgroundColor: subtleBg, borderColor }]}>
              <Text style={{ fontSize: 14, color: textPrimary, fontFamily: fonts.medium }}>{trimmed}</Text>
            </View>
          );
        }

        // 6. Texto regular
        return (
          <Text key={idx} variant="body" style={[s.bodyText, { color: textPrimary }]} selectable>
            {trimmed}
          </Text>
        );
      })}
    </View>
  );
}

export default function PostDetail() {
  const { id, fromAuthor } = useLocalSearchParams<{ id: string; fromAuthor?: string }>();
  const { top } = useSafeAreaInsets();
  const { data: post, isPending, error, refetch } = usePost(id);
  const me = useMe().data;
  const saved = useIsBookmarked(id);
  const toggle = useToggleBookmark();
  const [scrolled, setScrolled] = useState(false);
  const { scrollRef, kbHeight, ensureVisible, trackScroll } = useKeyboardScroll();

  // Sistema de tema completamente reactivo (Light / Dark)
  const { isDark, colors: themeColors } = useTheme();

  const screenBg = isDark ? '#000000' : '#FFFFFF';
  const cardBg = isDark ? '#121215' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0F1419';
  const textSecondary = isDark ? '#71767B' : '#536471';
  const borderColor = isDark ? '#2F3336' : '#E2E8F0';
  const subtleBg = isDark ? '#16181C' : '#F7F9F9';

  const repostMeta = post ? parseRepost(post) : null;
  const authorUsername = repostMeta?.originalAuthor ?? post?.authorUsername ?? '';
  const authorQuery = useAuthor(authorUsername);
  const follow = useFollowAuthor(authorUsername);
  const unfollow = useUnfollowAuthor(authorUsername);

  if (!post) {
    return (
      <Screen>
        <NavHeader title="Artículo" />
        {isPending ? <Spinner /> : <ErrorState error={error} onRetry={refetch} />}
      </Screen>
    );
  }

  const [statusText, statusTone] = postStatusLabel[post.status];
  const mins = readingMinutes(post.content);
  const verifiedVerdict = post.verifications?.find((v) => v.verdict === 'VERIFIED');
  const certUrl = `${API_URL}/v/${post.id}`;
  const isMyPost = me?.id === post.authorId;
  const isFollowingAuthor = Boolean(authorQuery.data?.isFollowedByMe);

  const openAuthor = () => {
    if (!authorUsername) return;
    if (fromAuthor === authorUsername && router.canGoBack()) {
      router.back();
      return;
    }
    router.navigate(`/author/${authorUsername}`);
  };

  const sharePost = () =>
    Share.share({
      title: post.title,
      message: `${post.title} · ${certUrl}`,
      url: certUrl,
    });

  // Evitar duplicación de texto entre summary y content
  const cleanSummary = (repostMeta?.cleanSummary ?? post.summary ?? '').trim();
  const cleanContent = (post.content ?? '').trim();
  const isSummaryDuplicate =
    !cleanSummary ||
    cleanSummary === cleanContent ||
    cleanContent.startsWith(cleanSummary) ||
    cleanSummary.includes('Publicado por @') ||
    cleanSummary.includes('📍') ||
    cleanSummary.includes('🎙️') ||
    cleanSummary.includes('![GIF]');

  return (
    <FormScrollContext.Provider value={{ ensureVisible }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: screenBg }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar style={scrolled ? (isDark ? 'light' : 'dark') : 'light'} />
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: kbHeight > 0 ? kbHeight + 140 : space.xxxl }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          scrollEventThrottle={16}
          onScroll={(e) => {
            trackScroll(e);
            const isDown = e.nativeEvent.contentOffset.y > 180;
            if (isDown !== scrolled) setScrolled(isDown);
          }}
        >
          {/* Si el post no tiene portada específica (es un post de feed o tiene GIF adentro), usa altura compacta */}
          <Cover
            seed={post.categoryId}
            imageUrl={post.coverImageUrl}
            style={{ height: post.coverImageUrl ? 300 : 160 }}
          />

          <Sheet style={{ marginTop: -32, gap: space.xl, paddingTop: 28, backgroundColor: cardBg }}>
            {repostMeta?.isRepost && repostMeta.repostedBy && (
              <Pressable
                onPress={() => router.navigate(`/author/${repostMeta.repostedBy}`)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Feather name="repeat" size={14} color={themeColors.success} />
                <Text variant="caption" style={{ color: themeColors.success, fontFamily: fonts.semibold }}>
                  Compartido por @{repostMeta.repostedBy} · Autor original: @{authorUsername}
                </Text>
              </Pressable>
            )}

            {/* Categoría clicable + organización + insignias de estado */}
            <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap', alignItems: 'center' }}>
              {post.categoryName && (
                <Pressable onPress={() => router.navigate(`/category/${post.categoryId}`)}>
                  <Badge label={post.categoryName} tone="accent" />
                </Pressable>
              )}
              {post.organizationName && <Badge label={post.organizationName} />}
              {post.isPremium && (
                <Badge
                  label={
                    post.isLocked ? `Premium · ${post.unlockPriceTokens ?? 0} fichas` : 'Premium desbloqueado'
                  }
                  tone="accent"
                />
              )}
              {post.isVerified ? (
                <Badge label="Verificado" tone="success" />
              ) : isMyPost ? (
                <Badge
                  label={verificationLabel[post.verificationStatus][0]}
                  tone={verificationLabel[post.verificationStatus][1]}
                />
              ) : (
                <Badge label="Sin verificar" />
              )}
              {post.status !== 'PUBLISHED' && <Badge label={statusText} tone={statusTone} />}
            </View>

            <Text variant="title" style={{ color: textPrimary }}>{post.title}</Text>

            {/* Fila de propietario/autor original con botón Seguir / Siguiendo + vista web */}
            <View style={s.authorBar}>
              <Pressable
                disabled={!authorUsername}
                onPress={openAuthor}
                accessibilityRole="button"
                accessibilityLabel={`Ver perfil de ${authorUsername}`}
                style={s.authorLeft}
              >
                <Avatar
                  name={authorUsername || '?'}
                  avatarUrl={authorQuery.data?.avatarUrl}
                  size={46}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text variant="heading" numberOfLines={1} style={{ fontSize: 16, flexShrink: 1, color: textPrimary }}>
                      {authorUsername || 'Autor'}
                    </Text>
                    {post.isVerified && <Feather name="check-circle" size={15} color={themeColors.success} />}
                  </View>
                  <Text variant="caption" style={{ color: textSecondary }}>
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </Text>
                </View>
              </Pressable>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
                {me?.username !== authorUsername && !!authorUsername && (
                  <Button
                    title={isFollowingAuthor ? 'Siguiendo' : 'Seguir'}
                    size="sm"
                    variant={isFollowingAuthor ? 'secondary' : 'primary'}
                    loading={follow.isPending || unfollow.isPending}
                    onPress={() => (isFollowingAuthor ? unfollow.mutate() : follow.mutate())}
                  />
                )}
                <Pressable
                  onPress={() => WebBrowser.openBrowserAsync(certUrl)}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir vista web pública"
                  style={[s.webBtn, { backgroundColor: subtleBg, borderColor }]}
                >
                  <Feather name="external-link" size={16} color={textPrimary} />
                </Pressable>
              </View>
            </View>

            {/* Franja de metadatos adaptativa al tema Light/Dark */}
            <View style={[s.metricsStrip, { backgroundColor: subtleBg, borderColor }]}>
              <View style={s.metricBox}>
                <Text variant="caption" style={{ color: textSecondary }}>Lectura</Text>
                <Text variant="label" style={{ color: textPrimary }}>{mins} min</Text>
              </View>
              <View style={[s.metricSep, { backgroundColor: borderColor }]} />
              <View style={s.metricBox}>
                <Text variant="caption" style={{ color: textSecondary }}>Fuentes</Text>
                <Text variant="label" style={{ color: textPrimary }}>{post.sources.length}</Text>
              </View>
              <View style={[s.metricSep, { backgroundColor: borderColor }]} />
              <View style={s.metricBox}>
                <Text variant="caption" style={{ color: textSecondary }}>Confianza</Text>
                <Text variant="label" style={{ color: post.isVerified ? themeColors.success : textPrimary }}>
                  {verifiedVerdict ? `${verifiedVerdict.trustScore}/100` : post.isVerified ? 'Verificado' : '–'}
                </Text>
              </View>
            </View>

            {/* Contenido del post y GIF/Imágenes entre el contenido */}
            <View style={{ gap: space.lg }}>
              {!isSummaryDuplicate && (
                <Text variant="heading" style={[s.summaryHeading, { color: textPrimary }]}>
                  {cleanSummary}
                </Text>
              )}
              {post.isLocked ? (
                <PremiumUnlockPanel post={post} />
              ) : (
                <PostContentRenderer
                  content={post.content}
                  isDark={isDark}
                  textPrimary={textPrimary}
                  subtleBg={subtleBg}
                  borderColor={borderColor}
                />
              )}
            </View>

            {isMyPost ? (
              <VerificationPanel post={post} />
            ) : (
              post.status === 'PUBLISHED' && !post.isLocked && <TipPanel post={post} />
            )}

            {post.sources.length > 0 && (
              <Section title={`Fuentes verificables (${post.sources.length})`}>
                <Card style={{ paddingHorizontal: 0, paddingVertical: space.xs, backgroundColor: subtleBg, borderColor }}>
                  {post.sources.map((src) => (
                    <ListRow
                      key={src.id}
                      icon="external-link"
                      title={src.title}
                      subtitle={src.publisher}
                      right={src.isReliable ? <Badge label="Fiable" tone="success" /> : undefined}
                      onPress={() => WebBrowser.openBrowserAsync(src.url)}
                    />
                  ))}
                </Card>
              </Section>
            )}

            {post.verifications && post.verifications.length > 0 && (
              <Section
                title="Certificado de verificación"
                action={
                  post.isVerified ? (
                    <Button
                      title="Ver en web"
                      size="sm"
                      variant="secondary"
                      icon="external-link"
                      onPress={() => WebBrowser.openBrowserAsync(certUrl)}
                    />
                  ) : undefined
                }
              >
                {post.verifications
                  .filter((v) => v.verdict === 'VERIFIED')
                  .map((v) => (
                    <Card key={v.id} style={{ gap: space.sm, backgroundColor: subtleBg, borderColor }}>
                      <Text variant="heading" style={{ color: textPrimary }}>
                        Veredicto: Verificado por moderador
                      </Text>
                      {v.notes && <Text variant="caption" style={{ color: textSecondary }}>{v.notes}</Text>}
                    </Card>
                  ))}
              </Section>
            )}

            <PostEngagementBar post={post} />

            <CommentsSection post={post} />
          </Sheet>
        </ScrollView>

        {/* Cabecera dinámica con botón atrás siempre visible */}
        <View
          style={[
            s.topHeaderWrap,
            { paddingTop: top },
            scrolled && {
              backgroundColor: screenBg,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: borderColor,
            },
          ]}
        >
          <NavHeader
            title={post.title}
            onImage={!scrolled}
            right={
              <View style={{ flexDirection: 'row', gap: space.xs, marginLeft: space.xs }}>
                <IconButton
                  name="share-2"
                  tone={scrolled ? 'plain' : 'onImage'}
                  label="Compartir certificado del artículo"
                  onPress={sharePost}
                />
                <IconButton
                  name="bookmark"
                  tone={scrolled ? 'plain' : 'onImage'}
                  active={saved}
                  label={saved ? 'Quitar de guardados' : 'Guardar para después'}
                  onPress={() => toggle.mutate(post)}
                />
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </FormScrollContext.Provider>
  );
}

const s = StyleSheet.create({
  topHeaderWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  authorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flex: 1,
  },
  webBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricSep: {
    width: 1,
    height: 28,
  },
  inlineMediaCard: {
    width: '100%',
    height: 240,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginVertical: 6,
    borderWidth: 1,
    position: 'relative',
  },
  inlineMediaImg: {
    width: '100%',
    height: '100%',
  },
  inlineGifBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  inlineGifBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  inlineLocationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginVertical: 4,
  },
  inlineLocationText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  inlineSpaceCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 12,
    marginVertical: 6,
    gap: 4,
  },
  inlineSpaceTagText: {
    color: '#7856FF',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  inlineSpaceTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  inlinePollCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 10,
    marginVertical: 4,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: fonts.regular,
  },
  summaryHeading: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.medium,
  },
});
