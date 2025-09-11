import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  Share,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import DateModal from "@/app/date-modal";
import PendingInviteCard from "@/components/PendingInviteCard";
import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import Tutorial from "@/components/Tutorial";
import TapToInviteButton from "@/components/TapToInviteButton"; // Add this import
import { colors } from "@/constants/Colors";
import { useNotification } from "@/contexts/NotificationContext";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { shareMessage } from "@/utils/helpers";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const iconSize = 28;

export default function RelationshipScreen() {
  const {
    user,
    relationships,
    invites,
    updateExistingRelationship,
    editExistingRelationship, // Use the new API function
    fetchUser,
    cancelUserInvite, // Add this
    recordShareAttempt,
  } = useUserRedux();

  const { addNotification } = useNotification();

  // Add state for date modal
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [tutorialVisible, setTutorialVisible] = useState(false); // Add this state
  // Remove trustCenterVisible state since we're navigating to a page now

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

  // Remove the entire handleInvite function - it's now in TapToInviteButton

  const handleShareInvite = async (inviteId: string) => {
    try {
      // Create the invite link using the existing invite ID
      const inviteLink = `https://makeitofficial.us/confirm/${inviteId}`;

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
    if (!relationshipData.relationship) {
      // Check if user has pending invites first
      const hasPendingInvites =
        relationshipData.pendingInvites &&
        relationshipData.pendingInvites.length > 0;

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
    if (relationshipData.relationship) {
      switch (relationshipData.relationship.status) {
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
    const hasPendingInvites =
      relationshipData.pendingInvites &&
      relationshipData.pendingInvites.length > 0;

    if (hasPendingInvites) {
      return "Pending";
    }

    // User is single - check their isSingle preference
    if (user?.isSingle === false) {
      return "Relationship Status Private";
    }
    return "Single";
  };

  // Function to get single user image based on their preference and invite status
  const getSingleUserImage = () => {
    // Check if user has pending invites first
    const hasPendingInvites =
      relationshipData.pendingInvites &&
      relationshipData.pendingInvites.length > 0;

    if (hasPendingInvites) {
      return require("@/assets/images/pending.png");
    }

    if (user?.isSingle === false) {
      return require("@/assets/images/unknown.png");
    }
    return require("@/assets/images/single.png");
  };

  // Function to get single user status text based on their preference and invite status
  const getSingleUserStatusText = () => {
    // Check if user has pending invites first
    const hasPendingInvites =
      relationshipData.pendingInvites &&
      relationshipData.pendingInvites.length > 0;

    if (hasPendingInvites) {
      return "Pending";
    }

    if (user?.isSingle === false) {
      return "Private";
    }
    return "Single";
  };

  const handleTutorial = () => {
    setTutorialVisible(true);
  };

  const handleTutorialClose = () => {
    setTutorialVisible(false);
  };

  // Remove handleTrustCenter function since we don't need it anymore

  // Remove handleTrustCenterClose function since we don't need it anymore

  // Single state render
  if (relationshipData.status === "single") {
    const hasPendingInvites =
      relationshipData.pendingInvites &&
      relationshipData.pendingInvites.length > 0;

    return (
      <View style={styles.container}>
        <TopBar title="My Relationship" />

        <View style={styles.content}>
          {/* Single Profile Section */}
          <TouchableOpacity
            style={styles.profileSection}
            onPress={handleManage}
            activeOpacity={0.8}>
            <View style={styles.singleImageContainer}>
              <View style={styles.imagePlaceholder}>
                <Image
                  source={getSingleUserImage()}
                  style={styles.singleImage}
                  resizeMode="contain"
                />
              </View>
              <TouchableOpacity
                style={styles.manageIconContainer}
                onPress={handleManage}
                activeOpacity={0.8}></TouchableOpacity>
            </View>

            <View style={styles.relationshipInfo}>
              <Text style={styles.statusText}>{getSingleUserStatusText()}</Text>
              <Text style={styles.partnerText}>
                {hasPendingInvites
                  ? "Waiting for confirmation"
                  : "Ready to connect"}
              </Text>
            </View>
          </TouchableOpacity>

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
              <TapToInviteButton />
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.trustCenterButton]}
              onPress={() => router.push("/trust-center")}
              activeOpacity={0.8}>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.trustCenterButtonText}>Trust Center</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.tutorialButton]}
              onPress={handleTutorial}
              activeOpacity={0.8}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
              <Text style={styles.tutorialButtonText}>How It Works</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Row at Bottom */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.settingsRow}
              onPress={handleEditProfile}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}>
              <Ionicons
                name="settings"
                size={16}
                color={colors.text.secondary}
              />
              <Text style={styles.settingsText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tutorial Modal - Remove TrustCenter modal */}
        <Tutorial visible={tutorialVisible} onClose={handleTutorialClose} />
      </View>
    );
  }

  // Dating state render (existing functionality with dynamic images)
  return (
    <View style={styles.container}>
      <TopBar title="Relationship" />

      <View style={styles.content}>
        {/* Profile Section */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={handleManage}
          activeOpacity={0.8}>
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
            <TouchableOpacity
              style={styles.manageIconContainer}
              onPress={handleManage}
              activeOpacity={0.8}></TouchableOpacity>
          </View>

          <View style={styles.relationshipInfo}>
            <Text style={styles.statusText}>{getCurrentStatusText()}</Text>
            <Text style={styles.partnerText}>
              {relationshipData.partner?.name ||
                relationshipData.partner?.phone ||
                "Partner"}
            </Text>
          </View>
        </TouchableOpacity>

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
            style={[styles.actionButton, styles.trustCenterButton]}
            onPress={() => router.push("/trust-center")}
            activeOpacity={0.8}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.trustCenterButtonText}>Trust Center</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.tutorialButton]}
            onPress={handleTutorial}
            activeOpacity={0.8}>
            <Ionicons name="help-circle" size={20} color={colors.primary} />
            <Text style={styles.tutorialButtonText}>How It Works</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Row at Bottom */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={handleEditProfile}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}>
            <Ionicons name="settings" size={16} color={colors.text.secondary} />
            <Text style={styles.settingsText}>Settings</Text>
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

      {/* Tutorial Modal - Remove TrustCenter modal */}
      <Tutorial visible={tutorialVisible} onClose={handleTutorialClose} />
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
    position: "relative",
  },

  // Single state styles
  singleImageContainer: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
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
    position: "relative",
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
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border.medium,
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
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.medium,
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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 0,
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
  // Add tutorial button styles
  tutorialButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  tutorialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  // Replace searchesButton and searchesButtonText with trustCenterButton styles
  trustCenterButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  trustCenterButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  // Add manage icon styles
  manageIconContainer: {
    position: "absolute",
    top: -10,
    right: -10,
    // backgroundColor: colors.background.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  // Remove quickActions styles and add new bottom styles
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 120,
    alignItems: "center",
  },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 100,
  },

  settingsText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "600",
  },
});
