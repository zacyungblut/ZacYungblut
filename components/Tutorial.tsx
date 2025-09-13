import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  View,
  Platform,
  SafeAreaView,
  Image,
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
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { Text } from "@/components/Themed";
import { colors } from "@/constants/Colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TutorialProps {
  visible: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: "Make It Official",
    subtitle:
      'The modern way to make your relationship "Facebook" official \n \nOfficial brings transparency back to dating by verifying your relationship status and viewing others',
    description: "",
    emoji: "",
    isLogoStep: true,
  },
  {
    title: "Step 1: Set Your Relationship Status",
    subtitle:
      "If you're single: you're all set!\n\nIf you're taken: Invite your partner, once they confirm your status will show as \"Dating\" \n \n Once your status is set, you can search others by phone number.",
    emoji: "✅",
  },

  {
    title: "Step 2: See Who's Official",
    subtitle:
      "Once your status is set, you can search others by phone number. \n \n Now when you're verifying someone's story, you can know for sure if they're telling the truth.",
    emoji: "📱",
  },
  {
    title: "Step 3: Make Better Dating Decisions and Build Trust",
    subtitle:
      "Official is built for privacy and trust. \n \n No one can EVER see when you started dating, who you're dating, your identity, or when you use the app. \n \n Confidentiality is our top priority.",
    emoji: "🔒",
  },
];

export default function Tutorial({ visible, onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
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
  // New animation value for finger tap
  const fingerTapTranslate = useSharedValue(0);

  // Start finger tap animation when modal is visible
  useEffect(() => {
    if (modalVisible && !isClosing) {
      fingerTapTranslate.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(-3, { duration: 200, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) }),
          withTiming(0, { duration: 800 }) // Pause between taps
        ),
        -1,
        false
      );
    }
  }, [modalVisible, isClosing]);

  // Handle opening the modal
  useEffect(() => {
    if (visible && !isClosing) {
      setModalVisible(true);
      setCurrentStep(0);
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

  // Finger tap animation style
  const fingerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: fingerTapTranslate.value }, // Up movement
      ],
    };
  });

  const handleModalClose = () => {
    setModalVisible(false);
    setIsClosing(false);
    setCurrentStep(0);
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

  // Fixed function to handle step transition
  const goToNextStep = () => {
    setCurrentStep(currentStep + 1);
    // Animate content back in
    contentOpacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      // Animate content out and then go to next step
      contentOpacity.value = withTiming(
        0,
        {
          duration: 150,
          easing: Easing.in(Easing.ease),
        },
        (finished) => {
          if (finished) {
            runOnJS(goToNextStep)();
          }
        }
      );
    } else {
      // Last step, close the tutorial
      animateClose();
    }
  };

  const handleClose = () => {
    animateClose();
  };

  const handleBackdropPress = () => {
    animateClose();
  };

  const currentStepData = tutorialSteps[currentStep];

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="none"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.modalOverlay}>
        {/* Make backdrop touchable */}
        <TouchableOpacity
          style={[styles.backdrop, backdropStyle]}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />

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

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                {tutorialSteps.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor:
                          index <= currentStep
                            ? colors.primary
                            : colors.border.medium,
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Main Content - Tappable */}
              <TouchableOpacity
                style={styles.mainContent}
                onPress={handleNext}
                activeOpacity={1}>
                {/* Logo for first step, emoji for others */}
                {currentStepData.isLogoStep ? (
                  <Image
                    source={require("@/assets/images/official.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.emoji}>{currentStepData.emoji}</Text>
                )}

                {/* Title */}
                <Text style={styles.title}>{currentStepData.title}</Text>

                {/* Subtitle */}
                {currentStepData.subtitle && (
                  <Text style={styles.subtitle}>
                    {currentStepData.subtitle}
                  </Text>
                )}

                {/* Description */}
                {currentStepData.description && (
                  <Text style={styles.description}>
                    {currentStepData.description}
                  </Text>
                )}

                {/* Tap to Continue */}
                <View style={styles.tapContainer}>
                  <View style={styles.tapContentRow}>
                    <Text style={styles.tapText}>
                      {currentStep < tutorialSteps.length - 1
                        ? "Tap to continue"
                        : "Tap to finish"}
                    </Text>
                    <Animated.View
                      style={[styles.fingerContainer, fingerAnimatedStyle]}>
                      <Text style={styles.fingerEmoji}>👆</Text>
                    </Animated.View>
                  </View>
                </View>
              </TouchableOpacity>
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
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Changed from 0.8 to 0.4
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Changed from 0.8 to 0.4
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
    top: 8,
    left: 8,
    zIndex: 10,
    padding: 4,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    marginBottom: 20, // Reduced from 60 to 20 to move content higher
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mainContent: {
    flex: 1,
    justifyContent: "flex-start", // Changed from "center" to "flex-start"
    alignItems: "center",
    paddingHorizontal: 0,
    paddingTop: 20, // Added small top padding for breathing room
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
    marginBottom: 80, // Increased from 32 to provide proper spacing before tap button
    lineHeight: 24,
    maxWidth: "90%",
  },
  highlightContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  highlight: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
    lineHeight: 22,
  },
  tapContainer: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  tapContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tapText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.white,
    textAlign: "center",
  },
  fingerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  fingerEmoji: {
    fontSize: 16,
    textAlign: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
});
