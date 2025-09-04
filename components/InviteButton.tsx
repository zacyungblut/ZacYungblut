import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, Dimensions } from "react-native";
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

  return (
    <TouchableOpacity
      style={styles.inviteButton}
      onPress={onPress}
      activeOpacity={0.8}>
      <LinearGradient
        colors={[colors.primary, colors.hero]}
        style={styles.inviteButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <Text style={styles.inviteButtonText}>Tap to invite</Text>

        <Animated.View style={[styles.plusIconContainer, pulseAnimatedStyle]}>
          <Ionicons name="add-circle" size={24} color={colors.heroSecondary} />
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
  );
}

const styles = StyleSheet.create({
  inviteButton: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  inviteButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
    position: "relative",
  },
  inviteButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.heroSecondary,
  },
  plusIconContainer: {
    // Additional styling for the plus icon if needed
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
