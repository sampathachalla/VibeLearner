import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

type QuizOptionProps = {
  opt: string;
  revealed: boolean;
  isCorrect: boolean;
  isSelected: boolean;
  onSelect: () => void;
};

export default function QuizOption({ opt, revealed, isCorrect, isSelected, onSelect }: QuizOptionProps) {
  const colors = useThemeColors();
  
  let icon: React.ReactNode = null;
  if (revealed) {
    if (isCorrect) {
      icon = <Ionicons name="checkmark-circle" size={22} color="#4ADE80" style={{ marginLeft: 8 }} />;
    } else if (isSelected && !isCorrect) {
      icon = <Ionicons name="close-circle" size={22} color="#F87171" style={{ marginLeft: 8 }} />;
    }
  }
  return (
    <Pressable
      key={opt}
      onPress={onSelect}
      style={[
        styles.option, 
        { backgroundColor: colors.surface },
        revealed && isCorrect ? { backgroundColor: colors.surfaceVariant } : null, 
        isSelected ? { borderWidth: 2, borderColor: colors.primary } : null
      ]}
      disabled={revealed}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.optionText, { color: colors.text }]}>{opt}</Text>
        {icon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: { backgroundColor: '#181A20', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 10 },
  optionText: { color: 'white', fontSize: 16 },
  optionSelected: { borderWidth: 2, borderColor: '#7F8CFF' },
  optionCorrect: { backgroundColor: '#2d3042' },
});
