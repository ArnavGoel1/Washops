import { AuthProvider } from '@/store/AuthContext';
import { OrderProvider } from '@/store/OrderContext';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // preventAutoHideAsync() had no matching hideAsync() call before -
    // the splash screen would never disappear. Hiding it once the root
    // layout has mounted is the minimum fix; swap this for a real
    // "fonts/session loaded" check once you have one (see AuthContext's
    // isLoading if you want to gate on session restore specifically).
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <OrderProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" options={{ headerShown: false }} />
              <Stack.Screen name="Otp" options={{ headerShown: false }} />
              <Stack.Screen name="SignUp" options={{ headerShown: false }} />
              <Stack.Screen
                name="ForgotPassword"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="neworder" options={{ headerShown: false }} />
            </Stack>
          </OrderProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
