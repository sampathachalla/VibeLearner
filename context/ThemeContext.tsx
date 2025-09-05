// context/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

const THEME_STORAGE_KEY = 'user_theme_preference';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from storage or system preference
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Try to get saved theme preference
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeState(savedTheme);
        } else {
          // Fall back to system preference
          const systemTheme = systemColorScheme || 'light';
          setThemeState(systemTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        // Fall back to system preference
        const systemTheme = systemColorScheme || 'light';
        setThemeState(systemTheme);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeTheme();
  }, [systemColorScheme]);

  // Update theme when system preference changes (if user hasn't set a custom preference)
  useEffect(() => {
    if (!isInitialized) return;

    const checkSystemTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        // Only update if user hasn't set a custom preference
        if (!savedTheme && systemColorScheme) {
          setThemeState(systemColorScheme);
        }
      } catch (error) {
        console.error('Failed to check system theme:', error);
      }
    };

    checkSystemTheme();
  }, [systemColorScheme, isInitialized]);

  const setTheme = async (newTheme: Theme) => {
    try {
      console.log('🎨 ThemeContext: Setting theme to:', newTheme);
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      console.log('✅ ThemeContext: Theme saved to AsyncStorage');
    } catch (error) {
      console.error('❌ ThemeContext: Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('🔄 ThemeContext: Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  const value: ThemeContextProps = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Keep the old export for backward compatibility
export const useThemeContext = useTheme;