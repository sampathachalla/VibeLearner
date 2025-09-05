import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';

// Load Tailwind styles only on web (for NativeWind)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  require('../global.css');
}

// 🔄 Custom inner layout wrapper to apply dynamic dark mode class
function ThemedLayoutWrapper() {
  const { theme, isDark } = useTheme();
  const colors = useThemeColors();

  const backgroundColor = colors.background;
  const statusBarStyle = isDark ? 'light' : 'dark';

  // Debug theme changes
  console.log('🎨 Layout: Theme changed to:', theme, 'isDark:', isDark, 'backgroundColor:', backgroundColor);

  return (
    <SafeAreaProvider>
      {/* Apply theme-based styling */}
      <View style={{ flex: 1, backgroundColor }}>
        <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top', 'left', 'right']}>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar
            style={Platform.OS === 'android' ? statusBarStyle : 'auto'}
            backgroundColor={Platform.OS === 'android' ? colors.background : undefined}
          />
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

// ✅ Final Export
export default function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemedLayoutWrapper />
      </ThemeProvider>
    </AuthProvider>
  );
}