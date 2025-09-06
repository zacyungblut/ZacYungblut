import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";

interface AnimatedSearchEmptyStateProps {
  phoneNumberLength: number;
}

const AnimatedSearchEmptyState: React.FC<AnimatedSearchEmptyStateProps> = ({
  phoneNumberLength,
}) => {
  const radius = 160;
  const segmentWidth = 28;
  const segmentHeight = 4;
  const inwardDistance = 18;

  // Create shared values for each segment's position
  const segmentPositions = Array.from({ length: 10 }, () => useSharedValue(0));

  // Shared values for search icon animation
  const searchIconTranslateX = useSharedValue(0);
  const searchIconTranslateY = useSharedValue(0);
  const searchIconScale = useSharedValue(1);

  // Trigger haptic feedback
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  useEffect(() => {
    segmentPositions.forEach((position, index) => {
      const shouldAnimate = index < phoneNumberLength;
      const targetValue = shouldAnimate ? 1 : 0;
      const previousValue = position.value;

      position.value = withSpring(
        targetValue,
        {
          damping: 20,
          stiffness: 300,
        },
        (finished) => {
          if (finished && targetValue > previousValue && shouldAnimate) {
            runOnJS(triggerHaptic)();
          }
        }
      );
    });

    // Animate search icon when typing - much more noticeable!
    if (phoneNumberLength > 0) {
      // More pronounced horizontal searching movement
      searchIconTranslateX.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1200 }),
          withTiming(8, { duration: 1200 }),
          withTiming(0, { duration: 800 })
        ),
        -1, // Infinite repeats
        false
      );

      // More pronounced vertical searching movement
      searchIconTranslateY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 1500 }),
          withTiming(6, { duration: 1500 }),
          withTiming(0, { duration: 1000 })
        ),
        -1, // Infinite repeats
        false
      );

      // More pronounced breathing scale animation
      searchIconScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1500 }),
          withTiming(0.95, { duration: 1500 })
        ),
        -1, // Infinite repeats
        true // Reverse
      );
    } else {
      // Stop animations and return to normal
      searchIconTranslateX.value = withTiming(0, { duration: 600 });
      searchIconTranslateY.value = withTiming(0, { duration: 600 });
      searchIconScale.value = withTiming(1, { duration: 600 });
    }
  }, [phoneNumberLength]);

  // Generate segment components
  const renderSegments = () => {
    return Array.from({ length: 10 }, (_, index) => {
      const angle = index * 36 - 90; // Start from top, 36 degrees apart
      const radian = (angle * Math.PI) / 180;

      // Calculate initial position (on the circle)
      const x = radius + Math.cos(radian) * radius;
      const y = radius + Math.sin(radian) * radius;

      const animatedStyle = useAnimatedStyle(() => {
        const progress = segmentPositions[index].value;

        // Calculate inward movement
        const inwardX = Math.cos(radian) * inwardDistance * progress;
        const inwardY = Math.sin(radian) * inwardDistance * progress;

        return {
          transform: [
            { translateX: x - segmentWidth / 2 - inwardX },
            { translateY: y - segmentHeight / 2 - inwardY },
            { rotate: `${angle + 90}deg` },
            { scale: 1 + progress * 0.2 }, // Slight scale effect
          ],
          opacity: 0.3 + progress * 0.7, // Fade in effect
        };
      });

      return (
        <Animated.View key={index} style={[styles.segment, animatedStyle]} />
      );
    });
  };

  // Animated style for search icon
  const searchIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: searchIconTranslateX.value },
        { translateY: searchIconTranslateY.value },
        { scale: searchIconScale.value },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        {/* Render all segments */}
        <View style={styles.segmentsContainer}>{renderSegments()}</View>

        {/* Content inside the circle */}
        <View style={styles.innerContent}>
          <Animated.View
            style={[styles.searchIconContainer, searchIconAnimatedStyle]}>
            <Ionicons name="search" size={52} color={colors.text.quaternary} />
          </Animated.View>

          <Text style={styles.emptyStateTitle}>Search anyone</Text>
          <Text style={styles.emptyStateSubtitle}>837,483+ contacts</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Changed back to center since we have more vertical space
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40, // Add bottom padding to account for search input
  },
  circleContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: 320,
    height: 320,
  },
  segmentsContainer: {
    position: "absolute",
    width: 320,
    height: 320,
  },
  segment: {
    position: "absolute",
    width: 28,
    height: 4,
    backgroundColor: "#2A2A2A", // Off-black color
    borderRadius: 2,
  },
  innerContent: {
    position: "absolute",
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 25,
  },
  searchIconContainer: {
    marginBottom: 28,
    opacity: 0.8,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default AnimatedSearchEmptyState;
