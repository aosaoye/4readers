import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCategories, useCreatePost } from '@/api/hooks';
import { BlogEditor, type BlogEditorOutput } from '@/components/post';
import { usePostDraft } from '@/lib/drafts';
import {
  Button,
  Chip,
  Field,
  fonts,
  Screen,
  Text,
  toast,
  useTheme,
} from '@/ui';

export default function ArticleScreen() {
  const { colors, spacing, radius, isDark } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data ?? [];
  const createPostMutation = useCreatePost();

  const {
    initialDraft,
    isLoaded,
    saveStatus,
    lastSavedAt,
    saveDraft,
    clearDraft,
  } = usePostDraft(800);

  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [seedHtml, setSeedHtml] = useState('');
  const [editorData, setEditorData] = useState<BlogEditorOutput>({
    html: '',
    plainText: '',
    wordCount: 0,
    readingTimeMinutes: 1,
  });

  // Hidratar el formulario cuando se lee AsyncStorage
  useEffect(() => {
    if (isLoaded && initialDraft) {
      if (initialDraft.title) setTitle(initialDraft.title);
      if (initialDraft.html) setSeedHtml(initialDraft.html);
      setEditorData((prev) => ({
        ...prev,
        html: initialDraft.html || '',
        plainText: initialDraft.plainText || '',
      }));
    }
  }, [isLoaded, initialDraft]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    saveDraft({
      title: newTitle,
      html: editorData.html,
      plainText: editorData.plainText,
    });
  };

  const handleEditorChange = (data: BlogEditorOutput) => {
    setEditorData(data);
    saveDraft({
      title,
      html: data.html,
      plainText: data.plainText,
    });
  };

  const handleDiscardDraft = () => {
    Alert.alert(
      'Descartar borrador',
      '¿Seguro que quieres borrar todo el contenido guardado localmente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: async () => {
            await clearDraft();
            setTitle('');
            setSeedHtml('<p></p>');
            setEditorData({
              html: '',
              plainText: '',
              wordCount: 0,
              readingTimeMinutes: 1,
            });
            toast.info('Borrador descartado');
          },
        },
      ]
    );
  };

  const handlePublish = () => {
    if (!title.trim() || !editorData.plainText.trim()) {
      Alert.alert(
        'Campos incompletos',
        'Añade un título y desarrolla el contenido del artículo antes de publicar.'
      );
      return;
    }

    createPostMutation.mutate(
      {
        title: title.trim(),
        content: editorData.html,
        summary: editorData.plainText.slice(0, 200),
        categoryId: selectedCategoryId || undefined,
      } as any,
      {
        onSuccess: async () => {
          await clearDraft();
          toast.success('¡Artículo publicado con éxito!');
          router.back();
        },
        onError: (err: any) => {
          Alert.alert('Error al publicar', err?.message ?? 'Inténtalo de nuevo.');
        },
      }
    );
  };

  if (!isLoaded) {
    return (
      <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  const timeString = lastSavedAt
    ? lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <Screen edges={['top']} style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Barra superior de navegación */}
        <View
          style={[
            s.topBar,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
              paddingTop: Math.max(top, 8),
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [s.navBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>

          <View style={s.topTitleCol}>
            <Text variant="heading" style={{ color: colors.text }}>
              Editor de Artículos
            </Text>
            <Text variant="xs" style={{ color: colors.textMuted }}>
              {saveStatus === 'saving'
                ? 'Guardando borrador...'
                : saveStatus === 'saved' && timeString
                ? `Guardado a las ${timeString}`
                : 'Autoguardado local activo'}
            </Text>
          </View>

          {title.trim() || editorData.plainText.trim() ? (
            <Pressable
              onPress={handleDiscardDraft}
              hitSlop={8}
              style={({ pressed }) => [
                s.discardBtn,
                { backgroundColor: colors.dangerSoft },
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Limpiar borrador"
            >
              <Text variant="xs" weight="600" tone="danger">
                Limpiar
              </Text>
            </Pressable>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          contentContainerStyle={{
            padding: spacing.md,
            paddingBottom: Math.max(bottom, spacing.xl) + 40,
            gap: spacing.md,
          }}
        >
          {/* Campo Título */}
          <Field
            label="Título del artículo"
            placeholder="Escribe un titular claro y atractivo..."
            value={title}
            onChangeText={handleTitleChange}
          />

          {/* Selector de Categoría (opcional) */}
          {categories.length > 0 && (
            <View style={{ gap: spacing.xs }}>
              <Text variant="sm" weight="500" tone="secondary">
                Tema / Categoría
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.xs }}
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <Chip
                      key={cat.id}
                      label={cat.name}
                      active={isSelected}
                      onPress={() =>
                        setSelectedCategoryId(isSelected ? '' : cat.id)
                      }
                    />
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Editor enriquecido BlogEditor con TipTap */}
          <View style={{ gap: spacing.xs }}>
            <Text variant="sm" weight="500" tone="secondary">
              Contenido enriquecido
            </Text>
            <BlogEditor
              initialHtml={seedHtml}
              postTitle={title}
              onChange={handleEditorChange}
              minHeight={380}
              allowPdfExport={true}
            />
          </View>

          {/* Botón de Publicar */}
          <View style={{ marginTop: spacing.sm }}>
            <Button
              label="Publicar artículo"
              loading={createPostMutation.isPending}
              onPress={handlePublish}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  topBar: {
    height: 60,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleCol: {
    flex: 1,
    alignItems: 'center',
  },
  discardBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
});
