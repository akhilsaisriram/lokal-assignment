import { Stack } from "expo-router/stack";
import { useColorScheme } from "react-native";

export default function Layout() {
  const theme = useColorScheme(); // Detect system theme

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme === "dark" ? "#1E1E1E" : "#F8F9FA", // Dark or Light background
        },
        headerTintColor: theme === "dark" ? "#FFFFFF" : "#000000", // White text in dark mode, black in light
        headerBackTitleStyle: {
          color: theme === "dark" ? "#FFFFFF" : "#000000", // Back arrow color
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="helloworld"
        options={({ route }) => ({
          title: JSON.parse(route.params?.job)?.company_name || "Job Details",
          headerShown: true,
          headerStyle: {
            backgroundColor: theme === "dark" ? "#1E1E1E" : "#F8F9FA",
          },
          headerTintColor: theme === "dark" ? "#FFFFFF" : "#000000",
          headerBackTitleStyle: {
            color: theme === "dark" ? "#FFFFFF" : "#000000",
          },
        })}
      />
    </Stack>
  );
}
