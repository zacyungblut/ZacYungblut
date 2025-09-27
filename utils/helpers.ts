import * as Haptics from "expo-haptics";
import { APP_CONFIG } from "@/constants/AppConfig";
import * as ImagePicker from "expo-image-picker";

export const playHapticDrumRoll = async () => {
  const numberOfBeats = 10;
  const delayBetweenBeats = 50; // 50ms between each beat for a fast drum roll

  for (let i = 0; i < numberOfBeats; i++) {
    await new Promise((resolve) => setTimeout(resolve, delayBetweenBeats));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export const shareMessage = `Hey! I'd like to make it official. Press this link to make our relationship official`;
export const referralMessage = `Hey, check out this app called Official, the modern way to be "Facebook Official" with your partner. When you join we both get ${
  APP_CONFIG.REFERRAL_BONUS_SEARCHES || 2
} free searches!`;

// Helper function to calculate remaining searches for the user
export const calculateRemainingSearches = (
  searchTransactions: any[] = [],
  bonusSearches: number = 0,
  hasPremium: boolean = false
): number => {
  const DEFAULT_MONTHLY_SEARCHES = hasPremium
    ? APP_CONFIG.PREMIUM_MONTHLY_SEARCHES
    : APP_CONFIG.DEFAULT_MONTHLY_SEARCHES;

  // Get current date and calculate 30 days ago
  const now = new Date();
  const thirtyDaysAgo = new Date(
    now.getTime() - APP_CONFIG.SEARCH_HISTORY_DAYS * 24 * 60 * 60 * 1000
  );

  // Count search transactions from the last 30 days
  const recentSearches = searchTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.createdAt);
    return transactionDate >= thirtyDaysAgo;
  });

  // Calculate remaining searches
  const totalSearches = DEFAULT_MONTHLY_SEARCHES + bonusSearches;
  const remainingSearches = Math.max(0, totalSearches - recentSearches.length);
  console.log("totalSearches", totalSearches);
  console.log("recentSearches", recentSearches.length);
  console.log("remainingSearches", remainingSearches);

  return remainingSearches;
};

export interface SelectedMedia {
  uri: string;
  type: "image" | "video";
}

export const selectMediaFromLibrary =
  async (): Promise<SelectedMedia | null> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.6,
        allowsEditing: false,
        base64: true, // Enable base64 for S3 upload
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedAsset = result.assets[0];

        if (!selectedAsset.uri) {
          throw new Error("Selected media is invalid");
        }

        console.log("Selected media:", selectedAsset.uri);
        console.log("Media type:", selectedAsset.type);
        console.log("File size:", selectedAsset.fileSize);

        // For videos, we need to handle the URI differently
        let mediaUri = selectedAsset.uri;

        // If it's a video and we have base64, use that; otherwise use the file URI
        if (selectedAsset.type === "video") {
          if (selectedAsset.base64) {
            mediaUri = `data:video/mp4;base64,${selectedAsset.base64}`;
          }
          // If no base64, the backend will handle the file URI
        } else {
          // For images, always use base64
          if (selectedAsset.base64) {
            mediaUri = `data:image/jpeg;base64,${selectedAsset.base64}`;
          }
        }

        return {
          uri: mediaUri,
          type: selectedAsset.type === "video" ? "video" : "image",
        };
      }

      return null;
    } catch (error) {
      console.error("Error selecting media:", error);
      throw error;
    }
  };
