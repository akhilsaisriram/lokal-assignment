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
} from "react-native";
import { Card, Divider } from "react-native-elements";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snackbar } from "react-native-paper";

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
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title(theme)}>{jobObject.title}</Text>
            <TouchableOpacity
              onPress={() => {
                toggleBookmark()
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
          </View>

          <Text style={styles.company(theme)}>{jobObject.company_name}</Text>
          <Divider style={styles.divider} />

          {/* Job Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detail(theme)}>
              📍 Location: {jobObject.primary_details?.Place}
            </Text>
            <Text style={styles.detail(theme)}>
              💼 Job Type: {jobObject.primary_details?.Job_Type}
            </Text>
            <Text style={styles.detail(theme)}>
              ⏳ Experience: {jobObject.primary_details?.Experience}
            </Text>
            <Text style={styles.detail(theme)}>
              🎓 Qualification: {jobObject.primary_details?.Qualification}
            </Text>
            <Text style={styles.detail(theme)}>
              💰 Salary: {jobObject.primary_details?.Salary}
            </Text>
            <Text style={styles.detail(theme)}>
              📅 Applications: {jobObject.num_applications}
            </Text>
            <Text style={styles.detail(theme)}>
              🏢 Category: {jobObject.job_category}
            </Text>
            <Text style={styles.detail(theme)}>
              🔖 Role: {jobObject.job_role}
            </Text>

            {/* Display Gender and Shift Timing */}
            {jobObject.contentV3?.V3?.filter(
              (item) =>
                item.field_key === "Gender" || item.field_key === "Shift timing"
            ).map((item, index) => (
              <Text key={index} style={styles.detail(theme)}>
                {item.field_key}: {item.field_value}
              </Text>
            ))}

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
      <View style={styles.hh}>
      </View>
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
    paddingVertical: 30,
    paddingHorizontal: 20,
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
    justifyContent: "space-between",
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
  height:60,

  },
};

export default JobDetails;
