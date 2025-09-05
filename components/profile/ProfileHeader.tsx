import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function ProfileHeader() {
  const colors = useThemeColors();
  
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.primary }]}>User Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 6, // Reduced from 18 to 6
  },
  title: {
    fontWeight: '700',
    fontSize: 28,
    fontFamily: 'Montserrat',
  },
});
