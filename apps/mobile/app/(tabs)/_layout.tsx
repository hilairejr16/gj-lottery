import { Tabs } from 'expo-router';
import { Home, Trophy, Gamepad2, Ticket, Wallet } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   '#F5A623',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: {
          backgroundColor: '#0D1520',
          borderTopColor:  '#1E3A5F',
          borderTopWidth:  1,
          height:          68,
          paddingBottom:   10,
          paddingTop:      6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        headerShown:      false,
      }}
    >
      <Tabs.Screen name="index"   options={{ title: 'Akèy',    tabBarIcon: ({ color }) => <Home     size={22} color={color} /> }} />
      <Tabs.Screen name="sports"  options={{ title: 'Espò',    tabBarIcon: ({ color }) => <Trophy   size={22} color={color} /> }} />
      <Tabs.Screen name="virtual" options={{ title: 'Vityèl',  tabBarIcon: ({ color }) => <Gamepad2 size={22} color={color} /> }} />
      <Tabs.Screen name="lottery" options={{ title: 'Lotri',   tabBarIcon: ({ color }) => <Ticket   size={22} color={color} /> }} />
      <Tabs.Screen name="wallet"  options={{ title: 'Pòtfèy', tabBarIcon: ({ color }) => <Wallet   size={22} color={color} /> }} />
    </Tabs>
  );
}
