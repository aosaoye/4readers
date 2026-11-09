import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import { Appearance, type ColorSchemeName, type TextStyle } from 'react-native';

/** Tokens de diseño. Cambiar un valor aquí cambia la identidad de TODA la app. */
export const lightColors = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#FCE5DD',
  tabBar: '#FFFFFF',
  tabActive: '#FCE5DD',
  ink: '#141211',
  muted: '#6E625E',
  faint: '#A3938E',
  line: '#F1D6CC',
  accent: '#E4531D',
  accentSoft: '#FADCD2',
  success: '#2F7D4F',
  successSoft: '#D8EBDD',
  warn: '#8F6410',
  warnSoft: '#F1E3C4',
  danger: '#C0392B',
  dangerSoft: '#F3D9D5',
  onInk: '#FFFFFF',
  onInkSecondary: '#D1D5DB',
};
export type ColorName = keyof typeof lightColors;
export type Palette = Record<ColorName, string>;

/** Misma identidad (acento naranja y semánticos) adaptada a fondo negro para que el texto siga siendo legible. */
export const darkColors: Palette = {
  bg: '#000000',
  surface: '#16181C',
  surfaceAlt: '#2A1912',
  tabBar: '#000000',
  tabActive: '#2A1912',
  ink: '#F2EEEC',
  muted: '#BDB8B5',
  faint: '#8E827E',
  line: '#2F3336',
  accent: '#E4531D',
  accentSoft: '#3A1D12',
  success: '#4FB37A',
  successSoft: '#12291B',
  warn: '#D9A441',
  warnSoft: '#2E230E',
  danger: '#E5675A',
  dangerSoft: '#331614',
  onInk: '#000000',
  onInkSecondary: '#4A4543',
};

export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'cashbank_theme_preference';

let currentThemeMode: ThemeMode = 'system';
let currentSystemScheme: ColorSchemeName | null = Appearance.getColorScheme();

function computeIsDark(mode: ThemeMode, sysScheme: ColorSchemeName | null | undefined): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return sysScheme === 'dark';
}

export let isDark = computeIsDark(currentThemeMode, currentSystemScheme);

export function getActiveColors(): Palette {
  return isDark ? darkColors : lightColors;
}

export function getThemeMode(): ThemeMode {
  return currentThemeMode;
}

/** Proxy reactivo: leer colors.bg o cualquier color siempre devuelve el valor del tema activo. */
export const colors: Palette = new Proxy({} as Palette, {
  get(_target, prop: string) {
    const palette = getActiveColors();
    return (palette as any)[prop];
  },
});

type ThemeListener = () => void;
const themeListeners = new Set<ThemeListener>();

function notifyThemeListeners() {
  themeListeners.forEach((l) => l());
}

export async function setThemeMode(mode: ThemeMode) {
  currentThemeMode = mode;
  isDark = computeIsDark(currentThemeMode, currentSystemScheme);
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {}
  notifyThemeListeners();
}

/** Carga la preferencia guardada de tema al arrancar la app. */
export async function hydrateTheme(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      currentThemeMode = saved;
    }
  } catch {}
  currentSystemScheme = Appearance.getColorScheme();
  isDark = computeIsDark(currentThemeMode, currentSystemScheme);
  notifyThemeListeners();
}

// Escuchar cambios de apariencia del sistema en tiempo real
Appearance.addChangeListener(({ colorScheme }) => {
  currentSystemScheme = colorScheme;
  isDark = computeIsDark(currentThemeMode, currentSystemScheme);
  notifyThemeListeners();
});

interface ThemeContextValue {
  isDark: boolean;
  colors: Palette;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark,
  colors,
  mode: currentThemeMode,
  setMode: setThemeMode,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    hydrateTheme();
    const listener = () => setTick((t) => t + 1);
    themeListeners.add(listener);
    return () => {
      themeListeners.delete(listener);
    };
  }, []);

  const value: ThemeContextValue = {
    isDark,
    colors: getActiveColors(),
    mode: currentThemeMode,
    setMode: setThemeMode,
  };

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;
export const gutter = space.xl;
export const radius = { sm: 10, md: 14, lg: 20, xl: 32, pill: 999 } as const;

export const fonts = {
  light: 'Inter_300Light',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const type = {
  display: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 40, letterSpacing: -1.1 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.8 },
  heading: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 23, letterSpacing: -0.3 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  kicker: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
} satisfies Record<string, TextStyle>;
export type TypeVariant = keyof typeof type;

export const defaultColor: Record<TypeVariant, ColorName> = {
  display: 'ink', title: 'ink', heading: 'ink', body: 'muted', label: 'ink', caption: 'muted', kicker: 'accent',
};
