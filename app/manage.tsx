import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  Image,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import DateModal from "@/app/date-modal";
import RelationshipStatusModal from "@/components/RelationshipStatusModal";
import { useNotification } from "@/contexts/NotificationContext";
import { shareMessage } from "@/utils/helpers";

export default function ManageScreen() {
  const {
    user,
    relationships,
    editExistingRelationship,
    endExistingRelationship, // Add this
    sendUserInvite,
    fetchUser,
    cancelUserInvite,
    recordShareAttempt,
    updateUserRelationshipTypeVisibility, // Add this
    invites,
  } = useUserRedux();

  const { addNotification } = useNotification();

  // Modal states
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isEndingRelationship, setIsEndingRelationship] = useState(false); // Add this

  // Remove this local state line:
  // const [showRelationshipType, setShowRelationshipType] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  // Get current active relationship
  const activeRelationship = relationships.find((rel) => !rel.endDate);
  const partner = activeRelationship?.users.find(
    (u) => u.phone !== user?.phone
  );

  // Check for pending sent invites
  const pendingSentInvites = invites.sent.filter(
    (invite) => invite.status === "PENDING"
  );

  // Function to get the appropriate image based on relationship status
  const getRelationshipImage = (status?: string) => {
    if (!activeRelationship) {
      // Check if user has pending invites first
      const hasPendingInvites = pendingSentInvites.length > 0;

      if (hasPendingInvites) {
        return require("@/assets/images/pending.png");
      }

      // User is single - check their isSingle preference
      if (user?.isSingle === false) {
        return require("@/assets/images/unknown.png");
      }
      return require("@/assets/images/single.png");
    }

    switch (status) {
      case "MARRIED":
        return require("@/assets/images/married.png");
      case "ENGAGED":
        return require("@/assets/images/engaged.png");
      case "DATING":
      default:
        return require("@/assets/images/dating.png");
    }
  };

  // Get current status display text
  const getCurrentStatusText = () => {
    if (activeRelationship) {
      switch (activeRelationship.status) {
        case "DATING":
          return "Dating";
        case "ENGAGED":
          return "Engaged";
        case "MARRIED":
          return "Married";
        default:
          return "In Relationship";
      }
    }

    // Check if user has pending invites first
    const hasPendingInvites = pendingSentInvites.length > 0;

    if (hasPendingInvites) {
      return "Pending";
    }

    // User is single - check their isSingle preference
    if (user?.isSingle === false) {
      return "Status Unknown";
    }
    return "Single";
  };

  // Get status color - now returns consistent color
  const getStatusColor = () => {
    return colors.primary;
  };

  const handleChangeRelationshipStatus = () => {
    setStatusModalVisible(true);
  };

  const handleStatusSelect = async (newStatus: string) => {
    if (!activeRelationship) {
      // For single users, the modal handles the isSingle update
      setStatusModalVisible(false);
      return;
    }

    setIsStatusUpdating(true);

    try {
      await editExistingRelationship(activeRelationship.id, {
        status: newStatus,
      });

      addNotification({
        title: "Status Updated",
        description: `Relationship status changed to ${newStatus.toLowerCase()}`,
        type: "success",
        emoji: "✅",
      });

      setStatusModalVisible(false);
    } catch (error) {
      console.error("Failed to update relationship status:", error);
      Alert.alert(
        "Error",
        "Failed to update relationship status. Please try again."
      );
    } finally {
      setIsStatusUpdating(false);
    }
  };

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
          onPress: async () => {
            setIsEndingRelationship(true);

            try {
              await endExistingRelationship(activeRelationship.id);

              addNotification({
                title: "Relationship Ended",
                description: "Your relationship has been ended successfully",
                type: "success",
                emoji: "💔",
              });

              // Refresh user data to get updated relationships and status
              await fetchUser();
            } catch (error) {
              console.error("Failed to end relationship:", error);
              Alert.alert(
                "Error",
                "Failed to end relationship. Please try again."
              );
            } finally {
              setIsEndingRelationship(false);
            }
          },
        },
      ]
    );
  };

  const handleChangeStartDate = () => {
    if (!activeRelationship) return;

    setTempSelectedDate(new Date(activeRelationship.startDate));
    setDateModalVisible(true);
  };

  const handleDateModalClose = async (finalSelectedDate: Date) => {
    setDateModalVisible(false);

    if (activeRelationship) {
      try {
        await editExistingRelationship(activeRelationship.id, {
          startDate: finalSelectedDate.toISOString(),
        });
        console.log("Relationship date updated successfully");
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
  };

  const handleInvitePartner = async () => {
    console.log("Invite partner pressed");
    setIsInviteLoading(true);

    try {
      const response = await sendUserInvite("DATING", false);
      const inviteId = response.data.invite.id;
      const inviteLink = `https://makeitofficial.us/confirm/${inviteId}`;

      try {
        const result = await Share.share({
          message: shareMessage,
          url: inviteLink,
          title: "My Relationship",
        });

        if (result.action === Share.sharedAction) {
          try {
            const shareMethod = result.activityType
              ? `native_share:${result.activityType}`
              : "native_share:unknown";

            await recordShareAttempt(inviteId, {
              shareMethod,
              wasSuccessful: true,
              wasAborted: false,
              platform: Platform.OS,
              appVersion: "1.0.0",
            });

            console.log(
              "Share successful via:",
              result.activityType || "unknown"
            );
          } catch (shareTrackingError) {
            console.error("Failed to track share attempt:", shareTrackingError);
          }

          addNotification({
            title: "Invite Shared",
            description: "Your invite link has been shared successfully",
            type: "success",
            emoji: "🎉",
          });

          await fetchUser();
        } else {
          try {
            await recordShareAttempt(inviteId, {
              shareMethod: "native_share:cancelled",
              wasSuccessful: false,
              wasAborted: true,
              platform: Platform.OS,
              appVersion: "1.0.0",
            });

            console.log("Share cancelled by user");
          } catch (shareTrackingError) {
            console.error("Failed to track aborted share:", shareTrackingError);
          }

          try {
            await cancelUserInvite(inviteId);
            console.log("Invite cancelled due to share dismissal");
          } catch (cancelError) {
            console.error(
              "Failed to cancel invite after share dismissal:",
              cancelError
            );
          }
        }
      } catch (shareError) {
        console.error("Error sharing:", shareError);

        try {
          await recordShareAttempt(inviteId, {
            shareMethod: "native_share:error",
            wasSuccessful: false,
            wasAborted: false,
            errorMessage:
              shareError instanceof Error
                ? shareError.message
                : String(shareError),
            platform: Platform.OS,
            appVersion: "1.0.0",
          });
        } catch (shareTrackingError) {
          console.error("Failed to track failed share:", shareTrackingError);
        }

        try {
          await cancelUserInvite(inviteId);
          console.log("Invite cancelled due to share error");
        } catch (cancelError) {
          console.error(
            "Failed to cancel invite after share error:",
            cancelError
          );
        }

        Alert.alert("Share Error", "Failed to share the invite link");
      }
    } catch (error: any) {
      console.error("Error creating invite:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create invitation";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsInviteLoading(false);
    }
  };

  const handleEditPartnerInfo = () => {
    console.log("Edit partner info pressed");
  };

  const renderItem = (
    title: string,
    icon: string,
    onPress: () => void,
    value?: string,
    destructive = false,
    loading = false,
    showChevron = true
  ) => (
    <TouchableOpacity
      style={[styles.item, destructive && styles.destructiveItem]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={loading}>
      <View style={styles.itemContent}>
        <Ionicons
          name={icon as any}
          size={24}
          color={
            destructive
              ? colors.status.error || "#FF3B30"
              : colors.text.secondary
          }
          style={styles.itemIcon}
        />
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.itemText,
              destructive && styles.destructiveText,
              loading && styles.loadingText,
            ]}
            allowFontScaling={false}>
            {title}
          </Text>
          {value && (
            <Text style={styles.valueText} allowFontScaling={false}>
              {value}
            </Text>
          )}
        </View>
      </View>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            destructive ? colors.status.error || "#FF3B30" : colors.primary
          }
        />
      ) : showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text.tertiary}
        />
      ) : null}
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} allowFontScaling={false}>
        {title}
      </Text>
      <View style={styles.sectionContainer}>{children}</View>
    </View>
  );

  // Build relationship management items based on status
  const getRelationshipItems = () => {
    const items = [];

    if (activeRelationship) {
      // User is in a relationship
      items.push(
        renderItem(
          "When We Started Dating",
          "calendar-outline",
          handleChangeStartDate,
          new Date(activeRelationship.startDate).toLocaleDateString(),
          undefined,
          undefined,
          true
        )
      );

      items.push(<View key="sep1" style={styles.separator} />);

      // Remove the "Go on a Break" item completely
      // items.push(renderItem("Go on a Break", "pause", handleEditPartnerInfo));
      // items.push(<View key="sep2" style={styles.separator} />);

      items.push(
        renderItem(
          "End Relationship",
          "heart-dislike-outline",
          handleBreakUp,
          undefined,
          true,
          isEndingRelationship, // Use the loading state
          false
        )
      );
    } else {
      // User is single
      items.push(
        renderItem(
          "Invite Your Partner",
          "person-add-outline",
          handleInvitePartner,
          pendingSentInvites.length > 0
            ? `${pendingSentInvites.length} pending`
            : undefined,
          false,
          isInviteLoading
        )
      );
    }

    return items;
  };

  // Add new function to render toggle item
  const renderToggleItem = (
    title: string,
    icon: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    description?: string
  ) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Ionicons
          name={icon as any}
          size={24}
          color={colors.text.secondary}
          style={styles.itemIcon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.itemText} allowFontScaling={false}>
            {title}
          </Text>
          {description && (
            <Text style={styles.valueText} allowFontScaling={false}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: colors.border.medium,
          true: colors.primary + "40", // Add transparency
        }}
        thumbColor={value ? colors.primary : colors.text.tertiary}
        ios_backgroundColor={colors.border.medium}
      />
    </View>
  );

  const handleToggleShowRelationshipType = async (value: boolean) => {
    try {
      await updateUserRelationshipTypeVisibility(value);

      addNotification({
        title: "Privacy Setting Updated",
        description: `Relationship type visibility ${
          value ? "enabled" : "disabled"
        }`,
        type: "success",
        emoji: "🔒",
      });
    } catch (error) {
      console.error("Failed to update relationship type visibility:", error);
      Alert.alert(
        "Error",
        "Failed to update privacy setting. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="Manage"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Big Status Box */}
        <TouchableOpacity
          style={styles.statusBox}
          onPress={handleChangeRelationshipStatus}
          activeOpacity={0.8}>
          <View style={styles.statusContent}>
            <View style={styles.statusImageContainer}>
              <Image
                source={getRelationshipImage(activeRelationship?.status)}
                style={styles.statusImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.statusInfo}>
              <Text
                style={[styles.statusText, { color: getStatusColor() }]}
                allowFontScaling={false}>
                {getCurrentStatusText()}
              </Text>
              {activeRelationship && partner && (
                <Text style={styles.partnerSubtitle} allowFontScaling={false}>
                  You and {partner.phone}
                </Text>
              )}
            </View>
          </View>
          {/* Edit Icon */}
          <Ionicons
            name="pencil"
            size={20}
            color={colors.text.secondary}
            style={styles.editIcon}
          />
        </TouchableOpacity>

        {/* Privacy Settings Section */}
        {renderSection("Privacy", [
          renderToggleItem(
            "Show my relationship type",
            "eye-outline",
            user?.showRelationshipType ?? true, // Use the actual user setting
            handleToggleShowRelationshipType,
            `Show that you're ${getCurrentStatusText()} when searched`
          ),
        ])}

        {/* Relationship Management Section */}
        {getRelationshipItems().length > 0 &&
          renderSection("Actions", getRelationshipItems())}
      </ScrollView>

      {/* Date Modal */}
      <DateModal
        visible={dateModalVisible}
        onClose={handleDateModalClose}
        selectedDate={tempSelectedDate}
        onDateChange={handleDateChange}
      />

      {/* Relationship Status Modal */}
      <RelationshipStatusModal
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        onStatusSelect={handleStatusSelect}
        currentStatus={getCurrentStatusText()}
        isInRelationship={!!activeRelationship}
        isUpdating={isStatusUpdating}
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

  // Big Status Box
  statusBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 32,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border.medium,
    position: "relative", // Add this to enable absolute positioning of children
  },
  statusContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  statusInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
  },
  partnerText: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: "400",
  },
  statusImageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusImage: {
    width: 140,
    height: 140,
  },
  statusText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  partnerSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 4,
  },
  editIcon: {
    position: "absolute",
    top: 16,
    right: 16,
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

  // Item styles
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.background.secondary,
    minHeight: 60,
  },
  destructiveItem: {
    backgroundColor: colors.background.secondary,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    marginRight: 12,
    width: 24,
  },
  textContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  destructiveText: {
    color: colors.status.error || "#FF3B30",
  },
  loadingText: {
    color: colors.text.secondary,
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
});
