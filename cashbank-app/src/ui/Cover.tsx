import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { hash } from './Avatar';

const PALETTES: [string, string, string][] = [
  ['#1F2D3D', '#5E7A8C', '#E0A66F'], ['#2B2230', '#8A5A4B', '#EBB46C'], ['#1E2F2A', '#5F7B5C', '#D2B77A'],
  ['#2A2F4A', '#7C6F9E', '#E8A9A0'], ['#33261F', '#946B4E', '#E6C48F'], ['#18303A', '#3E7C86', '#F0C98A'],
];

/** Muestra `imageUrl` (HTTPS) cuando el artículo incluye portada; de lo contrario, genera un degradado estable por categoría. */
export function Cover({
  seed,
  imageUrl,
  style,
}: {
  seed: string;
  imageUrl?: string | null;
  style?: StyleProp<ViewStyle>;
}) {
  const [failed, setFailed] = useState(false);
  if (imageUrl && !failed) {
    return (
      <Image
        source={{ uri: imageUrl }}
        resizeMode="cover"
        onError={() => setFailed(true)}
        style={style as StyleProp<ImageStyle>}
      />
    );
  }
  const p = PALETTES[hash(seed) % PALETTES.length];
  return <LinearGradient colors={p} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={style} />;
}
