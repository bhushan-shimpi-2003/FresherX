import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme } from './dark';
import { lightTheme } from './light';

export type Theme = typeof darkTheme | typeof lightTheme;
export { darkTheme, lightTheme };

export const ThemeContext = createContext<Theme>(darkTheme as Theme);

export function ThemeProvider({ children, override }: { children: ReactNode; override?: 'dark' | 'light' | null }) {
  const systemScheme = useColorScheme();
  const scheme = override ?? systemScheme ?? 'dark';
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}


export function useTheme() {
  return useContext(ThemeContext);
}
