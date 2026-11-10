import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  CoreBridge,
  PlaceholderBridge,
  RichText,
  TenTapStartKit,
  Toolbar,
  useEditorBridge,
} from '@10play/tentap-editor';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCategories, useCreatePost } from '@/api/hooks';
import { usePostDraft } from '@/lib/drafts';
import { fonts, Screen, Text, toast, useTheme } from '@/ui';

export default function ArticleScreen() {
  const { colors, isDark, scheme } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data ?? [];
  const createPostMutation = useCreatePost();

  // Autoguardado con debounce de 800ms
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
  const [stats, setStats] = useState({ words: 0, readingTime: 1, chars: 0 });

  // Modales interactivos
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Detección de teclado para anclar la barra exactamente encima
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

  // CSS inyectado en el WebView TipTap: lienzo continuo a pantalla completa
  const customEditorCSS = useMemo(
    () => `
      * {
        box-sizing: border-box;
      }
      html, body {
        background-color: ${isDark ? '#000000' : '#FFFFFF'};
        color: ${isDark ? '#FFFFFF' : '#0F172A'};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 17px;
        line-height: 1.68;
        margin: 0;
        padding: 8px 20px 48px 20px;
        caret-color: #E4531D;
        min-height: 100%;
      }
      p {
        margin: 0 0 16px 0;
      }
      h1, h2, h3 {
        color: ${isDark ? '#FFFFFF' : '#0F172A'};
        font-weight: 700;
        line-height: 1.3;
        margin: 24px 0 10px 0;
      }
      h1 { font-size: 26px; }
      h2 { font-size: 22px; }
      h3 { font-size: 18px; }
      blockquote {
        border-left: 3px solid #E4531D;
        background-color: ${isDark ? '#16181C' : '#F8FAFC'};
        color: ${isDark ? '#9CA3AF' : '#475569'};
        margin: 16px 0;
        padding: 10px 16px;
        border-radius: 0 8px 8px 0;
        font-style: italic;
      }
      code {
        background-color: ${isDark ? '#1E1F22' : '#F1F5F9'};
        color: #E4531D;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 14.5px;
      }
      pre {
        background-color: ${isDark ? '#16181C' : '#F1F5F9'};
        padding: 14px;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid ${isDark ? '#2F3336' : '#E2E8F0'};
      }
      a {
        color: #1D9BF0;
        text-decoration: underline;
      }
      ul, ol {
        padding-left: 24px;
        margin: 0 0 16px 0;
      }
      li {
        margin-bottom: 6px;
      }
      p.is-editor-empty:first-child::before {
        color: ${isDark ? '#536471' : '#94A3B8'};
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }
    `,
    [isDark]
  );

  // Configuración del tema visual de la Toolbar inferior
  const editorTheme = useMemo(
    () => ({
      toolbar: {
        toolbarBody: {
          backgroundColor: isDark ? '#16181C' : '#F8FAFC',
          borderTopColor: isDark ? '#2F3336' : '#E2E8F0',
          borderBottomColor: isDark ? '#2F3336' : '#E2E8F0',
          borderTopWidth: 1,
          height: 48,
          minWidth: '100%',
        },
        toolbarButton: {
          backgroundColor: isDark ? '#16181C' : '#F8FAFC',
          paddingHorizontal: 8,
          alignItems: 'center',
          justifyContent: 'center',
        },
        icon: {
          tintColor: isDark ? '#FFFFFF' : '#0F172A',
          width: 24,
          height: 24,
        },
        iconActive: {
          tintColor: '#E4531D',
        },
        iconDisabled: {
          tintColor: isDark ? '#536471' : '#CBD5E1',
        },
        iconWrapperActive: {
          backgroundColor: isDark ? 'rgba(228, 83, 29, 0.22)' : '#FCE5DD',
          borderRadius: 6,
        },
        linkBarTheme: {
          addLinkContainer: {
            backgroundColor: isDark ? '#16181C' : '#F8FAFC',
            borderTopColor: isDark ? '#2F3336' : '#E2E8F0',
            borderBottomColor: isDark ? '#2F3336' : '#E2E8F0',
            height: 48,
          },
          linkInput: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#0F172A',
          },
          doneButton: {
            backgroundColor: '#E4531D',
          },
          doneButtonText: {
            color: '#FFFFFF',
          },
        },
      },
    }),
    [isDark]
  );

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    theme: editorTheme as any,
    bridgeExtensions: [
      ...TenTapStartKit,
      PlaceholderBridge.configureExtension({
        placeholder: 'Comienza a escribir tu historia, artículo o guía aquí...',
      }),
      CoreBridge.configureCSS(customEditorCSS),
    ],
    onChange: async () => {
      const [html, plainText] = await Promise.all([
        editor.getHTML(),
        editor.getText(),
      ]);

      const cleanText = (plainText || '').trim();
      const words = cleanText ? cleanText.split(/\s+/).length : 0;
      const readingTime = Math.max(1, Math.ceil(words / 200));

      setStats({
        words,
        readingTime,
        chars: cleanText.length,
      });

      saveDraft({
        title,
        html,
        plainText: cleanText,
      });
    },
  });

  // Hidratar borrador inicial desde AsyncStorage
  useEffect(() => {
    if (isLoaded && initialDraft) {
      if (initialDraft.title) setTitle(initialDraft.title);
      if (initialDraft.html && editor) {
        editor.setContent(initialDraft.html);
      }
      const words = initialDraft.plainText ? initialDraft.plainText.trim().split(/\s+/).length : 0;
      setStats({
        words,
        readingTime: Math.max(1, Math.ceil(words / 200)),
        chars: initialDraft.plainText ? initialDraft.plainText.length : 0,
      });
    }
  }, [isLoaded, initialDraft, editor]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    editor.getHTML().then((html) => {
      editor.getText().then((plainText) => {
        saveDraft({
          title: newTitle,
          html,
          plainText: (plainText || '').trim(),
        });
      });
    });
  };

  // Exportar artículo a PDF profesional
  const handleExportPDF = async () => {
    setShowMoreModal(false);
    setShowInsertModal(false);
    setShowPublishModal(false);

    try {
      const htmlContent = await editor.getHTML();
      const styledDocument = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${title || 'Artículo de 4readers'}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                padding: 48px;
                line-height: 1.7;
                color: #0F172A;
                max-width: 720px;
                margin: 0 auto;
              }
              h1.doc-title {
                font-size: 32px;
                font-weight: 800;
                margin-bottom: 8px;
                border-bottom: 2px solid #E2E8F0;
                padding-bottom: 16px;
                color: #0F172A;
              }
              .meta {
                font-size: 13px;
                color: #64748B;
                margin-bottom: 32px;
              }
              blockquote {
                border-left: 3px solid #E4531D;
                background-color: #F8FAFC;
                padding: 12px 18px;
                color: #475569;
                font-style: italic;
                margin: 18px 0;
                border-radius: 0 8px 8px 0;
              }
              pre, code {
                background-color: #F1F5F9;
                border-radius: 6px;
                padding: 4px 8px;
                font-family: monospace;
              }
              img {
                max-width: 100%;
                border-radius: 8px;
              }
            </style>
          </head>
          <body>
            <h1 class="doc-title">${title || 'Artículo sin título'}</h1>
            <div class="meta">${stats.words} palabras · ~${stats.readingTime} min de lectura · Generado en 4readers</div>
            ${htmlContent}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: styledDocument });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
        });
      }
    } catch {
      toast.error('No se pudo generar el PDF');
    }
  };

  // Descartar borrador
  const handleDiscard = () => {
    Alert.alert(
      'Descartar borrador',
      '¿Seguro que deseas borrar todo el texto y empezar de nuevo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: async () => {
            await clearDraft();
            setTitle('');
            editor.setContent('<p></p>');
            setStats({ words: 0, readingTime: 1, chars: 0 });
            setShowMoreModal(false);
            setShowPublishModal(false);
            toast.info('Borrador descartado');
          },
        },
      ]
    );
  };

  // Publicar artículo a 4readers
  const handlePublish = async () => {
    const [html, plainText] = await Promise.all([
      editor.getHTML(),
      editor.getText(),
    ]);

    const cleanBody = (plainText || '').trim();
    if (!title.trim() || !cleanBody) {
      Alert.alert(
        'Campos incompletos',
        'Añade un título y escribe contenido en el artículo antes de publicar.'
      );
      return;
    }

    createPostMutation.mutate(
      {
        title: title.trim(),
        content: html,
        summary: cleanBody.slice(0, 200),
        categoryId: selectedCategoryId || undefined,
      } as any,
      {
        onSuccess: async () => {
          await clearDraft();
          setShowPublishModal(false);
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
      <Screen style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000000' : '#FFFFFF' }}>
        <ActivityIndicator color="#E4531D" size="large" />
      </Screen>
    );
  }

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const headerIconColor = isDark ? '#FFFFFF' : '#0F172A';
  const screenBg = isDark ? '#000000' : '#FFFFFF';
  const hairlineColor = isDark ? '#2F3336' : '#E2E8F0';

  const timeString = lastSavedAt
    ? lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View style={[s.root, { backgroundColor: screenBg, paddingTop: Math.max(top, 10) }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* CABECERA SUPERIOR IDÉNTICA A LA IMAGEN 2 (Google Docs / Medium style) */}
        <View style={[s.topBar, { borderBottomColor: hairlineColor }]}>
          {/* Botón circular izquierdo: Botón de checkmark estilizado */}
          <Pressable
            onPress={() => setShowPublishModal(true)}
            hitSlop={10}
            style={({ pressed }) => [
              s.circleCheckBtn,
              { backgroundColor: isDark ? '#1D9BF0' : '#1D9BF0' },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Publicar o guardar artículo"
          >
            <Feather name="check" size={20} color="#FFFFFF" />
          </Pressable>

          {/* Iconos de acción a la derecha: Deshacer, Rehacer, +, Comentarios, IA, Más */}
          <View style={s.topActionsRow}>
            {/* Deshacer */}
            <Pressable
              onPress={() => editor.undo()}
              hitSlop={10}
              style={({ pressed }) => [s.actionIconBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="Deshacer"
            >
              <MaterialCommunityIcons name="undo-variant" size={22} color={headerIconColor} />
            </Pressable>

            {/* Rehacer */}
            <Pressable
              onPress={() => editor.redo()}
              hitSlop={10}
              style={({ pressed }) => [s.actionIconBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="Rehacer"
            >
              <MaterialCommunityIcons name="redo-variant" size={22} color={headerIconColor} />
            </Pressable>

            {/* Insertar elementos (+) */}
            <Pressable
              onPress={() => setShowInsertModal(true)}
              hitSlop={10}
              style={({ pressed }) => [s.actionIconBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="Insertar elemento"
            >
              <Feather name="plus" size={23} color={headerIconColor} />
            </Pressable>

            {/* Comentarios / Estadísticas */}
            <Pressable
              onPress={() => setShowStatsModal(true)}
              hitSlop={10}
              style={({ pressed }) => [s.actionIconBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="Estadísticas del artículo"
            >
              <Feather name="message-square" size={20} color={headerIconColor} />
            </Pressable>

            {/* Asistente IA (✨) */}
            <Pressable
              onPress={() => setShowAiModal(true)}
              hitSlop={10}
              style={({ pressed }) => [s.actionIconBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="Asistente de IA"
            >
              <Ionicons name="sparkles" size={20} color={headerIconColor} />
            </Pressable>

            {/* Más opciones (⋮) */}
            <Pressable
              onPress={() => setShowMoreModal(true)}
              hitSlop={10}
              style={({ pressed }) => [s.actionIconBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="Más opciones"
            >
              <Feather name="more-vertical" size={21} color={headerIconColor} />
            </Pressable>
          </View>
        </View>

        {/* LIENZO A PANTALLA COMPLETA CONTINUO: Título + Categoría + Editor TipTap */}
        <View style={s.canvasContainer}>
          {/* Título editorial grande sin bordes, fluido y continuo */}
          <TextInput
            placeholder="Título del artículo"
            placeholderTextColor={isDark ? '#536471' : '#94A3B8'}
            value={title}
            onChangeText={handleTitleChange}
            multiline
            style={[
              s.titleInput,
              {
                color: isDark ? '#FFFFFF' : '#0F172A',
              },
            ]}
          />

          {/* Selector de categoría sutil y discreto estilo pill */}
          <Pressable
            onPress={() => setShowCategoryModal(true)}
            style={({ pressed }) => [
              s.categoryPill,
              {
                backgroundColor: isDark ? '#16181C' : '#F1F5F9',
                borderColor: hairlineColor,
              },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Feather name="tag" size={12} color="#E4531D" />
            <Text style={[s.categoryPillText, { color: isDark ? '#E7E9EA' : '#0F1419' }]}>
              {selectedCategory?.name || 'Añadir tema'}
            </Text>
            <Feather name="chevron-down" size={12} color={isDark ? '#71767B' : '#64748B'} />
          </Pressable>

          {/* Lienzo TipTap continuo a pantalla completa */}
          <View style={s.richTextWrapper} key={scheme}>
            <RichText
              editor={editor}
              style={{
                backgroundColor: screenBg,
                flex: 1,
              }}
            />
          </View>
        </View>

        {/* BARRA DE HERRAMIENTAS INFERIOR ANCLADA EXACTAMENTE SOBRE EL TECLADO (Imagen 2) */}
        <View
          style={[
            s.bottomToolbarWrap,
            {
              backgroundColor: isDark ? '#16181C' : '#F8FAFC',
              borderTopColor: hairlineColor,
              paddingBottom: isKeyboardVisible ? 0 : Math.max(bottom, 6),
            },
          ]}
        >
          <Toolbar editor={editor} hidden={false} />
        </View>
      </KeyboardAvoidingView>

      {/* MODAL 1: PUBLICAR ARTÍCULO */}
      <Modal
        visible={showPublishModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPublishModal(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setShowPublishModal(false)} />
          <View
            style={[
              s.modalSheet,
              {
                backgroundColor: isDark ? '#16181C' : '#FFFFFF',
                paddingBottom: Math.max(bottom, 20) + 10,
              },
            ]}
          >
            <View style={[s.modalHandle, { backgroundColor: isDark ? '#3E4144' : '#CBD5E1' }]} />

            <Text variant="heading" style={[s.sheetTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Publicar artículo
            </Text>
            <Text style={[s.sheetSubtitle, { color: isDark ? '#71767B' : '#64748B' }]}>
              Tu artículo se compartirá en tu perfil y en el feed de lectores de 4readers.
            </Text>

            {/* Resumen de detalles */}
            <View
              style={[
                s.previewCard,
                {
                  backgroundColor: isDark ? '#000000' : '#F8FAFC',
                  borderColor: hairlineColor,
                },
              ]}
            >
              <Text style={[s.previewTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]} numberOfLines={2}>
                {title || 'Artículo sin título'}
              </Text>
              <Text style={[s.previewMeta, { color: isDark ? '#71767B' : '#64748B' }]}>
                {stats.words} palabras · ~{stats.readingTime} min de lectura · {selectedCategory?.name || 'Sin categoría'}
              </Text>
            </View>

            {/* Botón principal Publicar */}
            <Pressable
              onPress={handlePublish}
              disabled={createPostMutation.isPending}
              style={({ pressed }) => [
                s.publishPrimaryBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              {createPostMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={s.publishPrimaryBtnText}>Publicar ahora</Text>
              )}
            </Pressable>

            {/* Guardar borrador y salir */}
            <Pressable
              onPress={() => {
                setShowPublishModal(false);
                toast.info('Borrador guardado localmente');
                router.back();
              }}
              style={({ pressed }) => [
                s.saveDraftBtn,
                { borderColor: hairlineColor },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[s.saveDraftBtnText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Guardar borrador y salir
              </Text>
            </Pressable>

            {/* Exportar a PDF */}
            <Pressable
              onPress={handleExportPDF}
              style={({ pressed }) => [s.textActionBtn, pressed && { opacity: 0.7 }]}
            >
              <Feather name="download" size={16} color="#1D9BF0" style={{ marginRight: 6 }} />
              <Text style={{ color: '#1D9BF0', fontFamily: fonts.medium, fontSize: 14 }}>
                Exportar como PDF
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: SELECTOR DE TEMA / CATEGORÍA */}
      <Modal
        visible={showCategoryModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setShowCategoryModal(false)} />
          <View
            style={[
              s.modalSheet,
              {
                backgroundColor: isDark ? '#16181C' : '#FFFFFF',
                maxHeight: '65%',
                paddingBottom: Math.max(bottom, 20),
              },
            ]}
          >
            <View style={[s.modalHandle, { backgroundColor: isDark ? '#3E4144' : '#CBD5E1' }]} />
            <Text variant="heading" style={[s.sheetTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Seleccionar tema
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      setSelectedCategoryId(isSelected ? '' : cat.id);
                      setShowCategoryModal(false);
                    }}
                    style={({ pressed }) => [
                      s.categoryRow,
                      { borderBottomColor: hairlineColor },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[
                        s.categoryRowText,
                        {
                          color: isSelected ? '#E4531D' : isDark ? '#FFFFFF' : '#0F172A',
                          fontFamily: isSelected ? fonts.bold : fonts.regular,
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {isSelected && <Feather name="check" size={18} color="#E4531D" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: INSERTAR ELEMENTOS (+) */}
      <Modal
        visible={showInsertModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInsertModal(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setShowInsertModal(false)} />
          <View
            style={[
              s.modalSheet,
              {
                backgroundColor: isDark ? '#16181C' : '#FFFFFF',
                paddingBottom: Math.max(bottom, 20),
              },
            ]}
          >
            <View style={[s.modalHandle, { backgroundColor: isDark ? '#3E4144' : '#CBD5E1' }]} />
            <Text variant="heading" style={[s.sheetTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Insertar elemento
            </Text>

            <View style={{ marginTop: 16, gap: 10 }}>
              <Pressable
                onPress={() => {
                  setShowInsertModal(false);
                  editor.toggleBlockquote();
                }}
                style={({ pressed }) => [s.sheetMenuRow, pressed && { opacity: 0.7 }]}
              >
                <Feather name="message-circle" size={20} color="#E4531D" />
                <Text style={[s.sheetMenuRowText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  Cita destacada (Blockquote)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowInsertModal(false);
                  editor.toggleCode();
                }}
                style={({ pressed }) => [s.sheetMenuRow, pressed && { opacity: 0.7 }]}
              >
                <Feather name="code" size={20} color="#E4531D" />
                <Text style={[s.sheetMenuRowText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  Bloque de código
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowInsertModal(false);
                  setShowCategoryModal(true);
                }}
                style={({ pressed }) => [s.sheetMenuRow, pressed && { opacity: 0.7 }]}
              >
                <Feather name="tag" size={20} color="#E4531D" />
                <Text style={[s.sheetMenuRowText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  Cambiar categoría del artículo
                </Text>
              </Pressable>

              <Pressable
                onPress={handleExportPDF}
                style={({ pressed }) => [s.sheetMenuRow, pressed && { opacity: 0.7 }]}
              >
                <Feather name="file-text" size={20} color="#E4531D" />
                <Text style={[s.sheetMenuRowText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  Exportar a PDF
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: ESTADÍSTICAS Y AUTOGUARDADO (💬) */}
      <Modal
        visible={showStatsModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setShowStatsModal(false)} />
          <View
            style={[
              s.modalSheet,
              {
                backgroundColor: isDark ? '#16181C' : '#FFFFFF',
                paddingBottom: Math.max(bottom, 20),
              },
            ]}
          >
            <View style={[s.modalHandle, { backgroundColor: isDark ? '#3E4144' : '#CBD5E1' }]} />
            <Text variant="heading" style={[s.sheetTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Estadísticas del artículo
            </Text>

            <View style={{ marginTop: 16, gap: 12 }}>
              <View style={s.statRow}>
                <Text style={{ color: isDark ? '#71767B' : '#64748B' }}>Palabras:</Text>
                <Text style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontFamily: fonts.bold }}>{stats.words}</Text>
              </View>
              <View style={s.statRow}>
                <Text style={{ color: isDark ? '#71767B' : '#64748B' }}>Caracteres:</Text>
                <Text style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontFamily: fonts.bold }}>{stats.chars}</Text>
              </View>
              <View style={s.statRow}>
                <Text style={{ color: isDark ? '#71767B' : '#64748B' }}>Tiempo de lectura:</Text>
                <Text style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontFamily: fonts.bold }}>~{stats.readingTime} min</Text>
              </View>
              <View style={s.statRow}>
                <Text style={{ color: isDark ? '#71767B' : '#64748B' }}>Autoguardado:</Text>
                <Text style={{ color: '#16A34A', fontFamily: fonts.medium }}>
                  {saveStatus === 'saving'
                    ? 'Guardando...'
                    : timeString
                    ? `Guardado a las ${timeString}`
                    : 'Activo'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: ASISTENTE IA (✨) */}
      <Modal
        visible={showAiModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAiModal(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setShowAiModal(false)} />
          <View
            style={[
              s.modalSheet,
              {
                backgroundColor: isDark ? '#16181C' : '#FFFFFF',
                paddingBottom: Math.max(bottom, 20),
              },
            ]}
          >
            <View style={[s.modalHandle, { backgroundColor: isDark ? '#3E4144' : '#CBD5E1' }]} />
            <Text variant="heading" style={[s.sheetTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Asistente de redacción IA
            </Text>
            <Text style={[s.sheetSubtitle, { color: isDark ? '#71767B' : '#64748B' }]}>
              Herramientas de IA para creadores de 4readers.
            </Text>

            <View style={{ marginTop: 16, gap: 10 }}>
              <Pressable
                onPress={() => {
                  setShowAiModal(false);
                  toast.success('Corrigiendo estilo y ortografía...');
                }}
                style={({ pressed }) => [s.sheetMenuRow, pressed && { opacity: 0.7 }]}
              >
                <MaterialCommunityIcons name="spellcheck" size={20} color="#E4531D" />
                <Text style={[s.sheetMenuRowText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  Corregir ortografía y gramática
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowAiModal(false);
                  toast.success('Generando resumen para el feed...');
                }}
                style={({ pressed }) => [s.sheetMenuRow, pressed && { opacity: 0.7 }]}
              >
                <MaterialCommunityIcons name="text-box-search-outline" size={20} color="#E4531D" />
                <Text style={[s.sheetMenuRowText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  Generar extracto sugerido
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowAiModal(false);
                  toast.success('Sugerencias de titulares creadas');
                }}
                style={({ pressed }) => [s.sheetMenuRow, pressed && { opacity: 0.7 }]}
              >
                <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#E4531D" />
                <Text style={[s.sheetMenuRowText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  Sugerir titulares de alto impacto
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 6: MÁS OPCIONES (⋮) */}
      <Modal
        visible={showMoreModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowMoreModal(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setShowMoreModal(false)} />
          <View
            style={[
              s.modalSheet,
              {
                backgroundColor: isDark ? '#16181C' : '#FFFFFF',
                paddingBottom: Math.max(bottom, 20),
              },
            ]}
          >
            <View style={[s.modalHandle, { backgroundColor: isDark ? '#3E4144' : '#CBD5E1' }]} />
            <Text variant="heading" style={[s.sheetTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Opciones del artículo
            </Text>

            <View style={{ marginTop: 16, gap: 10 }}>
              <Pressable
                onPress={handleExportPDF}
                style={({ pressed }) => [s.sheetMenuRow, pressed && { opacity: 0.7 }]}
              >
                <Feather name="download" size={19} color={isDark ? '#FFFFFF' : '#0F172A'} />
                <Text style={[s.sheetMenuRowText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  Exportar como PDF
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowMoreModal(false);
                  setShowCategoryModal(true);
                }}
                style={({ pressed }) => [s.sheetMenuRow, pressed && { opacity: 0.7 }]}
              >
                <Feather name="tag" size={19} color={isDark ? '#FFFFFF' : '#0F172A'} />
                <Text style={[s.sheetMenuRowText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  Cambiar categoría ({selectedCategory?.name || 'Ninguna'})
                </Text>
              </Pressable>

              <Pressable
                onPress={handleDiscard}
                style={({ pressed }) => [s.sheetMenuRow, pressed && { opacity: 0.7 }]}
              >
                <Feather name="trash-2" size={19} color="#DC2626" />
                <Text style={[s.sheetMenuRowText, { color: '#DC2626' }]}>
                  Descartar borrador
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    height: 54,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  circleCheckBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasContainer: {
    flex: 1,
  },
  titleInput: {
    fontSize: 26,
    fontFamily: fonts.bold,
    lineHeight: 32,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
  },
  categoryPillText: {
    fontSize: 12.5,
    fontFamily: fonts.medium,
  },
  richTextWrapper: {
    flex: 1,
  },
  bottomToolbarWrap: {
    minHeight: 48,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 19,
    fontFamily: fonts.bold,
  },
  sheetSubtitle: {
    fontSize: 13.5,
    marginTop: 4,
    lineHeight: 19,
  },
  previewCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 16,
    gap: 6,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  previewMeta: {
    fontSize: 12,
  },
  publishPrimaryBtn: {
    backgroundColor: '#E4531D',
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  publishPrimaryBtnText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 15.5,
  },
  saveDraftBtn: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  saveDraftBtnText: {
    fontFamily: fonts.medium,
    fontSize: 14.5,
  },
  textActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  categoryRowText: {
    fontSize: 15,
  },
  sheetMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  sheetMenuRowText: {
    fontSize: 15.5,
    fontFamily: fonts.medium,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});
