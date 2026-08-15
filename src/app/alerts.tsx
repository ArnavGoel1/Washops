import Footer from "@/components/Footer";
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NotificationItem,
} from "@/lib/api/notification";
import { updatePaymentStatus } from "@/lib/api/payment";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
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
const ORANGE = "#EA580C";
const GREEN = "#16A36A";

export default function AlertsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "DUE" | "COLLECTED">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAlerts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await listMyNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.log("[Alerts] Error loading notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAlerts();
    }, [fetchAlerts])
  );

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.log("[Alerts] mark all read error:", err);
    }
  };

  const handleCollectPayment = async (alertItem: NotificationItem) => {
    const paymentId =
      typeof alertItem.payment === "string"
        ? alertItem.payment
        : alertItem.payment?._id;

    if (!paymentId) {
      Alert.alert("Notice", "Payment details not linked.");
      return;
    }

    Alert.alert(
      "Collect Payment",
      "Confirm receiving ₹" +
        (alertItem.amount || 0) +
        " from " +
        (alertItem.customerName || "customer") +
        "?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Collected",
          onPress: async () => {
            try {
              setUpdatingId(alertItem._id);
              await updatePaymentStatus(paymentId, "success");
              await markNotificationRead(alertItem._id);
              await fetchAlerts(true);
              Alert.alert("Success", "Payment recorded in revenue!");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to update payment");
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const dueAlerts = useMemo(
    () => notifications.filter((n) => n.type === "payment_due" && !n.read),
    [notifications]
  );

  const collectedAlerts = useMemo(
    () => notifications.filter((n) => n.type === "payment_collected"),
    [notifications]
  );

  const totalDueAmount = useMemo(
    () => dueAlerts.reduce((sum, n) => sum + (n.amount || 0), 0),
    [dueAlerts]
  );

  const totalCollectedAmount = useMemo(
    () => collectedAlerts.reduce((sum, n) => sum + (n.amount || 0), 0),
    [collectedAlerts]
  );

  const filteredAlerts = useMemo(() => {
    if (activeFilter === "DUE") return dueAlerts;
    if (activeFilter === "COLLECTED") return collectedAlerts;
    return notifications;
  }, [notifications, activeFilter, dueAlerts, collectedAlerts]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* SINGLE CLEAN HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={DARK} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Alerts & Collections</Text>

        {dueAlerts.length > 0 ? (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
          >
            <Text style={styles.markAllText}>Mark read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAlerts(true)}
          />
        }
      >
        {/* SUBTITLE */}
        <Text style={styles.pageSubtitle}>
          Real-time payment collection alerts & reminders
        </Text>

        {/* SUMMARY HERO CARDS */}
        <View style={styles.summarySection}>
          {/* TOTAL PAYMENTS DUE HERO CARD */}
          <View style={styles.dueCard}>
            <View style={styles.alertTop}>
              <View style={styles.dueIconBox}>
                <Ionicons name="cash-outline" size={24} color="#EA580C" />
              </View>

              <View style={styles.alertTitleContainer}>
                <Text style={styles.dueCardLabel}>TOTAL PAYMENTS DUE</Text>
                <View style={styles.numberRow}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <Text style={styles.bigNumber}>
                    {totalDueAmount.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.dueDescription}>
              {dueAlerts.length} customer payment{dueAlerts.length === 1 ? "" : "s"} currently pending collection.
            </Text>

            <TouchableOpacity
              style={styles.viewPaymentsBtn}
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/Payment")}
            >
              <Text style={styles.viewPaymentsBtnText}>View In Payments</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* COLLECTED REVENUE CARD */}
          <View style={styles.collectedCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.collectedIconBox}>
                <Ionicons name="checkmark-done" size={18} color="#16A36A" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.collectedLabel}>COLLECTED REVENUE</Text>
                <Text style={styles.collectedAmount}>
                  ₹{totalCollectedAmount.toLocaleString()}
                </Text>
              </View>
            </View>

            <Text style={styles.collectedSub}>
              {collectedAlerts.length} paid orders
            </Text>
          </View>
        </View>

        {/* FILTER PILLS */}
        <View style={styles.filterRow}>
          {(["ALL", "DUE", "COLLECTED"] as const).map((filter) => {
            const count =
              filter === "ALL"
                ? notifications.length
                : filter === "DUE"
                ? dueAlerts.length
                : collectedAlerts.length;

            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  activeFilter === filter && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === filter && styles.filterPillTextActive,
                  ]}
                >
                  {filter} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ALERTS FEED */}
        <View style={styles.feedSection}>
          <Text style={styles.feedHeaderTitle}>Recent Alerts</Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={BLUE} />
              <Text style={styles.loadingText}>Syncing alerts...</Text>
            </View>
          ) : filteredAlerts.length > 0 ? (
            filteredAlerts.map((item) => {
              const isDue = item.type === "payment_due";
              const isCollected = item.type === "payment_collected";
              const isUpdating = updatingId === item._id;
              const custId =
                typeof item.customer === "string"
                  ? item.customer
                  : item.customer?._id;

              return (
                <TouchableOpacity
                  key={item._id}
                  style={[
                    styles.alertItemCard,
                    !item.read && isDue && styles.alertCardUnread,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (custId) {
                      router.push({
                        pathname: "/Customer/[id]",
                        params: {
                          id: custId,
                          name: item.customerName,
                        },
                      });
                    }
                  }}
                >
                  <View style={styles.alertItemTop}>
                    <View
                      style={[
                        styles.itemIconCircle,
                        isDue ? styles.iconCircleDue : styles.iconCircleCollected,
                      ]}
                    >
                      <Ionicons
                        name={
                          isDue
                            ? "alert-circle"
                            : isCollected
                            ? "checkmark-circle"
                            : "notifications"
                        }
                        size={20}
                        color={isDue ? ORANGE : GREEN}
                      />
                    </View>

                    <View style={styles.itemMainInfo}>
                      <View style={styles.itemTitleRow}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        {item.amount ? (
                          <Text
                            style={[
                              styles.itemAmountBadge,
                              isDue
                                ? styles.amountBadgeDue
                                : styles.amountBadgeCollected,
                            ]}
                          >
                            ₹{item.amount}
                          </Text>
                        ) : null}
                      </View>

                      <Text style={styles.itemMessage}>{item.message}</Text>

                      <Text style={styles.itemTime}>
                        {new Date(item.createdAt).toLocaleDateString()} ·{" "}
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* ACTION BAR FOR PENDING PAYMENT ALERT */}
                  {isDue && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[
                          styles.collectActionBtn,
                          isUpdating && styles.disabledBtn,
                        ]}
                        onPress={() => handleCollectPayment(item)}
                        disabled={isUpdating}
                        activeOpacity={0.8}
                      >
                        {isUpdating ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Ionicons name="card" size={14} color="#FFFFFF" />
                            <Text style={styles.collectActionText}>
                              Collect ₹{item.amount || 0}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.markReadBtn}
                        onPress={async () => {
                          await markNotificationRead(item._id);
                          setNotifications((prev) =>
                            prev.map((n) =>
                              n._id === item._id ? { ...n, read: true } : n
                            )
                          );
                        }}
                      >
                        <Text style={styles.markReadText}>Dismiss</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={46}
                color="#94A3B8"
              />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>
                No pending alerts right now.
              </Text>
            </View>
          )}
        </View>

        <Footer />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
  markAllBtn: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: BLUE,
  },
  scrollContent: {
    padding: 16,
  },
  pageSubtitle: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 14,
    fontWeight: "500",
  },
  summarySection: {
    gap: 12,
    marginBottom: 16,
  },
  dueCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  alertTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  alertTitleContainer: {
    marginLeft: 14,
    flex: 1,
  },
  dueCardLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bigNumber: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    marginLeft: 2,
    letterSpacing: -0.5,
  },
  dueDescription: {
    fontSize: 13,
    color: "#CBD5E1",
    marginTop: 10,
    lineHeight: 18,
  },
  viewPaymentsBtn: {
    marginTop: 12,
    backgroundColor: BLUE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  viewPaymentsBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  collectedCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  collectedIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E8F8F1",
    justifyContent: "center",
    alignItems: "center",
  },
  collectedLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: MUTED,
    letterSpacing: 0.5,
  },
  collectedAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: GREEN,
    marginTop: 1,
  },
  collectedSub: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
  },
  filterPillActive: {
    backgroundColor: DARK,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: MUTED,
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  feedSection: {
    marginBottom: 10,
  },
  feedHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: DARK,
    marginBottom: 10,
  },
  loadingBox: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  loadingText: {
    marginTop: 10,
    color: MUTED,
    fontSize: 13,
  },
  alertItemCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  alertCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: ORANGE,
  },
  alertItemTop: {
    flexDirection: "row",
  },
  itemIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleDue: {
    backgroundColor: "#FFF7ED",
  },
  iconCircleCollected: {
    backgroundColor: "#E8F8F1",
  },
  itemMainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: DARK,
  },
  itemAmountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "800",
  },
  amountBadgeDue: {
    backgroundColor: "#FFF4E4",
    color: ORANGE,
  },
  amountBadgeCollected: {
    backgroundColor: "#E8F8F1",
    color: GREEN,
  },
  itemMessage: {
    fontSize: 13,
    color: "#334155",
    marginTop: 4,
    lineHeight: 18,
  },
  itemTime: {
    fontSize: 11,
    color: MUTED,
    marginTop: 6,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  collectActionBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  collectActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  markReadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markReadText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "600",
  },
  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
  },
});
