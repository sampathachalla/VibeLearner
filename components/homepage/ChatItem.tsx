import { Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function ChatItem({ 
  text, 
  time, 
  onDelete, 
  isApiResponse 
}: { 
  text: string; 
  time?: string; 
  onDelete?: () => void;
  isApiResponse?: boolean;
}) {
  const colors = useThemeColors();
  
  return (
    <View style={{ 
      backgroundColor: isApiResponse ? colors.info : colors.surface, 
      borderRadius: 10, 
      padding: 14, 
      position: 'relative',
      borderLeftWidth: isApiResponse ? 4 : 0,
      borderLeftColor: isApiResponse ? colors.primary : 'transparent'
    }}>
      <Text style={{ color: colors.text }}>{text}</Text>
      {time ? (
        <Text style={{ color: isApiResponse ? colors.textSecondary : colors.primary, marginTop: 6, fontSize: 12 }}>
          {isApiResponse ? 'AI Response' : time}
        </Text>
      ) : null}
      {onDelete && (
        <TouchableOpacity
          style={{ position: 'absolute', top: 8, right: 8, backgroundColor: colors.error, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}
          onPress={onDelete}
        >
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
