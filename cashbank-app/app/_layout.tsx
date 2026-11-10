import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { persistOptions, queryClient } from '@/lib/queryClient';
import { session, useSession } from '@/lib/session';
import { ThemeProvider, Toaster, useTheme } from '@/ui';

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { authenticated } = useSession();
  const { isDark, colors, navigationTheme } = useTheme();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: 'card',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={authenticated}>
          <Stack.Screen name="(tabs)" options={{ presentation: 'card' }} />
          <Stack.Screen name="post/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="post/[id]/comments" />
          <Stack.Screen name="post/[id]/comment" options={{ presentation: 'modal' }} />
          <Stack.Screen name="post/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="category/[id]" />
          <Stack.Screen name="author/[username]" />
          <Stack.Screen name="organization/[slug]" />
          <Stack.Screen name="search" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="notifications-settings" />
          <Stack.Screen name="notifications-filters" />
          <Stack.Screen name="notifications-muted" />
          <Stack.Screen name="notifications-preferences" />
          <Stack.Screen name="explore-settings" />
          <Stack.Screen name="follow" />
          <Stack.Screen name="connections" />
          <Stack.Screen name="timelines" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="creator-studio" />
          <Stack.Screen name="my-posts" />
          <Stack.Screen name="payouts" />
          <Stack.Screen name="wallet" />
          <Stack.Screen name="store/index" />
          <Stack.Screen name="store/success" />
          <Stack.Screen name="store/cancel" />
          <Stack.Screen name="moderation/index" />
          <Stack.Screen name="moderation/[id]" />
          <Stack.Screen name="admin" />
        </Stack.Protected>
        <Stack.Protected guard={!authenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <Toaster />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const { ready } = useSession();

  useEffect(() => {
    session.hydrate();
  }, []);

  useEffect(() => {
    if (fontsLoaded && ready) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, ready]);

  if (!fontsLoaded || !ready) return null;

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <ThemeProvider>
        <SafeAreaProvider>
          <RootNavigation />
        </SafeAreaProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
