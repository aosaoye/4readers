import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import type { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';
import { AppState, Platform } from 'react-native';
import { ApiError } from '@/api/client';
import { session } from './session';

const DAY = 24 * 60 * 60 * 1000;

/**
 * Estrategia de velocidad:
 *  - La caché se guarda en disco: la app abre con datos al instante (stale-while-revalidate).
 *  - networkMode "offlineFirst": sin red igualmente muestra lo cacheado.
 *  - staleTime de 60 s: navegar entre pantallas no dispara peticiones repetidas (la API limita a 60/min).
 *  - Solo se reintenta en errores transitorios (red, 5xx, 429), nunca en 4xx.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 7 * DAY,
      networkMode: 'offlineFirst',
      refetchOnReconnect: true,
      retry: (count, err) => {
        if (count >= 2) return false;
        if (err instanceof ApiError) return err.status === 0 || err.status >= 500 || err.status === 429;
        return true;
      },
    },
  },
});

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'cashbank.rq.v1',
  throttleTime: 1500,
});

export const persistOptions: PersistQueryClientProviderProps['persistOptions'] = {
  persister,
  maxAge: 7 * DAY,
  buster: '2', // súbelo cuando cambie la forma de los datos para invalidar la caché antigua
  dehydrateOptions: {
    // Solo lo que se cargó bien. Los guardados ya viven en su propio almacenamiento.
    shouldDehydrateQuery: (q) => q.state.status === 'success' && q.queryKey[0] !== 'bookmarks',
  },
};

// React Query en RN necesita que le digamos cuándo hay red y cuándo la app vuelve a primer plano.
onlineManager.setEventListener((setOnline) => NetInfo.addEventListener((s) => setOnline(s.isConnected !== false)));
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (s) => focusManager.setFocused(s === 'active'));
}

// Al cerrar sesión (manual o por refresh inválido) no puede quedar nada del usuario anterior.
session.onClear(() => {
  queryClient.clear();
  persister.removeClient();
});
