import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function Header({ onOpenHistory }: { onOpenHistory?: () => void }) {
  const { isDark, toggleTheme } = useTheme();
  const colors = useThemeColors();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, minHeight: 40 }}>
      {/* Left: Hamburger for chat history */}
      <TouchableOpacity onPress={onOpenHistory} accessibilityRole="button" accessibilityLabel="Open chat history">
        <Ionicons name="menu-outline" size={26} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Center: App logo/name */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="sparkles" size={22} color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginLeft: 8 }}>VibeLearner</Text>
        </View>
      </View>

      {/* Right: Theme Toggle Button */}
      <TouchableOpacity 
        onPress={() => {
          console.log('🎨 Header: Theme toggle button pressed');
          console.log('🎨 Header: Current isDark:', isDark);
          toggleTheme();
        }}
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Ionicons
          name={isDark ? 'sunny' : 'moon'}
          size={20}
          color={isDark ? colors.gold : colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}
