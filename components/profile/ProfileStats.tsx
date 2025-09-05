import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ProfileStatsProps {
  chatCount: number;
}

export default function ProfileStats({ chatCount }: ProfileStatsProps) {
  const colors = useThemeColors();
  
  return (
    <View style={styles.container}>
      <View style={[styles.stats, { 
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
      }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Total Chats</Text>
        <Text style={[styles.value, { color: colors.primary }]}>{chatCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  stats: {
    backgroundColor: '#23263A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
    minWidth: '48%',
  },
  label: {
    color: '#B0B3B8',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    color: '#7F8CFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
