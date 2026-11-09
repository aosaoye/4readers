import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { fonts, radius, space, Text, useTheme } from '@/ui';

export type AudienceType = 'everyone' | 'following' | 'mentioned';

interface AudienceModalProps {
  visible: boolean;
  selected: AudienceType;
  onSelect: (type: AudienceType) => void;
  onClose: () => void;
}

const AUDIENCE_OPTIONS: {
  key: AudienceType;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  desc: string;
}[] = [
  {
    key: 'everyone',
    icon: 'globe',
    title: 'Cualquier persona',
    desc: 'Cualquier persona puede responder',
  },
  {
    key: 'following',
    icon: 'users',
    title: 'Cuentas que sigues',
    desc: 'Solo las cuentas que sigues pueden responder',
  },
  {
    key: 'mentioned',
    icon: 'at-sign',
    title: 'Solo las personas que menciones',
    desc: 'Solo las personas etiquetadas en este post pueden responder',
  },
];

export function AudienceModal({ visible, selected, onSelect, onClose }: AudienceModalProps) {
  const { isDark, colors } = useTheme();

  const modalBg = isDark ? '#16181C' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0F1419';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable
          style={[s.sheet, { backgroundColor: modalBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={s.handle} />

          <Text style={[s.title, { color: textPrimary }]}>¿Quién puede responder?</Text>
          <Text style={s.subtitle}>
            Elige quién puede responder a este post. Cualquier persona mencionada siempre podrá responder.
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
                  <View style={[s.iconCircle, { backgroundColor: active ? '#1D9BF0' : (isDark ? '#202327' : '#EFF3F4') }]}>
                    <Feather
                      name={opt.icon}
                      size={18}
                      color={active ? '#FFFFFF' : '#71767B'}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[s.optionTitle, { color: textPrimary }]}>{opt.title}</Text>
                    <Text style={s.optionDesc}>{opt.desc}</Text>
                  </View>

                  {active && <Feather name="check" size={20} color="#1D9BF0" />}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#71767B',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#71767B',
    lineHeight: 18,
    marginBottom: 20,
    fontFamily: fonts.regular,
  },
  optionsList: {
    gap: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 13,
    color: '#71767B',
    fontFamily: fonts.regular,
  },
});
