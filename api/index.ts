export const baseURL = "http://localhost:3000"; // local host
import axios from "axios";
import { AuthService } from "@/utils/authStorage";

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
