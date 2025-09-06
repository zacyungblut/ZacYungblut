import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { AuthService } from "@/utils/authStorage";
import { baseURL } from "@/api";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const { user, fetchUser } = useUserRedux();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize socket if user is authenticated and not already initialized
    if (user && !isInitializedRef.current) {
      initializeSocket();
      isInitializedRef.current = true;
    }

    // Cleanup when user logs out
    if (!user && isInitializedRef.current) {
      disconnectSocket();
      isInitializedRef.current = false;
    }

    return () => {
      if (socketRef.current) {
        disconnectSocket();
      }
    };
  }, [user]);

  const initializeSocket = () => {
    const token = AuthService.getAuthToken();

    if (!token || !user) {
      console.log("No token or user available for socket connection");
      return;
    }

    try {
      // Create socket connection with auth token
      socketRef.current = io(baseURL, {
        auth: {
          token: token,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection event handlers
      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current?.id);
        setIsConnected(true);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
      });

      // Listen for refresh events
      socketRef.current.on("refresh", (data) => {
        console.log("Received refresh event:", data);
        handleRefreshEvent(data);
      });

      // Listen for auth errors
      socketRef.current.on("auth_error", (error) => {
        console.error("Socket auth error:", error);
        disconnectSocket();
      });
    } catch (error) {
      console.error("Error initializing socket:", error);
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      console.log("Disconnecting socket");
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const handleRefreshEvent = async (data: any) => {
    try {
      console.log("Refreshing user data due to socket event");
      await fetchUser();
      console.log("User data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const contextValue: SocketContextType = {
    socket: socketRef.current,
    isConnected,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
