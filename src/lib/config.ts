import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORT = 5000;

function resolveBaseUrl(): string {
  // 1. Explicit env override (e.g. EXPO_PUBLIC_API_URL in .env)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Automatically get developer machine IP from Expo Go bundler host
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  const devMachineHost = hostUri ? hostUri.split(':')[0] : null;

  if (
    devMachineHost &&
    devMachineHost !== 'localhost' &&
    devMachineHost !== '127.0.0.1'
  ) {
    return `http://${devMachineHost}:${PORT}/api`;
  }

  // 3. Android Emulator fallback
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${PORT}/api`;
  }

  // 4. iOS Simulator & Web fallback
  return `http://localhost:${PORT}/api`;
}

export const API_BASE_URL = resolveBaseUrl();
