import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { useColorScheme } from "@/components/useColorScheme";

const TAB_BAR_HEIGHT = 90;

interface TabBarProps {
  currentPage: SharedValue<number>;
  onTabPress: (index: number) => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentPage, onTabPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Animated styles for the tab bar background
  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: isDark
        ? "rgba(0, 0, 0, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
    };
  });

  // Tab icon component
  const TabIcon = ({
    name,
    index,
    label,
  }: {
    name: keyof typeof Ionicons.glyphMap;
    index: number;
    label: string;
  }) => {
    const animatedIconStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        currentPage.value,
        [index - 0.5, index, index + 0.5],
        [0.4, 1, 0.4],
        "clamp"
      );

      return {
        opacity: withSpring(opacity, { damping: 15, stiffness: 150 }),
      };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        currentPage.value,
        [index - 0.5, index, index + 0.5],
        [0.4, 1, 0.4],
        "clamp"
      );

      return {
        opacity: withSpring(opacity, { damping: 15, stiffness: 150 }),
      };
    });

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabPress(index)}
        activeOpacity={0.7}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <Ionicons name={name} size={26} color="#000000" />
        </Animated.View>
        <Animated.Text
          style={[
            styles.tabLabel,
            {
              color: "#000000",
            },
            animatedTextStyle,
          ]}>
          {label}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background with blur effect */}
      <Animated.View style={[styles.tabBar, animatedTabBarStyle]}>
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Tab buttons */}
        <View style={styles.tabContainer}>
          <TabIcon name="person" index={0} label="My Relationship" />
          <TabIcon name="search" index={1} label="Search Others" />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
  },
  tabBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(200, 200, 200, 0.3)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default TabBar;
