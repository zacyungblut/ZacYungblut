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
  addUnlockTransaction,
  addReviewRequest,
  updateReviewRequest,
  selectUser,
  selectUserInvites,
  selectUserRelationships,
  selectUserUnlockTransactions,
  selectUserReviewRequests,
} from "@/store/slices/userSlice";
import { AuthService } from "@/utils/authStorage";
import {
  sendInvite,
  respondToInvite,
  cancelInvite,
  saveReviewRequest,
} from "@/api";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook for user-related Redux operations
export const useUserRedux = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.user);
  const invites = useAppSelector(selectUserInvites);
  const relationships = useAppSelector(selectUserRelationships);
  const unlockTransactions = useAppSelector(selectUserUnlockTransactions);
  const reviewRequests = useAppSelector(selectUserReviewRequests);

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
  const sendUserInvite = async (relationshipType: string) => {
    try {
      const response = await sendInvite(relationshipType);
      const newInvite = response.data.invite;

      // Add the new invite to the user's sent invites
      dispatch(
        addSentInvite({
          ...newInvite,
          senderPhone: user?.phone || "",
        })
      );

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

  const addNewUnlockTransaction = (transaction: any) => {
    dispatch(addUnlockTransaction(transaction));
  };

  // Save review request to backend and add to Redux store
  const saveUserReviewRequest = async (reviewData: {
    platform: string;
    appVersion?: string;
    buildVersion?: string;
    unlockCount: number;
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

    // Invites data and actions
    invites,
    sendUserInvite,
    cancelUserInvite,

    // Relationships data and actions
    relationships,
    addNewRelationship,
    updateExistingRelationship,
    editExistingRelationship,

    // Unlock transactions data and actions
    unlockTransactions,
    addNewUnlockTransaction,

    // Review requests data and actions
    reviewRequests,
    saveUserReviewRequest,
    addNewReviewRequest,
    updateExistingReviewRequest,
  };
};
