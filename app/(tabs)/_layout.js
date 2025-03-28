
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { View, StyleSheet, Pressable, useColorScheme } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from "@expo/vector-icons/Entypo";

function AnimatedTabButton({ isFocused, onPress, icon, label }) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });

  useEffect(() => {
    if (isFocused) {
      scale.value = withSpring(1.2);
      translateY.value = withSpring(5);
    } else {
      scale.value = withSpring(1);
      translateY.value = withSpring(0);
    }
  }, [isFocused]);

  const onPressIn = () => {
    scale.value = withTiming(0.9, { duration: 150 });
    translateY.value = withTiming(8, { duration: 150 });
  };

  const onPressOut = () => {
    if (isFocused) {
      scale.value = withTiming(1.2, { duration: 150 });
      translateY.value = withTiming(5, { duration: 150 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
      translateY.value = withTiming(0, { duration: 150 });
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        {icon}
      </Animated.View>
      <Animated.Text
        style={[styles.tabLabel, { color: isFocused ? "blue" : "gray" }]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export default function Layout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "index",
            tabBarButton: (props) => (
              <AnimatedTabButton
                {...props}
                label="index"
                icon={
                  <MaterialCommunityIcons
                    name="briefcase-search"
                    size={28}
                    color={
                      props.accessibilityState.selected ? "#ffbb00" : "gray"
                    }
                  />
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarButton: (props) => (
              <AnimatedTabButton
                {...props}
                label="Settings"
                icon={
                  <Entypo
                    name="bookmarks"
                    size={28}
                    color={
                      props.accessibilityState.selected ? "#ffbb00" : "gray"
                    }
                  />
                }
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end", // Moves tab bar to the bottom
    alignItems: "center", // Centers it horizontally
    backgroundColor: "#f5f5f5", // Optional background color
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    width: "95%",
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    bottom: 20,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
