
import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme(); // Detects the current color scheme
  console.log(colorScheme);
  
  // Define icon colors based on the current theme
  const iconColor = colorScheme === 'dark' ? '#ffbb00' : '#ffbb00';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: iconColor, // Active tab icon color
        tabBarInactiveTintColor: 'gray', // Inactive tab icon color
        tabBarStyle: { backgroundColor: colorScheme === 'dark' ? 'black' : 'white' }, // Tab bar background color
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="briefcase-search" size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color }) => (
            <Entypo name="bookmarks" size={24} color={color} />
          ),
          headerShown: false,
        }}
      />

    </Tabs>
  );
}
