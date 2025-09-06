import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import PhoneTextInput from "@/components/PhoneTextInput";
import { DEFAULT_COUNTRY } from "@/constants/countryCodes";
import { colors } from "@/constants/Colors";
import { searchUserByPhone } from "@/api";

interface SearchResult {
  phone: string;
  exists: boolean;
  relationshipStatus: string;
  name: string | null;
}

interface AlertSettings {
  statusChange: boolean;
  relationshipStart: boolean;
  relationshipEnd: boolean;
}

export default function AddAlertScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry] = useState(DEFAULT_COUNTRY);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);

  // Alert settings
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    statusChange: true,
    relationshipStart: false,
    relationshipEnd: false,
  });

  const handleBackPress = () => {
    router.back();
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    setSearchResult(null);
    setSearchError(null);

    // Perform search when user has typed a complete phone number
    if (text.length >= 10) {
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

  const updateAlertSetting = (key: keyof AlertSettings, value: boolean) => {
    setAlertSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getEnabledAlertsCount = () => {
    return Object.values(alertSettings).filter(Boolean).length;
  };

  const canCreateAlert = () => {
    return searchResult && getEnabledAlertsCount() > 0;
  };

  const handleCreateAlert = async () => {
    if (!canCreateAlert() || !searchResult) return;

    setIsCreatingAlert(true);

    try {
      // TODO: Implement create alert API call
      console.log("Creating alert for:", searchResult.phone, alertSettings);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        "Alert Created",
        `You'll now receive notifications when ${
          searchResult.name || searchResult.phone
        }'s relationship status changes.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to create alert:", error);
      Alert.alert("Error", "Failed to create alert. Please try again.");
    } finally {
      setIsCreatingAlert(false);
    }
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

  const renderAlertToggle = (
    key: keyof AlertSettings,
    title: string,
    description: string
  ) => (
    <View style={styles.alertToggleItem}>
      <View style={styles.alertToggleContent}>
        <Text style={styles.alertToggleTitle}>{title}</Text>
        <Text style={styles.alertToggleDescription}>{description}</Text>
      </View>
      <Switch
        value={alertSettings[key]}
        onValueChange={(value) => updateAlertSetting(key, value)}
        trackColor={{
          false: colors.background.tertiary,
          true: colors.primary + "40", // 40% opacity
        }}
        thumbColor={
          alertSettings[key] ? colors.primary : colors.text.quaternary
        }
        ios_backgroundColor={colors.background.tertiary}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar
        title="Add Alert"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search User</Text>
          <View style={styles.searchContainer}>
            <PhoneTextInput
              label=""
              phoneNumber={phoneNumber}
              onPhoneNumberChange={handlePhoneNumberChange}
              selectedCountry={selectedCountry}
              placeholder="Enter phone number"
              autoFocus={false}
              onCountryChange={() => {}}
              containerStyle={styles.phoneInputContainer}
            />
            {phoneNumber.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
                activeOpacity={0.7}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text.primary} />
            <Text style={styles.searchingText}>Searching...</Text>
          </View>
        ) : searchError ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle"
              size={48}
              color={colors.status.error || "#F44336"}
            />
            <Text style={styles.errorText}>{searchError}</Text>
          </View>
        ) : searchResult ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Found</Text>
            <View style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userPhone}>{searchResult.phone}</Text>
                {searchResult.name && (
                  <Text style={styles.userName}>{searchResult.name}</Text>
                )}
              </View>
              <View style={styles.statusContainer}>
                <Ionicons
                  name={getStatusIcon(searchResult.relationshipStatus)}
                  size={20}
                  color={getStatusColor(searchResult.relationshipStatus)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(searchResult.relationshipStatus) },
                  ]}>
                  {searchResult.relationshipStatus}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Alert Settings */}
        {searchResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alert Settings</Text>
            <Text style={styles.sectionSubtitle}>
              Choose what changes you want to be notified about
            </Text>
            <View style={styles.alertSettingsContainer}>
              {renderAlertToggle(
                "statusChange",
                "Relationship Status Changes",
                "Get notified when they become single, start dating, etc."
              )}
              <View style={styles.separator} />
              {renderAlertToggle(
                "relationshipStart",
                "New Relationships",
                "Get notified when they start dating someone new"
              )}
              <View style={styles.separator} />
              {renderAlertToggle(
                "relationshipEnd",
                "Relationship Ends",
                "Get notified when they become single again"
              )}
            </View>

            {getEnabledAlertsCount() === 0 && (
              <Text style={styles.warningText}>
                Select at least one alert type to continue
              </Text>
            )}
          </View>
        )}

        {/* Create Alert Button */}
        {searchResult && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.createButton,
                !canCreateAlert() && styles.createButtonDisabled,
              ]}
              onPress={handleCreateAlert}
              disabled={!canCreateAlert() || isCreatingAlert}
              activeOpacity={0.8}>
              {isCreatingAlert ? (
                <ActivityIndicator size="small" color={colors.heroSecondary} />
              ) : (
                <Text style={styles.createButtonText}>Create Alert</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Section styles
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 16,
    marginLeft: 4,
    lineHeight: 18,
  },

  // Search styles
  searchContainer: {
    position: "relative",
  },
  phoneInputContainer: {
    marginBottom: 0,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },

  // Loading and error styles
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  searchingText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error || "#F44336",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },

  // User card styles
  userCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  userInfo: {
    marginBottom: 12,
  },
  userPhone: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Alert settings styles
  alertSettingsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  alertToggleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background.secondary,
  },
  alertToggleContent: {
    flex: 1,
    marginRight: 12,
  },
  alertToggleTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 4,
  },
  alertToggleDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 16,
  },
  warningText: {
    fontSize: 14,
    color: colors.status.warning,
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },

  // Button styles
  buttonContainer: {
    paddingBottom: 32,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonDisabled: {
    backgroundColor: colors.text.quaternary,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.heroSecondary,
  },
});
