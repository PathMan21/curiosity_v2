import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  // === États ===
  const [fontSize, setFontSize] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("accessibility") || "{}");
    return saved.fontSize || "normal-class";
  });

  const [cursor, setCursor] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("accessibility") || "{}");
    return saved.cursorSize || false;
  });

  const [dark, setDark] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("accessibility") || "{}");
    return saved.dark || false;
  });

  const [highContrast, setHighContrast] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("accessibility") || "{}");
    return saved.highContrast || false;
  });

  // === Application des styles ===
  useEffect(() => {
    const body = document.body;
    body.classList.remove("normal-class", "medium-class", "large-class");
    body.classList.add(fontSize);

    cursor ? body.classList.add("big-cursor") : body.classList.remove("big-cursor");
    dark ? body.classList.add("dark-mode") : body.classList.remove("dark-mode");
    highContrast ? body.classList.add("high-contrast") : body.classList.remove("high-contrast");

    localStorage.setItem(
      "accessibility",
      JSON.stringify({ fontSize, cursorSize: cursor, dark, highContrast })
    );
  }, [fontSize, cursor, dark, highContrast]);

  return (
    <ThemeContext.Provider
      value={{ fontSize, cursor, dark, highContrast, setFontSize, setCursor, setDark, setHighContrast }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) console.warn("ThemeContext non initialisé");
  return context;
};