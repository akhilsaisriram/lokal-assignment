import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import JobCard from "../components/JobCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Snackbar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function settings() {
  const [visible, setVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  };

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();
  const theme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState("");
  const viewableItems = useSharedValue([]);

  // New state for multi-select mode:
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const fetchBookmarkedJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let bookmarks = await AsyncStorage.getItem("bookmarkedJobs");
      bookmarks = bookmarks ? JSON.parse(bookmarks) : {};
      if (typeof bookmarks !== "object" || Array.isArray(bookmarks)) {
        throw new Error("Invalid data format");
      }
      const jobList = Object.values(bookmarks);
      setJobs(jobList);
    } catch (error) {
      console.error("Error fetching bookmarked jobs:", error);
      setError("Failed to load bookmarks. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarkedJobs();
  }, [isFocused, fetchBookmarkedJobs]);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  };

  const isDarkMode = theme === "dark";

  const filteredJobs = jobs.filter((job) => {
    const searchLower = searchQuery.toLowerCase().trim();
    const location = job.primary_details?.Place?.toLowerCase() || "";
    const jobType = job.primary_details?.Job_Type?.toLowerCase() || "";
    const companyName = job.company_name?.toLowerCase() || "";
    const jobTitle = job.title?.toLowerCase() || "";
    return (
      location.includes(searchLower) ||
      jobType.includes(searchLower) ||
      companyName.includes(searchLower) ||
      jobTitle.includes(searchLower)
    );
  });

  // Toggle between selecting all filtered jobs or clearing selection.
  const handleSelectAllToggle = () => {
    if (selectedJobs.length === filteredJobs.length) {
      // Deselect all and exit selection mode.
      setSelectedJobs([]);
      setIsSelectionMode(false);
    } else {
      // Select all filtered job IDs.
      setSelectedJobs(filteredJobs.map((job) => job.id));
      setIsSelectionMode(true);
    }
  };
  console.log(selectedJobs);
  const handleDeleteSelected = async () => {
    try {
      setError(null);

      let bookmarks = await AsyncStorage.getItem("bookmarkedJobs");
      bookmarks = bookmarks ? JSON.parse(bookmarks) : {};

      if (typeof bookmarks !== "object" || Array.isArray(bookmarks)) {
        throw new Error("Invalid data format");
      }

      // Remove selected jobs from bookmarks
      selectedJobs.forEach((jobId) => {
        delete bookmarks[jobId];
      });

      // Save updated bookmarks back to AsyncStorage
      await AsyncStorage.setItem("bookmarkedJobs", JSON.stringify(bookmarks));

      // Update state to reflect the changes
      const updatedJobList = Object.values(bookmarks);
      setJobs(updatedJobList);
      setSelectedJobs([]); // Clear selection after deletion

      showSnackbar("Selected jobs deleted successfully"); // Show feedback
    } catch (error) {
      console.error("Error deleting selected jobs:", error);
      setError("Failed to delete selected jobs. Please try again.");
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#1E1E1E" : "#f2f2f2" },
      ]}
    >
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        style={[styles.snackbar, { backgroundColor: "#2E7D32" }]}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
      <View style={styles.headerContainer}>
        <View
          style={{
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isSelectionMode ? 30 : 10,
          }}
        >
          <Text style={[styles.headerText, { color: "#ffbb00" }]}>
            Bookmarks
          </Text>

          <TouchableOpacity style={styles.profileIconContainer}>
            <MaterialIcons name="account-circle" size={30} color="#ffbb00" />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.searchContainer,
            // { backgroundColor: isDarkMode ? "#333" : "#f0f0f0" },
          ]}
        >
          <TextInput
            style={[
              styles.searchInput,
              {
                color: isDarkMode ? "#fff" : "#000",
                borderColor: isDarkMode ? "#fff" : "gray",
                borderWidth: 1,
                marginBottom: 5,
                marginTop: 20,
              },
            ]}
            placeholder="🔍Search by title, company, type, or location"
            placeholderTextColor={isDarkMode ? "#888" : "#666"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isSelectionMode ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                height: 50,
              }}
            >
              {/* Select All / Deselect All Button */}
              <TouchableOpacity
                onPress={handleSelectAllToggle}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isDarkMode ? "#444" : "transparent", // Dark or Light Mode
                  padding: 10,
                  borderRadius: 8,
                  justifyContent: "center",
                  marginRight: 10, // Space between buttons
                  flex: 1, // Make buttons equal width
                }}
              >
                <MaterialIcons
                  name={
                    selectedJobs.length === filteredJobs.length
                      ? "radio-button-checked"
                      : "radio-button-unchecked"
                  }
                  size={30}
                  color="#FFD700"
                />
                <Text
                  style={{
                    marginLeft: 10,
                    fontSize: 16,
                    fontWeight: "bold",
                    color: isDarkMode ? "#FFF" : "#222", // Adapt text color
                  }}
                >
                  {selectedJobs.length === filteredJobs.length
                    ? "Deselect All"
                    : "Select All"}
                </Text>
              </TouchableOpacity>

              {/* Delete Selected Button */}
              <TouchableOpacity
                onPress={handleDeleteSelected}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "red",
                  padding: 10,
                  borderRadius: 8,
                  justifyContent: "center",
                  flex: 1, // Equal width
                }}
              >
                <MaterialIcons name="delete" size={30} color="#FFF" />
                <Text
                  style={{
                    marginLeft: 10,
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#FFF",
                  }}
                >
                  Delete Selected
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View></View>
          )}

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <MaterialIcons
                name="clear"
                size={20}
                color={isDarkMode ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : jobs.length > 0 ? (
        <FlatList
          data={filteredJobs}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              refreshBookmarks={fetchBookmarkedJobs}
              viewableItems={viewableItems}
              screenSource="settings"
              showSnackbar={showSnackbar}
              // Pass the selection props:
              isSelectionMode={isSelectionMode}
              isSelected={selectedJobs.includes(item.id)}
              onSelectChange={(id) => {
                if (selectedJobs.includes(id)) {
                  const newSelected = selectedJobs.filter(
                    (jobId) => jobId !== id
                  );
                  setSelectedJobs(newSelected);
                  if (newSelected.length === 0) {
                    // Exit selection mode if nothing is selected.
                    setIsSelectionMode(false);
                  }
                } else {
                  setSelectedJobs([...selectedJobs, id]);
                }
              }}
              onLongPress={() => {
                // On first long-press, enter selection mode and select the card.
                if (!isSelectionMode) {
                  setIsSelectionMode(true);
                  setSelectedJobs([item.id]);
                }
              }}
            />
          )}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No Result found for "{searchQuery}" Try another.
              </Text>
            </View>
          )}
          onViewableItemsChanged={({ viewableItems: vItems }) => {
            viewableItems.value = vItems.map((vItem) => vItem.item.id);
          }}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No bookmarks yet. Start saving jobs to see them here!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    position: "relative",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
  },
  searchInput: {
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 20,

    fontSize: 16,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  container: {
    flex: 1,
    width: "100%",
  },
  snackbar: {
    position: "absolute",
    top: -100,
    width: "60%",
    zIndex: 1000,
    elevation: 10,
    alignSelf: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  headerContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  profileIconContainer: {
    // Optional styling for your profile icon.
  },
  selectionModeButton: {
    // Add any extra styling you want for the select all button.
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d9534f",
    textAlign: "center",
  },
  footer: {
    padding: 15,
    alignItems: "center",
  },
  listContent: {
    top: 20,
    paddingHorizontal: 0,
  },
});
