import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  Easing,
} from "react-native-reanimated";

import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Define relationship status options with images
const RELATIONSHIP_STATUS_OPTIONS = [
  {
    value: "SINGLE",
    label: "Single",
    icon: "person-outline",
    image: require("@/assets/images/single.png"),
  },
  {
    value: "UNKNOWN",
    label: "Prefer not to say",
    icon: "help-outline",
    image: require("@/assets/images/unknown.png"),
  },
];

// Add pending option for users with pending invites
const PENDING_STATUS_OPTIONS = [
  {
    value: "PENDING",
    label: "Pending",
    icon: "time-outline",
    image: require("@/assets/images/pending.png"),
  },
];

const IN_RELATIONSHIP_STATUS_OPTIONS = [
  {
    value: "EXCLUSIVE",
    label: "Exclusive",
    icon: "heart-outline",
    image: require("@/assets/images/exclusive.png"),
  },
  {
    value: "ENGAGED",
    label: "Engaged",
    icon: "diamond-outline",
    image: require("@/assets/images/engaged.png"),
  },
  {
    value: "MARRIED",
    label: "Married",
    icon: "heart",
    image: require("@/assets/images/married.png"),
  },
];

interface RelationshipStatusModalProps {
  visible: boolean;
  onClose: () => void;
  onStatusSelect: (status: string) => void;
  currentStatus: string;
  isInRelationship: boolean;
  hasPendingInvites?: boolean; // Add this prop
  isUpdating?: boolean;
}

export default function RelationshipStatusModal({
  visible,
  onClose,
  onStatusSelect,
  currentStatus,
  isInRelationship,
  hasPendingInvites = false, // Add default value
  isUpdating = false,
}: RelationshipStatusModalProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { updateUserSingleStatus } = useUserRedux();

  // Animation values
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const GRADIENT_COLORS = useMemo(
    () => [colors.background.primary, colors.background.secondary] as const,
    []
  );

  // Handle modal opening
  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);

      // Reset values for opening
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
      contentOpacity.value = 0;

      // Animate in
      backdropOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });

      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 120,
        mass: 0.8,
      });

      contentOpacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });
    } else if (modalVisible) {
      // Close animation
      closeWithAnimation();
    }
  }, [visible]);

  const closeWithAnimation = () => {
    contentOpacity.value = withTiming(0, {
      duration: 150,
      easing: Easing.in(Easing.ease),
    });

    translateY.value = withTiming(SCREEN_HEIGHT * 0.6, {
      duration: 200,
      easing: Easing.in(Easing.ease),
    });

    backdropOpacity.value = withTiming(
      0,
      {
        duration: 200,
        easing: Easing.in(Easing.ease),
      },
      (finished) => {
        if (finished) {
          runOnJS(setModalVisible)(false);
        }
      }
    );
  };

  const handleBackdropPress = () => {
    onClose();
  };

  const handleStatusSelect = async (status: string) => {
    // If user is not in a relationship and selecting single status
    if (!isInRelationship && !hasPendingInvites) {
      try {
        if (status === "SINGLE") {
          await updateUserSingleStatus(true);
        } else if (status === "UNKNOWN") {
          await updateUserSingleStatus(false);
        }
      } catch (error) {
        console.error("Failed to update single status:", error);
      }
    }

    onStatusSelect(status);
    // The modal will close automatically after the status is updated in the parent
  };

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: translateY.value,
        },
      ],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [
        {
          translateY: interpolate(
            contentOpacity.value,
            [0, 1],
            [5, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  // Determine which status options to show
  const getStatusOptions = () => {
    if (isInRelationship) {
      return IN_RELATIONSHIP_STATUS_OPTIONS;
    } else if (hasPendingInvites) {
      return PENDING_STATUS_OPTIONS;
    } else {
      return RELATIONSHIP_STATUS_OPTIONS;
    }
  };

  const statusOptions = getStatusOptions();

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={styles.backdropTouch}
            onPress={handleBackdropPress}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <LinearGradient colors={GRADIENT_COLORS} style={styles.modalContent}>
            <Animated.View style={[styles.modalContentContainer, contentStyle]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.dragIndicator} />
              </View>

              {/* Content */}
              <View style={styles.modalContentInner}>
                <Text style={styles.modalTitle}>
                  {isInRelationship
                    ? "Change Relationship Status"
                    : hasPendingInvites
                    ? "Pending Invite"
                    : "Relationship Status"}
                </Text>

                <ScrollView
                  style={styles.optionsContainer}
                  showsVerticalScrollIndicator={false}>
                  {statusOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionItem,
                        index === 0 && styles.firstOptionItem,
                        index === statusOptions.length - 1 &&
                          styles.lastOptionItem,
                      ]}
                      onPress={() => handleStatusSelect(option.value)}
                      activeOpacity={0.7}
                      disabled={
                        isUpdating ||
                        (hasPendingInvites && option.value === "PENDING")
                      }>
                      <View style={styles.optionContent}>
                        <View style={styles.optionImageContainer}>
                          <Image
                            source={option.image}
                            style={styles.optionImage}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={styles.optionTextContainer}>
                          <Text style={styles.optionText}>{option.label}</Text>
                          {hasPendingInvites && option.value === "PENDING" && (
                            <Text style={styles.pendingSubtext}>
                              You have an invite waiting for a response
                            </Text>
                          )}
                        </View>
                      </View>
                      {currentStatus.toLowerCase() ===
                        option.label.toLowerCase() && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 0 : 20,
    zIndex: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
    minHeight: 400,
  },
  modalContent: {
    flex: 1,
    alignItems: "center",
  },
  modalContentContainer: {
    width: "100%",
    flex: 1,
  },
  modalHeader: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: colors.border.medium,
    borderRadius: 2,
    marginBottom: 16,
  },
  doneButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.heroSecondary,
  },
  modalContentInner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 32,
  },
  optionsContainer: {
    flex: 1,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderTopWidth: 0,
    minHeight: 70, // Increased height to accommodate images
  },
  firstOptionItem: {
    borderTopWidth: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastOptionItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionImageContainer: {
    marginRight: 16,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  optionImage: {
    width: 40,
    height: 40,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  pendingSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    fontStyle: "italic",
  },
});
