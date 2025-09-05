import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import PhoneTextInput from "@/components/PhoneTextInput";
import { DEFAULT_COUNTRY } from "@/constants/countryCodes";
import { colors } from "@/constants/Colors";
import { searchUserByPhone } from "@/api";

const { width } = Dimensions.get("window");

interface SearchResult {
  phone: string;
  exists: boolean;
  relationshipStatus: string;
  name: string | null;
}

export default function SearchScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry] = useState(DEFAULT_COUNTRY);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handlePremiumPress = () => {
    // Handle premium upsell navigation
    console.log("Premium pressed");
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    setSearchResult(null);
    setSearchError(null);

    // Perform search when user has typed a complete phone number
    if (text.length >= 10) {
      // Adjust this based on your minimum phone number length
      performSearch(text);
    }
  };

  const performSearch = async (phone: string) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      // Combine country code with phone number
      const fullPhoneNumber = selectedCountry.code + phone;
      const response = await searchUserByPhone(fullPhoneNumber);

      if (response.data.success) {
        setSearchResult(response.data.result);
      } else {
        setSearchError("Search failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Search error:", error);
      if (error.response?.status === 401) {
        setSearchError("Please log in to search for users.");
      } else {
        setSearchError("Unable to search at this time. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setPhoneNumber("");
    setSearchResult(null);
    setSearchError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "single":
        return colors.status.success || "#4CAF50";
      case "dating":
      case "engaged":
      case "married":
        return colors.status.error || "#F44336";
      case "unknown":
        return colors.text.tertiary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "single":
        return "checkmark-circle";
      case "dating":
      case "engaged":
      case "married":
        return "heart";
      case "unknown":
        return "help-circle";
      default:
        return "information-circle";
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title="Search" />

      {/* Search bar at the very top */}
      <View style={styles.searchHeaderContainer}>
        <View style={styles.searchInputContainer}>
          <PhoneTextInput
            label=""
            phoneNumber={phoneNumber}
            onPhoneNumberChange={handlePhoneNumberChange}
            selectedCountry={selectedCountry}
            placeholder="Search by phone number"
            autoFocus={false}
            onCountryChange={() => {}}
            containerStyle={styles.phoneInputContainer}
          />
        </View>
      </View>

      {/* Content area */}
      <View style={styles.contentContainer}>
        {phoneNumber.length === 0 ? (
          // Empty state when no search input
          <View style={styles.emptyStateContainer}>
            <View style={styles.searchIconContainer}>
              <Ionicons
                name="search"
                size={80}
                color={colors.text.quaternary}
              />
            </View>

            <Text style={styles.emptyStateTitle}>Search anyone</Text>
            <Text style={styles.emptyStateSubtitle}>
              Search a phone number to see their relationship status.
            </Text>
          </View>
        ) : (
          // Search results area
          <View style={styles.searchResultsContainer}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.text.primary} />
                <Text style={styles.searchingText}>Searching...</Text>
                <Text style={styles.searchingSubtext}>
                  Looking for "{selectedCountry.code}
                  {phoneNumber}"
                </Text>
              </View>
            ) : searchError ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={60}
                  color={colors.status.error || "#F44336"}
                />
                <Text style={styles.errorText}>{searchError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => performSearch(phoneNumber)}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : searchResult ? (
              <View style={styles.resultContainer}>
                <View style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Ionicons
                      name={getStatusIcon(searchResult.relationshipStatus)}
                      size={40}
                      color={getStatusColor(searchResult.relationshipStatus)}
                    />
                    <Text style={styles.phoneResultText}>
                      {searchResult.phone}
                    </Text>
                  </View>

                  {searchResult.name && (
                    <Text style={styles.nameText}>{searchResult.name}</Text>
                  )}

                  <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Relationship Status</Text>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: getStatusColor(
                            searchResult.relationshipStatus
                          ),
                        },
                      ]}>
                      {searchResult.relationshipStatus}
                    </Text>
                  </View>

                  {searchResult.relationshipStatus === "Unknown" && (
                    <Text style={styles.unknownSubtext}>
                      This person hasn't joined Official yet or hasn't set their
                      status.
                    </Text>
                  )}
                </View>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Search header styles
  searchHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.primary,
  },
  searchInputContainer: {
    position: "relative",
  },
  phoneInputContainer: {
    marginBottom: 0,
  },

  // Content area styles
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  searchIconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },

  // Search results styles
  searchResultsContainer: {
    flex: 1,
    paddingTop: 16,
  },

  // Loading styles
  loadingContainer: {
    paddingTop: 100,
    alignItems: "center",
  },
  searchingText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  searchingSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: "center",
  },

  // Error styles
  errorContainer: {
    paddingTop: 100,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.status.error || "#F44336",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },

  // Result styles
  resultContainer: {
    paddingTop: 32,
  },
  resultCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  phoneResultText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 16,
    textAlign: "center",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "700",
  },
  unknownSubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
});
