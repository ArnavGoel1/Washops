import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface Activity {
  id?: string | number;
  initials: string;
  name: string;
  order: string;
  time: string;
}

interface ActivityCardProps {
  activities: Activity[];
  onPress?: (activity: Activity) => void;
}

export default function ActivityCard({
  activities,
  onPress,
}: ActivityCardProps) {
  return (
    <View style={styles.card}>
      {activities.map((activity, index) => (
        <TouchableOpacity
          key={activity.id ?? index}
          style={[
            styles.row,
            index === activities.length - 1 && styles.lastRow,
          ]}
          activeOpacity={0.7}
          onPress={() => onPress?.(activity)}
        >
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {activity.initials}
            </Text>
          </View>

          {/* Customer information */}
          <View style={styles.customerInfo}>
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {activity.name}
            </Text>

            
          </View>
          <Text
              style={styles.order}
              
            >
              {activity.order}
            </Text>
          {/* Time */}
          <View style={styles.time}>
          <TouchableOpacity >
           <Text style = {styles.ButtonText}>
            {activity.time}
           </Text>  
          </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  /* ================= CARD ================= */

  card: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    borderWidth: 1,
    borderColor: '#E5EAF0',

    overflow: 'hidden',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 2,
  },

  /* ================= ROW ================= */

  row: {
    minHeight: 72,

    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  /* ================= AVATAR ================= */

  avatar: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: '#EFF6FF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  avatarText: {
    fontSize: 12,
    fontWeight: '800',

    color: '#2563EB',

    letterSpacing: 0.2,
  },

  /* ================= CUSTOMER ================= */

  customerInfo: {
    flex: 1,

    minWidth: 0,

    gap: 2,

    marginRight: 10,
  },

  name: {
    fontSize: 14,
    lineHeight: 19,

    fontWeight: '700',

    color: '#0F172A',
  },

  order: {
    marginTop: 2,
    marginRight:5,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',


    
  },

  /* ================= TIME ================= */

  time: {
    fontSize: 12,
    backgroundColor:'#00ff',
    fontWeight: '600',
    height:30,
    color: '#64748B',
    justifyContent:'center',
    marginRight: 4,
    borderRadius:10,
    minWidth: 58,

    textAlign: 'center',
  },

  /* ================= ARROW ================= */

  arrowContainer: {
    width: 22,

    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  ButtonText:{
    color:'#fff'
  }
});