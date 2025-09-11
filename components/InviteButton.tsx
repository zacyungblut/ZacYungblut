import React, { useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Themed";
import { colors } from "@/constants/Colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface InviteButtonProps {
  onPress: () => void;
}

export default function InviteButton({ onPress }: InviteButtonProps) {
  const shimmerProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    // Start shimmer animation
    shimmerProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withDelay(500, withTiming(1, { duration: 0 }))
      ),
      -1,
      false
    );

    // Start pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerProgress.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      shimmerProgress.value,
      [0, 0.2, 0.5, 0.8, 1],
      [0, 0.3, 0.6, 0.3, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateX }, { skewX: "-20deg" }],
    };
  });

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressScale.value }],
    };
  });

  const handlePressIn = () => {
    pressScale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    pressScale.value = withTiming(1, { duration: 100 });
  };

  return (
    <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
      {/* 3D Shadow layers */}
      {/* <Animated.View style={styles.shadowLayer3} /> */}
      <Animated.View style={styles.shadowLayer2} />
      <Animated.View style={styles.shadowLayer1} />

      <TouchableOpacity
        style={styles.inviteButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        {/* Top highlight border */}
        <Animated.View style={styles.topHighlight} />

        <LinearGradient
          colors={[colors.primary, colors.hero]}
          style={styles.inviteButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.inviteButtonText}>Tap to invite</Text>

          <Animated.View style={[styles.plusIconContainer, pulseAnimatedStyle]}>
            <Ionicons
              name="add-circle"
              size={24}
              color={colors.heroSecondary}
            />
          </Animated.View>

          {/* Shimmer overlay with improved animation */}
          <Animated.View style={styles.shimmerContainer} pointerEvents="none">
            <Animated.View
              style={[styles.shimmerOverlay, shimmerAnimatedStyle]}
            />
            <Animated.View
              style={[
                styles.shimmerOverlay,
                styles.shimmerOverlaySecondary,
                shimmerAnimatedStyle,
              ]}
            />
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "relative",
  },

  // 3D Shadow layers for depth with pastel colors
  shadowLayer3: {
    position: "absolute",
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: "#FFB3E6", // Light pastel pink
    opacity: 0.4,
    borderRadius: 20,
    zIndex: 1,
  },
  shadowLayer2: {
    position: "absolute",
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: "#FFB3E6", // Light pastel blue
    opacity: 0.5,
    borderRadius: 18,
    zIndex: 2,
  },
  shadowLayer1: {
    position: "absolute",
    top: 2,
    left: 2,
    right: -2,
    bottom: -2,
    backgroundColor: "#C7FFB3", // Light pastel green
    opacity: 0.6,
    borderRadius: 17,
    zIndex: 3,
  },

  inviteButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderTopColor: "#ffffff40", // Lighter top border for 3D effect
    borderLeftColor: "#ffffff30",
    borderRightColor: "#00000030", // Darker right border
    borderBottomColor: "#00000040", // Darker bottom border
    position: "relative",
    zIndex: 4,
    // iOS shadow for additional depth
    ...(Platform.OS === "ios" && {
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    }),
    // Android elevation
    ...(Platform.OS === "android" && {
      elevation: 8,
    }),
  },

  // Top highlight for extra 3D effect
  topHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#ffffff60",
    zIndex: 5,
  },

  inviteButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
    position: "relative",
    // Add inner highlight for more depth
    borderTopWidth: 1,
    borderTopColor: "#ffffff20",
  },
  inviteButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.heroSecondary,
    // Add text shadow for better readability
    textShadowColor: "#00000040",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  plusIconContainer: {
    // Add subtle glow effect to icon
    shadowColor: colors.heroSecondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  shimmerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  shimmerOverlay: {
    position: "absolute",
    top: -10,
    bottom: -10,
    width: 40,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 2,
  },
  shimmerOverlaySecondary: {
    width: 20,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginLeft: 50,
  },
});
