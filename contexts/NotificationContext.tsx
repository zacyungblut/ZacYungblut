import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
  Image,
} from "react-native";

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import Ionicons from "@expo/vector-icons/Ionicons";

import { colors } from "@/constants/Colors";
import { playHapticDrumRoll } from "@/utils/helpers";

// Define the notification type
export interface Notification {
  id: string;
  title: string;
  description: string;
  type?: string;
  duration?: number; // in milliseconds
  timestamp: Date;
  route?: string; // Add route property for navigation
  routeParams?: Record<
    string,
    string | number | (string | number)[] | null | undefined
  >; // Add route params for navigation
  image?: string; // URL or require() for the image
  emoji?: string; // Add emoji support
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const defaultNotificationContext: NotificationContextType = {
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
};

const NotificationContext = createContext<NotificationContextType>(
  defaultNotificationContext
);

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] =
    useState<Notification | null>(null);

  // Shared values for animations and gestures
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const gestureTranslateY = useSharedValue(0);

  const notificationQueue = useRef<Notification[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingQueue = useRef(false);
  const isDismissing = useRef(false);
  const router = useRouter();
  const isMounted = useRef(true);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Animated style with gesture support
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + gestureTranslateY.value }],
    opacity: opacity.value,
  }));

  // Simple completion handler - runs on JS thread
  const handleAnimationComplete = useCallback(() => {
    if (!isMounted.current) return;

    setCurrentNotification(null);
    isProcessingQueue.current = false;
    isDismissing.current = false;

    // Reset gesture values for next notification
    gestureTranslateY.value = 0;

    // Process next notification
    setTimeout(() => {
      if (isMounted.current && notificationQueue.current.length > 0) {
        showNextNotification();
      }
    }, 100);
  }, []);

  // Simple animate out function
  const animateOut = useCallback(() => {
    if (isDismissing.current) return;

    isDismissing.current = true;

    // Clear timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Simple animation out
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(handleAnimationComplete)();
      }
    });
  }, [handleAnimationComplete]);

  // Show next notification
  const showNextNotification = useCallback(() => {
    if (
      !isMounted.current ||
      isProcessingQueue.current ||
      notificationQueue.current.length === 0
    ) {
      return;
    }

    isProcessingQueue.current = true;
    isDismissing.current = false;

    const nextNotification = notificationQueue.current.shift();
    if (!nextNotification) {
      isProcessingQueue.current = false;
      return;
    }

    setCurrentNotification(nextNotification);

    // Reset and animate in
    translateY.value = -100;
    opacity.value = 0;
    gestureTranslateY.value = 0;

    translateY.value = withTiming(16, { duration: 400 });
    opacity.value = withTiming(1, { duration: 400 });

    // Haptic feedback
    try {
      playHapticDrumRoll();
    } catch (error) {
      console.warn("Haptic feedback failed:", error);
    }

    // Auto dismiss timer
    timeoutRef.current = setTimeout(() => {
      if (isMounted.current && !isDismissing.current) {
        animateOut();
      }
    }, nextNotification.duration ?? 5000);
  }, [animateOut]);

  // Dismiss current notification
  const dismissCurrentNotification = useCallback(() => {
    if (!isMounted.current || isDismissing.current) return;
    animateOut();
  }, [animateOut]);

  // Handle notification tap
  const handleNotificationTap = useCallback(() => {
    if (!currentNotification || isDismissing.current) return;

    try {
      if (currentNotification.route) {
        const route = currentNotification.route;
        const params = currentNotification.routeParams;

        // Dismiss first
        dismissCurrentNotification();

        // Navigate after delay
        setTimeout(() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
              () => {}
            );

            if (route && params) {
              router.push({ pathname: route as any, params: params });
            } else {
              router.push(route as any);
            }
          } catch (navError) {
            console.warn("Navigation error:", navError);
          }
        }, 400);
      } else {
        dismissCurrentNotification();
      }
    } catch (error) {
      console.warn("Notification tap error:", error);
      dismissCurrentNotification();
    }
  }, [currentNotification, router, dismissCurrentNotification]);

  // PanResponder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 10
        );
      },
      onPanResponderGrant: () => {
        // Clear auto-dismiss timer when user starts interacting
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow upward swipes (negative dy)
        if (gestureState.dy < 0) {
          gestureTranslateY.value = gestureState.dy;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = -20; // Swipe up at least 80 pixels to dismiss
        const velocityThreshold = -200; // Or swipe with enough velocity

        if (
          gestureState.dy < swipeThreshold ||
          gestureState.vy < velocityThreshold
        ) {
          // Dismiss the notification
          gestureTranslateY.value = withTiming(-150, { duration: 200 });
          opacity.value = withTiming(0, { duration: 200 }, (finished) => {
            if (finished) {
              runOnJS(handleAnimationComplete)();
            }
          });

          // Haptic feedback for successful dismiss
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (error) {
            console.warn("Haptic feedback failed:", error);
          }
        } else {
          // Snap back to original position
          gestureTranslateY.value = withSpring(0, {
            damping: 15,
            stiffness: 150,
          });

          // Restart auto-dismiss timer
          if (currentNotification && !isDismissing.current) {
            timeoutRef.current = setTimeout(() => {
              if (isMounted.current && !isDismissing.current) {
                animateOut();
              }
            }, 3000); // Shorter time after user interaction
          }
        }
      },
    })
  ).current;

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      try {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          duration: notification.duration ?? 5000,
        };

        setNotifications((prev) => [...prev, newNotification]);
        notificationQueue.current.push(newNotification);

        if (!currentNotification && !isProcessingQueue.current) {
          showNextNotification();
        }

        // Haptic feedback
        try {
          if (notification.type === "error") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } else if (notification.type === "warning") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } else {
            // Use impactAsync for success and default cases
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        } catch (hapticError) {
          console.warn("Haptic feedback failed:", hapticError);
        }
      } catch (error) {
        console.error("Add notification error:", error);
      }
    },
    [currentNotification, showNextNotification]
  );

  // Remove notification by ID
  const removeNotification = useCallback(
    (id: string) => {
      try {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );
        notificationQueue.current = notificationQueue.current.filter(
          (notification) => notification.id !== id
        );

        if (currentNotification?.id === id) {
          dismissCurrentNotification();
        }
      } catch (error) {
        console.warn("Remove notification error:", error);
      }
    },
    [currentNotification, dismissCurrentNotification]
  );

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    try {
      setNotifications([]);
      notificationQueue.current = [];

      if (currentNotification) {
        dismissCurrentNotification();
      }
    } catch (error) {
      console.warn("Clear notifications error:", error);
    }
  }, [currentNotification, dismissCurrentNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {currentNotification !== null && (
        <Animated.View
          style={[styles.notificationContainer, animatedStyle]}
          {...panResponder.panHandlers}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleNotificationTap}
            style={styles.touchableContainer}>
            <View style={styles.notificationCard}>
              {/* Profile image - only shown if image is provided */}
              {Boolean(
                currentNotification.image || currentNotification.emoji
              ) && (
                <View style={styles.imageContainer}>
                  {currentNotification.emoji ? (
                    <View style={styles.emojiContainer}>
                      <Text style={styles.emojiText}>
                        {currentNotification.emoji}
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={
                        typeof currentNotification.image === "string"
                          ? { uri: currentNotification.image }
                          : currentNotification.image
                      }
                      style={styles.profileImage}
                    />
                  )}
                </View>
              )}

              <View style={styles.contentContainer}>
                <Text style={styles.titleText}>
                  {currentNotification.title}
                </Text>
                {currentNotification.description && (
                  <Text style={styles.descriptionText}>
                    {currentNotification.description}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={dismissCurrentNotification}
                hitSlop={styles.closeButtonHitSlop}>
                <Ionicons
                  name="close"
                  size={20}
                  color={"#000000"}
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingHorizontal: 16,
  },
  touchableContainer: {
    // No specific styles needed, just for organization
  },
  notificationCard: {
    backgroundColor: colors.surface.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.medium, // Night sky blue border
    padding: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    elevation: 8,
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageContainer: {
    marginRight: 12,
    borderRadius: 20,
    padding: 2,
    backgroundColor: colors.surface.overlayLight,
  },
  emojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface.white,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiText: {
    fontSize: 24,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  contentContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.text.secondary,
    opacity: 0.8,
    marginTop: 1,
  },
  closeButtonHitSlop: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  },
  closeIcon: {
    opacity: 0.7,
  },
});
