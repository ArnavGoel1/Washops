import Footer from "@/components/Footer";
import Header from "@/components/Header";
import * as customerApi from "@/lib/api/customer";
import * as paymentApi from "@/lib/api/payment";
import { PaymentItem } from "@/lib/api/payment";
import { Schedule, ScheduleStatus } from "@/Types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
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

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: any, b: any) {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return false;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const STATUS_BADGE_STYLE: Record<ScheduleStatus, { bg: string; text: string }> = {
  pending: { bg: "#FFF4E4", text: "#D98200" },
  confirmed: { bg: "#EFF6FF", text: "#0066FF" },
  in_progress: { bg: "#F3E8FF", text: "#9333EA" },
  completed: { bg: "#E8F8F1", text: "#16A36A" },
  cancelled: { bg: "#FEE2E2", text: "#DC2626" },
};

export default function ScheduleScreen() {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [weekAnchor, setWeekAnchor] = useState<Date>(startOfWeek(today));
  const [schedules, setSchedules] = useState<any[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [updatingScheduleId, setUpdatingScheduleId] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const [scheduleData, paymentData] = await Promise.all([
        customerApi.listMySchedules(),
        paymentApi.listMyPayments(),
      ]);
      if (Array.isArray(scheduleData)) setSchedules(scheduleData);
      if (Array.isArray(paymentData)) setPayments(paymentData);
    } catch (err: any) {
      console.log("[Schedule] error loading schedule data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekAnchor);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekAnchor]);

  // Filter schedules for the selected day
  const schedulesForSelectedDay = useMemo(() => {
    return schedules
      .filter((s) => isSameDay(new Date(s.appointmentDate), selectedDate))
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [schedules, selectedDate]);

  // Apply status filter pill
  const filteredAppointments = useMemo(() => {
    if (activeFilter === "ALL") return schedulesForSelectedDay;
    if (activeFilter === "PENDING") {
      return schedulesForSelectedDay.filter(
        (s) => s.status === "pending" || s.status === "confirmed"
      );
    }
    if (activeFilter === "IN PROGRESS") {
      return schedulesForSelectedDay.filter((s) => s.status === "in_progress");
    }
    if (activeFilter === "COMPLETED") {
      return schedulesForSelectedDay.filter((s) => s.status === "completed");
    }
    return schedulesForSelectedDay;
  }, [schedulesForSelectedDay, activeFilter]);

  // Revenue for selected day
  const revenueForSelectedDay = useMemo(() => {
    const dayScheduleIds = new Set(schedulesForSelectedDay.map((s) => s._id || s.id));
    return payments
      .filter(
        (p) =>
          p.schedule &&
          dayScheduleIds.has((p.schedule as any)._id || p.schedule) &&
          p.status === "success"
      )
      .reduce((sum, p) => sum + (p.rate || 0), 0);
  }, [schedulesForSelectedDay, payments]);

  const goToPreviousWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() - 7);
    setWeekAnchor(d);
  };

  const goToNextWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() + 7);
    setWeekAnchor(d);
  };

  const goToToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setWeekAnchor(startOfWeek(now));
  };

  // Status transition handler
  const handleUpdateStatus = async (
    scheduleId: string,
    newStatus: ScheduleStatus
  ) => {
    try {
      setUpdatingScheduleId(scheduleId);
      await customerApi.updateSchedule(scheduleId, { status: newStatus });
      await loadData(true);
    } catch (err: any) {
      Alert.alert("Update Failed", err.message || "Could not update status.");
    } finally {
      setUpdatingScheduleId(null);
    }
  };

  

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadData(true)} />
        }
      >
        {/* HEADER & NAV */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.monthLabel}>{formatMonthYear(selectedDate)}</Text>
            <Text style={styles.title}>Schedule</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={goToPreviousWeek}>
              <Ionicons name="chevron-back" size={18} color={DARK} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={goToNextWeek}>
              <Ionicons name="chevron-forward" size={18} color={DARK} />
            </TouchableOpacity>
          </View>
        </View>

        {/* DAY STRIP */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dayStrip}
          contentContainerStyle={styles.dayStripContent}
        >
          {weekDays.map((d) => {
            const isSelected = isSameDay(d, selectedDate);
            const isCurrentToday = isSameDay(d, today);
            const dayWashCount = schedules.filter((s) =>
              isSameDay(new Date(s.appointmentDate), d)
            ).length;

            return (
              <TouchableOpacity
                key={d.toISOString()}
                style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                onPress={() => setSelectedDate(d)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                  {DAY_LABELS[d.getDay()]}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                  {d.getDate()}
                </Text>

                {/* Wash counter badge */}
                {dayWashCount > 0 && (
                  <View
                    style={[
                      styles.dayCountBadge,
                      isSelected && styles.dayCountBadgeSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayCountText,
                        isSelected && styles.dayCountTextSelected,
                      ]}
                    >
                      {dayWashCount}
                    </Text>
                  </View>
                )}

                {isCurrentToday && !isSelected && <View style={styles.todayDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconBox}>
              <Ionicons name="car-sport" size={18} color={BLUE} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.summaryLabel}>Scheduled Washes</Text>
              <Text style={styles.summaryValue}>
                {schedulesForSelectedDay.length}{" "}
                <Text style={styles.summaryUnit}>
                  {schedulesForSelectedDay.length === 1 ? "Vehicle" : "Vehicles"}
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIconBox,
                { backgroundColor: "#E8F8F1" },
              ]}
            >
              <Ionicons name="cash-outline" size={18} color="#16A36A" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.summaryLabel}>Revenue</Text>
              <Text style={[styles.summaryValue, { color: "#16A36A" }]}>
                ₹{revenueForSelectedDay > 0 ? revenueForSelectedDay.toLocaleString() : (schedulesForSelectedDay.length * 350).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* APPOINTMENTS SECTION HEADER */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Appointments</Text>
            <Text style={styles.sectionSubtitle}>
              {formatFullDate(selectedDate)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addWashButton}
            onPress={() => router.push("/neworder")}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addWashText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* FILTER PILLS */}
        <View style={styles.filterPillRow}>
          {["ALL", "PENDING", "IN PROGRESS", "COMPLETED"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterPill,
                activeFilter === f && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === f && styles.filterPillTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* APPOINTMENTS LIST */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BLUE} />
            <Text style={styles.loadingText}>Loading schedule...</Text>
          </View>
        ) : filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No appointments scheduled</Text>
            <Text style={styles.emptyText}>
              There are no {activeFilter !== "ALL" ? activeFilter.toLowerCase() : ""}{" "}
              washes scheduled for this date.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => router.push("/neworder")}
            >
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.emptyAddButtonText}>Schedule a Wash</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredAppointments.map((s) => {
            const scheduleId = s._id || s.id;
            const car = s.car || {
              company: "Standard",
              model: "Sedan",
              carNumber: "DL 01 AB 1234",
            };
            const customer = s.customer || {};
            const user = customer.user || {};
            const customerName = user.name || customer.phone || "Customer";
            const customerPhone = user.phone || customer.phone || "";
            const status: ScheduleStatus = s.status || "pending";
            const badgeStyle =
              STATUS_BADGE_STYLE[status] || STATUS_BADGE_STYLE.pending;
            const isUpdating = updatingScheduleId === scheduleId;

            return (
              <TouchableOpacity
                key={scheduleId}
                style={styles.appointmentCard}
                activeOpacity={0.85}
                onPress={() => {
                  if (customer._id || customer.id) {
                    router.push({
                      pathname: "/Customer/[id]",
                      params: {
                        id: customer._id || customer.id,
                        name: customerName,
                        phone: customerPhone,
                      },
                    });
                  }
                }}
              >
                {/* Time Strip */}
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={14} color={BLUE} />
                  <Text style={styles.timeBadgeText}>{s.time || "10:00 AM"}</Text>
                </View>

                {/* Main Content */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.carTitle}>
                      {car.company} {car.model}
                    </Text>
                    <Text style={styles.carPlate}>{car.carNumber}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badgeStyle.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: badgeStyle.text },
                      ]}
                    >
                      {status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Customer Details Row */}
                <View style={styles.customerRow}>
                  <View style={styles.customerInfo}>
                    <Ionicons name="person-outline" size={14} color={MUTED} />
                    <Text style={styles.customerText}>{customerName}</Text>
                  </View>

                  {customerPhone ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Ionicons name="call-outline" size={12} color={MUTED} />
                      <Text style={{ fontSize: 12, color: MUTED, fontWeight: "500" }}>{customerPhone}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  {status === "pending" || status === "confirmed" ? (
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        styles.startBtn,
                        isUpdating && styles.disabledBtn,
                      ]}
                      onPress={() =>
                        handleUpdateStatus(scheduleId, "in_progress")
                      }
                      disabled={isUpdating}
                      activeOpacity={0.8}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="play" size={14} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Start Wash</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : status === "in_progress" ? (
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        styles.completeBtn,
                        isUpdating && styles.disabledBtn,
                      ]}
                      onPress={() =>
                        handleUpdateStatus(scheduleId, "completed")
                      }
                      disabled={isUpdating}
                      activeOpacity={0.8}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color="#FFFFFF"
                          />
                          <Text style={styles.actionBtnText}>
                            Mark Completed
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.completedInfoRow}>
                      <Ionicons
                        name="checkmark-done-circle"
                        size={18}
                        color="#16A36A"
                      />
                      <Text style={styles.completedInfoText}>
                        Wash Completed
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 13,
    color: MUTED,
    fontWeight: "600",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: DARK,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  todayButton: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: BLUE,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  dayStrip: {
    marginBottom: 18,
  },
  dayStripContent: {
    gap: 8,
  },
  dayCell: {
    width: 58,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  dayCellSelected: {
    backgroundColor: DARK,
    borderColor: DARK,
  },
  dayLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: "600",
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: "#94A3B8",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: DARK,
  },
  dayNumberSelected: {
    color: "#FFFFFF",
  },
  dayCountBadge: {
    marginTop: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  dayCountBadgeSelected: {
    backgroundColor: BLUE,
  },
  dayCountText: {
    fontSize: 9,
    fontWeight: "800",
    color: BLUE,
  },
  dayCountTextSelected: {
    color: "#FFFFFF",
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BLUE,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: "800",
    color: DARK,
    marginTop: 2,
  },
  summaryUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: MUTED,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "500",
    marginTop: 1,
  },
  addWashButton: {
    backgroundColor: BLUE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addWashText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  filterPillRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
  },
  filterPillActive: {
    backgroundColor: DARK,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: MUTED,
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: MUTED,
    fontSize: 13,
  },
  emptyState: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 6,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
  },
  emptyText: {
    marginTop: 4,
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyAddButton: {
    marginTop: 16,
    backgroundColor: BLUE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emptyAddButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  appointmentCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: BLUE,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  carTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: DARK,
  },
  carPlate: {
    fontSize: 13,
    fontWeight: "600",
    color: MUTED,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  customerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  customerText: {
    fontSize: 13,
    fontWeight: "600",
    color: DARK,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  callButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: BLUE,
  },
  cardActions: {
    marginTop: 12,
  },
  actionBtn: {
    height: 40,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  startBtn: {
    backgroundColor: BLUE,
  },
  completeBtn: {
    backgroundColor: "#16A36A",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  completedInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  completedInfoText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A36A",
  },
});
