import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { CustomerProfile, listCustomers } from "@/lib/api/customer";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomerList = async () => {
    try {
      const data = await listCustomers();
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.log("[Customers] Error loading customers:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomerList();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomerList();
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = search.toLowerCase();
    const name = (customer.user?.name || "").toLowerCase();
    const phone = customer.phone || customer.user?.phone || "";

    return name.includes(query) || phone.includes(search);
  });

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Page Header */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Customers</Text>
            <Text style={styles.subtitle}>
              Manage customer details & carwash history
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => router.push("/neworder")}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers by name or phone..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Customer Count */}
        <View style={styles.customerCountRow}>
          <Text style={styles.customerCount}>
            {filteredCustomers.length} Total Customers
          </Text>

          <TouchableOpacity
            style={styles.sortButton}
            activeOpacity={0.6}
            onPress={fetchCustomerList}
          >
            <Ionicons name="refresh-outline" size={16} color="#64748B" />
            <Text style={styles.sortText}>Reload</Text>
          </TouchableOpacity>
        </View>

        {/* Customer List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066FF" />
            <Text style={styles.loadingText}>Loading customers...</Text>
          </View>
        ) : (
          <View style={styles.customerList}>
            {filteredCustomers.map((customer) => {
              const name = customer.name || customer.user?.name || "Customer";
              const phone = customer.phone || customer.user?.phone || "No phone";
              const initials = name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "C";
              const carCount = customer.carDetails?.length || 0;
              const rate = customer.price ? "₹" + customer.price : "₹350";

              return (
                <TouchableOpacity
                  key={customer._id}
                  style={styles.customerCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/Customer/[id]",
                      params: {
                        id: customer._id,
                        name,
                        phone,
                      },
                    })
                  }
                >
                  {/* Avatar */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>

                  {/* Customer Info */}
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{name}</Text>

                    <View style={styles.phoneRow}>
                      <Ionicons name="call-outline" size={12} color="#64748B" />
                      <Text style={styles.phone}>{phone}</Text>
                    </View>

                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Ionicons name="car-outline" size={13} color="#64748B" />
                        <Text style={styles.statText}>
                          {carCount} {carCount === 1 ? "car" : "cars"}
                        </Text>
                      </View>

                      <View style={styles.dot} />

                      <Text style={styles.spentText}>{rate}</Text>
                    </View>
                  </View>

                  {/* Arrow */}
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              );
            })}

            {/* Empty State */}
            {filteredCustomers.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={44} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No customers found</Text>
                <Text style={styles.emptyText}>
                  Tap + Add above to create your first customer profile!
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddButton}
                  onPress={() => router.push("/neworder")}
                >
                  <Text style={styles.emptyAddText}>Add Customer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <Footer />
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  titleRow: {
    marginTop: 8,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  addButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  searchContainer: {
    height: 50,
    marginTop: 10,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },
  customerCountRow: {
    marginTop: 16,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  sortText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  customerList: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  customerCard: {
    minHeight: 80,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
  customerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  phoneRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  phone: {
    marginLeft: 4,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  statsRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  spentText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  emptyState: {
    minHeight: 220,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  emptyText: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },
  emptyAddButton: {
    marginTop: 14,
    backgroundColor: "#0066FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyAddText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
