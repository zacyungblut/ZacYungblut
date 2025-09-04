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

  return {
    user,
    loading,
    error,
    fetchUser,
    saveUser,
    logoutUser,
    updateUserData,
  };
};
