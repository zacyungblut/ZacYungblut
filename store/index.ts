import { configureStore } from "@reduxjs/toolkit";

import userSlice from "@/store/slices/userSlice";

// We'll start with just the user slice for now, you can add the others later
export const store = configureStore({
  reducer: {
    user: userSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Disable in development to improve performance
        ignoredActions: [
          "user/loadUser/fulfilled",
          // Add more actions that contain non-serializable data
          "persist/PERSIST",
          "persist/REHYDRATE",
        ],
        ignoredPaths: ["user.user.photos"],
        // Reduce frequency of checks in development
        warnAfter: 128,
      },
      immutableCheck: {
        // Reduce frequency of immutability checks
        warnAfter: 128,
      },
    }).concat(__DEV__ ? [] : []),
  devTools: __DEV__
    ? {
        maxAge: 50, // Limit action history to prevent memory issues
        trace: false, // Disable stack traces for better performance
        traceLimit: 25,
      }
    : false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
