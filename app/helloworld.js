import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  Linking,
  Image,
  Modal,
} from "react-native";
import { Card, Divider } from "react-native-elements";
import {
  Entypo,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  MaterialIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snackbar } from "react-native-paper";
import AntDesign from "@expo/vector-icons/AntDesign";
const JobDetails = () => {
  const { job } = useLocalSearchParams();
  const jobObject = job ? JSON.parse(job) : null;
  const theme = useColorScheme();
  const [visible, setVisible] = React.useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000); // Auto-hide after 3s
  };
  useEffect(() => {
    const checkBookmark = async () => {
      try {
        let bookmarks = await AsyncStorage.getItem("bookmarkedJobs");
        bookmarks = bookmarks ? JSON.parse(bookmarks) : {};
        setIsBookmarked(!!bookmarks[jobObject?.id]);
      } catch (error) {
        console.error("Error checking bookmark:", error);
      }
    };
    checkBookmark();
  }, []);

  const toggleBookmark = async () => {
    console.log("ll");

    try {
      let bookmarks = await AsyncStorage.getItem("bookmarkedJobs");
      bookmarks = bookmarks ? JSON.parse(bookmarks) : {};

      if (bookmarks[jobObject?.id]) {
        delete bookmarks[jobObject.id];
        setIsBookmarked(false);
        showSnackbar(`Bookmark Removed Sucessfully`);
      } else {
        bookmarks[jobObject.id] = jobObject;
        setIsBookmarked(true);
        showSnackbar(`Bookmarked Sucessfully`);
      }

      await AsyncStorage.setItem("bookmarkedJobs", JSON.stringify(bookmarks));
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  if (!jobObject) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Job not found.</Text>
      </View>
    );
  }

  const formattedContact = jobObject.custom_link
    ? jobObject.custom_link.replace(/^tel:/, "")
    : "Not Available";

  const openWhatsApp = () => {
    if (jobObject.contact_preference?.whatsapp_link) {
      Linking.openURL(jobObject.contact_preference.whatsapp_link);
    }
  };
  ////////////////////////////////////////////////////////////
  const isDarkMode = theme === "dark";

  const [modalVisible, setModalVisible] = useState(false);
  const textColor = isDarkMode ? "#ffffff" : "#1E1E1E";
  const bgColor = isDarkMode ? "#2D2D2D" : "#F5F5F5";
  return (
    <SafeAreaView style={styles.safeArea(theme)}>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        style={[styles.snackbar, { backgroundColor: "#2E7D32", Text: "white" }]} // ✅ Green background
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
      <ScrollView contentContainerStyle={styles.container(theme)}>
        <Card containerStyle={styles.card(theme)}>
          <View style={styles.cardHeader}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image
                source={{ uri: jobObject.creatives[0].file }}
                style={styles.jobImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={{ width: "65%" }}>
              <Text
                style={[
                  styles.jobTitle,
                  {
                    width: "100%",
                  },
                ]}
              >
                {jobObject.title || "Not Available"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                toggleBookmark();
              }}
              hitSlop={{ top: 10, bottom: 20, left: 20, right: 20 }} // Expands touchable area
              activeOpacity={0.7} // Gives feedback when tapped
            >
              <Entypo
                name="bookmark"
                size={50}
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
                    source={{ uri: jobObject.creatives[0].file }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
          <View
            style={{
              marginTop: 5,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <FontAwesome
              name="money"
              size={18}
              color="black"
              style={{ marginRight: 5 }}
            />
            <Text
              style={{
                color: "green",
                fontWeight: "bold",
                fontSize: 14,
                marginTop: 5,
              }}
            >
              {jobObject.primary_details?.Salary || "Not Available"}
            </Text>
          </View>
          <View
            style={{
              marginTop: 5,
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
              {jobObject.company_name || "Not Available"}
            </Text>
          </View>
          <View
            style={{
              marginTop: 10,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <FontAwesome6
              name="location-dot"
              size={15}
              color="#404040"
              style={{ marginRight: 7 }}
            />
            <Text style={styles.detailText}>
              {jobObject.primary_details?.Place || "Not Available"}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
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
                  marginRight: 8,
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
                {jobObject.job_tags[0].value}
              </Text>
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
                {jobObject.primary_details.Job_Type}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />
          <View
            style={{
              backgroundColor: "#E3F2FD",
              padding: 16,
              borderRadius: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                Job Heighlights
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
              }}
            >
              <FontAwesome
                name="group"
                size={20}
                color="black"
                style={{ marginRight: 5 }}
              />
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                Number of Applications:
              </Text>
              <Text style={{ marginLeft: 5, fontSize: 16 }}>
                {jobObject.num_applications}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
              }}
            >
              <AntDesign
                name="staro"
                size={20}
                color="black"
                style={{ marginRight: 5 }}
              />
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                Experience:
              </Text>
              <Text style={{ marginLeft: 5, fontSize: 16 }}>
                {jobObject.primary_details.Experience}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
              }}
            >
              <Entypo
                name="open-book"
                size={20}
                color="black"
                style={{ marginRight: 5 }}
              />
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                Qualification:
              </Text>
              <Text style={{ marginLeft: 5, fontSize: 16 }}>
                {jobObject.primary_details.Qualification}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
              }}
            >
              <MaterialIcons
                name="category"
                size={20}
                color="black"
                style={{ marginRight: 5 }}
              />
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                Category:
              </Text>
              <Text style={{ marginLeft: 5, fontSize: 16 }}>
                {jobObject.job_category}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
              }}
            >
              <MaterialIcons
                name="work-outline"
                size={20}
                color="black"
                style={{ marginRight: 5 }}
              />
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                Job Role:
              </Text>
              <Text style={{ marginLeft: 5, fontSize: 16 }}>
                {jobObject.job_role}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "col",
                marginTop: 15,
              }}
            >
              <View>
                {jobObject.contentV3?.V3?.filter(
                  (item) =>
                    item.field_key === "Gender" ||
                    item.field_key === "Shift timing"
                ).map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 15,
                    }}
                  >
                    {item.field_key === "Gender" ? (
                      <FontAwesome5
                        name="venus-mars"
                        size={20}
                        color="black"
                        style={{ marginRight: 5 }}
                      />
                    ) : (
                      <MaterialIcons
                        name="schedule"
                        size={20}
                        color="black"
                        style={{ marginRight: 5 }}
                      />
                    )}
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                      {item.field_key}:
                    </Text>
                    <Text style={{ marginLeft: 5, fontSize: 16 }}>
                      {item.field_value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.detailsContainer}>
            {/* Display Gender and Shift Timing */}

            <Text style={styles.detail(theme)}>
              📜 Other Details: {jobObject.other_details}
            </Text>

            <Divider style={styles.divider} />

            {/* Contact Details */}
            <Text style={styles.detail(theme)}>
              📞 Contact HR: {formattedContact}
            </Text>
            {jobObject.contact_preference?.whatsapp_link && (
              <TouchableOpacity onPress={openWhatsApp}>
                <Text style={styles.whatsappLink}>
                  <FontAwesome name="whatsapp" size={20} color="#25D366" />{" "}
                  WhatsApp
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </ScrollView>
      <View style={styles.hh}></View>
    </SafeAreaView>
  );
};

// Styles
const styles = {
  safeArea: (theme) => ({
    flex: 1,
    backgroundColor: theme === "dark" ? "#121212" : "#F8F9FA",
  }),
  container: (theme) => ({
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    backgroundColor: theme === "dark" ? "#121212" : "#F8F9FA",
    height: "auto",
  }),
  card: (theme) => ({
    width: "100%",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    backgroundColor: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
    shadowColor: theme === "dark" ? "#000" : "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }),
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  snackbar: {
    position: "relative", // Ensure absolute positioning
    top: -100, // Adjust to position at the top
    // left: "10%",            // Center horizontally (10% from left)
    width: "60%", // Set a reasonable width
    zIndex: 1000, // Ensure it appears above everything
    elevation: 10, // Boost priority on Android
    alignSelf: "center", // Center horizontally
    textAlign: "center", // Align text to the center
    justifyContent: "center",
  },
  title: (theme) => ({
    fontSize: 24,
    fontWeight: "bold",
    color: theme === "dark" ? "#FFFFFF" : "#333",
    flexShrink: 1,
  }),
  company: (theme) => ({
    fontSize: 18,
    fontWeight: "600",
    color: theme === "dark" ? "#AAAAAA" : "#666",
    marginTop: 5,
  }),
  detailsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  detail: (theme) => ({
    fontSize: 16,
    color: theme === "dark" ? "#FFFFFF" : "#333",
    marginVertical: 5,
    lineHeight: 24,
  }),
  whatsappLink: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#25D366",
    textDecorationLine: "underline",
    marginTop: 10,
    textAlign: "center",
  },
  divider: {
    marginVertical: 15,
    backgroundColor: "#ddd",
    height: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  hh: {
    height: 60,
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
    // color: isDarkMode ? "#ffffff" : "#000000",

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
  }
};

export default JobDetails;
