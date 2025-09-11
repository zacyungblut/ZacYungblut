import React, { useCallback, useRef, useState, useEffect } from "react";
import { Dimensions, StyleSheet, View, Keyboard } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";

import { colors } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import TabBar from "@/components/TabBar";
import ReferralClaimModal from "@/components/ReferralClaimModal";
import { AuthService } from "@/utils/authStorage";
import { useUserRedux } from "@/store/hooks/useUserRedux";

// Import your tab screens directly
import SearchScreen from "./search";
import RelationshipScreen from "./relationship";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TabLayout() {
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const currentPage = useSharedValue(0);
  const { user } = useUserRedux();

  // Referral modal state
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Check for pending referral code on component mount
  useEffect(() => {
    const checkReferralCode = () => {
      const pendingReferralCode = AuthService.getReferralCode();
      console.log("pendingReferralCode", pendingReferralCode);
      if (pendingReferralCode && pendingReferralCode !== user?.id) {
        setReferralCode(pendingReferralCode);
        setShowReferralModal(true);
      }
    };

    // Small delay to ensure the component is fully mounted
    const timer = setTimeout(checkReferralCode, 500);

    return () => clearTimeout(timer);
  }, []);

  // Create a safe keyboard dismiss function
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleTabPress = useCallback((index: number) => {
    // Dismiss keyboard when tab is pressed
    Keyboard.dismiss();

    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      y: 0,
      animated: false,
    });
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const newScrollOffset = event.contentOffset.x / SCREEN_WIDTH;
      currentPage.value = newScrollOffset;

      // Dismiss keyboard when scrolling away from search page (index 1)
      if (Math.abs(newScrollOffset - 1) > 0.1) {
        runOnJS(dismissKeyboard)();
      }
    },
  });

  const handleReferralModalClose = () => {
    setShowReferralModal(false);
    setReferralCode(null);
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={true}
        onScroll={scrollHandler}
        style={[
          styles.scrollView,
          {
            backgroundColor: colors.background.primary,
          },
        ]}
        decelerationRate="fast">
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <RelationshipScreen />
        </View>
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <SearchScreen />
        </View>
      </Animated.ScrollView>

      <TabBar currentPage={currentPage} onTabPress={handleTabPress} />

      {/* Referral Claim Modal */}
      {referralCode && (
        <ReferralClaimModal
          visible={showReferralModal}
          onClose={handleReferralModalClose}
          referralCode={referralCode}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
