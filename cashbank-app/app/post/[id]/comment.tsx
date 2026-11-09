import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { ApiError } from '@/api/client';
import { useCreateComment, useMe, usePost } from '@/api/hooks';
import { rules } from '@/lib/validation';
import {
  Avatar,
  Banner,
  Button,
  Chip,
  colors,
  Divider,
  fonts,
  gutter,
  IconButton,
  radius,
  Screen,
  space,
  Text,
  toast,
} from '@/ui';

/**
 * Pantalla dedicada para publicar una respuesta o solicitud de corrección (estilo X / Twitter):
 * - Barra superior con botón cerrar (X) a la izquierda y botón "Responder" en píldora a la derecha.
 * - Hilo visual ("En respuesta a @autor") conectado al Avatar del usuario y al TextInput auto-enfocado.
 * - Barra inferior sobre el teclado para adjuntar enlace https:// o marcar como Solicitud de corrección.
 */
export default function ComposeCommentScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const me = useMe().data;
  const post = usePost(id).data;
  const createComment = useCreateComment(id);

  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isCorrection, setIsCorrection] = useState(mode === 'correction');
  const [showSourceInput, setShowSourceInput] = useState(mode === 'correction');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const apiError = createComment.error instanceof ApiError ? createComment.error : null;
  const authorUsername = post?.authorUsername ?? 'autor';

  const submit = () => {
    const trimmed = content.trim();
    const urlTrimmed = sourceUrl.trim();
    if (trimmed.length < 4) {
      setErrorMsg('Tu respuesta debe tener al menos 4 caracteres.');
      return;
    }
    if (isCorrection && !urlTrimmed) {
      setShowSourceInput(true);
      setErrorMsg('Las solicitudes de corrección requieren un enlace https:// oficial de respaldo.');
      return;
    }
    if (urlTrimmed) {
      const urlErr = rules.sourceUrl(urlTrimmed);
      if (urlErr) {
        setErrorMsg(urlErr);
        return;
      }
    }
    setErrorMsg(null);
    createComment.mutate(
      {
        content: trimmed,
        sourceUrl: urlTrimmed || undefined,
        isCorrectionRequest: isCorrection || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Respuesta enviada');
          router.replace({
            pathname: '/post/[id]/comments',
            params: { id },
          });
        },
      },
    );
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Cabecera estilo Twitter: X a la izquierda, Responder a la derecha */}
        <View style={s.topBar}>
          <IconButton
            name="x"
            label="Cancelar y cerrar"
            onPress={() => (router.canGoBack() ? router.back() : router.replace(`/post/${id}`))}
          />
          <Button
            title="Responder"
            size="sm"
            loading={createComment.isPending}
            disabled={content.trim().length < 4}
            onPress={submit}
          />
        </View>
        <Divider />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {apiError && <Banner message={apiError.message} details={apiError.details} />}
          {errorMsg && <Banner tone="warn" message={errorMsg} />}

          {/* Línea de hilo + En respuesta a @autor */}
          <View style={s.replyContextRow}>
            <View style={s.threadLineCol}>
              <View style={s.threadLine} />
            </View>
            <Text variant="caption" style={{ fontSize: 14 }}>
              En respuesta a{' '}
              <Text variant="label" color="accent" style={{ fontSize: 14 }}>
                @{authorUsername}
              </Text>
            </Text>
          </View>

          {/* Avatar a la izquierda + TextInput libre a la derecha */}
          <View style={s.composerRow}>
            <Avatar name={me?.username ?? 'Tú'} avatarUrl={me?.avatarUrl} size={42} />
            <View style={{ flex: 1, gap: space.md }}>
              <TextInput
                value={content}
                onChangeText={(v) => {
                  setContent(v);
                  if (errorMsg) setErrorMsg(null);
                }}
                autoFocus
                multiline
                maxLength={1200}
                placeholder={
                  isCorrection
                    ? 'Explica qué dato debe corregirse y por qué…'
                    : 'Publicar tu respuesta'
                }
                placeholderTextColor={colors.faint}
                style={s.mainInput}
              />

              {(showSourceInput || isCorrection) && (
                <View style={s.sourceBox}>
                  <Feather name="link-2" size={16} color={colors.accent} />
                  <TextInput
                    value={sourceUrl}
                    onChangeText={(v) => {
                      setSourceUrl(v);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    placeholder={
                      isCorrection
                        ? 'https:// fuente oficial verificable (obligatoria)'
                        : 'https:// fuente de respaldo (opcional)'
                    }
                    placeholderTextColor={colors.faint}
                    style={s.sourceInput}
                  />
                  {sourceUrl.length > 0 && (
                    <Pressable onPress={() => setSourceUrl('')} hitSlop={8}>
                      <Feather name="x-circle" size={16} color={colors.muted} />
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Barra de herramientas acoplada sobre el teclado */}
        <Divider />
        <View style={s.bottomToolbar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Pressable
              onPress={() => setShowSourceInput((v) => !v)}
              style={[s.toolBtn, (showSourceInput || !!sourceUrl) && s.toolBtnActive]}
              accessibilityRole="button"
              accessibilityLabel="Añadir enlace de fuente https://"
            >
              <Feather
                name="link-2"
                size={18}
                color={showSourceInput || !!sourceUrl ? colors.accent : colors.ink}
              />
              <Text
                variant="caption"
                style={{
                  color: showSourceInput || !!sourceUrl ? colors.accent : colors.ink,
                  fontFamily: fonts.semibold,
                }}
              >
                Fuente https://
              </Text>
            </Pressable>

            <Chip
              label={isCorrection ? 'Solicitud de corrección' : 'Sugerir corrección'}
              active={isCorrection}
              onPress={() => {
                const next = !isCorrection;
                setIsCorrection(next);
                if (next) setShowSourceInput(true);
              }}
            />
          </View>

          <Text variant="caption">{content.trim().length}/1200</Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  scrollContent: {
    paddingHorizontal: gutter,
    paddingTop: space.sm,
    paddingBottom: space.xxl,
    gap: space.xs,
  },
  replyContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 28,
  },
  threadLineCol: {
    width: 42,
    alignItems: 'center',
  },
  threadLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.line,
    borderRadius: 1,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  mainInput: {
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 26,
    color: colors.ink,
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 6,
  },
  sourceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    height: 44,
  },
  sourceInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
  },
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingVertical: space.sm,
    backgroundColor: colors.surface,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
  },
  toolBtnActive: {
    backgroundColor: colors.accentSoft,
  },
});
