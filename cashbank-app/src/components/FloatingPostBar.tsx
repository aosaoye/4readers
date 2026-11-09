import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, space, Text } from '@/ui';

type Props = {
  sourcesCount: number;
  isVerified: boolean;
  saved: boolean;
  onPressCert: () => void;
  onToggleSave: () => void;
  onShare: () => void;
};

/**
 * Píldora flotante inferior en el detalle del artículo (inspirada en la referencia):
 * muestra fuentes verificables, acceso rápido al certificado web, guardado y compartir.
 */
export function FloatingPostBar({
  sourcesCount,
  isVerified,
  saved,
  onPressCert,
  onToggleSave,
  onShare,
}: Props) {
  const { bottom } = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[s.container, { bottom: Math.max(bottom, 16) }]}>
      <View style={s.pill}>
        <Pressable
          onPress={onPressCert}
          accessibilityRole="button"
          accessibilityLabel="Ver certificado y fuentes"
          style={s.item}
        >
          <Feather
            name={isVerified ? 'check-circle' : 'link-2'}
            size={17}
            color={isVerified ? colors.success : colors.ink}
          />
          <Text variant="caption" style={s.label}>
            {isVerified ? 'Certificado' : `${sourcesCount} f.`}
          </Text>
        </Pressable>

        <View style={s.sep} />

        <View style={s.item}>
          <Feather name="book-open" size={16} color={colors.muted} />
          <Text variant="caption" style={s.label}>
            {sourcesCount} {sourcesCount === 1 ? 'fuente' : 'fuentes'}
          </Text>
        </View>

        <View style={s.sep} />

        <Pressable
          onPress={onToggleSave}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Quitar de guardados' : 'Guardar artículo'}
          style={s.item}
        >
          <Feather name="bookmark" size={17} color={saved ? colors.accent : colors.ink} />
        </Pressable>

        <View style={s.sep} />

        <Pressable
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="Compartir artículo"
          style={s.item}
        >
          <Feather name="share-2" size={17} color={colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    height: 48,
    gap: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  label: {
    fontFamily: fonts.medium,
    color: colors.ink,
    fontSize: 13,
  },
  sep: {
    width: 1,
    height: 18,
    backgroundColor: colors.line,
  },
});
