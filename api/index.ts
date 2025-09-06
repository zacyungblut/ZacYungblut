import axios from "axios";
import { AuthService } from "@/utils/authStorage";

export const baseURL = "http://localhost:3000"; // Updated to match backend port
export const socketURL = baseURL; // Export socket URL for SocketContext

let API = createAPIInstance();

function createAPIInstance() {
  const instance = axios.create({
    baseURL,
    timeout: 120000, // Increased to 2 minutes for large uploads
    headers: {
      "Content-Type": "application/json",
    },
    maxContentLength: 200 * 1024 * 1024, // 200MB
    maxBodyLength: 200 * 1024 * 1024, // 200MB
  });

  // Add response interceptor for handling timeouts and auth errors
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Handle 401 errors only
      if (error.response?.status === 401) {
        try {
          return API.request(error.config);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          throw error;
        }
      }
      return Promise.reject(error);
    }
  );

  // Simplify request interceptor
  instance.interceptors.request.use(
    async (config) => {
      const token = AuthService.getAuthToken();
      if (token !== null) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
}

export const signup = async (phone: string) => {
  return API.post("/auth/signup", { phone });
};

export const verifyCode = async (phone: string, code: string) => {
  return API.post("/auth/verify", { phone, code });
};

export const resendVerification = async (phone: string, type: string) => {
  return API.post("/auth/signup", { phone });
};

// Add this new function to get the current authenticated user
export const getCurrentUser = async () => {
  return API.get("/auth/me");
};

// Invite functions
export const sendInvite = async (relationshipType: string) => {
  return API.post("/invites/send", { relationshipType });
};

export const getInvites = async () => {
  return API.get("/invites");
};

export const respondToInvite = async (
  inviteId: string,
  response: "ACCEPTED" | "DECLINED"
) => {
  return API.post("/invites/respond", { inviteId, response });
};

export const cancelInvite = async (inviteId: string) => {
  return API.delete(`/invites/${inviteId}`);
};

// Search functions
export const searchUserByPhone = async (phone: string) => {
  return API.post("/search/user", { phone });
};

export const unlockUserStatus = async (phone: string) => {
  return API.post("/search/unlock", { phone });
};

export const getUserUnlockHistory = async () => {
  return API.get("/search/unlocks");
};

// Relationship functions
export const editRelationship = async (
  relationshipId: string,
  updateData: any
) => {
  return API.put("/relationships/edit", { relationshipId, ...updateData });
};

export const getUserRelationships = async () => {
  return API.get("/relationships");
};
