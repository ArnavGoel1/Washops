
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const BLUE = '#0066FF';
const DARK = '#111318';
const MUTED = '#737780';
const BG = '#0f0f0f0f';
const WHITE = '#FFFFFF';
const BORDER = '#E9EBEF';
const GREEN = '#16A36A';
const ORANGE = '#D98200';

export default function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >

      <View style={styles.actionIcon}>
        <Ionicons
          name={icon}
          size={22}
          color={BLUE}
        />
      </View>

      <Text style={styles.actionLabel}>
        {label}
      </Text>

    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 15,

    borderWidth: 1,
    borderColor: BORDER,
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  actionLabel: {
    fontSize: 11,
    color: DARK,
    fontWeight: '600',
  },

});