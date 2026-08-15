import { useState } from 'react';
import {
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { router } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },

  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
  },

  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },

  title: {
    textAlign: 'center',
  },

  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 30,
  },

  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: 250,
  },

  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },

  buttonText: {
    color: '#fff',
  },

  backText: {
    color: '#007AFF',
    fontSize: 14,
    marginTop: 15,
  },
});

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const handleForgotPassword = () => {
    const cleanEmail = email.trim();

    if (cleanEmail === '') {
      alert('Please enter your email');
      return;
    }

    const isEmailValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

    if (!isEmailValid) {
      alert('Please enter a valid email');
      return;
    }

    // For now, go to OTP screen
    router.push('/Newpassotp');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* Logo */}
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />

          <ThemedText type="title" style={styles.title}>
            Washops
          </ThemedText>
        </ThemedView>

        {/* Heading */}
        <ThemedText style={styles.heading}>
          Forgot Password
        </ThemedText>

        <ThemedText style={styles.description}>
          Enter your email to reset your password.
        </ThemedText>

        {/* Email */}
        <View>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.button}
        >
          <ThemedText type="code" style={styles.buttonText}>
            Continue
          </ThemedText>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => router.push('/Login')}
        >
          <ThemedText style={styles.backText}>
            Back to Login
          </ThemedText>
        </TouchableOpacity>

        {Platform.OS === 'web' && <WebBadge />}

      </SafeAreaView>
    </ThemedView>
  );
}