import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Share,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useMemo, useEffect } from "react";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import InviteButton from "@/components/InviteButton";
import PendingInviteCard from "@/components/PendingInviteCard";
import DateModal from "@/app/date-modal";
import { useNotification } from "@/contexts/NotificationContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const iconSize = 28;

export default function RelationshipScreen() {
  const {
    user,
    relationships,
    invites,
    updateExistingRelationship,
    editExistingRelationship, // Use the new API function
    sendUserInvite,
    fetchUser,
    cancelUserInvite, // Add this
    recordShareAttempt,
  } = useUserRedux();

  const { addNotification } = useNotification();

  // Add state for date modal
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Calculate relationship status based on actual data
  const relationshipData = useMemo(() => {
    // Check if user has any active relationships
    const activeRelationship = relationships.find((rel) => !rel.endDate);

    if (activeRelationship) {
      return {
        status: "dating" as const,
        relationship: activeRelationship,
        partner: activeRelationship.users.find((u) => u.phone !== user?.phone),
      };
    }

    // Check for pending sent invites
    const pendingSentInvites = invites.sent.filter(
      (invite) => invite.status === "PENDING"
    );

    return {
      status: "single" as const,
      relationship: null,
      partner: null,
      pendingInvites: pendingSentInvites,
    };
  }, [relationships, invites, user?.phone]); // Remove pendingInvites from dependencies

  // Initialize temp date when modal opens
  useEffect(() => {
    if (dateModalVisible && relationshipData.relationship?.startDate) {
      setTempSelectedDate(new Date(relationshipData.relationship.startDate));
    }
  }, [dateModalVisible, relationshipData.relationship]);

  // Auto-open date modal if startDate equals createdAt (user hasn't set custom date)
  useEffect(() => {
    if (
      relationshipData.status === "dating" &&
      relationshipData.relationship &&
      !dateModalVisible
    ) {
      const startDate = new Date(relationshipData.relationship.startDate);
      const createdAt = new Date(relationshipData.relationship.createdAt);

      // Compare dates (ignoring milliseconds) - if they're the same, open modal
      const startDateStr = startDate.toISOString().slice(0, 19); // Remove milliseconds
      const createdAtStr = createdAt.toISOString().slice(0, 19); // Remove milliseconds

      if (startDateStr === createdAtStr) {
        // Small delay to ensure the screen has rendered
        const timer = setTimeout(() => {
          setDateModalVisible(true);
        }, 1000); // 1 second delay

        return () => clearTimeout(timer);
      }
    }
  }, [relationshipData, dateModalVisible]);

  // Calculate relationship duration
  const relationshipDuration = useMemo(() => {
    if (!relationshipData.relationship) return null;

    const startDate = new Date(relationshipData.relationship.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());

    const years = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
    );
    const days = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
    );

    return { years, months, days };
  }, [relationshipData.relationship]);

  const handlePremiumPress = () => {
    console.log("Premium pressed");
  };

  const handleEditProfile = () => {
    router.push("/settings");
  };

  const handleMessagePartner = () => {
    console.log("Message partner pressed");
  };

  const handleViewMemories = () => {
    console.log("View memories pressed");
  };

  const handleInvite = async () => {
    console.log("Invite pressed");
    setIsLoading(true);

    try {
      // Send invite with default "DATING" relationship type, but don't update local state yet
      const response = await sendUserInvite("DATING", false);
      const inviteId = response.data.invite.id;

      // Create the invite link
      const inviteLink = `https://makeitofficial.us/confirm/${inviteId}`;
      const shareMessage = `Hey! I'd like to make it official. Press this link to make us official`;

      // Show native share dialog
      try {
        const result = await Share.share({
          message: shareMessage,
          url: inviteLink, // iOS will use this for the URL
          title: "Make It Official",
        });

        if (result.action === Share.sharedAction) {
          // Record successful share attempt with detailed activity type
          try {
            const shareMethod = result.activityType
              ? `native_share:${result.activityType}`
              : "native_share:unknown";

            await recordShareAttempt(inviteId, {
              shareMethod,
              wasSuccessful: true,
              wasAborted: false,
              platform: Platform.OS,
              appVersion: "1.0.0", // You can get this from your app config
            });

            console.log(
              "Share successful via:",
              result.activityType || "unknown"
            );
          } catch (shareTrackingError) {
            console.error("Failed to track share attempt:", shareTrackingError);
            // Don't block the flow if tracking fails
          }

          addNotification({
            title: "Invite Shared",
            description: "Your invite link has been shared successfully",
            type: "success",
            emoji: "🎉",
          });

          // Only refresh user data after successful share
          await fetchUser();
        } else {
          // Record aborted share attempt
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

          // User dismissed or cancelled the share dialog
          // Cancel the invite in the backend
          try {
            await cancelUserInvite(inviteId);
            console.log("Invite cancelled due to share dismissal");
          } catch (cancelError) {
            console.error(
              "Failed to cancel invite after share dismissal:",
              cancelError
            );
            // Don't show error to user since they dismissed the share anyway
          }
        }
      } catch (shareError) {
        console.error("Error sharing:", shareError);

        // Record failed share attempt
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

        // Cancel the invite since sharing failed
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
      setIsLoading(false);
    }
  };

  const handleShareInvite = async (inviteId: string) => {
    try {
      // Create the invite link using the existing invite ID
      const inviteLink = `https://makeitofficial.us/confirm/${inviteId}`;
      const shareMessage = `Hey! I'd like to make it official. Press this link to make us official`;

      // Show native share dialog
      const result = await Share.share({
        message: shareMessage,
        url: inviteLink, // iOS will use this for the URL
        title: "Make It Official",
      });

      if (result.action === Share.sharedAction) {
        // Record successful reshare attempt with detailed activity type
        try {
          const shareMethod = result.activityType
            ? `reshare:${result.activityType}`
            : "reshare:unknown";

          await recordShareAttempt(inviteId, {
            shareMethod,
            wasSuccessful: true,
            wasAborted: false,
            platform: Platform.OS,
            appVersion: "1.0.0",
          });

          console.log(
            "Reshare successful via:",
            result.activityType || "unknown"
          );
        } catch (shareTrackingError) {
          console.error("Failed to track reshare attempt:", shareTrackingError);
        }

        addNotification({
          title: "Invite Shared",
          description: "Your invite link has been shared successfully",
          type: "success",
          emoji: "🎉",
        });
      } else {
        // Record aborted reshare attempt
        try {
          await recordShareAttempt(inviteId, {
            shareMethod: "reshare:cancelled",
            wasSuccessful: false,
            wasAborted: true,
            platform: Platform.OS,
            appVersion: "1.0.0",
          });

          console.log("Reshare cancelled by user");
        } catch (shareTrackingError) {
          console.error("Failed to track aborted reshare:", shareTrackingError);
        }
      }
    } catch (shareError) {
      console.error("Error sharing:", shareError);

      // Record failed reshare attempt
      try {
        await recordShareAttempt(inviteId, {
          shareMethod: "reshare:error",
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
        console.error("Failed to track failed reshare:", shareTrackingError);
      }

      Alert.alert("Share Error", "Failed to share the invite link");
    }
  };

  const handlePastSearches = () => {
    router.push("/past-searches");
  };
  const handleManage = () => {
    router.push("/manage");
  };

  const handleAlerts = () => {
    router.push("/alerts");
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelUserInvite(inviteId);

      addNotification({
        title: "Invite Cancelled",
        description: "Your invite has been cancelled successfully",
        type: "success",
        emoji: "✅",
      });

      // Refresh user data to update the UI
      await fetchUser();
    } catch (error: any) {
      console.error("Failed to cancel invite:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to cancel invite";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      // This function is not directly available in useUserRedux,
      // so it will be handled by the API call in the backend.
      // For now, we'll just log and show an alert.
      console.log("Invite accepted successfully");
      Alert.alert(
        "Success",
        "Relationship confirmed! You are now officially connected."
      );
    } catch (error) {
      console.error("Failed to accept invite:", error);
      Alert.alert("Error", "Failed to accept invite. Please try again.");
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      // This function is not directly available in useUserRedux,
      // so it will be handled by the API call in the backend.
      // For now, we'll just log and show an alert.
      console.log("Invite declined successfully");
      Alert.alert("Success", "Invite declined successfully.");
    } catch (error) {
      console.error("Failed to decline invite:", error);
      Alert.alert("Error", "Failed to decline invite. Please try again.");
    }
  };

  const handleDateEdit = () => {
    setDateModalVisible(true);
  };

  const handleDateModalClose = async (finalSelectedDate: Date) => {
    setDateModalVisible(false);

    // ALWAYS save the date when modal closes, even if unchanged
    // This ensures startDate will be different from createdAt
    if (relationshipData.relationship) {
      try {
        await editExistingRelationship(relationshipData.relationship.id, {
          startDate: finalSelectedDate.toISOString(),
        });
        console.log("Relationship date updated successfully");

        // Update local state to reflect the change
        setTempSelectedDate(finalSelectedDate);
      } catch (error) {
        console.error("Failed to update relationship date:", error);
        // You could add an Alert here if needed
      }
    }
  };

  const handleDateChange = (date: Date) => {
    setTempSelectedDate(date);
    // Don't update anything immediately, just update local state
  };

  // Function to get the appropriate image based on relationship status
  const getRelationshipImage = (status?: string) => {
    switch (status) {
      case "MARRIED":
        return require("@/assets/images/married.png");
      case "SITUATIONSHIP":
        return require("@/assets/images/situationship.png");
      case "DATING":
      default:
        return require("@/assets/images/dating.png");
    }
  };

  // Function to get user-friendly status text
  const getStatusText = (status?: string) => {
    switch (status) {
      case "DATING":
        return "Dating";
      case "ENGAGED":
        return "Engaged";
      case "MARRIED":
        return "Married";
      case "SEPARATED":
        return "Separated";
      case "WIDOWED":
        return "Widowed";
      case "SITUATIONSHIP":
        return "Situationship";
      case "FRIENDS_WITH_BENEFITS":
        return "Friends with Benefits";
      case "ON_A_BREAK":
        return "On a Break";
      case "OPEN_RELATIONSHIP":
        return "Open Relationship";
      case "POLYAMOROUS":
        return "Polyamorous";
      default:
        return "In Relationship";
    }
  };

  // Single state render
  if (relationshipData.status === "single") {
    const hasPendingInvites =
      relationshipData.pendingInvites &&
      relationshipData.pendingInvites.length > 0;

    return (
      <View style={styles.container}>
        <TopBar
          title={
            relationshipData?.status === "single"
              ? "Make it Official"
              : "It's Official"
          }
        />

        <View style={styles.content}>
          {/* Single Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.singleImageContainer}>
              <View style={styles.imagePlaceholder}>
                <Image
                  source={require("@/assets/images/single.png")}
                  style={styles.singleImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.relationshipInfo}>
              <Text style={styles.statusText}>Single</Text>
              <Text style={styles.partnerText}>
                {hasPendingInvites ? "Invite pending..." : "Ready to connect"}
              </Text>
            </View>
          </View>

          {/* Invite Button or Pending Invites */}
          <View style={styles.inviteContainer}>
            {hasPendingInvites ? (
              <View style={styles.pendingInvitesContainer}>
                <PendingInviteCard
                  invite={relationshipData.pendingInvites![0]}
                  onCancel={handleCancelInvite}
                  onShare={handleShareInvite}
                />
                {relationshipData.pendingInvites!.length > 1 && (
                  <Text style={styles.moreInvitesText}>
                    +{relationshipData.pendingInvites!.length - 1} more invites
                  </Text>
                )}
              </View>
            ) : (
              <InviteButton onPress={handleInvite} />
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.searchesButton]}
              onPress={handlePastSearches}
              activeOpacity={0.8}>
              <Ionicons name="search" size={20} color={colors.text.secondary} />
              <Text style={styles.searchesButtonText}>Past Searches</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleManage}
              activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="construct"
                  size={iconSize}
                  color={colors.text.secondary}
                />
              </View>
              <Text style={styles.quickActionText}>Manage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleAlerts}
              activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="notifications"
                  size={iconSize}
                  color={colors.text.secondary}
                />
              </View>
              <Text style={styles.quickActionText}>Alerts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleEditProfile}
              activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="settings"
                  size={iconSize}
                  color={colors.text.secondary}
                />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Dating state render (existing functionality with dynamic images)
  return (
    <View style={styles.container}>
      <TopBar title="Relationship" />

      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.datingImageContainer}>
            <View style={styles.imagePlaceholder}>
              <Image
                source={getRelationshipImage(
                  relationshipData.relationship?.status
                )}
                style={styles.datingImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.relationshipInfo}>
            <Text style={styles.statusText}>
              {getStatusText(relationshipData.relationship?.status)}
            </Text>
            <Text style={styles.partnerText}>
              {relationshipData.partner?.name ||
                relationshipData.partner?.phone ||
                "Partner"}
            </Text>
          </View>
        </View>

        {/* Stats Section with actual duration */}
        <TouchableOpacity
          style={styles.statsContainer}
          onPress={handleDateEdit}
          activeOpacity={0.8}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {relationshipDuration?.years || 0}
            </Text>
            <Text style={styles.statLabel}>Years</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {relationshipDuration?.months || 0}
            </Text>
            <Text style={styles.statLabel}>Months</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {relationshipDuration?.days || 0}
            </Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.searchesButton]}
            onPress={handlePastSearches}
            activeOpacity={0.8}>
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <Text style={styles.searchesButtonText}>Past Searches</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={handleManage}
            activeOpacity={0.7}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="construct"
                size={iconSize}
                color={colors.text.secondary}
              />
            </View>
            <Text style={styles.quickActionText}>Manage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={handleAlerts}
            activeOpacity={0.7}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="notifications"
                size={iconSize}
                color={colors.text.secondary}
              />
            </View>
            <Text style={styles.quickActionText}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={handleEditProfile}
            activeOpacity={0.7}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="settings"
                size={iconSize}
                color={colors.text.secondary}
              />
            </View>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },

  // Image placeholder styles
  imagePlaceholder: {
    borderRadius: 16,
    borderWidth: 0,
    borderColor: colors.border.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  // Single state styles
  singleImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  singleImage: {
    width: 120,
    height: 120,
  },
  inviteContainer: {
    marginBottom: 32,
  },

  // Pending invite styles
  pendingInvitesContainer: {
    gap: 12,
  },
  moreInvitesText: {
    textAlign: "center",
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: "italic",
    marginTop: 8,
  },

  // Dating state styles
  datingImageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  datingImage: {
    width: 120,
    height: 120,
  },
  relationshipInfo: {
    alignItems: "center",
  },
  statusText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  partnerText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    opacity: 0.5,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.hero,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.heroSecondary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.heroSecondary,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  quickActionItem: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: "500",
    textAlign: "center",
  },
  searchesButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.text.secondary,
  },
  searchesButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
  },
});
