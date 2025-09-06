import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import DateModal from "@/app/date-modal";

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

export default function ManageScreen() {
  const { user, relationships, editExistingRelationship } = useUserRedux();

  // Privacy settings state
  const [showRelationshipStatus, setShowRelationshipStatus] = useState(true);
  const [showRelationshipDuration, setShowRelationshipDuration] =
    useState(true);
  const [showPartnerName, setShowPartnerName] = useState(false);
  const [allowSearchByOthers, setAllowSearchByOthers] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  // Date modal state
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());

  const handleBackPress = () => {
    router.back();
  };

  // Get current active relationship
  const activeRelationship = relationships.find((rel) => !rel.endDate);
  const partner = activeRelationship?.users.find(
    (u) => u.phone !== user?.phone
  );

  const handleBreakUp = () => {
    if (!activeRelationship) return;

    Alert.alert(
      "End Relationship",
      `Are you sure you want to end your relationship with ${
        partner?.name || partner?.phone
      }? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "End Relationship",
          style: "destructive",
          onPress: () => {
            // TODO: Implement relationship ending logic
            console.log("Relationship ended");
          },
        },
      ]
    );
  };

  const handleChangeStartDate = () => {
    if (!activeRelationship) return;

    // Set the current start date as the initial temp date
    setTempSelectedDate(new Date(activeRelationship.startDate));
    setDateModalVisible(true);
  };

  const handleDateModalClose = async (finalSelectedDate: Date) => {
    setDateModalVisible(false);

    // Save the date when modal closes
    if (activeRelationship) {
      try {
        await editExistingRelationship(activeRelationship.id, {
          startDate: finalSelectedDate.toISOString(),
        });
        console.log("Relationship date updated successfully");

        // Update local state to reflect the change
        setTempSelectedDate(finalSelectedDate);
      } catch (error) {
        console.error("Failed to update relationship date:", error);
        Alert.alert(
          "Error",
          "Failed to update relationship date. Please try again."
        );
      }
    }
  };

  const handleDateChange = (date: Date) => {
    setTempSelectedDate(date);
    // Don't update anything immediately, just update local state
  };

  const handleChangeRelationshipStatus = () => {
    // TODO: Open status picker (Single, Dating, Engaged, Married, etc.)
    console.log("Change relationship status pressed");
  };

  const handleEditPartnerInfo = () => {
    // TODO: Navigate to edit partner information
    console.log("Edit partner info pressed");
  };

  const privacySettings: PrivacySetting[] = [
    {
      id: "show_status",
      title: "Show Relationship Status",
      description: "Let others see if you're single, dating, married, etc.",
      value: showRelationshipStatus,
      onToggle: setShowRelationshipStatus,
    },
    {
      id: "show_duration",
      title: "Show Relationship Duration",
      description: "Display how long you've been together",
      value: showRelationshipDuration,
      onToggle: setShowRelationshipDuration,
    },
    {
      id: "show_partner",
      title: "Show Partner's Name",
      description: "Display who you're dating, not just your status",
      value: showPartnerName,
      onToggle: setShowPartnerName,
    },
    {
      id: "allow_search",
      title: "Allow Others to Search for Me",
      description: "Let people find you by searching your phone number",
      value: allowSearchByOthers,
      onToggle: setAllowSearchByOthers,
    },
    {
      id: "show_online",
      title: "Show Online Status",
      description: "Let others see when you're active on Official",
      value: showOnlineStatus,
      onToggle: setShowOnlineStatus,
    },
  ];

  const renderRelationshipItem = (
    title: string,
    icon: string,
    onPress: () => void,
    value?: string,
    destructive = false
  ) => (
    <TouchableOpacity
      style={[styles.manageItem, destructive && styles.destructiveItem]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.manageContent}>
        <Ionicons
          name={icon as any}
          size={24}
          color={
            destructive ? colors.status.error || "#FF3B30" : colors.text.primary
          }
          style={styles.manageIcon}
        />
        <View style={styles.textContainer}>
          <Text
            style={[styles.manageText, destructive && styles.destructiveText]}>
            {title}
          </Text>
          {value && <Text style={styles.valueText}>{value}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  );

  const renderPrivacyToggle = (setting: PrivacySetting) => (
    <View key={setting.id} style={styles.privacyItem}>
      <View style={styles.privacyContent}>
        <Text style={styles.privacyTitle}>{setting.title}</Text>
        <Text style={styles.privacyDescription}>{setting.description}</Text>
      </View>
      <Switch
        value={setting.value}
        onValueChange={setting.onToggle}
        trackColor={{
          false: colors.background.tertiary,
          true: colors.primary + "40", // 40% opacity
        }}
        thumbColor={setting.value ? colors.primary : colors.text.quaternary}
        ios_backgroundColor={colors.background.tertiary}
      />
    </View>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContainer}>{children}</View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar
        title="Manage"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Relationship Management Section */}
        {activeRelationship && (
          <>
            {renderSection(
              "Relationship Management",
              <>
                {renderRelationshipItem(
                  "Change Relationship Status",
                  "heart-outline",
                  handleChangeRelationshipStatus,
                  activeRelationship.status
                )}
                <View style={styles.separator} />
                {renderRelationshipItem(
                  "Edit When We Met",
                  "calendar-outline",
                  handleChangeStartDate,
                  new Date(activeRelationship.startDate).toLocaleDateString()
                )}
                <View style={styles.separator} />
                {renderRelationshipItem(
                  "Edit Partner Information",
                  "person-outline",
                  handleEditPartnerInfo,
                  partner?.name || "Add partner's name"
                )}
                <View style={styles.separator} />
                {renderRelationshipItem(
                  "End Relationship",
                  "heart-dislike-outline",
                  handleBreakUp,
                  undefined,
                  true
                )}
              </>
            )}
          </>
        )}

        {/* Privacy Settings Section */}
        {renderSection(
          "Privacy Settings",
          privacySettings.map((setting, index) => (
            <View key={setting.id}>
              {renderPrivacyToggle(setting)}
              {index < privacySettings.length - 1 && (
                <View style={styles.privacySeparator} />
              )}
            </View>
          ))
        )}

        {/* No Relationship Message */}
        {!activeRelationship && (
          <View style={styles.noRelationshipContainer}>
            <Ionicons
              name="heart-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.noRelationshipTitle}>
              No Active Relationship
            </Text>
            <Text style={styles.noRelationshipSubtitle}>
              Once you're in a relationship, you'll be able to manage it here
            </Text>
          </View>
        )}
      </ScrollView>
      {/* Date Modal - Always rendered, visibility controlled by props */}
      <DateModal
        visible={dateModalVisible}
        onClose={handleDateModalClose}
        selectedDate={tempSelectedDate}
        onDateChange={handleDateChange}
      />
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
    paddingTop: 20,
  },

  // Section styles
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.medium,
  },

  // Relationship management styles
  manageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background.secondary,
  },
  destructiveItem: {
    backgroundColor: colors.background.secondary,
  },
  manageContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  manageIcon: {
    marginRight: 12,
    width: 24,
  },
  textContainer: {
    flex: 1,
  },
  manageText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  destructiveText: {
    color: colors.status.error || "#FF3B30",
  },
  valueText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 52,
  },

  // Privacy settings styles
  privacyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background.secondary,
  },
  privacyContent: {
    flex: 1,
    marginRight: 12,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  privacySeparator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 16,
  },

  // No relationship state
  noRelationshipContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  noRelationshipTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  noRelationshipSubtitle: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 22,
  },
});
