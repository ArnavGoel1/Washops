import { OrderListItem as OrderListItemType } from '@/store/OrderContext';
import { ScheduleStatus } from '@/Types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OrderListItemProps {
  order: OrderListItemType;
  onPress: (order: OrderListItemType) => void;
}

export default function OrderListItem({ order, onPress }: OrderListItemProps) {
  return (
    <TouchableOpacity
      style={styles.orderRow}
      activeOpacity={0.6}
      onPress={() => onPress(order)}
    >
      <View style={styles.tagColumn}>
        <View style={styles.tagBadge}>
          <Text style={styles.orderTag}>{order.tag}</Text>
        </View>
      </View>

      <Text
        style={[styles.customerName, styles.customerColumn]}
        numberOfLines={1}
      >
        {order.customerName}
      </Text>

      <Text
        style={[styles.orderItems, styles.itemsColumn]}
        numberOfLines={1}
      >
        {order.car.model}
      </Text>

      <View style={styles.statusColumn}>
        <StatusBadge status={order.status} />
      </View>
    </TouchableOpacity>
  );
}

function StatusBadge({ status }: { status: ScheduleStatus }) {
  const statusStyle: Record<ScheduleStatus, any> = {
    pending: styles.pendingBadge,
    confirmed: styles.confirmedBadge,
    in_progress: styles.washingBadge,
    completed: styles.readyBadge,
    cancelled: styles.overdueBadge,
  };

  const textStyle: Record<ScheduleStatus, any> = {
    pending: styles.pendingText,
    confirmed: styles.confirmedText,
    in_progress: styles.washingText,
    completed: styles.readyText,
    cancelled: styles.overdueText,
  };

  const label: Record<ScheduleStatus, string> = {
    pending: 'PENDING',
    confirmed: 'CONFIRMED',
    in_progress: 'WASHING',
    completed: 'READY',
    cancelled: 'CANCELLED',
  };

  return (
    <View style={[styles.statusBadge, statusStyle[status]]}>
      <Text style={[styles.statusText, textStyle[status]]}>{label[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  orderRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  tagColumn: {
    width: '24%',
    justifyContent: 'center',
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  customerColumn: {
    width: '32%',
  },
  itemsColumn: {
    width: '20%',
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statusColumn: {
    width: '24%',
    alignItems: 'flex-end',
  },
  orderTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  orderItems: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pendingBadge: { backgroundColor: '#FFFBEB' },
  pendingText: { color: '#F59E0B' },
  confirmedBadge: { backgroundColor: '#EEF2FF' },
  confirmedText: { color: '#6366F1' },
  washingBadge: { backgroundColor: '#EFF6FF' },
  washingText: { color: '#3B82F6' },
  overdueBadge: { backgroundColor: '#FEF2F2' },
  overdueText: { color: '#EF4444' },
  readyBadge: { backgroundColor: '#ECFDF5' },
  readyText: { color: '#10B981' },
  deliveredBadge: { backgroundColor: '#F8FAFC' },
  deliveredText: { color: '#94A3B8' },
});