import {
  type ComponentRef,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { gutter, space } from './theme';

type ScrollCtx = {
  ensureVisible: (pageY: number, height: number) => void;
};

export const FormScrollContext = createContext<ScrollCtx | null>(null);

export const useFormScroll = () => useContext(FormScrollContext);

/**
 * Hook reutilizable para cualquier ScrollView que contenga campos `<Field />`:
 * calcula la altura del teclado y expone `ensureVisible` para desplazar automáticamente el input enfocado.
 */
export function useKeyboardScroll() {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const scrollY = useRef(0);
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s1 = Keyboard.addListener(showEvent, (e) => {
      setKbHeight(e.endCoordinates?.height ?? 300);
    });
    const s2 = Keyboard.addListener(hideEvent, () => {
      setKbHeight(0);
    });
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  const ensureVisible = useCallback((pageY: number, height: number) => {
    const screenH = Dimensions.get('window').height;
    const visibleLimit = screenH * 0.44;
    const fieldBottom = pageY + Math.min(height, 130);
    if (fieldBottom > visibleLimit) {
      const delta = fieldBottom - visibleLimit + 32;
      scrollRef.current?.scrollTo({
        y: Math.max(0, scrollY.current + delta),
        animated: true,
      });
    }
  }, []);

  const trackScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
  }, []);

  return { scrollRef, kbHeight, ensureVisible, trackScroll };
}

/**
 * Contenedor de formularios y pantallas con campos de texto:
 * - Escucha la apertura del teclado en iOS y Android.
 * - Añade espacio inferior dinámico y desplaza automáticamente el campo enfocado por encima del teclado.
 */
export function FormScroll({
  children,
  footer,
  contentContainerStyle,
}: {
  children: ReactNode;
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const { scrollRef, kbHeight, ensureVisible, trackScroll } = useKeyboardScroll();

  return (
    <FormScrollContext.Provider value={{ ensureVisible }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 20}
      >
        <ScrollView
          ref={scrollRef}
          onScroll={trackScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[
            {
              padding: gutter,
              gap: space.lg,
              paddingBottom: kbHeight > 0 ? kbHeight + 160 : 60,
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
        {footer}
      </KeyboardAvoidingView>
    </FormScrollContext.Provider>
  );
}
