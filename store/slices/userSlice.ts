import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import { getCurrentUser, editRelationship as editRelationshipAPI } from "@/api";

// Define types based on your schema
interface Invite {
  id: string;
  senderPhone: string;
  relationshipType: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED";
  message?: string;
  createdAt: string;
  updatedAt: string;
}

interface RelationshipUser {
  id: string;
  phone: string;
  name?: string;
}

interface Relationship {
  id: string;
  status:
    | "DATING"
    | "ENGAGED"
    | "MARRIED"
    | "SEPARATED"
    | "WIDOWED"
    | "SITUATIONSHIP"
    | "FRIENDS_WITH_BENEFITS"
    | "ON_A_BREAK"
    | "OPEN_RELATIONSHIP"
    | "POLYAMOROUS";
  startDate: string;
  endDate?: string;
  users: RelationshipUser[];
  createdAt: string;
  updatedAt: string;
}

interface UnlockTransaction {
  id: string;
  userId: string;
  targetPhone: string;
  targetStatus: string;
  createdAt: string;
}

interface ReviewRequest {
  id: string;
  userId: string;
  platform: string;
  appVersion?: string;
  buildVersion?: string;
  unlockCount: number;
  wasDisplayed: boolean;
  userInteracted: boolean;
  deviceModel?: string;
  osVersion?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  phone: string;
  name?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  relationships: Relationship[];
  sentInvites: Invite[];
  unlockTransactions: UnlockTransaction[];
  reviewRequests: ReviewRequest[];
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

// Async thunk for editing relationship
export const editRelationship = createAsyncThunk(
  "user/editRelationship",
  async (
    { relationshipId, updateData }: { relationshipId: string; updateData: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await editRelationshipAPI(relationshipId, updateData);
      return response.data.relationship;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update relationship"
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
    // Add new unlock transaction to the list
    addUnlockTransaction: (state, action: PayloadAction<UnlockTransaction>) => {
      if (state.user) {
        state.user.unlockTransactions = [
          action.payload,
          ...state.user.unlockTransactions,
        ];
      }
    },
    // Add new review request to the list
    addReviewRequest: (state, action: PayloadAction<ReviewRequest>) => {
      if (state.user) {
        state.user.reviewRequests = [
          action.payload,
          ...state.user.reviewRequests,
        ];
      }
    },
    // Update review request (e.g., when user interacts with it)
    updateReviewRequest: (
      state,
      action: PayloadAction<{
        id: string;
        wasDisplayed?: boolean;
        userInteracted?: boolean;
      }>
    ) => {
      if (state.user) {
        const index = state.user.reviewRequests.findIndex(
          (req) => req.id === action.payload.id
        );
        if (index !== -1) {
          state.user.reviewRequests[index] = {
            ...state.user.reviewRequests[index],
            ...action.payload,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    },
    // Invite reducers - only for sent invites now
    addSentInvite: (state, action: PayloadAction<Invite>) => {
      if (state.user) {
        state.user.sentInvites = [action.payload, ...state.user.sentInvites];
      }
    },
    updateInviteStatus: (
      state,
      action: PayloadAction<{ inviteId: string; status: Invite["status"] }>
    ) => {
      if (state.user) {
        // Update in sent invites only
        const sentInviteIndex = state.user.sentInvites.findIndex(
          (invite) => invite.id === action.payload.inviteId
        );
        if (sentInviteIndex !== -1) {
          state.user.sentInvites[sentInviteIndex].status =
            action.payload.status;
        }
      }
    },
    removeCancelledInvite: (
      state,
      action: PayloadAction<{ inviteId: string }>
    ) => {
      if (state.user) {
        // Remove from sent invites if cancelled
        state.user.sentInvites = state.user.sentInvites.filter(
          (invite) => invite.id !== action.payload.inviteId
        );
      }
    },
    addRelationship: (state, action: PayloadAction<Relationship>) => {
      if (state.user) {
        state.user.relationships = [
          action.payload,
          ...state.user.relationships,
        ];
      }
    },
    updateRelationship: (state, action: PayloadAction<Relationship>) => {
      if (state.user) {
        const index = state.user.relationships.findIndex(
          (rel) => rel.id === action.payload.id
        );
        if (index !== -1) {
          state.user.relationships[index] = action.payload;
        }
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
      .addCase(editRelationship.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editRelationship.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          const index = state.user.relationships.findIndex(
            (rel) => rel.id === action.payload.id
          );
          if (index !== -1) {
            state.user.relationships[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(editRelationship.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUser,
  clearUser,
  setUserLoading,
  setUserError,
  updateUser,
  addUnlockTransaction,
  addReviewRequest,
  updateReviewRequest,
  addSentInvite,
  updateInviteStatus,
  removeCancelledInvite,
  addRelationship,
  updateRelationship,
} = userSlice.actions;

export default userSlice.reducer;

// Memoized selectors for optimal performance
export const selectUser = (state: { user: UserState }) => state.user.user;

export const selectUserInvites = createSelector([selectUser], (user) => ({
  sent: user?.sentInvites || [],
}));

export const selectUserRelationships = createSelector(
  [selectUser],
  (user) => user?.relationships || []
);

// Add new selector for unlock transactions
export const selectUserUnlockTransactions = createSelector(
  [selectUser],
  (user) => user?.unlockTransactions || []
);

export const selectUserReviewRequests = createSelector(
  [selectUser],
  (user) => user?.reviewRequests || []
);
