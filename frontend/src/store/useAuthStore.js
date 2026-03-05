/**
 * Auth Store (Zustand)
 * Manages: user state, login, register, logout
 */

import { create } from "zustand";
import API from "../api/axiosInstance";
import toast from "react-hot-toast";

// Persist state helper
const loadFromStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: loadFromStorage("messenger_user"),
  token: localStorage.getItem("messenger_token"),
  loading: false,

  // ── Register ──
  register: async (username, email, password) => {
    set({ loading: true });
    try {
      const { data } = await API.post("/auth/register", {
        username,
        email,
        password,
      });
      localStorage.setItem("messenger_token", data.token);
      localStorage.setItem("messenger_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      toast.success("Account created! Welcome 🎉");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
      set({ loading: false });
      return false;
    }
  },

  // ── Login ──
  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("messenger_token", data.token);
      localStorage.setItem("messenger_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      toast.success(`Welcome back, ${data.user.username}!`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
      set({ loading: false });
      return false;
    }
  },

  // ── Logout ──
  logout: async () => {
    try {
      await API.post("/auth/logout");
    } catch {}
    localStorage.removeItem("messenger_token");
    localStorage.removeItem("messenger_user");
    set({ user: null, token: null });
    toast.success("Logged out");
  },

  // ── Update user in state after profile edit ──
  setUser: (updatedUser) => {
    localStorage.setItem("messenger_user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));

export default useAuthStore;
