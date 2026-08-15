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
  },

  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
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

  inputContainer: {
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
    paddingHorizontal: 25,
    borderRadius: 5,
    marginTop: 10,
    minWidth: 120,
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#fff',
  },

  loginText: {
    color: '#007AFF',
    fontSize: 14,
    marginTop: 15,
  },

  errorText: {
    color: '#E53E3E',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 250,
    marginTop: 4,
  },
});

export default function SignupScreen() {
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignup = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    setErrorMessage(null);

    // Check empty fields
    if (
      cleanName === '' ||
      cleanEmail === '' ||
      password === '' ||
      confirmPassword === ''
    ) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    // Email validation
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!isEmailValid) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    // Password validation
    const isPasswordValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*]/.test(password);

    if (!isPasswordValid) {
      setErrorMessage(
        'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.'
      );
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({ name: cleanName, email: cleanEmail, password });
      router.replace('/(tabs)');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to sign up. Please check your network.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
        <ThemedText style={styles.heading}>Create Account</ThemedText>

        {/* Name */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            editable={!isSubmitting}
            style={styles.input}
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
            style={styles.input}
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Create a password"
            placeholderTextColor="#999"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
            style={styles.input}
          />
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Confirm your password"
            placeholderTextColor="#999"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isSubmitting}
            style={styles.input}
          />
        </View>

        {errorMessage && (
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        )}

        {/* Sign Up */}
        <TouchableOpacity
          onPress={handleSignup}
          disabled={isSubmitting}
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText type="code" style={styles.buttonText}>
              Sign Up
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity onPress={() => router.push('/Login')}>
          <ThemedText style={styles.loginText}>
            Already have an account? Login
          </ThemedText>
        </TouchableOpacity>

        <Footer />
        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}
