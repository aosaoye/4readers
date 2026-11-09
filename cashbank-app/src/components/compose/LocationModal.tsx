import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, radius, space, Text, useTheme } from '@/ui';

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (loc: string) => void;
}

const POPULAR_LOCATIONS = [
  'Madrid, España',
  'Barcelona, Cataluña',
  'Buenos Aires, Argentina',
  'Ciudad de México, México',
  'Bogotá, Colombia',
  'Santiago, Chile',
  'Lima, Perú',
  'Silicon Valley, CA',
  'En remoto / Global',
];

export function LocationModal({ visible, onClose, onSelectLocation }: LocationModalProps) {
  const { isDark, colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = POPULAR_LOCATIONS.filter((l) =>
    l.toLowerCase().includes(query.toLowerCase())
  );

  const modalBg = isDark ? '#000000' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0F1419';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[s.container, { backgroundColor: modalBg, paddingTop: Math.max(top, 10), paddingBottom: Math.max(bottom, 16) }]}>
        <View style={s.header}>
          <Pressable onPress={onClose} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
            <Feather name="x" size={24} color={textPrimary} />
          </Pressable>
          <Text style={[s.headerTitle, { color: textPrimary }]}>Añadir ubicación</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[s.searchBox, { backgroundColor: isDark ? '#16181C' : '#EFF3F4' }]}>
          <Feather name="map-pin" size={18} color="#1D9BF0" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar ciudad o lugar"
            placeholderTextColor="#71767B"
            autoFocus
            style={[s.searchInput, { color: textPrimary }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Feather name="x-circle" size={16} color="#71767B" />
            </Pressable>
          )}
        </View>

        {query.trim().length > 0 && !POPULAR_LOCATIONS.includes(query.trim()) && (
          <Pressable
            onPress={() => {
              onSelectLocation(query.trim());
              onClose();
            }}
            style={s.customLocRow}
          >
            <Feather name="plus-circle" size={18} color="#1D9BF0" />
            <Text style={[s.locText, { color: '#1D9BF0' }]}>Usar &ldquo;{query.trim()}&rdquo;</Text>
          </Pressable>
        )}

        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelectLocation(item);
                onClose();
              }}
              style={({ pressed }) => [s.locRow, pressed && { opacity: 0.7 }]}
            >
              <Feather name="map-pin" size={18} color="#71767B" />
              <Text style={[s.locText, { color: textPrimary }]}>{item}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: 14,
    height: 42,
    gap: 10,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    paddingVertical: 0,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
  },
  customLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  locText: {
    fontSize: 15,
    fontFamily: fonts.medium,
  },
});
