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
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text, useTheme } from '@/ui';

export interface BlogEditorOutput {
  html: string;
  plainText: string;
  wordCount: number;
  readingTimeMinutes: number;
}

interface BlogEditorProps {
  initialHtml?: string;
  placeholder?: string;
  minHeight?: number;
  allowPdfExport?: boolean;
  postTitle?: string;
  onChange: (data: BlogEditorOutput) => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({
  initialHtml = '',
  placeholder = 'Escribe tu historia, añade encabezados, citas o fuentes...',
  minHeight = 340,
  allowPdfExport = true,
  postTitle = 'Borrador de Artículo',
  onChange,
}) => {
  const { colors, radius, spacing, scheme, isDark } = useTheme();
  const [stats, setStats] = useState({ words: 0, readingTime: 1, chars: 0 });

  // CSS reactivo inyectado en el WebView de TipTap según Light o Dark mode
  const customEditorCSS = useMemo(
    () => `
      * {
        box-sizing: border-box;
      }
      html, body {
        background-color: ${colors.surface};
        color: ${colors.text};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.65;
        margin: 0;
        padding: 12px;
        caret-color: ${colors.primary};
      }
      p {
        margin: 0 0 12px 0;
      }
      h1, h2, h3 {
        color: ${colors.text};
        font-weight: 700;
        line-height: 1.3;
        margin: 18px 0 8px 0;
      }
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      h3 { font-size: 17px; }
      blockquote {
        border-left: 3px solid ${colors.primary};
        background-color: ${colors.surfaceSubtle};
        color: ${colors.textSecondary};
        margin: 12px 0;
        padding: 8px 14px;
        border-radius: 0 8px 8px 0;
        font-style: italic;
      }
      code {
        background-color: ${colors.surfaceSubtle};
        color: ${colors.text};
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 14px;
      }
      pre {
        background-color: ${colors.surfaceSubtle};
        padding: 12px;
        border-radius: 8px;
        overflow-x: auto;
      }
      a {
        color: ${colors.info};
        text-decoration: underline;
      }
      ul, ol {
        padding-left: 22px;
        margin: 0 0 12px 0;
      }
      li {
        margin-bottom: 4px;
      }
      p.is-editor-empty:first-child::before {
        color: ${colors.inputPlaceholder};
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }
    `,
    [colors]
  );

  // Configura el tema nativo de la Toolbar y editor de 10tap para que respete Dark y Light
  const editorTheme = useMemo(
    () => ({
      toolbar: {
        toolbarBody: {
          backgroundColor: colors.surfaceSubtle,
          borderTopColor: colors.border,
          borderBottomColor: colors.border,
        },
        toolbarButton: {
          backgroundColor: colors.surfaceSubtle,
        },
        icon: {
          tintColor: colors.text,
        },
        iconActive: {
          tintColor: colors.primary,
        },
        iconDisabled: {
          tintColor: colors.textMuted,
        },
      },
    }),
    [colors]
  );

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: initialHtml,
    theme: editorTheme as any,
    bridgeExtensions: [
      ...TenTapStartKit,
      PlaceholderBridge.configureExtension({
        placeholder,
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

      onChange({
        html,
        plainText: cleanText,
        wordCount: words,
        readingTimeMinutes: readingTime,
      });
    },
  });

  // Hidratar contenido cuando initialHtml cambie (por ejemplo desde AsyncStorage)
  useEffect(() => {
    if (initialHtml && editor) {
      editor.setContent(initialHtml);
    }
  }, [initialHtml, editor]);


  const handleExportPDF = async () => {
    const htmlContent = await editor.getHTML();
    const styledDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: -apple-system, Helvetica, Arial, sans-serif;
              padding: 48px;
              line-height: 1.7;
              color: #0F172A;
              max-width: 720px;
              margin: 0 auto;
            }
            h1.doc-title {
              font-size: 30px;
              margin-bottom: 8px;
              border-bottom: 1px solid #E2E8F0;
              padding-bottom: 16px;
            }
            .meta {
              font-size: 12px;
              color: #64748B;
              margin-bottom: 32px;
            }
            blockquote {
              border-left: 3px solid #0F172A;
              padding-left: 16px;
              color: #475569;
              font-style: italic;
            }
            pre, code {
              background-color: #F1F5F9;
              border-radius: 6px;
              padding: 4px 8px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <h1 class="doc-title">${postTitle || 'Artículo sin título'}</h1>
          <div class="meta">${stats.words} palabras · ${stats.readingTime} min de lectura</div>
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
  };

  return (
    <View
      key={scheme} // Garantiza que el WebView reconstruya su CSS al alternar Dark/Light
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        overflow: 'hidden',
      }}
    >
      {/* Barra de formato superior integrada en la tarjeta */}
      <View
        style={{
          height: 46,
          backgroundColor: colors.surfaceSubtle,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          justifyContent: 'center',
        }}
      >
        <Toolbar editor={editor} />
      </View>

      {/* Lienzo de edición enriquecida */}
      <View
        style={{
          height: minHeight,
          backgroundColor: colors.surface,
        }}
      >
        <RichText
          editor={editor}
          style={{
            backgroundColor: colors.surface,
            flex: 1,
          }}
        />
      </View>

      {/* Footer con métricas del post y exportación a PDF */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          backgroundColor: colors.surfaceSubtle,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Text variant="xs" tone="secondary">
          {stats.words} palabras · ~{stats.readingTime} min de lectura
        </Text>

        {allowPdfExport && (
          <Pressable
            onPress={handleExportPDF}
            style={({ pressed }) => ({
              paddingHorizontal: spacing.sm,
              paddingVertical: 4,
              borderRadius: radius.sm,
              backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
              borderWidth: 1,
              borderColor: colors.borderStrong,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text variant="xs" weight="600" tone="default">
              Exportar PDF
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};
