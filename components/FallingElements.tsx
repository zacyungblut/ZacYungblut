import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
  Image,
  ImageSourcePropType,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FallingElementProps {
  delay?: number;
  size?: number;
  imageSource: ImageSourcePropType;
}

const FallingElement: React.FC<FallingElementProps> = ({
  delay = 0,
  size = 20,
  imageSource,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.3)).current;
  const rotationValue = useRef(new Animated.Value(0)).current;
  const swayValue = useRef(new Animated.Value(0)).current;

  // Random starting position and characteristics for each element
  const startX = useRef(Math.random() * SCREEN_WIDTH).current;
  const swayIntensity = useRef(30 + Math.random() * 40).current; // 30-70px sway
  const rotationIntensity = useRef(0.05 + Math.random() * 0.1).current; // 0.05-0.15 rotations (18-54 degrees max)
  const fallDuration = useRef(7000 + Math.random() * 4000).current; // 7-11 seconds
  const swayDuration = useRef(2000 + Math.random() * 2000).current; // 2-4 seconds per sway cycle

  // Refs to track and stop animations
  const swayAnimationRef = useRef<any>(null);
  const rotationAnimationRef = useRef<any>(null);

  useEffect(() => {
    const startAnimation = () => {
      // Stop any existing animations
      if (swayAnimationRef.current) {
        swayAnimationRef.current.stop();
      }
      if (rotationAnimationRef.current) {
        rotationAnimationRef.current.stop();
      }

      // Reset values
      animatedValue.setValue(0);
      opacityValue.setValue(0);
      scaleValue.setValue(0.3);
      rotationValue.setValue(0);
      swayValue.setValue(0);

      // Randomize new position for this cycle
      const newStartX = Math.random() * SCREEN_WIDTH;

      // Start sway animation (independent loop)
      const startSwayAnimation = () => {
        swayAnimationRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(swayValue, {
              toValue: 1,
              duration: swayDuration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(swayValue, {
              toValue: -1,
              duration: swayDuration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(swayValue, {
              toValue: 0,
              duration: swayDuration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        swayAnimationRef.current.start();
      };

      // Start rotation animation (independent loop)
      const startRotationAnimation = () => {
        rotationAnimationRef.current = Animated.loop(
          Animated.timing(rotationValue, {
            toValue: 1,
            duration: 8000 + Math.random() * 8000, // 8-16 seconds per rotation cycle
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          })
        );
        rotationAnimationRef.current.start();
      };

      // Main falling animation sequence
      Animated.sequence([
        // Initial delay
        Animated.delay(delay),

        // Fade in and scale up
        Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),

        // Main fall - ensure it always completes the full distance
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: fallDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),

        // Small delay at the bottom before restarting
        Animated.delay(500),
      ]).start((finished) => {
        // Only restart if the animation finished naturally (not stopped)
        if (finished) {
          // Stop the continuous animations before restarting
          if (swayAnimationRef.current) {
            swayAnimationRef.current.stop();
          }
          if (rotationAnimationRef.current) {
            rotationAnimationRef.current.stop();
          }

          // Restart after a random delay
          setTimeout(startAnimation, Math.random() * 3000 + 1000); // 1-4 second delay
        }
      });

      // Start independent animations
      startSwayAnimation();
      startRotationAnimation();
    };

    startAnimation();

    // Cleanup function
    return () => {
      if (swayAnimationRef.current) {
        swayAnimationRef.current.stop();
      }
      if (rotationAnimationRef.current) {
        rotationAnimationRef.current.stop();
      }
    };
  }, [delay, fallDuration, swayDuration]);

  // Vertical position (main fall) - ensure full coverage
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, SCREEN_HEIGHT + 150], // Extended range to ensure full coverage
  });

  // Horizontal swaying motion
  const translateX = swayValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-swayIntensity, 0, swayIntensity],
  });

  // Much more subtle rotation animation
  const rotation = rotationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", `${360 * rotationIntensity}deg`, "0deg"], // Rotates to max then back to 0, creating a gentle rocking motion
  });

  // Slight scale variation during fall for more organic feel
  const dynamicScale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 1.1],
  });

  // Opacity that stays visible throughout the fall and only fades at very end
  const dynamicOpacity = animatedValue.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 0.8, 0.8, 0], // Fade in quickly, stay visible, fade out at very end
  });

  return (
    <Animated.View
      style={[
        styles.fallingElement,
        {
          left: startX,
          transform: [
            { translateY },
            { translateX },
            { rotate: rotation },
            { scale: Animated.multiply(scaleValue, dynamicScale) },
          ],
          opacity: Animated.multiply(opacityValue, dynamicOpacity),
        },
      ]}
      pointerEvents="none">
      <Image
        source={imageSource}
        style={[styles.elementImage, { width: size, height: size }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

interface FallingElementsProps {
  count?: number;
  size?: number;
  visible?: boolean;
  imageSource: ImageSourcePropType;
}

const FallingElements: React.FC<FallingElementsProps> = ({
  count = 4,
  size = 20,
  visible = true,
  imageSource,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.animationContainer}>
      {Array.from({ length: count }, (_, index) => (
        <FallingElement
          key={index}
          delay={index * 1800 + Math.random() * 1000} // More staggered timing
          size={size + Math.random() * 10 - 2} // Vary size more (±2-8px)
          imageSource={imageSource}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: "none",
  },
  fallingElement: {
    position: "absolute",
    zIndex: 1,
  },
  elementImage: {
    tintColor: undefined, // Remove any tinting to preserve the original image color
  },
});

export default FallingElements;
