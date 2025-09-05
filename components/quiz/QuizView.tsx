import { useAuth } from '@/context/AuthContext';
import { db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import QuizCard from './QuizCard';
import QuizNav from './QuizNav';
import { cybersecurityQuiz } from './quizdata';
import { useThemeColors } from '@/hooks/useThemeColors';

type QuizItem = {
  id: number;
  question: string;
  options: string[];
  answer: string;
  rationale: string;
};

export default function QuizView({ topic, apiData }: { topic?: string; apiData?: any }) {
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<number>(0);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const fetchingRef = useRef(false);
  const { user } = useAuth();
  const colors = useThemeColors();

  // Extract courseId from apiData if available
  const courseId = apiData?.courseId || null;

  useEffect(() => {
    if (!topic) {
      setLoading(false);
      return;
    }

    // Prevent duplicate API calls
    if (fetchingRef.current) {
      return;
    }

    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // If we have a courseId, fetch from Firestore
        if (courseId && user?.uid) {
          const courseRef = doc(db, 'users', user.uid, 'courses', courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (courseDoc.exists()) {
            const data = courseDoc.data();
            
            // Use quiz data from Firestore
            if (data.quiz && Array.isArray(data.quiz)) {
              setQuiz(data.quiz);
              return;
            }
          } else {
            console.log('❌ Course not found in Firestore:', courseId);
          }
        }

        // Check if we have API data for this topic
        if (apiData && apiData.topic === topic && apiData.quiz_json) {
          const quizData = Array.isArray(apiData.quiz_json) ? apiData.quiz_json : [];
          setQuiz(quizData);
        } else {
          // Use cybersecurity quiz as fallback
          setQuiz(cybersecurityQuiz);
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [topic, courseId, user?.uid, apiData]);

  const current = quiz[active];
  const isMCQ = true; // All questions are MCQ format
  const isShort = false;

  const handleOption = (opt: string) => {
    setSelected(opt);
    setRevealed(true);
  };

  const next = () => {
    // Check if answer is correct and update score
    if (selected === current?.answer) {
      setScore(score + 1);
    }
    
    const nextIndex = active + 1;
    if (nextIndex >= quiz.length) {
      // Quiz completed
      setShowResults(true);
    } else {
      setActive(nextIndex);
      setRevealed(false);
      setSelected(null);
    }
  };
  const prev = () => {
    setActive((a) => (a - 1 + quiz.length) % quiz.length);
    setRevealed(false);
    setSelected(null);
  };

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loading, { color: colors.textSecondary }]}>Loading quiz…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.error, { color: colors.error }]}>Error</Text>
        <Text style={[styles.loading, { color: colors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  if (!quiz.length) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.loading, { color: colors.textSecondary }]}>No quiz available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <QuizNav active={active} total={quiz.length} onPrev={prev} onNext={next} />
      <QuizCard current={current} revealed={revealed} selected={selected} handleOption={handleOption} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 16 },
  navBtn: { backgroundColor: '#23263A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  navText: { color: '#7F8CFF', fontWeight: '700', fontSize: 18 },
  counter: { color: '#8A8FA0', fontWeight: '600', fontSize: 15 },
  card: { backgroundColor: '#23263A', borderRadius: 16, padding: 22, minWidth: 320, maxWidth: 440, width: '92%', alignItems: 'flex-start', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  module: { color: '#7F8CFF', fontWeight: '700', fontSize: 15, marginBottom: 8 },
  question: { color: 'white', fontWeight: '700', fontSize: 19, marginBottom: 6 },
  option: { backgroundColor: '#181A20', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 10 },
  optionText: { color: 'white', fontSize: 16 },
  optionSelected: { borderWidth: 2, borderColor: '#7F8CFF' },
  optionCorrect: { backgroundColor: '#2d3042' },
  shortLabel: { color: '#8A8FA0', fontWeight: '600', marginBottom: 4 },
  shortAnswer: { color: 'white', fontSize: 16, fontWeight: '500' },
  rationaleLabel: { color: '#8A8FA0', fontWeight: '600', marginBottom: 2 },
  rationale: { color: '#B0B3B8', fontSize: 15 },
  loading: { color: '#8A8FA0', marginTop: 8 },
  error: { color: '#FF7F7F', fontWeight: '700' },
});
