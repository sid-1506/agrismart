import { createContext, useContext, useState, useEffect } from "react";

export const THEMES = {
  "earth-harvest": {
    id: "earth-harvest", name: "Earth & Harvest", mode: "light", tag: "Original",
    desc: "Warm cream & deep forest green — the classic AgriSmart look.",
    preview: { bg:"#F7F3ED", sidebar:"#1A4731", accent:"#C8973A", card:"#FFFFFF", text:"#1A4731" },
    vars: {
      "--bg":"#F7F3ED","--bg-secondary":"#EDE8E0","--surface":"#E2DDD5","--card":"#FFFFFF",
      "--sidebar":"#1A4731","--sidebar-dark":"#0D2A1F","--sidebar-text":"#F7F3ED",
      "--primary":"#1A4731","--primary-hover":"#2E6B49",
      "--accent":"#C8973A","--accent-light":"#E8D5B4",
      "--text":"#1A1A16","--text-muted":"#4A5E50","--text-light":"#7A9080",
      "--border":"#E0D8CC","--border-light":"#EDE8E0",
      "--input-bg":"#F7F3ED","--topbar-bg":"#FFFFFF",
      "--shadow":"rgba(26,71,49,0.10)","--shadow-hover":"rgba(26,71,49,0.18)",
      "--nav-active-bg":"rgba(200,151,58,0.18)","--nav-active-c":"#C8973A",
    },
  },

  "morning-meadow": {
    id: "morning-meadow", name: "Morning Meadow", mode: "light", tag: "Fresh",
    desc: "Soft sage green & ivory — light, airy and easy on the eyes.",
    preview: { bg:"#F0F7EE", sidebar:"#2B5219", accent:"#74A832", card:"#FFFFFF", text:"#2B5219" },
    vars: {
      "--bg":"#F0F7EE","--bg-secondary":"#E4F0E0","--surface":"#D4E8CC","--card":"#FFFFFF",
      "--sidebar":"#2B5219","--sidebar-dark":"#182E0E","--sidebar-text":"#F0F7EE",
      "--primary":"#2B5219","--primary-hover":"#3A6E22",
      "--accent":"#74A832","--accent-light":"#C2DFA0",
      "--text":"#182810","--text-muted":"#3A5A2C","--text-light":"#688055",
      "--border":"#C0D8A8","--border-light":"#D8ECC8",
      "--input-bg":"#F0F7EE","--topbar-bg":"#FFFFFF",
      "--shadow":"rgba(43,82,25,0.10)","--shadow-hover":"rgba(43,82,25,0.18)",
      "--nav-active-bg":"rgba(116,168,50,0.18)","--nav-active-c":"#74A832",
    },
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    const saved = localStorage.getItem("agri_theme");
    return saved && THEMES[saved] ? saved : "earth-harvest";
  });

  const theme = THEMES[themeId] || THEMES["earth-harvest"];

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute("data-theme", theme.mode);
    localStorage.setItem("agri_theme", themeId);
  }, [themeId, theme]);

  const setTheme = (id) => { if (THEMES[id]) setThemeId(id); };

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
