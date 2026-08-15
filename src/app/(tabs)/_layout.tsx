import { Colors } from '@/constants/theme';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function AppTabs() {
  const scheme = useColorScheme();

  const colors =
    Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
     <GestureHandlerRootView style={{ flex: 1 }}>
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{
        selected: {
          color: colors.text,
        },
      }}
    >

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          Dashboard
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>


      <NativeTabs.Trigger name="customer">
        <NativeTabs.Trigger.Label>
          Customer
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

       <NativeTabs.Trigger name="Schedule">
        <NativeTabs.Trigger.Label>
          Schedule
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>


      <NativeTabs.Trigger name="Payment">
        <NativeTabs.Trigger.Label>
          Payment
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      

    </NativeTabs>
    </GestureHandlerRootView>
  );
}