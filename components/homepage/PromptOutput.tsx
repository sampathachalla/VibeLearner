import { Text, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function PromptOutput({ text }: { text?: string | null }) {
  const colors = useThemeColors();
  
  return (
    <View style={{ 
      backgroundColor: colors.card, 
      borderRadius: 12, 
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border
    }}>
      {text ? (
        <Text style={{ color: colors.text }}>{text}</Text>
      ) : (
        <>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Start a new chat</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
            Ask questions, brainstorm ideas, or get help with your learning.
          </Text>
        </>
      )}
    </View>
  );
}
