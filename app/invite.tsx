import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Share,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

import SignupButton from "@/components/SignupButton";
import PhoneTextInput from "@/components/PhoneTextInput";
import { colors } from "@/constants/Colors";
import { DEFAULT_COUNTRY, CountryCode } from "@/constants/countryCodes";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { useNotification } from "@/contexts/NotificationContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type RelationshipType = "Dating" | "Married" | "Situationship";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
    height: "100%",
    minHeight: Dimensions.get("window").height,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.medium,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.surface.white,
    height: "100%",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    marginTop: 20,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  relationshipContainer: {
    width: "100%",
    marginBottom: 40,
  },
  relationshipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  relationshipOption: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
    backgroundColor: "transparent",
  },
  relationshipOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10", // 10% opacity
  },
  relationshipOptionUnselected: {
    borderColor: colors.border.medium,
    backgroundColor: "transparent",
  },
  relationshipIcon: {
    marginBottom: 8,
    width: 48,
    height: 48,
  },
  relationshipText: {
    fontSize: 10,
    color: colors.text.quaternary,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },
  relationshipTextSelected: {
    color: colors.primary,
  },
  relationshipTextUnselected: {
    color: colors.text.secondary,
  },
  keyboardStickyContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
    backgroundColor: colors.surface.white,
  },
  submitButtonContainer: {
    marginBottom: 0,
  },
  phoneInputContainer: {
    marginBottom: 20,
    width: "100%",
  },
  phoneInputSection: {
    width: "100%",
    marginBottom: 40,
  },
  selectedRelationshipContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  selectedRelationshipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "10",
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  selectedRelationshipIcon: {
    width: 24,
    height: 24,
  },
  selectedRelationshipText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  changeButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
    textDecorationLine: "underline",
  },
});

const relationshipOptions: { type: RelationshipType; image: any }[] = [
  { type: "Dating", image: require("@/assets/images/dating.png") },
  { type: "Married", image: require("@/assets/images/married.png") },
  {
    type: "Situationship",
    image: require("@/assets/images/situationship.png"),
  },
];

function Invite() {
  const router = useRouter();
  const { sendUserInvite } = useUserRedux();
  const { addNotification } = useNotification();
  const [selectedRelationship, setSelectedRelationship] =
    useState<RelationshipType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRelationshipSelect = useCallback(
    (relationship: RelationshipType) => {
      setSelectedRelationship(relationship);
    },
    []
  );

  const handleCreateInvite = useCallback(async () => {
    if (!selectedRelationship) return;

    setIsLoading(true);

    try {
      // Send invite with just the relationship type - no phone number needed
      const response = await sendUserInvite(selectedRelationship.toUpperCase());
      const inviteId = response.data.invite.id;

      // Create the invite link
      const inviteLink = `https://makeitofficial.us/confirm/${inviteId}`;
      const shareMessage = `Hey! I'd like to make it official. Press this link to make us official ${inviteLink}`;

      // Show native share dialog
      try {
        const result = await Share.share({
          message: shareMessage,
          url: inviteLink, // iOS will use this for the URL
          title: "Make It Official",
        });

        if (result.action === Share.sharedAction) {
          addNotification({
            title: "Invite Shared",
            description: "Your invite link has been shared successfully",
            type: "success",
            emoji: "🎉",
          });
        }
      } catch (shareError) {
        console.error("Error sharing:", shareError);
        Alert.alert("Share Error", "Failed to share the invite link");
      }

      // Navigate back after sharing
      router.back();
    } catch (error: any) {
      console.error("Error creating invite:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create invitation";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRelationship, router, sendUserInvite, addNotification]);

  const isValidSelection = selectedRelationship !== null;

  return (
    <View style={styles.container}>
      {/* Modal handle */}
      <View style={styles.modalHandle} />

      <SafeAreaView style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <View style={styles.formContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Make It Official</Text>
              <Text style={styles.subtitle}>
                Choose your relationship status to create and share an
                invitation link
              </Text>
            </View>

            {/* Show relationship options */}
            <View style={styles.relationshipContainer}>
              <View style={styles.relationshipRow}>
                {relationshipOptions.map((option) => (
                  <TouchableOpacity
                    key={option.type}
                    style={[
                      styles.relationshipOption,
                      selectedRelationship === option.type
                        ? styles.relationshipOptionSelected
                        : styles.relationshipOptionUnselected,
                    ]}
                    onPress={() => handleRelationshipSelect(option.type)}
                    activeOpacity={0.7}>
                    <Image
                      source={option.image}
                      style={styles.relationshipIcon}
                      resizeMode="contain"
                    />
                    <Text
                      style={[
                        styles.relationshipText,
                        selectedRelationship === option.type
                          ? styles.relationshipTextSelected
                          : styles.relationshipTextUnselected,
                      ]}>
                      {option.type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.keyboardStickyContainer}>
          <SignupButton
            title="CREATE & SHARE INVITE"
            onPress={handleCreateInvite}
            isLoading={isLoading}
            isEnabled={isValidSelection}
            containerStyle={styles.submitButtonContainer}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

export default React.memo(Invite);
