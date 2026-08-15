import Footer from "@/components/Footer";
import { CustomerProfile, getCustomerById } from "@/lib/api/customer";
import { Schedule } from "@/Types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BLUE = "#0066FF";
const DARK = "#0F172A";
const MUTED = "#64748B";
const BACKGROUND = "#F8FAFC";
const CARD = "#FFFFFF";
const BORDER = "#E2E8F0";

export default function CustomerDetails() {
  const params = useLocalSearchParams();
  const customerId = (params.id as string) || "";

  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      getCustomerById(customerId)
        .then((res) => {
          if (res.customer) setCustomer(res.customer);
          if (res.schedules) setSchedules(res.schedules);
        })
        .catch((err) => console.log("[CustomerDetails] error:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [customerId]);

  const displayName =
    customer?.name || customer?.user?.name || (params.name as string) || "Customer";
  const displayPhone =
    customer?.phone || customer?.user?.phone || (params.phone as string) || "";
  const address =
    customer?.address?.street || "Green Glen Layout, Sector 14";
  const cars = customer?.carDetails || [];
  const rate = customer?.price ? "₹" + customer.price : "₹450";
  const notes = customer?.notes || "";

  const initials =
    displayName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "C";

  

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* TOP HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={21} color={DARK} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Customer Profile</Text>

          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* CUSTOMER HERO CARD */}
          <View style={styles.customerSection}>
            <View style={styles.customerTopRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              <View style={styles.customerInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.customerName}>{displayName}</Text>
                  <View style={styles.activeBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                </View>

                {displayPhone ? (
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={13} color={MUTED} />
                    <Text style={styles.detailText}>{displayPhone}</Text>
                  </View>
                ) : null}

                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={13} color={MUTED} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {address}
                  </Text>
                </View>
              </View>
            </View>

            </View>

          {/* OVERVIEW METRICS */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>VEHICLES</Text>
              <Text style={styles.statValue}>{cars.length || 1}</Text>
              <Text style={styles.statFooter}>Registered</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PLAN RATE</Text>
              <Text style={styles.statValue}>{rate}</Text>
              <Text style={styles.statFooter}>Per Month</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>WASH HISTORY</Text>
              <Text style={styles.statValue}>{schedules.length || 0}</Text>
              <Text style={styles.statFooter}>Completed</Text>
            </View>
          </View>

          {/* REGISTERED VEHICLES SECTION */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Registered Vehicles</Text>
            <Text style={styles.sectionCount}>
              {cars.length || 1} Total
            </Text>
          </View>

          <View style={styles.cardContainer}>
            {cars.length > 0 ? (
              cars.map((c, i) => (
                <View
                  key={c.id || i}
                  style={[
                    styles.vehicleRow,
                    i < cars.length - 1 && styles.borderBottom,
                  ]}
                >
                  <View style={styles.carIconBox}>
                    <Ionicons name="car-sport" size={20} color={BLUE} />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.vehicleTitle}>
                      {c.company || "Standard"} {c.model}
                    </Text>
                    <Text style={styles.vehicleSubtitle}>
                      {c.carNumber || "DL 01 AB 1234"}
                    </Text>
                  </View>

                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {(c.type || "SEDAN").toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.vehicleRow}>
                <View style={styles.carIconBox}>
                  <Ionicons name="car-sport" size={20} color={BLUE} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.vehicleTitle}>Primary Vehicle</Text>
                  <Text style={styles.vehicleSubtitle}>DL 01 AB 1234</Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>SEDAN</Text>
                </View>
              </View>
            )}
          </View>

          {/* SERVICE PLAN & INSTRUCTIONS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Service Details & Notes</Text>
          </View>

          <View style={styles.planCard}>
            <View style={styles.planRow}>
              <View style={styles.planItem}>
                <Ionicons name="repeat-outline" size={16} color={BLUE} />
                <Text style={styles.planLabel}>Schedule Frequency:</Text>
                <Text style={styles.planVal}>Daily Wash Plan</Text>
              </View>
            </View>

            <View style={styles.planRow}>
              <View style={styles.planItem}>
                <Ionicons name="card-outline" size={16} color="#16A36A" />
                <Text style={styles.planLabel}>Monthly Subscription:</Text>
                <Text style={styles.planVal}>{rate} / month</Text>
              </View>
            </View>

            {notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesHeader}>Special Instructions:</Text>
                <Text style={styles.notesText}>{notes}</Text>
              </View>
            ) : null}
          </View>

          {/* RECENT WASHES SECTION */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Wash Appointments</Text>
            <Text style={styles.sectionCount}>
              {schedules.length} Recorded
            </Text>
          </View>

          <View style={styles.cardContainer}>
            {schedules.length > 0 ? (
              schedules.map((s, i) => {
                const isDone = s.status === "completed";
                return (
                  <View
                    key={s.id || i}
                    style={[
                      styles.washRow,
                      i < schedules.length - 1 && styles.borderBottom,
                    ]}
                  >
                    <View style={styles.washIconCircle}>
                      <Ionicons
                        name={isDone ? "checkmark-circle" : "time-outline"}
                        size={18}
                        color={isDone ? "#16A36A" : "#D98200"}
                      />
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.washTitle}>
                        {s.car?.model || "Car"} Wash
                      </Text>
                      <Text style={styles.washDate}>
                        {new Date(s.appointmentDate).toLocaleDateString()} ·{" "}
                        {s.time}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        isDone ? styles.statusCompleted : styles.statusPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isDone
                            ? styles.statusTextCompleted
                            : styles.statusTextPending,
                        ]}
                      >
                        {s.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyWashes}>
                <Ionicons name="sparkles-outline" size={32} color="#94A3B8" />
                <Text style={styles.emptyWashesText}>
                  Wash history will automatically log here after appointments.
                </Text>
              </View>
            )}
          </View>

          <Footer />
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: CARD,
  },
  backButton: {
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
  },
  customerSection: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  customerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: BLUE,
  },
  customerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customerName: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8F1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A36A",
    marginRight: 4,
  },
  activeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A36A",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 13,
    color: MUTED,
    fontWeight: "500",
  },
  contactBar: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  callActionButton: {
    backgroundColor: BLUE,
    height: 42,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  callActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  statsCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: MUTED,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK,
    marginTop: 4,
  },
  statFooter: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: BORDER,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: DARK,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "700",
    color: MUTED,
  },
  cardContainer: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  carIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK,
  },
  vehicleSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: DARK,
    letterSpacing: 0.3,
  },
  planCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
  },
  planRow: {
    marginBottom: 10,
  },
  planItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  planLabel: {
    fontSize: 13,
    color: MUTED,
    fontWeight: "500",
  },
  planVal: {
    fontSize: 13,
    fontWeight: "700",
    color: DARK,
  },
  notesBox: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  notesHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: DARK,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
  },
  washRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  washIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  washTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK,
  },
  washDate: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: "#E8F8F1",
  },
  statusPending: {
    backgroundColor: "#FFF4E4",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  statusTextCompleted: {
    color: "#16A36A",
  },
  statusTextPending: {
    color: "#D98200",
  },
  emptyWashes: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWashesText: {
    marginTop: 6,
    color: MUTED,
    fontSize: 12,
    textAlign: "center",
  },
});
