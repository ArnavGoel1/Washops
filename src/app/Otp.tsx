import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
  },

  heroSection: {
    alignItems: 'center',
    gap: Spacing.four,
  },

  title: {
    textAlign: 'center',
  },

  heading: {
    marginTop: 40,
    fontSize: 18,
    fontWeight: '500',
    textTransform: 'uppercase',
  },

  otpContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },

  verifyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.4,
  },

  verifyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default function OTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Checks whether all 6 boxes contain a digit
  const isOtpComplete = otp.every((digit) => digit !== '');

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;

    setOtp(newOtp);

    // Automatically move to next box
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (
      event.nativeEvent.key === 'Backspace' &&
      otp[index] === '' &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // Don't allow the user to continue
    // unless all 6 boxes are filled.
    if (!isOtpComplete) {
      return;
    }

    // All 6 boxes are filled
    router.push('/(tabs)');
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
          Enter the OTP
        </ThemedText>

        {/* OTP boxes */}
        <ThemedView style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={styles.otpBox}
              value={digit}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              onChangeText={(value) =>
                handleChange(value, index)
              }
              onKeyPress={(event) =>
                handleKeyPress(event, index)
              }
            />
          ))}
        </ThemedView>

        {/* Verify button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={!isOtpComplete}
          style={[
            styles.verifyButton,
            !isOtpComplete && styles.disabledButton,
          ]}
        >
          <ThemedText style={styles.verifyText}>
            Verify
          </ThemedText>
        </TouchableOpacity>

      </SafeAreaView>
    </ThemedView>
  );
}