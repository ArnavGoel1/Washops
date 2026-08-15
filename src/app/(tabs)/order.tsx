import Header from '@/components/Header';
import OrderListItem from '@/components/orders/OrderListItem';
import { useOrders } from '@/store/OrderContext';
import { Order } from '@/Types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Orders() {
  const { orders } = useOrders();
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.tag.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase());

    let matchesFilter = true;

    if (selectedFilter === 'IN PROGRESS') {
      matchesFilter = order.status === 'in_progress' || order.status === 'confirmed';
    }

    if (selectedFilter === 'OVERDUE') {
      matchesFilter = order.status === 'cancelled';
    }

    return matchesSearch && matchesFilter;
  });

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: '/Customer/[id]',
      params: {
        id: order.id,
        name: order.customer,
        phone: order.phone,
        tag: order.tag,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title */}
        <Text style={styles.title}>All Orders</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or tag number..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {['ALL', 'IN PROGRESS', 'OVERDUE'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders Table */}
        <View style={styles.ordersCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.tagColumn]}>TAG</Text>
            <Text style={[styles.headerText, styles.customerColumn]}>CUSTOMER</Text>
            <Text style={[styles.headerText, styles.itemsColumn]}>ITEMS</Text>
            <Text style={[styles.headerText, styles.statusColumn]}>STATUS</Text>
          </View>

          {filteredOrders.map((order) => (
            <OrderListItem
              key={order.id}
              order={order}
              onPress={handleOrderPress}
            />
          ))}

          {filteredOrders.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={32} color="#94A3B8" />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          )}
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={styles.exportButton}
          activeOpacity={0.8}
          onPress={() => console.log('Export report')}
        >
          <Ionicons name="download-outline" size={20} color="#1E293B" />
          <Text style={styles.exportText}>Export Daily Report</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  title: {
    marginTop: 24,
    marginHorizontal: 20,
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  searchContainer: {
    height: 50,
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  filterContainer: {
    height: 40,
    marginTop: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  filterButtonActive: {
    backgroundColor: '#0F172A',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  ordersCard: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tableHeader: {
    height: 48,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tagColumn: {
    width: '24%',
  },
  customerColumn: {
    width: '32%',
  },
  itemsColumn: {
    width: '20%',
  },
  statusColumn: {
    width: '24%',
    alignItems: 'flex-end',
  },
  emptyState: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  exportButton: {
    height: 48,
    marginTop: 24,
    marginHorizontal: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  exportText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
});