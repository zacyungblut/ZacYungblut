import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Modal,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import { Text } from "@/components/Themed";
import { colors } from "@/constants/Colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface DateModalProps {
  visible: boolean;
  onClose: (selectedDate: Date) => void; // Always pass the selected date back
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateModal({
  visible,
  onClose,
  selectedDate,
  onDateChange,
}: DateModalProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentSelectedDate, setCurrentSelectedDate] = useState(selectedDate);

  const GRADIENT_COLORS = useMemo(
    () => [colors.background.primary, colors.background.secondary] as const,
    []
  );

  // Reanimated shared values - removed modalScale
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  // Update local state when prop changes
  useEffect(() => {
    if (visible) {
      setCurrentSelectedDate(selectedDate);
    }
  }, [visible, selectedDate]);

  // Handle opening the modal
  useEffect(() => {
    if (visible && !isClosing) {
      setModalVisible(true);
      setIsClosing(false);

      // Reset values for opening
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
      contentOpacity.value = 0;

      // Faster animate in with just translation and fade
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
    }
  }, [visible, isClosing]);

  // Enhanced backdrop animation
  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  // Simplified modal animation - just translation
  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: translateY.value,
        },
      ],
    };
  });

  // Content fade animation
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

  // Separate function to handle the actual close
  const handleModalClose = () => {
    setModalVisible(false);
    setIsClosing(false);
    // Always pass the current selected date, even if unchanged
    onClose(currentSelectedDate);
  };

  const animateClose = () => {
    if (isClosing) return; // Prevent multiple close animations

    setIsClosing(true);

    // Faster animate out with just translation and fade
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
          runOnJS(handleModalClose)();
        }
      }
    );
  };

  const handleClose = () => {
    animateClose();
  };

  const handleBackdropPress = () => {
    animateClose();
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setCurrentSelectedDate(date);
      onDateChange(date);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent>
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
            <Animated.View style={[styles.contentContainer, contentStyle]}>
              {/* Header with drag indicator and done button */}
              <View style={styles.header}>
                <View style={styles.dragIndicator} />
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleClose}
                  activeOpacity={0.7}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={styles.questionText}>
                  When did you start dating?
                </Text>

                {/* Selected Date Display */}
                <View style={styles.selectedDateContainer}>
                  <Text style={styles.selectedDateText}>
                    {formatDate(currentSelectedDate)}
                  </Text>
                </View>

                {/* iOS Date Picker */}
                {Platform.OS === "ios" && (
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={currentSelectedDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      style={styles.datePicker}
                      textColor={colors.text.primary}
                      accentColor={colors.primary}
                    />
                  </View>
                )}

                {/* Android Date Picker Modal */}
                {Platform.OS === "android" && (
                  <>
                    <TouchableOpacity
                      style={styles.dateInputContainer}
                      onPress={() => setShowDatePicker(true)}
                      activeOpacity={0.8}>
                      <Text style={styles.dateLabel}>Date</Text>
                      <View style={styles.dateDisplay}>
                        <Text style={styles.dateText}>
                          {formatDate(currentSelectedDate)}
                        </Text>
                        <Text style={styles.chevronText}>▼</Text>
                      </View>
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={currentSelectedDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}
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
    minHeight: 500,
  },
  modalContent: {
    flex: 1,
    alignItems: "center",
  },
  contentContainer: {
    width: "100%",
    flex: 1,
  },
  header: {
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 24,
  },
  selectedDateContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 32,
    alignItems: "center",
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  datePickerContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    flex: 1,
  },
  datePicker: {
    width: "100%",
    height: 350,
  },
  // Android-specific styles
  dateInputContainer: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 8,
  },
  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.primary,
  },
  chevronText: {
    fontSize: 10,
    color: colors.text.tertiary,
  },
});
