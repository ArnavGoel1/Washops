import Footer from "@/components/Footer";
import QueueCard from "@/components/Queuecard";
import ActionButton from "@/components/QuickAction";
import { updateSchedule } from "@/lib/api/customer";
import { useAuth } from "@/store/AuthContext";
import { useOrders } from "@/store/OrderContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BLUE = "#0066FF";
const DARK = "#111318";
const MUTED = "#737780";
const BG = "#0f0f0f0f";
const WHITE = "#FFFFFF";
const BORDER = "#E9EBEF";
const GREEN = "#16A36A";
const ORANGE = "#D98200";

export default function DashboardScreen() {
  const { user } = useAuth();
  const { orders, loading, refreshOrders } = useOrders();

  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  const totalWashes = orders.length || 0;
  const completedWashes = orders.filter((o) => o.status === "completed").length;
  const pendingWashes = orders.filter(
    (o) =>
      o.status === "pending" ||
      o.status === "in_progress" ||
      o.status === "confirmed"
  ).length;

  const progressPercent =
    totalWashes > 0 ? Math.round((completedWashes / totalWashes) * 100) : 0;

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await updateSchedule(orderId, { status: "completed" });
      await refreshOrders();
    } catch (err) {
      console.error("Failed to complete order:", err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshOrders} />
        }
      >
        {/* APP HEADER */}
        <View style={styles.logoArea}>
          <View style={styles.brandArea}>
            <Image
              source={require("@/assets/images/washops.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Washops</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              activeOpacity={0.7}
              onPress={() => router.push("/alerts")}
            >
              <Ionicons name="notifications-outline" size={21} color={DARK} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              activeOpacity={0.7}
              onPress={() => router.push("/account")}
            >
              <Ionicons name="person-outline" size={21} color={DARK} />
            </TouchableOpacity>
          </View>
        </View>

        {/* WELCOME */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good day, {firstName} 👋</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>

        {/* TODAY'S WASHES */}
        <View style={styles.todayCard}>
          <View style={styles.todayTop}>
            <View>
              <Text style={styles.todayLabel}>TODAY'S WASHES</Text>
              <View style={styles.numberRow}>
                <Text style={styles.bigNumber}>{completedWashes}</Text>
                <Text style={styles.ofText}>/ {totalWashes || 1}</Text>
              </View>
              <Text style={styles.completedText}>washes completed</Text>
            </View>

            <View style={styles.carIcon}>
              <Ionicons name="car-sport" size={28} color={BLUE} />
            </View>
          </View>

          {/* PROGRESS TRACK */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: (Math.max(progressPercent, 5) + "%") as any },
              ]}
            />
          </View>

          <View style={styles.progressBottom}>
            <Text style={styles.progressText}>
              {progressPercent}% completed
            </Text>
            <Text style={styles.remainingText}>
              {pendingWashes} remaining
            </Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <StatCard
            icon="time-outline"
            label="Pending"
            value={String(pendingWashes)}
            description="Need attention"
            iconColor={ORANGE}
            iconBackground="#FFF4E4"
          />

          <StatCard
            icon="car-sport-outline"
            label="Active Fleet"
            value={String(totalWashes)}
            description="Total scheduled"
            iconColor={GREEN}
            iconBackground="#E8F8F1"
          />
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActions}>
          <ActionButton
            icon="add"
            label="New Wash"
            onPress={() => router.push("/neworder")}
          />

          <ActionButton
            icon="people-outline"
            label="Customers"
            onPress={() => router.push("/(tabs)/customer")}
          />

          <ActionButton
            icon="card-outline"
            label="Payments"
            onPress={() => router.push("/(tabs)/Payment")}
          />
        </View>

        {/* TODAY'S QUEUE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Queue</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/Schedule")}
            
          >
            <Text style={styles.seeAll}>See All ({orders.length})</Text>
          </TouchableOpacity>
        </View>

        {orders.length > 0 ? (
          orders.slice(0, 5).map((order) => {
            const isCompleted = order.status === "completed";
            const isPending = !isCompleted;
            const period = order.time.includes("PM") ? "PM" : "AM";
            const timeClean = order.time.replace(/AM|PM/g, "").trim();

            return (
              <QueueCard
                key={order.id}
                id={order.id}
                time={timeClean || "10:00"}
                period={period}
                name={order.customerName}
                vehicle={
                  (order.car?.company || "") + " " + (order.car?.model || "Car")
                }
                service={order.preferences?.[0] || "Standard Wash"}
                status={isCompleted ? "DONE" : "PENDING"}
                pending={isPending}
                onComplete={() => handleCompleteOrder(order.id)}
                onPress={() =>
                  router.push({
                    pathname: "/Customer/[id]",
                    params: {
                      id: order.customer,
                      name: order.customerName,
                      phone: order.phone,
                    },
                  })
                }
              />
            );
          })
        ) : (
          <View style={styles.emptyQueue}>
            <Ionicons name="sparkles-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyQueueTitle}>All caught up!</Text>
            <Text style={styles.emptyQueueText}>
              No pending washes in the queue right now.
            </Text>
          </View>
        )}

        <Footer />
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
  iconColor,
  iconBackground,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  description: string;
  iconColor: string;
  iconBackground: string;
}) {
  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>

      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  brandArea: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: DARK,
    marginLeft: 10,
    letterSpacing: -0.5,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 15,
    color: MUTED,
    fontWeight: "500",
  },
  title: {
    fontSize: 34,
    lineHeight: 39,
    color: DARK,
    fontWeight: "800",
    letterSpacing: -1.1,
  },
  todayCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 21,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  todayTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: MUTED,
    letterSpacing: 1,
    marginBottom: 3,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  bigNumber: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: "800",
    color: BLUE,
    letterSpacing: -1.5,
  },
  ofText: {
    fontSize: 20,
    fontWeight: "600",
    color: MUTED,
    marginLeft: 5,
  },
  completedText: {
    fontSize: 13,
    color: MUTED,
    marginTop: 1,
  },
  carIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  progressTrack: {
    height: 9,
    borderRadius: 10,
    backgroundColor: "#EDEFF3",
    overflow: "hidden",
    marginTop: 20,
  },
  progressFill: {
    height: "100%",
    backgroundColor: BLUE,
    borderRadius: 10,
  },
  progressBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9,
  },
  progressText: {
    fontSize: 11,
    color: MUTED,
    fontWeight: "500",
  },
  remainingText: {
    fontSize: 11,
    color: DARK,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 27,
  },
  statCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 11,
  },
  statLabel: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 25,
    color: DARK,
    fontWeight: "800",
    marginTop: 2,
  },
  statDescription: {
    fontSize: 10,
    color: "#A0A4AC",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    color: BLUE,
    fontWeight: "700",
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  emptyQueue: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
  },
  emptyQueueTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: DARK,
  },
  emptyQueueText: {
    marginTop: 2,
    fontSize: 12,
    color: MUTED,
  },
});
