import { create } from "zustand";
import axios from "axios";
import i18n from "../i18n/index.js";
import { getI18nLang } from "../i18n/index.js";
import useSettingsStore from "./useSettingsStore.js";

const API = import.meta.env.VITE_API_URL ?? "";

const useAuthStore = create((set, get) => ({
  user:    null,
  token:   localStorage.getItem("token") || null,
  loading: true,

  setUser:  (user)  => set({ user }),
  setToken: (token) => set({ token }),

  login: (userData, userToken) => {
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
    const lng = getI18nLang(userData.language);
    i18n.changeLanguage(lng);
    localStorage.setItem("agri_ui_lang", lng);
    useSettingsStore.getState().syncLanguage(userData.language);
    set({ user: userData, token: userToken });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) {
      set({ loading: false });
      return;
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const { data } = await axios.get(`${API}/api/auth/me`);
      const user = data.user;
      localStorage.setItem("user", JSON.stringify(user));
      const lng = getI18nLang(user.language);
      i18n.changeLanguage(lng);
      localStorage.setItem("agri_ui_lang", lng);
      useSettingsStore.getState().syncLanguage(user.language);
      set({ user, loading: false });
    } catch {
      get().logout();
      set({ loading: false });
    }
  },

  updateLanguage: async (languageName) => {
    try {
      const { data } = await axios.patch(`${API}/api/auth/profile`, { language: languageName });
      const updatedUser = data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      const lng = getI18nLang(languageName);
      i18n.changeLanguage(lng);
      localStorage.setItem("agri_ui_lang", lng);
      useSettingsStore.getState().syncLanguage(languageName);
      set({ user: updatedUser });
    } catch (err) {
      console.error("[useAuthStore] updateLanguage failed:", err.message);
    }
  },
}));

export default useAuthStore;
