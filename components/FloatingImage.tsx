import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

interface FloatingImageProps {
  children: React.ReactNode;
  style?: any;
  floatIntensity?: number;
  scaleIntensity?: number;
  duration?: number;
}

const FloatingImage: React.FC<FloatingImageProps> = ({
  children,
  style,
  floatIntensity = 8,
  scaleIntensity = 0.05,
  duration = 3000,
}) => {
  const floatAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createFloatingAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnimation, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnimation, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const createScaleAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 1 + scaleIntensity,
            duration: duration * 0.67, // 2000ms when duration is 3000ms
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: duration * 0.67,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createFloatingAnimation();
    createScaleAnimation();
  }, [duration, floatIntensity, scaleIntensity]);

  const translateY = floatAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -floatIntensity],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY }, { scale: scaleAnimation }],
        },
      ]}>
      {children}
    </Animated.View>
  );
};

export default FloatingImage;
