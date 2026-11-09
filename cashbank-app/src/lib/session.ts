import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';

/**
 * Sesión mínima y síncrona: los tokens viven en SecureStore (cifrado) y en memoria.
 * El cliente HTTP necesita leerlos sin esperar a React, por eso no es un hook de estado.
 */
const K_ACCESS = 'cashbank.access';
const K_REFRESH = 'cashbank.refresh';
const K_EXP = 'cashbank.accessExp';

type Snapshot = { ready: boolean; authenticated: boolean };
let access: string | null = null;
let refresh: string | null = null;
let accessExp = 0;
let snap: Snapshot = { ready: false, authenticated: false };
const listeners = new Set<() => void>();
const clearHandlers = new Set<() => void>();

function publish(next: Snapshot) {
  snap = next;
  listeners.forEach((l) => l());
}

export const session = {
  async hydrate() {
    try {
      [access, refresh] = await Promise.all([SecureStore.getItemAsync(K_ACCESS), SecureStore.getItemAsync(K_REFRESH)]);
      if (access === 'undefined') access = null;
      if (refresh === 'undefined') refresh = null;
      accessExp = Number((await SecureStore.getItemAsync(K_EXP)) ?? 0);
    } catch {
      access = refresh = null;
    }
    publish({ ready: true, authenticated: !!refresh });
  },
  async setTokens(t: { accessToken: string; refreshToken: string; expiresInSeconds: number }) {
    if (!t?.accessToken || !t?.refreshToken) return;
    access = t.accessToken;
    refresh = t.refreshToken;
    accessExp = Date.now() + (Number(t.expiresInSeconds) || 900) * 1000;
    publish({ ready: true, authenticated: true });
    await Promise.all([
      SecureStore.setItemAsync(K_ACCESS, access),
      SecureStore.setItemAsync(K_REFRESH, refresh),
      SecureStore.setItemAsync(K_EXP, String(accessExp)),
    ]).catch(() => {});
  },
  async clear() {
    access = refresh = null;
    accessExp = 0;
    publish({ ready: true, authenticated: false });
    clearHandlers.forEach((h) => h());
    await Promise.all([K_ACCESS, K_REFRESH, K_EXP].map((k) => SecureStore.deleteItemAsync(k))).catch(() => {});
  },
  /** Se ejecuta al cerrar sesión (aquí limpiamos la caché de React Query). */
  onClear(handler: () => void) {
    clearHandlers.add(handler);
    return () => clearHandlers.delete(handler);
  },
  getAccessToken: () => access,
  getRefreshToken: () => refresh,
  /** true si el access token caduca en menos de 30 s (o ya caducó). */
  isAccessExpiring: () => !access || accessExp - Date.now() < 30_000,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => snap,
};

export const useSession = () => useSyncExternalStore(session.subscribe, session.getSnapshot);
