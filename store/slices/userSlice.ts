import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getCurrentUser } from "@/api";

// Define the user type based on your schema
interface User {
  id: string;
  phone: string;
  name?: string;
  relationshipStatus: "SINGLE" | "RELATIONSHIP" | "SITUATIONSHIP";
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
      });
  },
});

export const { setUser, clearUser, setUserLoading, setUserError, updateUser } =
  userSlice.actions;
export default userSlice.reducer;
