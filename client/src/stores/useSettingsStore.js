import { create } from "zustand";
import i18n, { getI18nLang } from "../i18n/index.js";

const _getProfileLang = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}").language || "English"; }
  catch { return "English"; }
};

const useSettingsStore = create((set) => ({
  notificationsEnabled: localStorage.getItem("agri_notifs") !== "false",
  soundEnabled:         localStorage.getItem("agri_sound") !== "false",
  language:             _getProfileLang(),

  setNotifications: (val) => {
    localStorage.setItem("agri_notifs", String(val));
    set({ notificationsEnabled: val });
  },
  setSound: (val) => {
    localStorage.setItem("agri_sound", String(val));
    set({ soundEnabled: val });
  },
  // Instantly updates i18n UI language without backend call.
  // Call useAuthStore.updateLanguage() separately to persist to backend.
  setLanguage: (lang) => {
    const lng = getI18nLang(lang);
    i18n.changeLanguage(lng);
    localStorage.setItem("agri_ui_lang", lng);
    set({ language: lang });
  },
  // Sync language from auth store after login/fetchMe
  syncLanguage: (lang) => {
    set({ language: lang || "English" });
  },
}));

export default useSettingsStore;
