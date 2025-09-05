import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useThemeColors';
import QuizOption from './QuizOption';

type QuizItem = {
  id: number;
  question: string;
  options: string[];
  answer: string;
  rationale: string;
};

type QuizCardProps = {
  current: QuizItem;
  revealed: boolean;
  selected: string | null;
  handleOption: (opt: string) => void;
};

export default function QuizCard({ current, revealed, selected, handleOption }: QuizCardProps) {
  const isMCQ = true; // All questions are MCQ format
  const isShort = false;
  const colors = useThemeColors();
  
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.module, { color: colors.primary }]}>Question {current.id}</Text>
      <Text style={[styles.question, { color: colors.text }]}>{current.question}</Text>
      {isMCQ && current.options && current.options.length > 0 && (
        <View style={{ marginTop: 18 }}>
          {current.options.map((opt: string, index: number) => {
            const isCorrect = opt.startsWith(current.answer + '.');
            return (
              <QuizOption
                key={opt}
                opt={opt}
                revealed={revealed}
                isCorrect={isCorrect}
                isSelected={selected === opt}
                onSelect={() => !revealed && handleOption(opt)}
              />
            );
          })}
        </View>
      )}
      {isShort && (
        <View style={{ marginTop: 18 }}>
          <Text style={[styles.shortLabel, { color: colors.textSecondary }]}>Answer:</Text>
          <Text style={[styles.shortAnswer, { color: colors.text }]}>{current.answer}</Text>
        </View>
      )}
      {revealed && isMCQ && (
        <View style={{ marginTop: 16 }}>
          <Text style={[styles.rationaleLabel, { color: colors.textSecondary }]}>Rationale:</Text>
          <Text style={[styles.rationale, { color: colors.textSecondary }]}>{current.rationale}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#23263A', borderRadius: 16, padding: 22, minWidth: 320, maxWidth: 440, width: '92%', alignItems: 'flex-start', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  module: { color: '#7F8CFF', fontWeight: '700', fontSize: 15, marginBottom: 8 },
  question: { color: 'white', fontWeight: '700', fontSize: 19, marginBottom: 6 },
  shortLabel: { color: '#8A8FA0', fontWeight: '600', marginBottom: 4 },
  shortAnswer: { color: 'white', fontSize: 16, fontWeight: '500' },
  rationaleLabel: { color: '#8A8FA0', fontWeight: '600', marginBottom: 2 },
  rationale: { color: '#B0B3B8', fontSize: 15 },
});
