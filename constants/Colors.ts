/**
 * TikTok/Duolingo-inspired color system for VibeLearner app.
 * These colors complement the main theme system defined in Theme.ts
 */

const tintColorLight = '#00B8B0'; // Cyan for light mode
const tintColorDark = '#00F2EA';  // Neon cyan for dark mode

export const Colors = {
  light: {
    text: '#121212',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#4F4F4F',
    tabIconDefault: '#A0A0A0',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    tint: tintColorDark,
    icon: '#B3B3B3',
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
  },
};
