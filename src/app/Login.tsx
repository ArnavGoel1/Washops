import Footer from "@/components/Footer";
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { ApiError, useAuth } from '@/store/AuthContext';
import { router } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },

  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },

  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },

  title: {
    textAlign: 'center',
  },

  code: {
    textTransform: 'uppercase',
    fontSize: 18,
    fontWeight: '400',
    marginTop: 50,
  },

  forgotPassword: {
    width: 250,
    alignSelf: 'center',
    marginTop: 2,
  },

  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    textAlign: 'right',
  },

  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  signupText: {
    fontSize: 14,
  },

  signupLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },

  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    textAlign: 'center',
    width: 250,
  },

  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    minWidth: 100,
    alignItems: 'center',
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },
});

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Password validation
  const isPasswordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*]/.test(password);

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    setErrorMessage(null);

    // Empty fields
    if (cleanEmail === '' || password === '') {
      setErrorMessage('Please fill in all fields');
      return;
    }

    // Email validation
    if (!isEmailValid) {
      setErrorMessage('Please enter a valid email');
      return;
    }

    // Password validation
    if (!isPasswordValid) {
      setErrorMessage(
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await login(cleanEmail, password);
      // AuthContext now holds the user + token. Navigate straight into the
      // app rather than an OTP screen, since the backend does plain
      // email/password login with no OTP step (yet - see Otp.tsx note).
      router.replace('/(tabs)');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Logo + Washops */}
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />

          <ThemedText type="title" style={styles.title}>
            Washops
          </ThemedText>
        </ThemedView>

        {/* Login title */}
        <ThemedText type="code" style={styles.code}>
          Login Screen
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
            editable={!isSubmitting}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              padding: 10,
              width: 250,
            }}
          />
        </View>

        {/* Password */}
        <View style={{ marginBottom: 5 }}>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              padding: 10,
              width: 250,
            }}
          />
        </View>

        {errorMessage && (
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        )}

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={() => router.push('/ForgotPassword')}
          style={styles.forgotPassword}
        >
          <ThemedText style={styles.forgotPasswordText}>
            Forgot Password?
          </ThemedText>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isSubmitting}
          style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText type="code" style={{ color: '#fff' }}>
              Login
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* Sign Up */}
        <View style={styles.signupContainer}>
          <ThemedText style={styles.signupText}>
            Don't have an account?{' '}
          </ThemedText>

          <TouchableOpacity onPress={() => router.push('/SignUp')}>
            <ThemedText style={styles.signupLink}>Sign Up</ThemedText>
          </TouchableOpacity>
        </View>

        <Footer />
        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}
