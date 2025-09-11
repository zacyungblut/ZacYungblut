import { MMKV } from "react-native-mmkv";

// Create a dedicated MMKV instance for authentication
export const authStorage = new MMKV({
  id: "auth-storage",
});

const AUTH_TOKEN_KEY = "authToken";
const REFERRAL_CODE_KEY = "pendingReferralId";

export class AuthService {
  static getAuthToken(): string | undefined {
    try {
      const token = authStorage.getString(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error("Error retrieving auth token:", error);
      return undefined;
    }
  }

  static setAuthToken(token: string): void {
    try {
      authStorage.set(AUTH_TOKEN_KEY, token);
      console.log("Auth token saved successfully");
    } catch (error) {
      console.error("Error saving auth token:", error);
    }
  }

  static removeAuthToken(): void {
    try {
      authStorage.delete(AUTH_TOKEN_KEY);
      console.log("Auth token removed successfully");
    } catch (error) {
      console.error("Error removing auth token:", error);
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return !!token;
  }

  static getReferralCode(): string | undefined {
    try {
      const referralCode = authStorage.getString(REFERRAL_CODE_KEY);
      return referralCode;
    } catch (error) {
      console.error("Error retrieving referral code:", error);
      return undefined;
    }
  }

  static setReferralCode(referralCode: string): void {
    try {
      authStorage.set(REFERRAL_CODE_KEY, referralCode);
      console.log("Referral code saved successfully:", referralCode);
    } catch (error) {
      console.error("Error saving referral code:", error);
    }
  }

  static removeReferralCode(): void {
    try {
      authStorage.delete(REFERRAL_CODE_KEY);
      console.log("Referral code removed successfully");
    } catch (error) {
      console.error("Error removing referral code:", error);
    }
  }
}
