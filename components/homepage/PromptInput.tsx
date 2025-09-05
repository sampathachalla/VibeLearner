import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function PromptInput({ 
  onSend, 
  disabled = false 
}: { 
  onSend?: (text: string) => void | Promise<void>; 
  disabled?: boolean;
}) {
  const [text, setText] = useState('');
  const colors = useThemeColors();

  const submit = async () => {
    const t = text.trim();
    if (!t || disabled) return;
    
    try {
      await onSend?.(t);
      setText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <View>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: colors.card, 
        borderRadius: 12, 
        paddingHorizontal: 12, 
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.border
      }}>
        <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message VibeLearner..."
          placeholderTextColor={colors.textTertiary}
          style={{ 
            flex: 1, 
            color: colors.text, 
            paddingHorizontal: 10, 
            paddingVertical: 8 
          }}
          returnKeyType="send"
          onSubmitEditing={submit}
          editable={!disabled}
        />
        <TouchableOpacity 
          onPress={submit} 
          style={{ 
            backgroundColor: disabled ? colors.surfaceVariant : colors.primary, 
            borderRadius: 10, 
            paddingHorizontal: 12, 
            paddingVertical: 8 
          }}
          disabled={disabled}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>Send</Text>
        </TouchableOpacity>
      </View>
      <Text
        style={{
          color: colors.textTertiary,
          fontSize: 12,
          marginTop: 6,
          textAlign: 'center',
        }}
        accessibilityRole="text"
      >
        VibeLearner can make mistakes. Check important info.
      </Text>
    </View>
  );
}
