import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  View,
  Platform,
  SafeAreaView,
  ScrollView,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TrustCenterProps {
  visible: boolean;
  onClose: () => void;
}

const trustPoints = [
  {
    icon: "shield-checkmark",
    title: "Relationships are private. So is Official",
    description:
      "Your privacy is our highest priority. We built Official with privacy-first design principles.",
  },
  {
    icon: "eye-off",
    title: "We never share WHO you are dating",
    description:
      "Only your relationship status is visible. Your partner's identity remains completely private.",
  },
  {
    icon: "lock-closed",
    title: "We never share ANY information about you",
    description:
      "Only your phone number is used for verification. No personal data, no tracking, no profiles.",
  },
  {
    icon: "time",
    title: "We never share relationship details",
    description:
      "Duration, anniversary dates, and relationship history stay between you and your partner.",
  },
  {
    icon: "search",
    title: "No one knows if you search for them",
    description:
      "Searches are completely anonymous. No notifications, no traces, no digital footprints.",
  },
  {
    icon: "server",
    title: "Minimal data, maximum security",
    description:
      "We store only what's absolutely necessary and encrypt everything. Your trust is earned, not assumed.",
  },
];

export default function TrustCenter({ visible, onClose }: TrustCenterProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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

  const handleClose = () => {
    animateClose();
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="none"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />

        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <LinearGradient colors={GRADIENT_COLORS} style={styles.modalContent}>
            <Animated.View style={[styles.contentContainer, contentStyle]}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}>
                <Ionicons
                  name="close-circle"
                  size={32}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerEmoji}>🔒</Text>
                <Text style={styles.headerTitle}>Trust Center</Text>
                <Text style={styles.headerSubtitle}>
                  Your privacy and trust matter to us
                </Text>
              </View>

              {/* Trust Points */}
              <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                {trustPoints.map((point, index) => (
                  <View key={index} style={styles.trustPointContainer}>
                    <View style={styles.trustPointIcon}>
                      <Ionicons
                        name={point.icon as any}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.trustPointContent}>
                      <Text style={styles.trustPointTitle}>{point.title}</Text>
                      <Text style={styles.trustPointDescription}>
                        {point.description}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Bottom Assurance */}
                <View style={styles.bottomAssurance}>
                  <Text style={styles.assuranceTitle}>Our Promise</Text>
                  <Text style={styles.assuranceText}>
                    Official was built by people who believe privacy isn't a
                    luxury—it's a fundamental right. We don't sell your data, we
                    don't track your behavior, and we don't monetize your
                    relationships.
                  </Text>
                  <Text style={styles.assuranceSignature}>
                    — The Official Team
                  </Text>
                </View>
              </ScrollView>
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
  closeButton: {
    position: "absolute",
    top: 24,
    left: 24,
    zIndex: 10,
    padding: 4,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 32,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  trustPointContainer: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  trustPointIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  trustPointContent: {
    flex: 1,
    paddingTop: 2,
  },
  trustPointTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 6,
    lineHeight: 22,
  },
  trustPointDescription: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bottomAssurance: {
    marginTop: 32,
    padding: 20,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  assuranceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  assuranceText: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.text.secondary,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
  },
  assuranceSignature: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});
