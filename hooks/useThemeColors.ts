import { darkTheme, lightTheme } from '@/constants/Theme';
import { useTheme } from '@/context/ThemeContext';

export const useThemeColors = () => {
  const { isDark } = useTheme();
  return isDark ? darkTheme : lightTheme;
};
