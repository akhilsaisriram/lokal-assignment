import {
  Text,
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
  useColorScheme,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import JobCard from "../components/JobCard";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { AnimatedFAB, Button, Snackbar } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StatusBar } from "expo-status-bar";
import { API_BASE_URL } from "@env";

const api = axios.create({
  baseURL:  API_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default function Tab() {
  const [visible, setVisible] = React.useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000); // Auto-hide after 3s
  };
  const viewableItems = useSharedValue([]);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const theme = useColorScheme();
  const isDarkMode = theme === "dark";

  const fetchJobs = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      console.log("Fetching page:", page);
      const response = await api.get(`/jobs?page=${page}`);
      const newJobs = response.data.results || [];
      setJobs((prevJobs) => [...prevJobs, ...newJobs]);
      setHasMore(newJobs.length > 0);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{ padding: 10 }}>
        <ActivityIndicator size="large" />
      </View>
    );
  };

  const validJobs = jobs.filter((job) => job && job.id && job.title);

  const filteredJobs = validJobs.filter((job) => {
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
  const [isExtended, setIsExtended] = React.useState(true);

  const fabStyle = { bottom: 16, right: 16, position: "absolute" };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDarkMode ? "#1E1E1E" : "#f2f2f2" }}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#1E1E1E" : "#f0f0f0"}
      />
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        style={[styles.snackbar, { backgroundColor: "#2E7D32", Text: "white" }]} // ✅ Green background
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
            marginTop: 25,
          }}
        >
          <Text style={[styles.headerText, { color: "#ffbb00" }]}>Local jobs</Text>

          <TouchableOpacity style={styles.profileIconContainer}>
            <MaterialIcons
              name="account-circle"
              size={30}
              color={isDarkMode ? "#ffbb00" : "#ffbb00"}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: isDarkMode ? "#333" : "#f0f0f0" },
          ]}
        >
          <TextInput
            style={[
              styles.searchInput,
              {
                color: isDarkMode ? "#fff" : "#000",
                borderColor: isDarkMode ? "#fff" : "gray", // ✅ Dynamic border color
                borderWidth: 1, // ✅ Ensure border is visible
              },
            ]}
            placeholder="🔍Search by title, company, type, or location"
            placeholderTextColor={isDarkMode ? "#888" : "#666"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

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

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>

          <TouchableOpacity
            onPress={() => fetchJobs()}
            style={styles.reloadButton}
          >
            <MaterialIcons name="refresh" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredJobs}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            viewableItems={viewableItems}
            screenSource="index"
            showSnackbar={showSnackbar} 
          />
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onEndReached={fetchJobs}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          { flexGrow: 1 }, 
        ]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fabStyle: {
    bottom: 16,
    right: 16,
    position: "absolute",
  },
  errorContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
  },

  errorText: {
    color: "#ffffff",
    fontSize: 16,
    marginRight: 10,
  },

  reloadButton: {
    backgroundColor: "#B71C1C", 
    padding: 6,
    borderRadius: 6,
  },

  emptyText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },

  searchContainer: {
    position: "relative", 
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
  },
  searchInput: {
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: "#f0f0f0",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
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
  headerContainer: {
    padding: 12,
    paddingBottom: 8,
  },

  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    // marginTop: 25,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
  },
});
