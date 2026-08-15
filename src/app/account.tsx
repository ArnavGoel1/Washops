import Footer from "@/components/Footer";
import { useAuth } from "@/store/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BLUE = "#0066FF";
const DARK = "#0F172A";
const MUTED = "#64748B";
const BACKGROUND = "#F8FAFC";
const CARD = "#FFFFFF";
const BORDER = "#E2E8F0";

export default function AccountScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of Washops?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/Login");
        },
      },
    ]);
  };

  const name = user?.name || "User";
  const email = user?.email || "No email";

  const initials =
    name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={DARK} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Account & Profile</Text>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* SETTINGS SECTION */}
        <Text style={styles.sectionHeader}>Settings & Support</Text>

        <View style={styles.menuCard}>
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Alerts & daily reminders"
            onPress={() => router.push("/alerts")}
          />

          <MenuItem
            icon="people-outline"
            title="Manage Customers"
            subtitle="View & edit customer profiles"
            onPress={() => router.push("/(tabs)/customer")}
          />

          <MenuItem
            icon="card-outline"
            title="Payments & Rates"
            subtitle="View revenue & collected history"
            onPress={() => router.push("/(tabs)/Payment")}
          />

          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacy & Security"
            subtitle="Token & session encryption"
            onPress={() =>
              Alert.alert(
                "Security",
                "Your session is secured using JWT & Expo SecureStore encryption."
              )
            }
            last
          />
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#E53E3E" />
          <Text style={styles.logoutText}>Log Out of Washops</Text>
        </TouchableOpacity>

        {/* VERSION */}
        <Footer />
        <Text style={styles.versionText}>
          Washops v1.0.0 (Connected to MongoDB)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, last && styles.menuItemLast]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={20} color={BLUE} />
      </View>

      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  topHeader: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: CARD,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: BLUE,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: DARK,
  },
  email: {
    fontSize: 13,
    color: MUTED,
    marginTop: 3,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: DARK,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK,
  },
  menuSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 1,
  },
  logoutButton: {
    height: 50,
    backgroundColor: "#FFF5F5",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FED7D7",
    marginBottom: 16,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#E53E3E",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: MUTED,
  },
});
