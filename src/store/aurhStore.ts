import { create } from "zustand";
import {
  AuthState,
  LoginResponse,
  RegisterInputs,
  RegisterResponse,
} from "../libs/typs";
import axios from "axios";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  error: null,
  isLoading: false,
  succesMessage: null,

  register: async (data) => {
    console.log(data);
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post<RegisterResponse>(
        `http://localhost:4000/api/v1/auth/register`,
        data
      );

      const { success, user } = res.data;
      console.log(success, user);

      return { success, user };
    } catch (error: any) {
      console.log(error);
      if (!error) return;
      const message: string = error?.response?.data?.message;
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
  login: async (data) => {
    set({ isLoading: false, error: null });
    try {
      const res = await axios.post<LoginResponse>(
        `http://localhost:4000/api/v1/auth/login`,
        data
      );
      const { user, token } = res.data;
      if (res.data) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token ?? "");
      }
      set({ user, token });

      return { success: true };
    } catch (error: any) {
      console.log(error);
      if (!error) return;
      const message: string = error?.response?.data?.message;
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
  authCheckout: () => {
    try {
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      const token = localStorage.getItem("token") || null;
      if (user && token) {
        set({ token, user });
      }
    } catch (error) {
      console.log(error);
    }
  },
  updateProfile: async (data: RegisterInputs) => {
    set({ isLoading: true, error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      const res = await axios.put<LoginResponse>(
        `http://localhost:4000/api/v1/auth/updateProfile/${userId}`,
        data
      );
      const { user } = res.data;

      if (res.data) {
        localStorage.setItem("user", JSON.stringify(user));
      }


      console.log(res);
      set({
        isLoading: false,
        error: null,
        user,
        succesMessage: "Profile updated successfully!",
      });
    } catch (error: any) {
      console.log(error);
      const message = error?.response?.data?.message;
      if (message) {
        console.error("Error updating profile:", message);
        set({ error: message, succesMessage: null, isLoading: false });
      }
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
  clearError: () => {
    set({ error: null, succesMessage: null });
  },
}));
