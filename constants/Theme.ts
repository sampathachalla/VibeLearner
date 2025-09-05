export const lightTheme = {
  // Background colors
  background: '#FFFFFF',
  surface: '#F7F7F7',
  surfaceVariant: '#EFEFEF',
  
  // Text colors
  text: '#121212',
  textSecondary: '#4F4F4F',
  textTertiary: '#A0A0A0',
  
  // Accent colors (TikTok/Duolingo inspired)
  primary: '#00B8B0',        // Cyan
  primaryVariant: '#00A8A0', // Darker cyan
  
  secondary: '#E60073',      // Magenta/Pink
  secondaryVariant: '#D6006B', // Darker magenta
  
  // Status colors
  success: '#58CC02',        // Bright Green
  error: '#FF0050',          // Neon Magenta (for errors)
  warning: '#FFC107',        // Gold/Yellow
  info: '#00F2EA',           // Neon Cyan
  
  // Border colors
  border: '#D6D6D6',
  borderVariant: '#E0E0E0',
  
  // Card colors
  card: '#F7F7F7',
  cardVariant: '#EFEFEF',
  
  // Additional accent colors
  neonCyan: '#00F2EA',
  neonMagenta: '#FF0050',
  brightGreen: '#58CC02',
  gold: '#FFC107',
};

export const darkTheme = {
  // Background colors
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2A2A2A',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#666666',
  
  // Accent colors (TikTok/Duolingo inspired)
  primary: '#00F2EA',        // Neon Cyan
  primaryVariant: '#00E2DA', // Darker neon cyan
  
  secondary: '#FF0050',      // Neon Magenta
  secondaryVariant: '#E60048', // Darker neon magenta
  
  // Status colors
  success: '#58CC02',        // Bright Green
  error: '#FF0050',          // Neon Magenta (for errors)
  warning: '#FFD93D',        // Gold/Yellow
  info: '#00F2EA',           // Neon Cyan
  
  // Border colors
  border: '#333333',
  borderVariant: '#2C2C2C',
  
  // Card colors
  card: '#1E1E1E',
  cardVariant: '#2A2A2A',
  
  // Additional accent colors
  neonCyan: '#00F2EA',
  neonMagenta: '#FF0050',
  brightGreen: '#58CC02',
  gold: '#FFD93D',
};

export type ThemeColors = typeof lightTheme;
