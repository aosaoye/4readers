import { Feather } from '@expo/vector-icons';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors, fonts, gutter, radius, space } from './theme';

export type StepItem = {
  title: string;
  subtitle?: string;
};

type Props = {
  steps: StepItem[];
  current: number;
  onSelect?: (index: number) => void;
};

/**
 * Stepper de ancho completo: los círculos quedan distribuidos de extremo a extremo
 * (izquierda -> centro -> derecha) unidos por líneas elásticas (`flex: 1`).
 */
export function Stepper({ steps, current, onSelect }: Props) {
  return (
    <View style={s.wrap}>
      {/* Fila superior: Círculo 1 ─── Círculo 2 ─── Círculo 3 ocupando el 100% del ancho */}
      <View style={s.trackRow}>
        {steps.map((step, i) => {
          const active = i === current;
          const done = i < current;
          return (
            <Fragment key={step.title}>
              <Pressable
                disabled={!onSelect}
                onPress={() => onSelect?.(i)}
                hitSlop={10}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Paso ${i + 1}: ${step.title}`}
                style={[
                  s.badge,
                  active && { backgroundColor: colors.ink, borderColor: colors.ink },
                  done && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                {done ? (
                  <Feather name="check" size={14} color={colors.onInk} />
                ) : (
                  <Text
                    variant="caption"
                    style={{
                      fontFamily: fonts.bold,
                      color: active ? colors.onInk : colors.muted,
                    }}
                  >
                    {i + 1}
                  </Text>
                )}
              </Pressable>

              {i < steps.length - 1 && (
                <View style={[s.line, done && { backgroundColor: colors.accent }]} />
              )}
            </Fragment>
          );
        })}
      </View>

      {/* Fila inferior: etiquetas alineadas exactamente con cada extremo (izq / centro / der) */}
      <View style={s.labelsRow}>
        {steps.map((step, i) => {
          const active = i === current;
          const done = i < current;
          const align =
            i === 0 ? 'flex-start' : i === steps.length - 1 ? 'flex-end' : 'center';
          const textAlign =
            i === 0 ? 'left' : i === steps.length - 1 ? 'right' : 'center';
          return (
            <Pressable
              key={step.title}
              disabled={!onSelect}
              onPress={() => onSelect?.(i)}
              style={[s.labelCell, { alignItems: align }]}
            >
              <Text
                variant="caption"
                numberOfLines={1}
                style={{
                  textAlign,
                  fontFamily: active || done ? fonts.bold : fonts.medium,
                  color: active ? colors.ink : done ? colors.accent : colors.muted,
                }}
              >
                {step.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingHorizontal: gutter,
    paddingTop: space.sm,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg,
    gap: 6,
  },
  trackRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: space.sm,
    borderRadius: 1,
    backgroundColor: colors.line,
  },
  labelsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelCell: {
    flex: 1,
  },
});
