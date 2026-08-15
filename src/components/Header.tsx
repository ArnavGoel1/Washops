import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Header() {
  const Logo = require('@/assets/images/washops.png');

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
    <View style={styles.header}>
      {/* Logo */}
      <Image
        source={Logo}
        style={styles.logo}
        contentFit="contain"
      />

      {/* App Name */}
        <Text style={styles.title}>Washops</Text>
       
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea:{
        backgroundColor: "#FFFFFF",
    },
  header: {
    //width: '100%',
    height: 55,
    paddingHorizontal: 20,
    
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    // Soft drop shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
   // zIndex: 10,
 
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 13,
    marginRight: 12,
  },
  /*titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },*/
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
 /* subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },*/
});