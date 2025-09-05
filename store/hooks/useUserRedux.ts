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
  selectUser,
  selectUserInvites,
  selectUserRelationships,
  selectPendingReceivedInvites,
  removeRespondedInvite,
} from "@/store/slices/userSlice";
import { AuthService } from "@/utils/authStorage";
import { sendInvite, respondToInvite, cancelInvite } from "@/api";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook for user-related Redux operations
export const useUserRedux = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.user);
  const invites = useAppSelector(selectUserInvites);
  const relationships = useAppSelector(selectUserRelationships);
  const pendingInvites = useAppSelector(selectPendingReceivedInvites);

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
    recipientPhone: string,
    relationshipType: string
  ) => {
    try {
      const response = await sendInvite(recipientPhone, relationshipType);
      const newInvite = response.data.invite;

      // Add the new invite to the user's sent invites
      dispatch(
        addSentInvite({
          ...newInvite,
          senderPhone: user?.phone || "",
          recipientPhone,
        })
      );

      return response;
    } catch (error) {
      throw error;
    }
  };

  const respondToUserInvite = async (
    inviteId: string,
    response: "ACCEPTED" | "DECLINED"
  ) => {
    try {
      const apiResponse = await respondToInvite(inviteId, response);

      // Remove the responded invite from the store
      dispatch(removeRespondedInvite({ inviteId }));

      // If accepted and a relationship was created, add it to the store
      if (response === "ACCEPTED" && apiResponse.data.relationship) {
        dispatch(addRelationship(apiResponse.data.relationship));
      }

      return apiResponse;
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
    pendingInvites,
    sendUserInvite,
    respondToUserInvite,
    cancelUserInvite,

    // Relationships data and actions
    relationships,
    addNewRelationship,
    updateExistingRelationship,
  };
};
