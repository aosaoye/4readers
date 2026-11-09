// src/ui/theme.ts
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Appearance,
  StyleSheet,
  useColorScheme as useSystemColorScheme,
  type ColorSchemeName,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ColorPalette {
  // Fondos y superficies
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSubtle: string;
  overlay: string;

  // Textos y jerarquía tipográfica
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Bordes y divisores
  border: string;
  borderStrong: string;
  divider: string;

  // Marca / Acciones principales
  primary: string;
  primaryForeground: string;
  primarySoft: string;

  // Estados semánticos
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;

  // Inputs y controles
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;
  switchTrackOff: string;

  // Compatibilidad con la app existente
  bg: string;
  surfaceAlt: string;
  tabBar: string;
  tabActive: string;
  ink: string;
  muted: string;
  faint: string;
  line: string;
  accent: string;
  accentSoft: string;
  warn: string;
  warnSoft: string;
  onInk: string;
  onInkSecondary: string;
}

export type ColorName = keyof ColorPalette;
export type Palette = ColorPalette;

export const lightColors: ColorPalette = {
  // Fondos y superficies
  background: '#F8FAFC',       // Gris neutro muy claro para que resalten las cards blancas
  surface: '#FFFFFF',          // Blanco puro para cards, filas y cabeceras
  surfaceElevated: '#FFFFFF',  // Modales, sheets y barras flotantes
  surfaceSubtle: '#F1F5F9',    // Fondos secundarios, chips inactivos, avatares
  overlay: 'rgba(15, 23, 42, 0.45)',

  // Textos
  text: '#0F172A',             // Alto contraste (casi negro)
  textSecondary: '#475569',    // Subtítulos y descripciones
  textMuted: '#94A3B8',        // Metadatos, fechas, contadores
  textInverse: '#FFFFFF',      // Texto sobre botones oscuros/primarios

  // Bordes
  border: '#E2E8F0',           // Borde limpio de tarjetas
  borderStrong: '#CBD5E1',     // Borde activo o enfatizado
  divider: '#F1F5F9',          // Separador de listas

  // Marca
  primary: '#E4531D',          // Naranja de identidad de marca
  primaryForeground: '#FFFFFF',
  primarySoft: '#FCE5DD',

  // Estados semánticos
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  info: '#2563EB',
  infoSoft: '#DBEAFE',

  // Controles
  inputBackground: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputPlaceholder: '#94A3B8',
  switchTrackOff: '#E2E8F0',

  // Tokens heredados
  bg: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  tabBar: '#FFFFFF',
  tabActive: '#FCE5DD',
  ink: '#141211',
  muted: '#6E625E',
  faint: '#A3938E',
  line: '#E2E8F0',
  accent: '#E4531D',
  accentSoft: '#FCE5DD',
  warn: '#8F6410',
  warnSoft: '#F1E3C4',
  onInk: '#FFFFFF',
  onInkSecondary: '#D1D5DB',
};

export const darkColors: ColorPalette = {
  // Fondos y superficies
  background: '#09090B',       // Negro profundo (Zinc 950)
  surface: '#121215',          // Superficie de tarjetas diferenciada del fondo
  surfaceElevated: '#1C1C21',  // Modales, sheets, desplegables
  surfaceSubtle: '#27272A',    // Chips inactivos, barras de búsqueda, avatares
  overlay: 'rgba(0, 0, 0, 0.72)',

  // Textos
  text: '#FAFAFA',             // Blanco nítido
  textSecondary: '#A1A1AA',    // Gris medio legible sobre negro
  textMuted: '#71717A',        // Metadatos y textos deshabilitados
  textInverse: '#09090B',      // Texto oscuro sobre botones claros

  // Bordes
  border: '#27272A',           // Borde sutil en dark mode
  borderStrong: '#3F3F46',     // Borde enfatizado
  divider: '#1F1F23',          // Separador de filas

  // Marca
  primary: '#E4531D',
  primaryForeground: '#FFFFFF',
  primarySoft: '#2A1912',

  // Estados semánticos
  success: '#22C55E',
  successSoft: 'rgba(34, 197, 94, 0.16)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.16)',
  danger: '#EF4444',
  dangerSoft: 'rgba(239, 68, 68, 0.16)',
  info: '#3B82F6',
  infoSoft: 'rgba(59, 130, 246, 0.16)',

  // Controles
  inputBackground: '#121215',
  inputBorder: '#27272A',
  inputPlaceholder: '#52525B',
  switchTrackOff: '#27272A',

  // Tokens heredados
  bg: '#09090B',
  surfaceAlt: '#1C1C21',
  tabBar: '#09090B',
  tabActive: '#2A1912',
  ink: '#F2EEEC',
  muted: '#BDB8B5',
  faint: '#8E827E',
  line: '#27272A',
  accent: '#E4531D',
  accentSoft: '#2A1912',
  warn: '#D9A441',
  warnSoft: '#2E230E',
  onInk: '#000000',
  onInkSecondary: '#4A4543',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const gutter = space.xl;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 9999,
  pill: 9999,
} as const;

export const fonts = {
  light: 'Inter_300Light',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 26 },
  xl: { fontSize: 22, lineHeight: 30 },
  xxl: { fontSize: 28, lineHeight: 36 },
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
  display: 'ink',
  title: 'ink',
  heading: 'ink',
  body: 'muted',
  label: 'ink',
  caption: 'muted',
  kicker: 'accent',
};

export interface Theme {
  mode: ThemeMode;
  scheme: ResolvedTheme;
  isDark: boolean;
  colors: ColorPalette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  navigationTheme: NavigationTheme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = '@cashbank_theme_mode';
const THEME_STORAGE_KEY_LEGACY = 'cashbank_theme_preference';

let currentThemeMode: ThemeMode = 'system';
let currentSystemScheme: ColorSchemeName | null | undefined = Appearance.getColorScheme();

function computeIsDark(mode: ThemeMode, sysScheme: ColorSchemeName | null | undefined): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return sysScheme === 'dark';
}

export let isDark = computeIsDark(currentThemeMode, currentSystemScheme);

export function getActiveColors(): ColorPalette {
  return isDark ? darkColors : lightColors;
}

export function getThemeMode(): ThemeMode {
  return currentThemeMode;
}

/** Proxy reactivo: leer colors.bg o cualquier token devuelve siempre el color activo */
export const colors: ColorPalette = new Proxy({} as ColorPalette, {
  get(_target, prop: string) {
    const palette = getActiveColors();
    return (palette as any)[prop];
  },
});

type ThemeListener = () => void;
const themeListeners = new Set<ThemeListener>();

function notifyThemeListeners() {
  themeListeners.forEach((fn) => fn());
}

export async function setThemeMode(mode: ThemeMode): Promise<void> {
  currentThemeMode = mode;
  isDark = computeIsDark(currentThemeMode, currentSystemScheme);
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY_LEGACY, mode);
  } catch {}
  notifyThemeListeners();
}

export async function hydrateTheme(): Promise<void> {
  try {
    const saved =
      (await AsyncStorage.getItem(THEME_STORAGE_KEY)) ||
      (await AsyncStorage.getItem(THEME_STORAGE_KEY_LEGACY));
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      currentThemeMode = saved as ThemeMode;
    }
  } catch {}
  currentSystemScheme = Appearance.getColorScheme();
  isDark = computeIsDark(currentThemeMode, currentSystemScheme);
  notifyThemeListeners();
}

Appearance.addChangeListener(({ colorScheme }) => {
  currentSystemScheme = colorScheme;
  isDark = computeIsDark(currentThemeMode, currentSystemScheme);
  notifyThemeListeners();
});

const ThemeContext = createContext<Theme | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(currentThemeMode);

  useEffect(() => {
    hydrateTheme().then(() => {
      setModeState(currentThemeMode);
    });

    const listener = () => {
      setModeState(currentThemeMode);
    };
    themeListeners.add(listener);
    return () => {
      themeListeners.delete(listener);
    };
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    setThemeMode(newMode);
  };

  const resolvedScheme: ResolvedTheme = useMemo(() => {
    if (mode === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemScheme]);

  const activeIsDark = resolvedScheme === 'dark';
  const activeColors = activeIsDark ? darkColors : lightColors;

  // Sincronizar estado global
  isDark = activeIsDark;

  const toggleTheme = () => {
    setMode(activeIsDark ? 'light' : 'dark');
  };

  const navigationTheme: NavigationTheme = useMemo(() => {
    const base = activeIsDark ? NavigationDarkTheme : NavigationLightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: activeColors.primary,
        background: activeColors.background,
        card: activeColors.surface,
        text: activeColors.text,
        border: activeColors.border,
        notification: activeColors.danger,
      },
    };
  }, [activeIsDark, activeColors]);

  const value = useMemo<Theme>(
    () => ({
      mode,
      scheme: resolvedScheme,
      isDark: activeIsDark,
      colors: activeColors,
      spacing,
      radius,
      typography,
      navigationTheme,
      setMode,
      toggleTheme,
    }),
    [mode, resolvedScheme, activeIsDark, activeColors, navigationTheme]
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
};

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    // Si se usa fuera del Provider, fallback al valor global
    return {
      mode: currentThemeMode,
      scheme: isDark ? 'dark' : 'light',
      isDark,
      colors: getActiveColors(),
      spacing,
      radius,
      typography,
      navigationTheme: isDark ? NavigationDarkTheme : NavigationLightTheme,
      setMode: (m) => {
        setThemeMode(m);
      },
      toggleTheme: () => {
        setThemeMode(isDark ? 'light' : 'dark');
      },
    };
  }
  return context;
}

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Hook para crear StyleSheets reactivos al tema actual con memorización.
 */
export function useThemedStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  factory: (theme: Theme) => T
): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
