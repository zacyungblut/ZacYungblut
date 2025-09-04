import { StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import PhoneTextInput from "@/components/PhoneTextInput";
import { DEFAULT_COUNTRY } from "@/constants/countryCodes";
import { colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");

export default function SearchScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry] = useState(DEFAULT_COUNTRY);

  const handlePremiumPress = () => {
    // Handle premium upsell navigation
    console.log("Premium pressed");
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    // You can add search logic here as the user types
    console.log("Phone number changed:", text);
  };

  const clearSearch = () => {
    setPhoneNumber("");
  };

  return (
    <View style={styles.container}>
      <TopBar title="Search" onPremiumPress={handlePremiumPress} />

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
            <View style={styles.resultsPlaceholder}>
              <Text style={styles.searchingText}>Searching...</Text>
              <Text style={styles.searchingSubtext}>
                Looking for users with "{phoneNumber}"
              </Text>
            </View>
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
  resultsPlaceholder: {
    paddingTop: 100,
    alignItems: "center",
  },
  searchingText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  searchingSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: "center",
  },
});
