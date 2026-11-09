import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, radius, space, Text, useTheme } from '@/ui';

interface GifModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGif: (url: string) => void;
}

const SAMPLE_GIFS = [
  { id: '1', title: 'Mind Blown', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=60', category: 'Memes' },
  { id: '2', title: 'Thumbs Up', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60', category: 'Reacciones' },
  { id: '3', title: 'Thinking', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60', category: 'Tech' },
  { id: '4', title: 'Rocket To The Moon', url: 'https://images.unsplash.com/photo-1517976487502-5731c30e1efc?w=500&auto=format&fit=crop&q=60', category: 'Cripto' },
  { id: '5', title: 'Clapping', url: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=500&auto=format&fit=crop&q=60', category: 'Reacciones' },
  { id: '6', title: 'Victory Dance', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60', category: 'Memes' },
];

export function GifModal({ visible, onClose, onSelectGif }: GifModalProps) {
  const { isDark, colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const categories = ['Todos', 'Reacciones', 'Memes', 'Tech', 'Cripto'];

  const filtered = SAMPLE_GIFS.filter((g) => {
    const matchesCat = category === 'Todos' || g.category === category;
    const matchesQuery = !search.trim() || g.title.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const modalBg = isDark ? '#000000' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0F1419';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[s.container, { backgroundColor: modalBg, paddingTop: Math.max(top, 10), paddingBottom: Math.max(bottom, 16) }]}>
        {/* Cabecera */}
        <View style={s.header}>
          <Pressable onPress={onClose} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
            <Feather name="x" size={24} color={textPrimary} />
          </Pressable>
          <Text style={[s.headerTitle, { color: textPrimary }]}>Elige un GIF</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Input búsqueda */}
        <View style={[s.searchBox, { backgroundColor: isDark ? '#16181C' : '#EFF3F4' }]}>
          <Feather name="search" size={18} color="#71767B" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar GIFs"
            placeholderTextColor="#71767B"
            style={[s.searchInput, { color: textPrimary }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Feather name="x-circle" size={16} color="#71767B" />
            </Pressable>
          )}
        </View>

        {/* Categorías */}
        <View style={s.categoriesRow}>
          {categories.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[
                s.catChip,
                category === c
                  ? { backgroundColor: '#1D9BF0' }
                  : { backgroundColor: isDark ? '#202327' : '#EFF3F4' },
              ]}
            >
              <Text style={[s.catText, { color: category === c ? '#FFFFFF' : textPrimary }]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Grid de GIFs */}
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ gap: 10, paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelectGif(item.url);
                onClose();
              }}
              style={s.gifItem}
            >
              <Image source={{ uri: item.url }} style={s.gifImage} />
              <View style={s.gifBadge}>
                <Text style={s.gifBadgeText}>GIF</Text>
              </View>
              <Text style={s.gifTitle} numberOfLines={1}>{item.title}</Text>
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
    height: 40,
    gap: 8,
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    paddingVertical: 0,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  catText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  gifItem: {
    flex: 1,
    height: 130,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#202327',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  gifBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  gifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  gifTitle: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fonts.medium,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
