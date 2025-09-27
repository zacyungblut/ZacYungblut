import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Keyboard,
  Dimensions,
  Alert,
} from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import HomeIcon from "./HomeIcon";
import UserIcon from "./UserIcon";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { router } from "expo-router";
import { selectMediaFromLibrary } from "@/utils/helpers";

const TAB_BAR_HEIGHT = 75;

interface TabBarProps {
  currentPage: SharedValue<number>;
  onTabPress: (index: number) => void;
  onPlusPress?: () => void;
}

const TabBar: React.FC<TabBarProps> = ({
  currentPage,
  onTabPress,
  onPlusPress,
}) => {
  const { user } = useUserRedux();

  // Animated styles for the tab bar background
  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: "rgba(0, 0, 0, 0.95)",
    };
  });

  // Tab icon component
  const TabIcon = ({
    iconType,
    index,
    label,
  }: {
    iconType: "home" | "user";
    index: number;
    label: string;
  }) => {
    const animatedIconStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        currentPage.value,
        [index - 0.5, index, index + 0.5],
        [0.5, 1, 0.5],
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
        [0.5, 1, 0.5],
        "clamp"
      );

      return {
        opacity: withSpring(opacity, { damping: 15, stiffness: 150 }),
      };
    });

    const handlePress = () => {
      // Dismiss keyboard before tab navigation
      Keyboard.dismiss();
      onTabPress(index);
    };

    // Determine if this tab is selected
    const isSelected = Math.round(currentPage.value) === index;

    const renderIcon = () => {
      if (iconType === "home") {
        return <HomeIcon isFocused={isSelected} color="#FFFFFF" />;
      } else if (iconType === "user") {
        return <UserIcon isFocused={isSelected} color="#FFFFFF" />;
      }
      return null;
    };

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={handlePress}
        activeOpacity={0.7}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          {renderIcon()}
        </Animated.View>
        <Animated.Text
          style={[
            styles.tabLabel,
            {
              color: "#FFFFFF",
            },
            animatedTextStyle,
          ]}>
          {label}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  // Enhanced Plus button component
  const PlusButton = () => {
    const handlePress = async () => {
      Keyboard.dismiss();

      // Check if user has pisser tag before proceeding
      if (!user?.pisserTag) {
        // Trigger the pisser tag modal via the parent callback
        if (onPlusPress) {
          onPlusPress();
        }
        return;
      }

      try {
        // Open camera roll immediately
        const selectedMedia = await selectMediaFromLibrary();

        if (selectedMedia) {
          // Navigate to create post with the selected media
          router.push({
            pathname: "/create-post",
            params: {
              selectedMediaUri: selectedMedia.uri,
              selectedMediaType: selectedMedia.type,
            },
          });
        }
        // If user cancels media selection, do nothing (stay on current screen)
      } catch (error) {
        console.error("Error selecting media:", error);
        Alert.alert("Error", "Failed to select media. Please try again.");
      }

      // Call the callback if provided
      if (onPlusPress) {
        onPlusPress();
      }
    };

    return (
      <TouchableOpacity
        style={styles.plusButton}
        onPress={handlePress}
        activeOpacity={0.8}>
        <View style={styles.plusButtonContainer}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.tabBar, animatedTabBarStyle]}>
        <BlurView
          intensity={100}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />

        {/* Tab buttons with better spacing */}
        <View style={styles.tabContainer}>
          <View style={styles.leftTabsContainer}>
            <TabIcon iconType="home" index={0} label="Feed" />
          </View>

          {/* Plus button in center */}
          <PlusButton />

          <View style={styles.rightTabsContainer}>
            <TabIcon iconType="user" index={1} label="Profile" />
          </View>
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
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(40, 40, 40, 0.8)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 5,
  },
  leftTabsContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  rightTabsContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 0,
    minWidth: 60,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  plusButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    paddingHorizontal: 20,
  },
  plusButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(60, 60, 67, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default TabBar;
