import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BLUE = "#0066FF";
const DARK = "#111318";
const MUTED = "#737780";
const WHITE = "#FFFFFF";
const BORDER = "#E9EBEF";
const GREEN = "#16A36A";
const ORANGE = "#D98200";

export default function QueueCard({
  id,
  time,
  period,
  name,
  vehicle,
  service,
  status,
  pending,
  onComplete,
  onPress,
}: {
  id?: string;
  time: string;
  period: string;
  name: string;
  vehicle: string;
  service: string;
  status: "PENDING" | "DONE";
  pending?: boolean;
  onComplete?: () => Promise<void> | void;
  onPress?: () => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCompletePress = async () => {
    if (onComplete) {
      try {
        setIsUpdating(true);
        await onComplete();
      } catch (err) {
        console.error("Failed to complete wash job:", err);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.queueCard}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* TIME */}
      <View style={styles.timeContainer}>
        <Text style={styles.queueTime}>{time}</Text>
        <Text style={styles.queuePeriod}>{period}</Text>
      </View>

      {/* DIVIDER */}
      <View style={styles.verticalLine} />

      {/* INFORMATION */}
      <View style={styles.queueInfo}>
        <View style={styles.queueNameRow}>
          <Text style={styles.queueName} numberOfLines={1}>
            {name}
          </Text>

          <View
            style={[
              styles.statusBadge,
              pending ? styles.pendingBadge : styles.doneBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                pending ? styles.pendingText : styles.doneText,
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        <Text style={styles.queueVehicle} numberOfLines={1}>
          {vehicle}
        </Text>

        <Text style={styles.queueService} numberOfLines={1}>
          {service}
        </Text>
      </View>

      {/* ACTION */}
      {pending ? (
        <TouchableOpacity
          style={[styles.completeButton, isUpdating && styles.disabledButton]}
          activeOpacity={0.8}
          onPress={handleCompletePress}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={WHITE} />
          ) : (
            <Text style={styles.completeText}>Complete</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.doneCircle}>
          <Ionicons name="checkmark" size={17} color={GREEN} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  queueCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    minHeight: 82,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  timeContainer: {
    width: 48,
    alignItems: "center",
  },
  queueTime: {
    fontSize: 14,
    color: DARK,
    fontWeight: "800",
  },
  queuePeriod: {
    fontSize: 9,
    color: MUTED,
    fontWeight: "600",
    marginTop: 1,
  },
  verticalLine: {
    width: 1,
    height: 42,
    backgroundColor: BORDER,
    marginHorizontal: 12,
  },
  queueInfo: {
    flex: 1,
    minWidth: 0,
  },
  queueNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  queueName: {
    fontSize: 13,
    color: DARK,
    fontWeight: "700",
    flexShrink: 1,
  },
  statusBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadge: {
    backgroundColor: "#FFF1D8",
  },
  doneBadge: {
    backgroundColor: "#DDF7EA",
  },
  statusText: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  pendingText: {
    color: ORANGE,
  },
  doneText: {
    color: GREEN,
  },
  queueVehicle: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
  },
  queueService: {
    fontSize: 10,
    color: "#9A9EA7",
    marginTop: 1,
  },
  completeButton: {
    backgroundColor: BLUE,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 7,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  completeText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: "700",
  },
  doneCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8F8F1",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 7,
  },
});
