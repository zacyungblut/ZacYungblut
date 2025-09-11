import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import {
  getCurrentUser,
  editRelationship as editRelationshipAPI,
  deleteAccount as deleteAccountAPI,
  updateUserSingleStatus as updateUserSingleStatusAPI, // Add this import
} from "@/api";

// Define types based on your schema
interface ShareAttempt {
  id: string;
  inviteId: string;
  shareMethod: string;
  wasSuccessful: boolean;
  wasAborted: boolean;
  errorMessage?: string;
  platform?: string;
  appVersion?: string;
  createdAt: string;
}

interface Invite {
  id: string;
  senderPhone: string;
  relationshipType: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED";
  message?: string;
  shareAttempts?: ShareAttempt[]; // Add this field
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

interface ReviewRequest {
  id: string;
  userId: string;
  platform: string;
  appVersion?: string;
  buildVersion?: string;
  searchCount: number;
  wasDisplayed: boolean;
  userInteracted: boolean;
  deviceModel?: string;
  osVersion?: string;
  createdAt: string;
  updatedAt: string;
}

// Add SearchTransaction interface
interface SearchTransaction {
  id: string;
  userId: string;
  targetPhone: string;
  targetStatus: string;
  wasSuccessful: boolean;
  createdAt: string;
}

// Add ReferralTransaction interfaces
interface ReferralUser {
  id: string;
  phone: string;
  name?: string;
}

interface ReferralTransaction {
  id: string;
  referrerId: string;
  claimerId: string;
  platform?: string;
  appVersion?: string;
  buildVersion?: string;
  claimedAt: string;
  createdAt: string;
  updatedAt: string;
  referrer?: ReferralUser;
  claimer?: ReferralUser;
}

interface User {
  id: string;
  phone: string;
  name?: string;
  verified: boolean;
  isSingle: boolean;
  bonusSearches: number; // Add bonus searches field
  createdAt: string;
  updatedAt: string;
  relationships: Relationship[];
  sentInvites: Invite[];
  reviewRequests: ReviewRequest[];
  searchTransactions: SearchTransaction[]; // Add search transactions field
  referralsClaimed: ReferralTransaction[]; // Add referrals claimed
  referralsShared: ReferralTransaction[]; // Add referrals shared
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

// Add this new async thunk after editRelationship
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

// Add this new async thunk after deleteUserAccount
export const updateSingleStatus = createAsyncThunk(
  "user/updateSingleStatus",
  async (isSingle: boolean, { rejectWithValue }) => {
    try {
      const response = await updateUserSingleStatusAPI(isSingle);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update single status"
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
    addShareAttemptToInvite: (
      state,
      action: PayloadAction<{ inviteId: string; shareAttempt: ShareAttempt }>
    ) => {
      if (state.user) {
        const inviteIndex = state.user.sentInvites.findIndex(
          (invite) => invite.id === action.payload.inviteId
        );
        if (inviteIndex !== -1) {
          if (!state.user.sentInvites[inviteIndex].shareAttempts) {
            state.user.sentInvites[inviteIndex].shareAttempts = [];
          }
          state.user.sentInvites[inviteIndex].shareAttempts!.push(
            action.payload.shareAttempt
          );
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
      })
      // Add delete account cases
      .addCase(deleteUserAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        // Clear all user data on successful deletion
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add update single status cases
      .addCase(updateSingleStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSingleStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.isSingle = action.payload.isSingle;
          state.user.updatedAt = action.payload.updatedAt;
        }
        state.error = null;
      })
      .addCase(updateSingleStatus.rejected, (state, action) => {
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
  addReviewRequest,
  updateReviewRequest,
  addSentInvite,
  updateInviteStatus,
  removeCancelledInvite,
  addRelationship,
  updateRelationship,
  addShareAttemptToInvite,
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

export const selectUserReviewRequests = createSelector(
  [selectUser],
  (user) => user?.reviewRequests || []
);

// Add new selectors for search transactions and referrals
export const selectUserSearchTransactions = createSelector(
  [selectUser],
  (user) => user?.searchTransactions || []
);

export const selectUserReferrals = createSelector([selectUser], (user) => ({
  claimed: user?.referralsClaimed || [],
  shared: user?.referralsShared || [],
}));

export const selectUserBonusSearches = createSelector(
  [selectUser],
  (user) => user?.bonusSearches || 0
);
