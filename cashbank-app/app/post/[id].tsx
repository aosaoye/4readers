import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthor, useFollowAuthor, useMe, usePost, useUnfollowAuthor } from '@/api/hooks';
import { PostEngagementBar, PremiumUnlockPanel, TipPanel, VerificationPanel } from '@/components';
import { API_URL } from '@/config';
import { useIsBookmarked, useToggleBookmark } from '@/lib/bookmarks';
import { formatDate, postStatusLabel, readingMinutes, verificationLabel } from '@/lib/format';
import { parseRepost } from '@/lib/reposts';
import {
  Avatar,
  Badge,
  Button,
  Card,
  colors,
  Cover,
  ErrorState,
  fonts,
  FormScrollContext,
  IconButton,
  isDark,
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
} from '@/ui';

export default function PostDetail() {
  const { id, fromAuthor } = useLocalSearchParams<{ id: string; fromAuthor?: string }>();
  const { top } = useSafeAreaInsets();
  const { data: post, isPending, error, refetch } = usePost(id);
  const me = useMe().data;
  const saved = useIsBookmarked(id);
  const toggle = useToggleBookmark();
  const [scrolled, setScrolled] = useState(false);
  const { scrollRef, kbHeight, ensureVisible, trackScroll } = useKeyboardScroll();

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

  return (
    <FormScrollContext.Provider value={{ ensureVisible }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar style={scrolled && !isDark ? 'dark' : 'light'} />
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
          <Cover seed={post.categoryId} imageUrl={post.coverImageUrl} style={{ height: 320 }} />

          <Sheet style={{ marginTop: -32, gap: space.xl, paddingTop: 28 }}>
            {repostMeta?.isRepost && repostMeta.repostedBy && (
              <Pressable
                onPress={() => router.navigate(`/author/${repostMeta.repostedBy}`)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Feather name="repeat" size={14} color={colors.success} />
                <Text variant="caption" style={{ color: colors.success, fontFamily: fonts.semibold }}>
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

            <Text variant="title">{post.title}</Text>

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
                    <Text variant="heading" numberOfLines={1} style={{ fontSize: 16, flexShrink: 1 }}>
                      {authorUsername || 'Autor'}
                    </Text>
                    {post.isVerified && <Feather name="check-circle" size={15} color={colors.success} />}
                  </View>
                  <Text variant="caption">{formatDate(post.publishedAt ?? post.createdAt)}</Text>
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
                  style={s.webBtn}
                >
                  <Feather name="external-link" size={16} color={colors.ink} />
                </Pressable>
              </View>
            </View>

            {/* Franja de metadatos reales del artículo (lectura, fuentes, confianza) */}
            <View style={s.metricsStrip}>
              <View style={s.metricBox}>
                <Text variant="caption">Lectura</Text>
                <Text variant="label">{mins} min</Text>
              </View>
              <View style={s.metricSep} />
              <View style={s.metricBox}>
                <Text variant="caption">Fuentes</Text>
                <Text variant="label">{post.sources.length}</Text>
              </View>
              <View style={s.metricSep} />
              <View style={s.metricBox}>
                <Text variant="caption">Confianza</Text>
                <Text variant="label" style={{ color: post.isVerified ? colors.success : colors.ink }}>
                  {verifiedVerdict ? `${verifiedVerdict.trustScore}/100` : post.isVerified ? 'Verificado' : '–'}
                </Text>
              </View>
            </View>

            <View style={{ gap: space.lg }}>
              <Text variant="heading" style={{ fontSize: 18, lineHeight: 26 }}>
                {repostMeta?.cleanSummary ?? post.summary}
              </Text>
              {post.isLocked ? (
                <PremiumUnlockPanel post={post} />
              ) : (
                <Text variant="body" style={{ lineHeight: 25 }} selectable>
                  {post.content}
                </Text>
              )}
            </View>

            {isMyPost ? (
              <VerificationPanel post={post} />
            ) : (
              post.status === 'PUBLISHED' && !post.isLocked && <TipPanel post={post} />
            )}

            {post.sources.length > 0 && (
              <Section title={`Fuentes verificables (${post.sources.length})`}>
                <Card style={{ paddingHorizontal: 0, paddingVertical: space.xs }}>
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
                    <Card key={v.id} style={{ gap: space.sm }}>
                      <Text variant="label">Confianza: {v.trustScore}/100</Text>
                      <Text variant="body">{v.notes}</Text>
                    </Card>
                  ))}
              </Section>
            )}

            {post.status === 'PUBLISHED' && <PostEngagementBar post={post} />}
          </Sheet>
        </ScrollView>

        {/* Cabecera dinámica con botón atrás siempre visible */}
        <View
          style={[
            s.topHeaderWrap,
            { paddingTop: top },
            scrolled && s.topHeaderScrolled,
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
  },
  topHeaderScrolled: {
    backgroundColor: colors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
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
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricSep: {
    width: 1,
    height: 28,
    backgroundColor: colors.line,
  },
});
