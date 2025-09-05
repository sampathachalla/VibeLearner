import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

type QuizNavProps = {
  active: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function QuizNav({ active, total, onPrev, onNext }: QuizNavProps) {
  const colors = useThemeColors();
  
  return (
    <View style={styles.navRow}>
      <Pressable onPress={onPrev} style={[styles.navBtn, { backgroundColor: colors.card }]}>
        <Text style={[styles.navText, { color: colors.primary }]}>{'<'}</Text>
      </Pressable>
      <Text style={[styles.counter, { color: colors.textSecondary }]}>{active + 1} / {total}</Text>
      <Pressable onPress={onNext} style={[styles.navBtn, { backgroundColor: colors.card }]}>
        <Text style={[styles.navText, { color: colors.primary }]}>{'>'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 16 },
  navBtn: { backgroundColor: '#23263A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  navText: { color: '#7F8CFF', fontWeight: '700', fontSize: 18 },
  counter: { color: '#8A8FA0', fontWeight: '600', fontSize: 15 },
});
