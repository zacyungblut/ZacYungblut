// App configuration constants
export const APP_CONFIG = {
  // Search limits
  DEFAULT_MONTHLY_SEARCHES: 3,
  PREMIUM_MONTHLY_SEARCHES: 11,

  // Other search-related constants
  SEARCH_HISTORY_DAYS: 30,

  // Referral system
  REFERRAL_BONUS_SEARCHES: 2,
} as const;

export const APPLE_MUSIC_CONFIG = {
  // You'll need to get this from Apple Developer Console
  // For development, you can use MusicKit JS which handles token generation
  DEVELOPER_TOKEN: process.env.EXPO_PUBLIC_APPLE_MUSIC_TOKEN || "",

  // Apple Music API base URL
  API_BASE_URL: "https://api.music.apple.com/v1",

  // Default search parameters
  DEFAULT_SEARCH_LIMIT: 20,
  DEFAULT_COUNTRY_CODE: "us",
};
