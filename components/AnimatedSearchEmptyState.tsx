import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
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
import { ThermalSearchIcon } from "@/components/ThermalSearchIcon";
import { ThermalSegment } from "@/components/ThermalSegment";
import { colors } from "@/constants/Colors";

interface AnimatedSearchEmptyStateProps {
  phoneNumberLength: number;
  isSearching?: boolean;
}

const AnimatedSearchEmptyState: React.FC<AnimatedSearchEmptyStateProps> = ({
  phoneNumberLength,
  isSearching = false,
}) => {
  const radius = 160;
  const segmentWidth = 80; // Much longer segments
  const segmentHeight = 16; // Slightly taller for better curve visibility
  const inwardDistance = 18;

  // Create shared values for each segment's position
  const segmentPositions = Array.from({ length: 10 }, () => useSharedValue(0));

  // Create regular state for thermal intensities (immediate updates)
  const [segmentIntensities, setSegmentIntensities] = useState<number[]>(
    Array(10).fill(0)
  );

  // Shared value for spinning animation during search
  const spinRotation = useSharedValue(0);

  // Shared values for search icon animation - but we'll keep them minimal
  const searchIconTranslateX = useSharedValue(0);
  const searchIconTranslateY = useSharedValue(0);
  const searchIconScale = useSharedValue(1);

  // Trigger haptic feedback
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  useEffect(() => {
    if (isSearching) {
      // When searching, animate all segments to full opacity and start spinning
      segmentPositions.forEach((position) => {
        position.value = withSpring(1, {
          damping: 20,
          stiffness: 300,
        });
      });

      // Set all intensities to full immediately when searching - make them thermal/hot
      setSegmentIntensities(Array(10).fill(1));

      // Start continuous spinning animation
      spinRotation.value = withRepeat(
        withTiming(360, { duration: 2000 }),
        -1, // Infinite repeats
        false // Don't reverse
      );
    } else {
      // Normal behavior based on phone number length
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

      // Update thermal intensities immediately (no animation delay)
      const newIntensities = Array(10)
        .fill(0)
        .map((_, index) => (index < phoneNumberLength ? 1 : 0));
      setSegmentIntensities(newIntensities);

      // Stop spinning animation
      spinRotation.value = withTiming(0, { duration: 500 });
    }

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
      // Keep icon completely static when not searching
      searchIconTranslateX.value = withTiming(0, { duration: 600 });
      searchIconTranslateY.value = withTiming(0, { duration: 600 });
      searchIconScale.value = withTiming(1, { duration: 600 });
    }
  }, [phoneNumberLength, isSearching]);

  // Generate thermal segment components
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
            { scale: 1 + progress * 0.1 }, // Reduced scale effect for thermal segments
          ],
        };
      });

      // Determine the intensity for this segment
      // When searching, all segments should be thermal (hot)
      // When not searching, only segments up to phoneNumberLength should be thermal
      const intensity = isSearching ? 1 : segmentIntensities[index];

      return (
        <Animated.View key={index} style={[styles.segment, animatedStyle]}>
          <ThermalSegment
            width={segmentWidth}
            height={segmentHeight}
            intensity={intensity} // Use computed intensity
            thermalSpeed={isSearching ? 0.3 : 0.1} // Faster thermal animation when searching
          />
        </Animated.View>
      );
    });
  };

  // Animated style for search icon - keep it consistent
  const searchIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: searchIconTranslateX.value },
        { translateY: searchIconTranslateY.value },
        { scale: searchIconScale.value },
      ],
    };
  });

  // Animated style for the entire segments container (for spinning)
  const segmentsContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${spinRotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        {/* Render all thermal segments with spinning animation during search */}
        <Animated.View
          style={[styles.segmentsContainer, segmentsContainerAnimatedStyle]}>
          {renderSegments()}
        </Animated.View>

        {/* Content inside the circle */}
        <View style={styles.innerContent}>
          <Animated.View
            style={[styles.searchIconContainer, searchIconAnimatedStyle]}>
            <ThermalSearchIcon
              size={100}
              // Keep thermal search icon properties consistent
              thermalSpeed={0.15}
              borderFlowSpeed={0.4}
              borderIntensity={1.1}
            />
          </Animated.View>

          <Text style={styles.emptyStateSubtitle}>
            {isSearching ? "Searching..." : "837,483+ numbers"}
          </Text>
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
    // Remove background styling since ThermalSegment handles all visuals
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
    marginBottom: 24, // Reduced from 28 since we removed the title
    opacity: 0.8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default AnimatedSearchEmptyState;
