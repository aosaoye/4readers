import { useState } from 'react';
import { Image, View } from 'react-native';
import { Text } from './Text';

const PALETTE = ['#2E3B4E', '#6B4F3B', '#3F5A4C', '#5B4670', '#8A4B3A', '#3A5560'];
export const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function Avatar({
  name,
  avatarUrl,
  size = 40,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (avatarUrl && !failed) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        onError={() => setFailed(true)}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: PALETTE[hash(name) % PALETTE.length],
        }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: PALETTE[hash(name) % PALETTE.length],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="label" style={{ color: '#fff', fontSize: size * 0.36 }}>
        {name.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}
