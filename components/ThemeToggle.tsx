import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';

interface ThemeToggleProps {
  style?: any;
}

export default function ThemeToggle({ style }: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const colors = useThemeColors();

  const handleToggle = () => {
    console.log('🎨 ThemeToggle: Button pressed, current theme:', theme);
    toggleTheme();
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Current Theme Indicator */}
      <View style={[styles.currentThemeIndicator, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={20}
          color={isDark ? colors.neonCyan : colors.gold}
        />
        <Text style={[styles.currentThemeText, { color: colors.textSecondary }]}>
          Current: {isDark ? 'Dark' : 'Light'} Mode
        </Text>
      </View>
      
      {/* Theme Toggle Button */}
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.primary, borderColor: colors.primaryVariant }]}
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isDark ? 'sunny' : 'moon'}
          size={24}
          color={colors.background}
        />
        <Text style={[styles.text, { color: colors.background }]}>
          Switch to {isDark ? 'Light' : 'Dark'} Mode
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  currentThemeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
  },
  currentThemeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});
