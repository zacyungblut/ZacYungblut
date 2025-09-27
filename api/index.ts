import axios from "axios";
import { AuthService } from "@/utils/authStorage";

// export const baseURL = "http://localhost:3000"; // Updated to match backend port
// export const baseURL = "http://192.168.86.43:3000"; // 34 craigleith
// export const baseURL = "http://10.0.0.143:3000"; // 450 Front st west, toronto
export const baseURL = "https://mixer-backend.cfd";

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

// Auth functions
export const signup = async (phone: string, pisserTag?: string) => {
  return API.post("/auth/signup", { phone, pisserTag });
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

// Add this new function for deleting account
export const deleteAccount = async () => {
  return API.delete("/auth/delete-account");
};

// Add this new function for updating push token
export const updateExpoPushToken = async (expoPushToken: string | null) => {
  return API.put("/auth/push-token", { expoPushToken });
};

// Add this new function for checking pisser tag availability
export const checkPisserTagAvailability = async (pisserTag: string) => {
  return API.get(`/auth/check-pisser-tag?tag=${encodeURIComponent(pisserTag)}`);
};

// Add this new function for updating pisser tag
export const updateUserPisserTag = async (pisserTag: string) => {
  return API.put("/auth/pisser-tag", { pisserTag });
};

// Add this new function for updating user name
export const updateUserName = async (name: string) => {
  return API.put("/auth/name", { name });
};

// Posts API functions
export const createPost = async (postData: {
  caption?: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  songTitle?: string;
  songArtist?: string;
  songUrl?: string;
}) => {
  return API.post("/posts", postData);
};

// Enhanced feed function with cursor-based pagination
export const getFeed = async (cursor?: string, limit: number = 20) => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  params.append("limit", limit.toString());

  return API.get(`/posts/feed?${params.toString()}`);
};

// Keep existing getPosts for backward compatibility
export const getPosts = async (page: number = 1, limit: number = 20) => {
  return API.get(`/posts?page=${page}&limit=${limit}`);
};

export const getUserPosts = async (
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  return API.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
};

export const getPost = async (postId: string) => {
  return API.get(`/posts/${postId}`);
};

export const updatePost = async (
  postId: string,
  updateData: {
    caption?: string;
    songTitle?: string;
    songArtist?: string;
    songUrl?: string;
  }
) => {
  return API.put(`/posts/${postId}`, updateData);
};

export const deletePost = async (postId: string) => {
  return API.delete(`/posts/${postId}`);
};

// Post interaction functions
export const likePost = async (postId: string) => {
  return API.post(`/posts/${postId}/like`);
};

export const unlikePost = async (postId: string) => {
  return API.delete(`/posts/${postId}/like`);
};

export const dislikePost = async (postId: string) => {
  return API.post(`/posts/${postId}/dislike`);
};

export const undislikePost = async (postId: string) => {
  return API.delete(`/posts/${postId}/dislike`);
};

export const reportPost = async (
  postId: string,
  reason: string,
  details?: string
) => {
  return API.post(`/posts/${postId}/report`, { reason, details });
};

// Get user's interactions with posts
export const getUserPostInteractions = async (postIds: string[]) => {
  return API.post("/posts/interactions", { postIds });
};

// Song search function
export const searchSongs = async (query: string, limit: number = 20) => {
  return API.get(
    `/posts/search-songs?query=${encodeURIComponent(query)}&limit=${limit}`
  );
};

// Add this new function for getting current user's posts
export const getCurrentUserPosts = async (
  page: number = 1,
  limit: number = 20
) => {
  return API.get(`/auth/me/posts?page=${page}&limit=${limit}`);
};
