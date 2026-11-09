import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** En desarrollo, Expo ya conoce la IP de tu PC: la reutilizamos para llegar a la API en el puerto 3000. */
function devApiUrl() {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:3000`;
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
}

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || devApiUrl()).replace(/\/$/, '');
export const APP_SCHEME = 'cashbank';
export const REQUEST_TIMEOUT_MS = 15_000;
export const PAGE_SIZE = 10;
