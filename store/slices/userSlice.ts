import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import {
  getCurrentUser,
  deleteAccount as deleteAccountAPI,
  updateExpoPushToken as updateExpoPushTokenAPI,
  updateUserPisserTag as updateUserPisserTagAPI,
  updateUserName as updateUserNameAPI, // Add this import
} from "@/api";

interface User {
  id: string;
  phone: string;
  name?: string;
  pisserTag?: string;
  verified: boolean;
  expoPushToken?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunk for loading user data
export const loadUser = createAsyncThunk(
  "user/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to load user"
      );
    }
  }
);

// Async thunk for deleting account
export const deleteUserAccount = createAsyncThunk(
  "user/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await deleteAccountAPI();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete account"
      );
    }
  }
);

// Async thunk for updating push token
export const updateExpoPushToken = createAsyncThunk(
  "user/updateExpoPushToken",
  async (expoPushToken: string | null, { rejectWithValue }) => {
    try {
      const response = await updateExpoPushTokenAPI(expoPushToken);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update push token"
      );
    }
  }
);

// Async thunk for updating pisser tag
export const updatePisserTag = createAsyncThunk(
  "user/updatePisserTag",
  async (pisserTag: string, { rejectWithValue }) => {
    try {
      const response = await updateUserPisserTagAPI(pisserTag);
      return response.data.user;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to update pisser tag";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for updating name
export const updateName = createAsyncThunk(
  "user/updateName",
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await updateUserNameAPI(name);
      return response.data.user;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to update name";
      return rejectWithValue(errorMessage);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUserError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete account cases
      .addCase(deleteUserAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update push token cases
      .addCase(updateExpoPushToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpoPushToken.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.expoPushToken = action.payload.expoPushToken;
          state.user.updatedAt = action.payload.updatedAt;
        }
        state.error = null;
      })
      .addCase(updateExpoPushToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update pisser tag cases
      .addCase(updatePisserTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePisserTag.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.pisserTag = action.payload.pisserTag;
          state.user.updatedAt = action.payload.updatedAt;
        }
        state.error = null;
      })
      .addCase(updatePisserTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update name cases
      .addCase(updateName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateName.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.name = action.payload.name;
          state.user.updatedAt = action.payload.updatedAt;
        }
        state.error = null;
      })
      .addCase(updateName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUser, setUserLoading, setUserError, updateUser } =
  userSlice.actions;

export default userSlice.reducer;

// Memoized selectors
export const selectUser = (state: { user: UserState }) => state.user.user;
