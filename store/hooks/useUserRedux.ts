import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  loadUser,
  setUser,
  clearUser,
  updateUser,
  addSentInvite,
  updateInviteStatus,
  removeCancelledInvite,
  addRelationship,
  updateRelationship,
  editRelationship,
  endRelationship,
  deleteUserAccount,
  updateSingleStatus,
  updateRelationshipTypeVisibility,
  addReviewRequest,
  updateReviewRequest,
  selectUser,
  selectUserInvites,
  selectUserRelationships,
  selectUserReviewRequests,
  selectUserSearchTransactions,
  selectUserReferrals,
  selectUserBonusSearches,
  addShareAttemptToInvite,
} from "@/store/slices/userSlice";
import { AuthService } from "@/utils/authStorage";
import {
  sendInvite,
  respondToInvite,
  cancelInvite,
  saveReviewRequest,
  addShareAttempt,
} from "@/api";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook for user-related Redux operations
export const useUserRedux = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.user);
  const invites = useAppSelector(selectUserInvites);
  const relationships = useAppSelector(selectUserRelationships);
  const reviewRequests = useAppSelector(selectUserReviewRequests);
  const searchTransactions = useAppSelector(selectUserSearchTransactions);
  const referrals = useAppSelector(selectUserReferrals);
  const bonusSearches = useAppSelector(selectUserBonusSearches);

  const fetchUser = async () => {
    const result = await dispatch(loadUser());
    return result;
  };

  const saveUser = (userData: any) => {
    dispatch(setUser(userData));
  };

  const logoutUser = () => {
    dispatch(clearUser());
    AuthService.removeAuthToken();
  };

  const updateUserData = (updates: any) => {
    dispatch(updateUser(updates));
  };

  // Invite-related functions
  const sendUserInvite = async (
    relationshipType: string,
    updateLocalState: boolean = true
  ) => {
    try {
      const response = await sendInvite(relationshipType);
      const newInvite = response.data.invite;

      // Only add the new invite to the user's sent invites if updateLocalState is true
      if (updateLocalState) {
        dispatch(
          addSentInvite({
            ...newInvite,
            senderPhone: user?.phone || "",
          })
        );
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const cancelUserInvite = async (inviteId: string) => {
    try {
      const response = await cancelInvite(inviteId);

      // Remove the cancelled invite from the store
      dispatch(removeCancelledInvite({ inviteId }));

      return response;
    } catch (error) {
      throw error;
    }
  };

  const addNewRelationship = (relationship: any) => {
    dispatch(addRelationship(relationship));
  };

  const updateExistingRelationship = (relationship: any) => {
    dispatch(updateRelationship(relationship));
  };

  // New function to edit relationship via API
  const editExistingRelationship = async (
    relationshipId: string,
    updateData: any
  ) => {
    try {
      const result = await dispatch(
        editRelationship({ relationshipId, updateData })
      );
      return result;
    } catch (error) {
      throw error;
    }
  };

  // New function to end relationship via API
  const endExistingRelationship = async (relationshipId: string) => {
    try {
      const result = await dispatch(endRelationship(relationshipId));
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Save review request to backend and add to Redux store
  const saveUserReviewRequest = async (reviewData: {
    platform: string;
    appVersion?: string;
    buildVersion?: string;
    searchCount: number;
    wasDisplayed: boolean;
    userInteracted?: boolean;
    deviceModel?: string;
    osVersion?: string;
  }) => {
    try {
      const response = await saveReviewRequest(reviewData);
      const savedReviewRequest = response.data.reviewRequest;

      // Add the new review request to the store
      dispatch(addReviewRequest(savedReviewRequest));

      return response;
    } catch (error) {
      console.error("Failed to save review request:", error);
      throw error;
    }
  };

  const addNewReviewRequest = (reviewRequest: any) => {
    dispatch(addReviewRequest(reviewRequest));
  };

  const updateExistingReviewRequest = (updates: {
    id: string;
    wasDisplayed?: boolean;
    userInteracted?: boolean;
  }) => {
    dispatch(updateReviewRequest(updates));
  };

  const recordShareAttempt = async (
    inviteId: string,
    shareData: {
      shareMethod: string;
      wasSuccessful: boolean;
      wasAborted?: boolean;
      errorMessage?: string;
      platform?: string;
      appVersion?: string;
    }
  ) => {
    try {
      const response = await addShareAttempt(inviteId, shareData);
      const newShareAttempt = response.data.shareAttempt;

      // Add the share attempt to the local invite
      dispatch(
        addShareAttemptToInvite({
          inviteId,
          shareAttempt: newShareAttempt,
        })
      );

      return response;
    } catch (error) {
      console.error("Failed to record share attempt:", error);
      throw error;
    }
  };

  const deleteUserAccountPermanently = async () => {
    try {
      const result = await dispatch(deleteUserAccount());

      // If successful, also clear the auth token
      if (deleteUserAccount.fulfilled.match(result)) {
        AuthService.removeAuthToken();
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateUserSingleStatus = async (isSingle: boolean) => {
    try {
      const result = await dispatch(updateSingleStatus(isSingle));
      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateUserRelationshipTypeVisibility = async (
    showRelationshipType: boolean
  ) => {
    try {
      const result = await dispatch(
        updateRelationshipTypeVisibility(showRelationshipType)
      );
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    // User data
    user,
    loading,
    error,

    // User actions
    fetchUser,
    saveUser,
    logoutUser,
    updateUserData,
    updateUserSingleStatus,
    updateUserRelationshipTypeVisibility,
    deleteUserAccountPermanently,

    // Invites data and actions
    invites,
    sendUserInvite,
    cancelUserInvite,
    recordShareAttempt,

    // Relationships data and actions
    relationships,
    addNewRelationship,
    updateExistingRelationship,
    editExistingRelationship,
    endExistingRelationship,

    // Review requests data and actions
    reviewRequests,
    saveUserReviewRequest,
    addNewReviewRequest,
    updateExistingReviewRequest,

    // Search transactions data
    searchTransactions,

    // Referrals data
    referrals,

    // Bonus searches data
    bonusSearches,
  };
};
