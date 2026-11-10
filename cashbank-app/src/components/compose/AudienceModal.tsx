import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { fonts, radius, space, Text, useTheme } from '@/ui';

export type AudienceType =
  | 'everyone'
  | 'verified'
  | 'following'
  | 'mentioned'
  | 'following_of_following';

interface AudienceModalProps {
  visible: boolean;
  selected: AudienceType;
  onSelect: (type: AudienceType) => void;
  onClose: () => void;
}

interface AudienceOption {
  key: AudienceType;
  icon: keyof typeof Feather.glyphMap;
  title: string;
}

const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    key: 'everyone',
    icon: 'globe',
    title: 'Todos',
  },
  {
    key: 'verified',
    icon: 'check-circle',
    title: 'Cuentas con marca de verificación',
  },
  {
    key: 'following',
    icon: 'user-check',
    title: 'Cuentas a las que sigues',
  },
  {
    key: 'mentioned',
    icon: 'at-sign',
    title: 'Solo las cuentas que menciones',
  },
  {
    key: 'following_of_following',
    icon: 'users',
    title: 'Cuentas a las que sigues y a las que ellas siguen',
  },
];

export function AudienceModal({ visible, selected, onSelect, onClose }: AudienceModalProps) {
  const { isDark } = useTheme();

  const modalBg = isDark ? '#000000' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0F1419';
  const textSecondary = '#71767B';
  const radioInactive = isDark ? '#536471' : '#8899A6';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable
          style={[s.sheet, { backgroundColor: modalBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={s.handle} />

          <Text style={[s.title, { color: textPrimary }]}>¿Quiénes pueden responder?</Text>
          <Text style={[s.subtitle, { color: textSecondary }]}>
            Elige quiénes pueden responder a este post. Recuerda que cualquier persona mencionada siempre puede responder.
          </Text>

          <View style={s.optionsList}>
            {AUDIENCE_OPTIONS.map((opt) => {
              const active = selected === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    onSelect(opt.key);
                    onClose();
                  }}
                  style={({ pressed }) => [s.optionRow, pressed && { opacity: 0.7 }]}
                >
                  <View style={s.iconWrapper}>
                    <Feather name={opt.icon} size={20} color={textPrimary} />
                  </View>

                  <Text style={[s.optionTitle, { color: textPrimary }]}>{opt.title}</Text>

                  {/* Radio selector estilo X */}
                  <View
                    style={[
                      s.radioOuter,
                      active ? s.radioOuterActive : { borderColor: radioInactive },
                    ]}
                  >
                    {active && <View style={s.radioInner} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#71767B',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    marginBottom: 8,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 21,
    marginBottom: 20,
  },
  optionsList: {
    gap: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioOuterActive: {
    borderColor: '#1D9BF0',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1D9BF0',
  },
});
