import React, { useMemo } from 'react';
import { Linking, useWindowDimensions, View } from 'react-native';
import RenderHTML, { MixedStyleDeclaration } from 'react-native-render-html';
import { useTheme } from '@/ui';

interface PostContentReaderProps {
  content: string;
  horizontalPadding?: number;
}

/**
 * Detecta si el contenido almacenado en BD ya es HTML o si es un post antiguo en texto plano.
 */
function normalizeToHtml(raw: string): string {
  if (!raw) return '<p></p>';
  const trimmed = raw.trim();
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (hasHtmlTags) return trimmed;

  // Convierte saltos de línea de texto plano en párrafos HTML limpios
  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

export const PostContentReader: React.FC<PostContentReaderProps> = ({
  content,
  horizontalPadding = 32,
}) => {
  const { width } = useWindowDimensions();
  const { colors, spacing, radius } = useTheme();

  const htmlSource = useMemo(
    () => ({ html: normalizeToHtml(content) }),
    [content]
  );

  const baseStyle = useMemo<MixedStyleDeclaration>(
    () => ({
      color: colors.text,
      fontSize: 16,
      lineHeight: 26,
    }),
    [colors.text]
  );

  const tagsStyles = useMemo<Record<string, MixedStyleDeclaration>>(
    () => ({
      p: {
        marginTop: 0,
        marginBottom: spacing.sm,
        color: colors.text,
      },
      h1: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '700',
        color: colors.text,
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
      },
      h2: {
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '700',
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
      },
      h3: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.sm,
        marginBottom: spacing.xxs,
      },
      blockquote: {
        backgroundColor: colors.surfaceSubtle,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        marginVertical: spacing.sm,
        borderTopRightRadius: radius.sm,
        borderBottomRightRadius: radius.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
      },
      code: {
        backgroundColor: colors.surfaceSubtle,
        color: colors.text,
        fontFamily: 'monospace',
        fontSize: 14,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
      },
      pre: {
        backgroundColor: colors.surfaceSubtle,
        padding: spacing.sm,
        borderRadius: radius.md,
        marginVertical: spacing.sm,
      },
      a: {
        color: colors.info,
        textDecorationLine: 'underline',
      },
      ul: {
        marginTop: 0,
        marginBottom: spacing.sm,
        paddingLeft: spacing.lg,
      },
      ol: {
        marginTop: 0,
        marginBottom: spacing.sm,
        paddingLeft: spacing.lg,
      },
      li: {
        marginBottom: 6,
        color: colors.text,
      },
      hr: {
        backgroundColor: colors.divider,
        height: 1,
        marginVertical: spacing.md,
      },
    }),
    [colors, spacing, radius]
  );

  return (
    <View>
      <RenderHTML
        contentWidth={Math.max(200, width - horizontalPadding)}
        source={htmlSource}
        baseStyle={baseStyle}
        tagsStyles={tagsStyles}
        defaultTextProps={{ selectable: true }}
        renderersProps={{
          a: {
            onPress: (_event, href) => {
              if (href) Linking.openURL(href).catch(() => {});
            },
          },
        }}
      />
    </View>
  );
};
