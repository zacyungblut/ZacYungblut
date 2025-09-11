import React, { useState } from "react";
import { Alert, Platform, Share } from "react-native";
import InviteButton from "@/components/InviteButton";
import { useNotification } from "@/contexts/NotificationContext";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { shareMessage } from "@/utils/helpers";

interface TapToInviteButtonProps {
  onInviteSuccess?: () => void;
}

export default function TapToInviteButton({
  onInviteSuccess,
}: TapToInviteButtonProps) {
  const { sendUserInvite, fetchUser, cancelUserInvite, recordShareAttempt } =
    useUserRedux();

  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    console.log("Invite pressed");
    setIsLoading(true);

    try {
      // Send invite with default "DATING" relationship type, but don't update local state yet
      const response = await sendUserInvite("DATING", false);
      const inviteId = response.data.invite.id;

      // Create the invite link
      const inviteLink = `https://makeitofficial.us/confirm/${inviteId}`;

      // Show native share dialog
      try {
        const result = await Share.share({
          message: shareMessage,
          url: inviteLink, // iOS will use this for the URL
          title: "My Relationship",
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

          // Call the success callback if provided
          onInviteSuccess?.();
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

  return <InviteButton onPress={handleInvite} />;
}
