import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Image,
  Modal,
  Linking,
} from "react-native";
import { Card } from "react-native-elements";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AntDesign,
  Entypo,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
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
        opacity: withTiming(isVisible ? 1 : 1.5, { duration: 300 }),
        transform: [
          { scale: withTiming(isVisible ? 1 : 0.9, { duration: 300 }) },
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
        if (!isTriggered.value && Math.abs(offset.value) > width * 0.01) {
          isTriggered.value = true; // Mark trigger to prevent multiple calls
        }

        offset.value = withSpring(0, {}, () => {
          if (isTriggered.value) {
            runOnJS(toggleBookmark)();
            isTriggered.value = false; // Reset flag for next swipe
          }
        });
      });

    const animatedStyles = useAnimatedStyle(() => ({
      transform: [{ translateX: offset.value }],
    }));
    const [modalVisible, setModalVisible] = useState(false);

    const openWhatsApp = () => {
      if (job.contact_preference?.whatsapp_link) {
        Linking.openURL(job.contact_preference.whatsapp_link);
      }
    };
    const makeCall = () => {
      Linking.openURL(`tel:${formattedContact}`);
    };

    ////////////////////////////////////animation /////////////////
    const textColor = isDarkMode ? "#ffffff" : "#1E1E1E";
    const bgColor = isDarkMode ? "#2D2D2D" : "#F5F5F5";

    const scalevac = useSharedValue(1);

    useEffect(() => {
      scalevac.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, []);

    const animatedStylevac = useAnimatedStyle(() => ({
      transform: [{ scale: scalevac.value }],
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

                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Image
                      source={{ uri: job.creatives[0].file }}
                      style={styles.jobImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <View style={{ width: "65%" }}>
                    <Text
                      style={[
                        styles.jobTitle,
                        {
                          lineHeight: 22,
                          flexShrink: 1,
                          overflow: "hidden",
                          width: "100%",
                        },
                      ]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {job.title || "Not Available"}
                    </Text>

                    <Text
                      style={{
                        color: "green",
                        fontWeight: "bold",
                        fontSize: 14,
                        marginTop: 5,
                      }}
                    >
                      {job.primary_details?.Salary || "Not Available"}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={toggleBookmark}>
                    <Entypo
                      name="bookmark"
                      size={40}
                      color={isBookmarked ? "#FFD700" : "#808080"}
                    />
                  </TouchableOpacity>

                  <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                  >
                    <View style={styles.modalContainer}>
                      <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={styles.modalBackground}
                      >
                        <Image
                          source={{ uri: job.creatives[0].file }}
                          style={styles.modalImage}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  </Modal>
                </View>

                <View
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome6
                    name="hotel"
                    size={15}
                    color="#404040"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.detailText}>
                    {job.company_name || "Not Available"}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <FontAwesome6
                    name="location-dot"
                    size={15}
                    color="#404040"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.detailText}>
                    {job.primary_details?.Place || "Not Available"}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <Animated.View
                    style={[
                      {
                        backgroundColor: bgColor,
                        padding: 10,
                        borderRadius: 12,
                        marginBottom: 10,
                        shadowColor: "#000",
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        alignSelf: "flex-start",
                        marginRight: 8,
                      },
                      animatedStylevac,
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: textColor,
                      }}
                    >
                      {job.job_tags[0].value}
                    </Text>
                  </Animated.View>
                  <View
                    style={[
                      {
                        backgroundColor: bgColor,
                        padding: 10,
                        borderRadius: 12,
                        marginBottom: 10,
                        shadowColor: "#000",
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        alignSelf: "flex-start",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: textColor,
                      }}
                    >
                      {job.primary_details.Job_Type}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    {
                      backgroundColor: bgColor,
                      padding: 10,
                      borderRadius: 12,
                      marginBottom: 10,
                      shadowColor: "#000",
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: textColor,
                    }}
                  >
                    Experience:
                    {job.primary_details.Experience}
                  </Text>
                </View>
   
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    // backgroundColor: "#F5F5F5",
                    padding: 3,
                    borderRadius: 10,
                    justifyContent: "space-between",
                  }}
                >
                  {job.contact_preference?.whatsapp_link && (
                    <TouchableOpacity
                      onPress={openWhatsApp}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#25D366",
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        flex: 1, // Ensures equal width
                        justifyContent: "center",
                        marginRight: 8, // Adds spacing between buttons
                      }}
                    >
                      <FontAwesome name="whatsapp" size={20} color="#ffffff" />
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 16,
                          marginLeft: 6,
                        }}
                      >
                        Chat
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={makeCall}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#ffbb00",
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      flex: 1, // Ensures equal width
                      justifyContent: "center",
                      marginRight: 8,
                    }}
                  >
                    <FontAwesome name="phone" size={20} color="#ffffff" />
                    <Text
                      style={{ color: "#ffffff", fontSize: 16, marginLeft: 6 }}
                    >
                      {formattedContact}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "gray",
                      paddingVertical: 8,
                      paddingHorizontal: 5,
                      borderRadius: 8,
                      backgroundColor: "transparent",
                      justifyContent: "center",
                    }}
                    onPress={() =>
                      isSelectionMode
                        ? onSelectChange(job.id)
                        : navigateToDetails()
                    }
                    onLongPress={() => !isSelectionMode && onLongPress()}
                  >
                    <AntDesign name="right" size={20} color="gray" />
                  </TouchableOpacity>
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
      backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
      padding: 15,
      shadowColor: isDarkMode ? "#ffffff" : "#ccc",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 1,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 1,
    },
    jobImage: {
      width: 80,
      height: 80,
      borderRadius: 5,
      marginRight: 10,
    },
    jobTitle: {
      color: isDarkMode ? "#ffffff" : "#000000",

      fontSize: 16,
      fontWeight: "bold",
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.8)",
    },
    modalBackground: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    modalImage: {
      width: "90%",
      height: "80%",
    },
    cardBody: {
      marginTop: 20,
    },
    detailText: {
      fontSize: 15,
      color: isDarkMode ? "#BBBBBB" : "#555",
      marginBottom: 5,
    },
    detailValue: {
      fontWeight: "600",
      color: isDarkMode ? "#FFFFFF" : "#222",
    },
    whatsappLink: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#25D366",
      textDecorationLine: "underline",
      marginTop: 10,
      // textAlign: "center",
    },
  });

export default JobCard;
