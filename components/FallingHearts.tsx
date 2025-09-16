import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
  Image,
} from "react-native";
import { colors } from "@/constants/Colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FallingHeartProps {
  delay?: number;
  size?: number;
}

const FallingHeart: React.FC<FallingHeartProps> = ({
  delay = 0,
  size = 20,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.3)).current;
  const rotationValue = useRef(new Animated.Value(0)).current;
  const swayValue = useRef(new Animated.Value(0)).current;

  // Random starting position and characteristics for each heart
  const startX = useRef(Math.random() * SCREEN_WIDTH).current;
  const swayIntensity = useRef(30 + Math.random() * 40).current; // 30-70px sway
  const rotationIntensity = useRef(0.05 + Math.random() * 0.1).current; // 0.05-0.15 rotations (18-54 degrees max)
  const fallDuration = useRef(7000 + Math.random() * 4000).current; // 7-11 seconds
  const swayDuration = useRef(2000 + Math.random() * 2000).current; // 2-4 seconds per sway cycle

  useEffect(() => {
    const startAnimation = () => {
      // Reset values
      animatedValue.setValue(0);
      opacityValue.setValue(0);
      scaleValue.setValue(0.3);
      rotationValue.setValue(0);
      swayValue.setValue(0);

      // Start sway animation (independent loop)
      const startSwayAnimation = () => {
        Animated.loop(
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
        ).start();
      };

      // Start rotation animation (independent loop) - much slower and subtler
      const startRotationAnimation = () => {
        Animated.loop(
          Animated.timing(rotationValue, {
            toValue: 1,
            duration: 8000 + Math.random() * 8000, // 8-16 seconds per rotation cycle
            easing: Easing.inOut(Easing.sin), // Smoother easing for rotation
            useNativeDriver: true,
          })
        ).start();
      };

      // Main falling animation
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Fade in and scale up
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
        Animated.parallel([
          // Main fall animation
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: fallDuration,
            easing: Easing.out(Easing.quad), // Slightly decelerating fall
            useNativeDriver: true,
          }),
          // Fade out towards the end
          Animated.sequence([
            Animated.delay(fallDuration * 0.7), // Start fading at 70% of fall
            Animated.timing(opacityValue, {
              toValue: 0,
              duration: fallDuration * 0.3,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        // Restart animation after completion
        setTimeout(startAnimation, Math.random() * 5000 + 2000); // 2-7 second delay
      });

      // Start independent animations
      startSwayAnimation();
      startRotationAnimation();
    };

    startAnimation();
  }, [delay, fallDuration, swayDuration]);

  // Vertical position (main fall)
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, SCREEN_HEIGHT + 100],
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

  return (
    <Animated.View
      style={[
        styles.fallingHeart,
        {
          left: startX,
          transform: [
            { translateY },
            { translateX },
            { rotate: rotation },
            { scale: Animated.multiply(scaleValue, dynamicScale) },
          ],
          opacity: opacityValue,
        },
      ]}
      pointerEvents="none">
      <Image
        source={require("@/assets/images/heart.png")}
        style={[styles.heartImage, { width: size, height: size }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

interface FallingHeartsProps {
  count?: number;
  size?: number;
  visible?: boolean;
}

const FallingHearts: React.FC<FallingHeartsProps> = ({
  count = 4,
  size = 20,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.animationContainer}>
      {Array.from({ length: count }, (_, index) => (
        <FallingHeart
          key={index}
          delay={index * 1800 + Math.random() * 1000} // More staggered timing
          size={size + Math.random() * 10 - 2} // Vary size more (±2-8px)
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
  fallingHeart: {
    position: "absolute",
    zIndex: 1,
  },
  heartImage: {
    tintColor: undefined, // Remove any tinting to preserve the original heart color
  },
});

export default FallingHearts;
