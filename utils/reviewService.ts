import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";

interface ReviewRequest {
  id: string;
  userId: string;
  platform: string;
  appVersion?: string;
  buildVersion?: string;
  unlockCount: number;
  wasDisplayed: boolean;
  userInteracted: boolean;
  deviceModel?: string;
  osVersion?: string;
  createdAt: string;
  updatedAt: string;
}

interface UnlockTransaction {
  id: string;
  userId: string;
  targetPhone: string;
  targetStatus: string;
  createdAt: string;
}

export class ReviewService {
  /**
   * Check if we should request a review from the user based on their activity and previous requests
   */
  static shouldRequestReview(
    unlockTransactions: UnlockTransaction[],
    reviewRequests: ReviewRequest[]
  ): boolean {
    // Rule 1: Must have at least 1 unlock transaction
    if (unlockTransactions.length === 0) {
      console.log("No unlock transactions - not requesting review");
      return false;
    }

    // Rule 2: Maximum of 3 review requests total
    if (reviewRequests.length >= 3) {
      console.log("Already requested review 3 times - not requesting again");
      return false;
    }

    // Rule 3: Must not have requested in the last 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentRequests = reviewRequests.filter(
      (request) => new Date(request.createdAt) > threeDaysAgo
    );

    if (recentRequests.length > 0) {
      console.log("Requested review within last 3 days - not requesting again");
      return false;
    }

    console.log("All conditions met - should request review");
    return true;
  }

  /**
   * Check if the platform supports in-app reviews
   */
  static async isReviewAvailable(): Promise<boolean> {
    try {
      // Dynamically import StoreReview to avoid loading issues
      const StoreReview = await import("expo-store-review");

      const isAvailable = await StoreReview.isAvailableAsync();
      const hasAction = await StoreReview.hasAction();

      return isAvailable && hasAction;
    } catch (error) {
      console.error("Error checking review availability:", error);
      return false;
    }
  }

  /**
   * Request a review from the user
   * Returns metadata about the request for tracking
   */
  static async requestReview(): Promise<{
    wasDisplayed: boolean;
    platform: string;
    appVersion?: string;
    buildVersion?: string;
    deviceModel?: string;
    osVersion?: string;
  }> {
    const metadata = {
      wasDisplayed: false,
      platform: Platform.OS,
      appVersion: Application.nativeApplicationVersion || undefined,
      buildVersion: Application.nativeBuildVersion || undefined,
      deviceModel: Device.modelName || undefined,
      osVersion: Device.osVersion || undefined,
    };

    try {
      // Check if review is available first
      const isAvailable = await this.isReviewAvailable();

      if (!isAvailable) {
        console.log("Store review not available on this platform/version");
        return metadata;
      }

      // Dynamically import StoreReview
      const StoreReview = await import("expo-store-review");

      // Request the review
      console.log("Requesting store review...");
      await StoreReview.requestReview();

      metadata.wasDisplayed = true;
      console.log("Store review requested successfully");
    } catch (error) {
      console.error("Error requesting store review:", error);
    }

    return metadata;
  }

  /**
   * Get the current app version and build information
   */
  static getAppInfo() {
    return {
      appVersion: Application.nativeApplicationVersion || "unknown",
      buildVersion: Application.nativeBuildVersion || "unknown",
      platform: Platform.OS,
      deviceModel: Device.modelName || "unknown",
      osVersion: Device.osVersion || "unknown",
    };
  }

  /**
   * Check if enough time has passed since the last review request
   */
  static hasEnoughTimePassed(
    lastRequestDate: string,
    daysSince: number = 3
  ): boolean {
    const lastRequest = new Date(lastRequestDate);
    const daysSinceMs = daysSince * 24 * 60 * 60 * 1000;
    const now = new Date();

    return now.getTime() - lastRequest.getTime() >= daysSinceMs;
  }

  /**
   * Log review metrics for debugging
   */
  static logReviewMetrics(
    unlockTransactions: UnlockTransaction[],
    reviewRequests: ReviewRequest[]
  ) {
    console.log("=== Review Service Metrics ===");
    console.log(`Unlock transactions: ${unlockTransactions.length}`);
    console.log(`Review requests: ${reviewRequests.length}`);

    if (reviewRequests.length > 0) {
      const lastRequest = reviewRequests[0];
      const daysSince = Math.floor(
        (new Date().getTime() - new Date(lastRequest.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      console.log(`Days since last request: ${daysSince}`);
    }

    console.log("==============================");
  }
}
