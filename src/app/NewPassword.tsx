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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isPasswordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*]/.test(password);

  const handleResetPassword = () => {

    // Check empty fields
    if (password.trim() === '' || confirmPassword.trim() === '') {
      alert('Please fill in both password fields');
      return;
    }

    // Check password rules
    if (!isPasswordValid) {
      alert(
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Password is valid
    alert('Password reset successfully');

    // Go back to Login
    router.replace('/Login');
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
          Reset Password
        </ThemedText>

        <ThemedText style={styles.description}>
          Enter your new password below.
        </ThemedText>

        {/* New Password */}
        <View>
          <TextInput
            placeholder="Enter new password"
            placeholderTextColor="#999"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        {/* Confirm Password */}
        <View>
          <TextInput
            placeholder="Confirm new password"
            placeholderTextColor="#999"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
        </View>

        {/* Reset Password Button */}
        <TouchableOpacity
          onPress={handleResetPassword}
          style={styles.button}
        >
          <ThemedText type="code" style={styles.buttonText}>
            Reset Password
          </ThemedText>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => router.replace('/Login')}
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