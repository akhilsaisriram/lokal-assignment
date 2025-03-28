import React from "react";
import { View } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence, 
  Easing 
} from "react-native-reanimated";

const Skeleton = ({ isDark }) => {
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 800, easing: Easing.ease }),
        withTiming(1, { duration: 800, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const backgroundColor = isDark ? "#2C2C2C" : "#fff";
  const skeletonColor = isDark ? "#444" : "#e0e0e0";
  const shadowColor = isDark ? "#000" : "#000";

  return (
    <View style={{ padding: 12, backgroundColor, borderRadius: 10, marginBottom: 10, shadowColor, shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 }}>
      <Animated.View style={[{ width: "100%", height: 20, backgroundColor: skeletonColor, borderRadius: 5 }, animatedStyle]} />
      <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}>
        <Animated.View style={[{ width: 30, height: 30, backgroundColor: skeletonColor, borderRadius: 15 }, animatedStyle]} />
        <Animated.View style={[{ flex: 1, height: 20, marginLeft: 10, backgroundColor: skeletonColor, borderRadius: 5 }, animatedStyle]} />
      </View>
      <Animated.View style={[{ width: "80%", height: 15, marginTop: 10, backgroundColor: skeletonColor, borderRadius: 5 }, animatedStyle]} />
      <Animated.View style={[{ width: "60%", height: 15, marginTop: 5, backgroundColor: skeletonColor, borderRadius: 5 }, animatedStyle]} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 15 }}>
        <Animated.View style={[{ width: "45%", height: 40, backgroundColor: skeletonColor, borderRadius: 10 }, animatedStyle]} />
        <Animated.View style={[{ width: "45%", height: 40, backgroundColor: skeletonColor, borderRadius: 10 }, animatedStyle]} />
      </View>
    </View>
  );
};

export default Skeleton;
