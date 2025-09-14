import * as Haptics from "expo-haptics";

export const playHapticDrumRoll = async () => {
  const numberOfBeats = 10;
  const delayBetweenBeats = 50; // 50ms between each beat for a fast drum roll

  for (let i = 0; i < numberOfBeats; i++) {
    await new Promise((resolve) => setTimeout(resolve, delayBetweenBeats));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export const shareMessage = `Hey! I'd like to make it official. Press this link to make our relationship official`;
export const referralMessage = `Hey, check out this app called Official, the modern way to be "Facebook Official" with your partner. When you join we both get 2 free searches!`;

// Helper function to calculate remaining searches for the user
export const calculateRemainingSearches = (
  searchTransactions: any[] = [],
  bonusSearches: number = 0,
  hasPremium: boolean = false
): number => {
  const DEFAULT_MONTHLY_SEARCHES = hasPremium ? 8 : 2;

  // Get current date and calculate 30 days ago
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Count search transactions from the last 30 days
  const recentSearches = searchTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.createdAt);
    return transactionDate >= thirtyDaysAgo;
  });

  // Calculate remaining searches
  const totalSearches = DEFAULT_MONTHLY_SEARCHES + bonusSearches;
  const remainingSearches = Math.max(0, totalSearches - recentSearches.length);

  return remainingSearches;
};
