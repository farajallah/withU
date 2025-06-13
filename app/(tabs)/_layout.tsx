import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Shield, Settings, Volume2, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.home'),
          tabBarIcon: ({ size, color }) => (
            <Shield size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="monitor"
        options={{
          title: t('common.monitor'),
          tabBarIcon: ({ size, color }) => (
            <Volume2 size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: t('common.status'),
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('common.settings'),
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabBarLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    marginTop: 4,
  },
  tabBarIcon: {
    marginBottom: 2,
  },
});