import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const DRAFT_STORAGE_KEY = '@cashbank_new_post_draft_v1';

export interface PostDraftData {
  title: string;
  html: string;
  plainText: string;
  updatedAt: number;
}

export function usePostDraft(debounceMs = 800) {
  const [initialDraft, setInitialDraft] = useState<PostDraftData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carga inicial del borrador al montar la pantalla
  useEffect(() => {
    AsyncStorage.getItem(DRAFT_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed: PostDraftData = JSON.parse(raw);
          if (parsed.title?.trim() || parsed.plainText?.trim() || parsed.html?.trim()) {
            setInitialDraft(parsed);
            setLastSavedAt(new Date(parsed.updatedAt));
            setSaveStatus('saved');
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Guardado con debounce para no saturar el hilo JS
  const saveDraft = useCallback(
    (data: { title: string; html: string; plainText: string }) => {
      setSaveStatus('saving');
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        try {
          if (!data.title.trim() && !data.plainText.trim() && !data.html.trim()) {
            await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
            setSaveStatus('idle');
            return;
          }

          const payload: PostDraftData = {
            ...data,
            updatedAt: Date.now(),
          };
          await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
          setLastSavedAt(new Date(payload.updatedAt));
          setSaveStatus('saved');
        } catch {
          setSaveStatus('idle');
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  // Limpieza tras publicar o descartar manualmente
  const clearDraft = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await AsyncStorage.removeItem(DRAFT_STORAGE_KEY).catch(() => {});
    setInitialDraft(null);
    setLastSavedAt(null);
    setSaveStatus('idle');
  }, []);

  return {
    initialDraft,
    isLoaded,
    saveStatus,
    lastSavedAt,
    saveDraft,
    clearDraft,
  };
}
