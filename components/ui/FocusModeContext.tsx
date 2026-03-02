"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface FocusModeContextType {
  isFocused: boolean;
  toggle: () => void;
  exit: () => void;
}

const FocusModeContext = createContext<FocusModeContextType>({
  isFocused: false,
  toggle: () => {},
  exit: () => {},
});

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [isFocused, setIsFocused] = useState(false);

  const exit = useCallback(() => setIsFocused(false), []);
  const toggle = useCallback(() => setIsFocused((v) => !v), []);

  // Escape key to exit focus mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocused) exit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFocused, exit]);

  return (
    <FocusModeContext.Provider value={{ isFocused, toggle, exit }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  return useContext(FocusModeContext);
}
