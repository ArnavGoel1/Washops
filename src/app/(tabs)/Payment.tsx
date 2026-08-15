import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  listMyPayments,
  PaymentItem,
  updatePaymentStatus,
} from "@/lib/api/payment";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BLUE = "#0066FF";
const DARK = "#0F172A";
const MUTED = "#64748B";
const BACKGROUND = "#F8FAFC";
const CARD = "#FFFFFF";
const BORDER = "#E2E8F0";

export default function PaymentScreen() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPayments = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await listMyPayments();
      if (Array.isArray(data)) {
        setPayments(data);
      }
    } catch (err) {
      console.log("[Payment] Error loading payments:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [fetchPayments])
  );

  // Mark pending payment as collected/paid
  const handleMarkAsPaid = async (paymentId: string) => {
    Alert.alert(
      "Collect Payment",
      "Confirm receiving payment for this wash service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Paid",
          onPress: async () => {
            try {
              setUpdatingId(paymentId);
              await updatePaymentStatus(paymentId, "success");
              await fetchPayments(true);
              Alert.alert("Success", "Payment marked as collected!");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to update payment.");
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  // Calculations
  const paidPayments = useMemo(
    () => payments.filter((p) => p.status === "success"),
    [payments]
  );
  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status === "pending"),
    [payments]
  );

  const totalRevenue = useMemo(
    () => paidPayments.reduce((sum, p) => sum + (p.rate || 0), 0),
    [paidPayments]
  );

  const pendingAmount = useMemo(
    () => pendingPayments.reduce((sum, p) => sum + (p.rate || 0), 0),
    [pendingPayments]
  );

  // Filtered list
  const filteredList = useMemo(() => {
    let list = payments;
    if (activeFilter === "PAID") list = paidPayments;
    if (activeFilter === "PENDING") list = pendingPayments;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const name = (p.customer?.user?.name || "").toLowerCase();
        const car = (p.schedule?.car?.model || "").toLowerCase();
        const amount = String(p.rate || "");
        return name.includes(q) || car.includes(q) || amount.includes(q);
      });
    }

    return list;
  }, [payments, activeFilter, paidPayments, pendingPayments, search]);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchPayments(true)}
          />
        }
      >
        {/* PAGE TITLE */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>Payments & Revenue</Text>
            <Text style={styles.pageSubtitle}>
              Live financial overview & transaction history
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => fetchPayments(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color={DARK} />
          </TouchableOpacity>
        </View>

        {/* FINANCIAL SUMMARY CARDS */}
        <View style={styles.summarySection}>
          <View style={[styles.summaryCard, { backgroundColor: "#10B981" }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>TOTAL COLLECTED</Text>
              <View style={styles.iconCircle}>
                <Ionicons name="cash" size={16} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.cardAmount}>
              ₹{totalRevenue.toLocaleString()}
            </Text>
            <Text style={styles.cardFooter}>
              {paidPayments.length} completed transactions
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: "#0284C7" }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>PENDING RECEIVABLES</Text>
              <View style={styles.iconCircle}>
                <Ionicons name="time" size={16} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.cardAmount}>
              ₹{pendingAmount.toLocaleString()}
            </Text>
            <Text style={styles.cardFooter}>
              {pendingPayments.length} awaiting payment
            </Text>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer, car, or amount..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* FILTER PILLS */}
        <View style={styles.filterRow}>
          {(["ALL", "PAID", "PENDING"] as const).map((filter) => {
            const count =
              filter === "ALL"
                ? payments.length
                : filter === "PAID"
                ? paidPayments.length
                : pendingPayments.length;

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

        {/* TRANSACTIONS SECTION */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <Text style={styles.transactionCount}>
              {filteredList.length} RECORD{filteredList.length === 1 ? "" : "S"}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={BLUE} />
              <Text style={styles.loadingText}>Syncing payments from backend...</Text>
            </View>
          ) : filteredList.length > 0 ? (
            <View style={styles.transactionsCard}>
              {filteredList.map((p) => {
                const customerName = (p.customer as any)?.name || p.customer?.user?.name || "Customer";
                const customerId = p.customer?._id;
                const carModel = p.schedule?.car?.model || "Car Wash";
                const isSuccess = p.status === "success";
                const isUpdating = updatingId === p._id;

                const initials = customerName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "TX";

                return (
                  <View key={p._id} style={styles.transactionRow}>
                    {/* Avatar */}
                    <TouchableOpacity
                      style={styles.avatar}
                      onPress={() => {
                        if (customerId) {
                          router.push({
                            pathname: "/Customer/[id]",
                            params: {
                              id: customerId,
                              name: customerName,
                              phone: p.customer?.user?.phone || "",
                            },
                          });
                        }
                      }}
                    >
                      <Text style={styles.avatarText}>{initials}</Text>
                    </TouchableOpacity>

                    {/* Transaction Details */}
                    <View style={styles.txInfo}>
                      <TouchableOpacity
                        onPress={() => {
                          if (customerId) {
                            router.push({
                              pathname: "/Customer/[id]",
                              params: {
                                id: customerId,
                                name: customerName,
                                phone: p.customer?.user?.phone || "",
                              },
                            });
                          }
                        }}
                      >
                        <Text style={styles.txName}>{customerName}</Text>
                      </TouchableOpacity>
                      <Text style={styles.txSubtitle}>
                        {carModel} · {new Date(p.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    {/* Amount & Status Action */}
                    <View style={styles.amountContainer}>
                      <Text
                        style={[
                          styles.txAmount,
                          isSuccess ? styles.amountSuccess : styles.amountPending,
                        ]}
                      >
                        ₹{p.rate || 0}
                      </Text>

                      {isSuccess ? (
                        <View style={styles.tagSuccess}>
                          <Ionicons name="checkmark-circle" size={12} color="#16A36A" />
                          <Text style={styles.tagTextSuccess}>Paid</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.collectButton,
                            isUpdating && styles.disabledButton,
                          ]}
                          onPress={() => handleMarkAsPaid(p._id)}
                          disabled={isUpdating}
                          activeOpacity={0.8}
                        >
                          {isUpdating ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.collectButtonText}>
                              Collect ₹{p.rate || 0}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? "No transactions match your search query."
                  : "Completed and scheduled wash services will record transactions here automatically."}
              </Text>
            </View>
          )}
        </View>

        <Footer />
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: DARK,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  summarySection: {
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.8,
    opacity: 0.9,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 10,
    letterSpacing: -0.5,
  },
  cardFooter: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.85,
    marginTop: 4,
    fontWeight: "500",
  },
  searchContainer: {
    height: 48,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: DARK,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
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
  transactionsSection: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: DARK,
    fontSize: 18,
    fontWeight: "800",
  },
  transactionCount: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  transactionsCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: BLUE,
  },
  txInfo: {
    flex: 1,
    marginLeft: 12,
  },
  txName: {
    fontSize: 15,
    fontWeight: "700",
    color: DARK,
  },
  txSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "800",
  },
  amountSuccess: {
    color: "#10B981",
  },
  amountPending: {
    color: "#0284C7",
  },
  tagSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E8F8F1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  tagTextSuccess: {
    fontSize: 11,
    fontWeight: "800",
    color: "#16A36A",
  },
  collectButton: {
    backgroundColor: BLUE,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  collectButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
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
    lineHeight: 18,
  },
});
