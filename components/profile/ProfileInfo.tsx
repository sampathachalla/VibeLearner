import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export type UserProfile = {
  username: string;
  email: string;
  password: string;
  chatCount: number;
};

type Props = {
  user: UserProfile;
  onSaveUsername?: (next: string) => Promise<void> | void;
  saving?: boolean;
};

export default function ProfileInfo({ user, onSaveUsername, saving }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(user.username || '');
  const colors = useThemeColors();

  const startEdit = () => {
    setDraft(user.username || '');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(user.username || '');
    setIsEditing(false);
  };

  const save = async () => {
    if (!onSaveUsername) {
      setIsEditing(false);
      return;
    }
    await Promise.resolve(onSaveUsername(draft.trim()));
    setIsEditing(false);
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2
    }]}> 
      <Text style={[styles.heading, { color: colors.primary }]}>Profile Information</Text>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Username:</Text>
      {isEditing ? (
        <View style={{ gap: 8 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Enter username"
            placeholderTextColor="#888"
            style={{ backgroundColor: colors.surface, color: colors.text, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'Nunito' }}
            editable={!saving}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={save} disabled={!!saving} style={{ backgroundColor: saving ? colors.surfaceVariant : colors.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 }}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: 'white', fontWeight: '700', fontFamily: 'Nunito' }}>Save</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelEdit} disabled={!!saving} style={{ backgroundColor: colors.surfaceVariant, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontFamily: 'Nunito' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.value, { color: colors.text }]}>{user.username}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit username" onPress={startEdit} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <Text style={[styles.label, { color: colors.textSecondary }]}>Email:</Text>
      <Text style={[styles.value, { color: colors.text }]}>{user.email}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Password:</Text>
      <Text style={[styles.value, { color: colors.text }]}>{user.password}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Chats:</Text>
      <Text style={[styles.value, { color: colors.text }]}>{user.chatCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 18,
    margin: 16,
  },
  heading: {
    fontWeight: '800',
    fontSize: 22,
    marginBottom: 12,
    fontFamily: 'Montserrat',
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    marginTop: 8,
    fontFamily: 'Nunito',
  },
  value: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Nunito',
  },
});
