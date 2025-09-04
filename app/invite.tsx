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
import { colors } from "@/constants/Colors";

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
    marginBottom: 40,
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
  const [selectedRelationship, setSelectedRelationship] =
    useState<RelationshipType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRelationshipSelect = useCallback(
    (relationship: RelationshipType) => {
      setSelectedRelationship(relationship);
    },
    []
  );

  const handleShare = useCallback(async () => {
    if (!selectedRelationship) return;

    setIsLoading(true);

    try {
      const shareMessage = `Hey! Connect with me on Official so everyone knows we're together. Tap this link and let's make it official! 💕`;

      const result = await Share.share({
        message: shareMessage,
        title: "Join me on Official",
      });

      if (result.action === Share.sharedAction) {
        // Successfully shared
        router.back();
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share invitation");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRelationship, router]);

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
                Choose your relationship status and send an invitation to Make
                It Official
              </Text>
            </View>

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
            title="SEND"
            onPress={handleShare}
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
