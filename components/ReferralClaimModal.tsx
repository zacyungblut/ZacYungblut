import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  View,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Text } from "@/components/Themed";
import { colors } from "@/constants/Colors";
import { claimReferral } from "@/api";
import { AuthService } from "@/utils/authStorage";
import { useNotification } from "@/contexts/NotificationContext";
import { useUserRedux } from "@/store/hooks/useUserRedux";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ReferralClaimModalProps {
  visible: boolean;
  onClose: () => void;
  referralCode: string;
}

export default function ReferralClaimModal({
  visible,
  onClose,
  referralCode,
}: ReferralClaimModalProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const { addNotification } = useNotification();
  const { fetchUser } = useUserRedux();
  const GRADIENT_COLORS = useMemo(
    () => [colors.background.primary, colors.background.secondary] as const,
    []
  );

  // Animation values
  const fadeOpacity = useSharedValue(0);
  const scaleValue = useSharedValue(0.95);
  const contentOpacity = useSharedValue(0);

  // Handle opening the modal
  useEffect(() => {
    if (visible && !isClosing) {
      setModalVisible(true);
      setIsClosing(false);

      // Reset values for opening
      fadeOpacity.value = 0;
      scaleValue.value = 0.95;
      contentOpacity.value = 0;

      // Animate in
      fadeOpacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });

      scaleValue.value = withSpring(1, {
        damping: 16,
        stiffness: 100,
        mass: 0.8,
      });

      contentOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [visible, isClosing]);

  // Modal backdrop animation
  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeOpacity.value,
    };
  });

  // Modal content animation
  const modalStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeOpacity.value,
      transform: [
        {
          scale: scaleValue.value,
        },
      ],
    };
  });

  // Content fade animation
  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });

  const handleModalClose = () => {
    setModalVisible(false);
    setIsClosing(false);
    onClose();
  };

  const animateClose = () => {
    if (isClosing) return;

    setIsClosing(true);

    // Animate out
    contentOpacity.value = withTiming(0, {
      duration: 200,
      easing: Easing.in(Easing.ease),
    });

    scaleValue.value = withTiming(0.95, {
      duration: 250,
      easing: Easing.in(Easing.ease),
    });

    fadeOpacity.value = withTiming(
      0,
      {
        duration: 250,
        easing: Easing.in(Easing.ease),
      },
      (finished) => {
        if (finished) {
          runOnJS(handleModalClose)();
        }
      }
    );
  };

  const handleClaim = async () => {
    if (isClaiming) return;

    setIsClaiming(true);

    try {
      await claimReferral(
        referralCode,
        Platform.OS,
        // You can add app version and build version here if available
        "1.0.0",
        "1.0.0"
      );

      // Remove the referral code from storage since it's been claimed
      AuthService.removeReferralCode();

      addNotification({
        title: "Referral Claimed! 🎉",
        description: "You and your referrer both received 2 free searches!",
        type: "success",
        emoji: "🎉",
      });

      animateClose();
    } catch (error: any) {
      console.error("Error claiming referral:", error);

      // Clear the invalid referral code from storage
      AuthService.removeReferralCode();

      // Show failure notification instead of alert
      addNotification({
        title: "Failed to Claim Referral",
        description:
          error.response?.data?.error ||
          "The referral code is invalid or has expired.",
        type: "error",
        emoji: "❌",
      });

      // Close the modal after showing the error
      animateClose();
    } finally {
      await fetchUser();
      setIsClaiming(false);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="none"
      onRequestClose={() => {}}>
      <SafeAreaView style={styles.modalOverlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />

        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <LinearGradient colors={GRADIENT_COLORS} style={styles.modalContent}>
            <Animated.View style={[styles.contentContainer, contentStyle]}>
              {/* Main Content */}
              <View style={styles.mainContent}>
                {/* Gift Emoji */}
                <Text style={styles.emoji}>🎁</Text>

                {/* Title */}
                <Text style={styles.title}>Referral Bonus!</Text>

                {/* Description */}
                <Text style={styles.description}>
                  Claim your referral to get 2 free searches!{"\n\n"}
                  Your referrer will also get 2 free searches as a thank you.
                </Text>

                {/* Single Claim Button */}
                <TouchableOpacity
                  style={[styles.button, styles.claimButton]}
                  onPress={handleClaim}
                  disabled={isClaiming}
                  activeOpacity={0.8}>
                  <Text style={styles.claimButtonText}>
                    {isClaiming ? "Claiming..." : "Claim Referral"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    flex: 1,
    margin: 20,
    marginTop: Platform.OS === "ios" ? 60 : 40,
    marginBottom: Platform.OS === "ios" ? 60 : 40,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 25,
  },
  modalContent: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: "90%",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  claimButton: {
    backgroundColor: colors.primary,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
