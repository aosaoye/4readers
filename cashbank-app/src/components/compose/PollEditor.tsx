import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { fonts, radius, space, Text, useTheme } from '@/ui';

export interface PollData {
  options: string[];
  duration: string; // '1 día' | '3 días' | '7 días'
}

interface PollEditorProps {
  poll: PollData;
  onChange: (poll: PollData | null) => void;
}

export function PollEditor({ poll, onChange }: PollEditorProps) {
  const { isDark, colors } = useTheme();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const setOptionText = (index: number, text: string) => {
    const next = [...poll.options];
    next[index] = text.slice(0, 25);
    onChange({ ...poll, options: next });
  };

  const addOption = () => {
    if (poll.options.length < 4) {
      onChange({ ...poll, options: [...poll.options, ''] });
    }
  };

  const removeOption = (index: number) => {
    if (poll.options.length > 2) {
      const next = poll.options.filter((_, i) => i !== index);
      onChange({ ...poll, options: next });
    } else {
      // Si quedan 2 y borra, se resetea el texto
      const next = [...poll.options];
      next[index] = '';
      onChange({ ...poll, options: next });
    }
  };

  const cycleDuration = () => {
    const durations = ['1 día', '3 días', '7 días'];
    const cur = durations.indexOf(poll.duration);
    const next = durations[(cur + 1) % durations.length];
    onChange({ ...poll, duration: next });
  };

  const containerBg = isDark ? '#16181C' : '#F7F9F9';
  const inputBg = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#2F3336' : '#CFD9DE';
  const activeBorderColor = '#1D9BF0';

  return (
    <View style={[s.card, { backgroundColor: containerBg, borderColor }]}>
      <View style={s.optionsList}>
        {poll.options.map((opt, idx) => {
          const isFocused = focusedIndex === idx;
          const isLastRequired = idx === 1;
          const canAdd = poll.options.length < 4;

          return (
            <View
              key={idx}
              style={[
                s.optionInputBox,
                {
                  backgroundColor: inputBg,
                  borderColor: isFocused ? activeBorderColor : borderColor,
                },
              ]}
            >
              <Feather name="image" size={18} color="#71767B" style={{ marginRight: 8 }} />

              <TextInput
                value={opt}
                onChangeText={(t) => setOptionText(idx, t)}
                onFocus={() => setFocusedIndex(idx)}
                onBlur={() => setFocusedIndex(null)}
                placeholder={`Opción ${idx + 1}`}
                placeholderTextColor="#71767B"
                maxLength={25}
                style={[s.input, { color: isDark ? '#FFFFFF' : colors.ink }]}
              />

              <View style={s.rightTools}>
                {opt.length > 0 && (
                  <Text style={s.charCount}>{25 - opt.length}</Text>
                )}

                {isLastRequired && canAdd ? (
                  <Pressable
                    onPress={addOption}
                    hitSlop={8}
                    style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.7 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Añadir otra opción"
                  >
                    <Feather name="plus" size={20} color="#1D9BF0" />
                  </Pressable>
                ) : (
                  (poll.options.length > 2 || opt.length > 0) && (
                    <Pressable
                      onPress={() => removeOption(idx)}
                      hitSlop={8}
                      style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.7 }]}
                      accessibilityRole="button"
                      accessibilityLabel="Eliminar opción"
                    >
                      <Feather name="x" size={18} color="#71767B" />
                    </Pressable>
                  )
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Duración de la encuesta (Imagen 2) */}
      <View style={[s.durationRow, { borderTopColor: borderColor }]}>
        <View>
          <Text style={s.durationLabel}>Duración de la encuesta</Text>
          <Pressable onPress={cycleDuration} hitSlop={6}>
            <Text style={s.durationValue}>{poll.duration}</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => onChange(null)}
          hitSlop={8}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <Text style={s.removePollText}>Eliminar encuesta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: space.sm,
    marginBottom: space.sm,
    overflow: 'hidden',
  },
  optionsList: {
    padding: space.sm,
    gap: space.sm,
  },
  optionInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    paddingVertical: 0,
  },
  rightTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#71767B',
    fontFamily: fonts.regular,
  },
  iconBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  durationLabel: {
    fontSize: 13,
    color: '#71767B',
    fontFamily: fonts.regular,
    marginBottom: 2,
  },
  durationValue: {
    fontSize: 15,
    color: '#1D9BF0',
    fontFamily: fonts.medium,
  },
  removePollText: {
    fontSize: 13,
    color: '#F4212E',
    fontFamily: fonts.medium,
  },
});
