import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from "react-native";
import { Card } from "react-native-elements";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const { width } = Dimensions.get("window"); // Get screen width

const JobCard = React.memo(
  ({
    job,
    refreshBookmarks = () => {},
    screenSource,
    viewableItems,
    showSnackbar,
    isSelectionMode = false,
    isSelected = false,
    onSelectChange = () => {},
    onLongPress = () => {},
  }) => {
    const slideAnim = useSharedValue(0);
    const navigation = useNavigation();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const isFocused = useIsFocused();
    const theme = useColorScheme(); // Detect system theme (light/dark)
    const backgroundOpacity = useSharedValue(0);

    useEffect(() => {
      const checkBookmark = async () => {
        try {
          let bookmarks = await AsyncStorage.getItem("bookmarkedJobs");
          bookmarks = bookmarks ? JSON.parse(bookmarks) : {};
          setIsBookmarked(!!bookmarks[job.id]);
        } catch (error) {
          console.error("Error checking bookmark:", error);
        }
      };
      checkBookmark();
    }, [isFocused]);
    const offset = useSharedValue(0);

    const rStyle = useAnimatedStyle(() => {
      const isVisible = viewableItems.value.includes(job.id);
      return {
        opacity: withTiming(isVisible ? 1 : 0, { duration: 300 }),
        transform: [
          { scale: withTiming(isVisible ? 1 : 0.8, { duration: 300 }) },
        ],
      };
    });

    const removeBookmark = async (bookmarks) => {
      delete bookmarks[job.id];
      setIsBookmarked(false);
      await AsyncStorage.setItem("bookmarkedJobs", JSON.stringify(bookmarks));

      refreshBookmarks();
    };

    const toggleBookmark = async () => {
      try {
        let bookmarks = await AsyncStorage.getItem("bookmarkedJobs");
        bookmarks = bookmarks ? JSON.parse(bookmarks) : {};

        if (bookmarks[job.id]) {
          if (screenSource === "settings") {
            showSnackbar(`Bookmarks Removed Sucessfully`);

            slideAnim.value = withTiming(-width, { duration: 600 }, () => {
              runOnJS(removeBookmark)(bookmarks);
            });
          } else {
            delete bookmarks[job.id];
            setIsBookmarked(false);
            await AsyncStorage.setItem(
              "bookmarkedJobs",
              JSON.stringify(bookmarks)
            );
            refreshBookmarks();
            showSnackbar(`Bookmarks Removed Sucessfully`);
          }
        } else {
          bookmarks[job.id] = job;
          setIsBookmarked(true);
          await AsyncStorage.setItem(
            "bookmarkedJobs",
            JSON.stringify(bookmarks)
          );
          refreshBookmarks();
          showSnackbar(`Bookmarked Sucessfully`); // Show Snackbar
        }
      } catch (error) {
        console.error("Error toggling bookmark:", error);
      }
    };

    const navigateToDetails = () => {
      navigation.navigate("helloworld", { job: JSON.stringify(job) });
    };

    const formattedContact = job.custom_link
      ? job.custom_link.replace(/^tel:/, "")
      : "Not Available";
    const isDarkMode = theme === "dark";
    const styles = getStyles(isDarkMode);

    const isTriggered = useSharedValue(false); // Prevent multiple triggers

    const pan = Gesture.Pan()
      .onChange((event) => {
        offset.value = event.translationX;
      })
      .onFinalize(() => {
        // Check if swiped past 10% in either direction
        if (!isTriggered.value && Math.abs(offset.value) > width * 0.1) {
          isTriggered.value = true; // Mark trigger to prevent multiple calls
        }

        // Move back to original position
        offset.value = withSpring(0, {}, () => {
          // Trigger the function ONLY after returning to original position
          if (isTriggered.value) {
            runOnJS(toggleBookmark)();
            isTriggered.value = false; // Reset flag for next swipe
          }
        });
      });

    const animatedStyles = useAnimatedStyle(() => ({
      transform: [{ translateX: offset.value }],
    }));

    const backgroundStyle = useAnimatedStyle(() => ({
      opacity: backgroundOpacity.value,
      backgroundColor: "yellow",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    }));
    return (
      <GestureHandlerRootView>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              { transform: [{ translateX: slideAnim }] },
              rStyle,
              animatedStyles,
            ]}
          >
            <TouchableOpacity
              onPress={() =>
                isSelectionMode ? onSelectChange(job.id) : navigateToDetails()
              }
              onLongPress={() => !isSelectionMode && onLongPress()}
            >
              <Card containerStyle={styles.cardContainer}>
                <View style={styles.cardHeader}>
                  {isSelectionMode && (
                    <MaterialIcons
                      name={
                        isSelected
                          ? "radio-button-checked"
                          : "radio-button-unchecked"
                      }
                      size={30}
                      color={isSelected ? "#FFD700" : "#808080"}
                    />
                  )}

                  <Text style={styles.jobTitle}>
                    {job.title || "Not Available"}
                  </Text>
                  <TouchableOpacity onPress={toggleBookmark}>
                    <Entypo
                      name="bookmark"
                      size={40}
                      color={isBookmarked ? "#FFD700" : "#808080"}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.detailText}>
                    📍 Location:{" "}
                    <Text style={styles.detailValue}>
                      {job.primary_details?.Place || "Not Available"}
                    </Text>
                  </Text>
                  <Text style={styles.detailText}>
                    💰 Salary:{" "}
                    <Text style={styles.detailValue}>
                      {job.primary_details?.Salary || "Not Available"}
                    </Text>
                  </Text>
                  <Text style={styles.detailText}>
                    📞 Contact:{" "}
                    <Text style={styles.detailValue}>{formattedContact}</Text>
                  </Text>
                  <Text style={styles.detailText}>
                    <FontAwesome name="whatsapp" size={18} color="#25D366" />{" "}
                    WhatsApp:{" "}
                    <Text style={styles.detailValue}>
                      {job.whatsapp_no || "Not Available"}
                    </Text>
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }
);

const getStyles = (isDarkMode) =>
  StyleSheet.create({
    cardContainer: {
      borderRadius: 12,
      borderWidth: 0,
      marginBottom: 5,
      backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
      padding: 15,
      shadowColor: isDarkMode ? "#ffffff" : "#ccc",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 5,
    },
    jobTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#ffffff" : "#333",
      flex: 1,
    },
    cardBody: {
      marginTop: 5,
    },
    detailText: {
      fontSize: 14,
      color: isDarkMode ? "#BBBBBB" : "#555",
      marginBottom: 5,
    },
    detailValue: {
      fontWeight: "600",
      color: isDarkMode ? "#FFFFFF" : "#222",
    },
  });

export default JobCard;
