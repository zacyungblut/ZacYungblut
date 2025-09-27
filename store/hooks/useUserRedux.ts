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
  deleteUserAccount,
  updateExpoPushToken,
  updatePisserTag,
  updateName,
  selectUser,
} from "@/store/slices/userSlice";
import { AuthService } from "@/utils/authStorage";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook for user-related Redux operations
export const useUserRedux = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.user);

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

  const updateUserExpoPushToken = async (expoPushToken: string | null) => {
    try {
      const result = await dispatch(updateExpoPushToken(expoPushToken));
      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateUserPisserTag = async (pisserTag: string) => {
    try {
      const result = await dispatch(updatePisserTag(pisserTag));
      if (updatePisserTag.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error(result.payload as string);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateUserName = async (name: string) => {
    try {
      const result = await dispatch(updateName(name));
      if (updateName.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error(result.payload as string);
      }
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
    deleteUserAccountPermanently,
    updateUserExpoPushToken,
    updateUserPisserTag,
    updateUserName,
  };
};
