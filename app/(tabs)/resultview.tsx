import FlashcardsView from '@/components/flashcards/FlashcardsView';
import NotesView from '@/components/notes/NotesView';
import QuizView from '@/components/quiz/QuizView';
import { db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function ResultPage() {
  const router = useRouter();
  const { topic, courseId } = useLocalSearchParams<{ topic?: string; courseId?: string }>();
  const [active, setActive] = useState<'notes' | 'quiz' | 'flashcards'>('notes');
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const colors = useThemeColors();

  // Debug logging
  console.log('🔍 ResultPage - Navigation params:', { topic, courseId });
  console.log('🔍 ResultPage - User:', user?.uid);

  // Always fetch fresh course data from Firestore when screen loads
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !user?.uid) {
        console.log('❌ Missing courseId or userId:', { courseId, userId: user?.uid });
        setError('Missing course information');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      let retryCount = 0;
      const maxRetries = 5;
      
      const attemptFetch = async (): Promise<boolean> => {
        try {
          console.log(`🔄 Fetching course data for courseId: ${courseId} (attempt ${retryCount + 1})`);
          const courseRef = doc(db, 'users', user.uid, 'courses', courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (courseDoc.exists()) {
            const data = courseDoc.data();
            console.log('✅ Course data fetched successfully:', {
              courseId: data.courseId,
              topic: data.topic,
              quizLength: data.quiz?.length || 0,
              flashcardsLength: data.flashcards?.length || 0,
              courseOutline: !!data.course_outline
            });
            
            // Structure the data to match the expected API format
            const structuredData = {
              topic: data.meta?.topic || data.topic || topic,
              quiz_json: data.quiz || [],
              flashcards_json: data.flashcards || [],
              course_outline_json: data.course_outline || null,
              course_outline_html: data.course_outline_html || '',
              timestamp: data.meta?.generated_at || data.timestamp || Date.now()
            };
            
            console.log('📝 Structured data for components:', {
              topic: structuredData.topic,
              quizLength: structuredData.quiz_json?.length || 0,
              flashcardsLength: structuredData.flashcards_json?.length || 0,
              hasCourseOutline: !!structuredData.course_outline_json
            });
            
            setCourseData(structuredData);
            return true;
          } else {
            console.log(`❌ Course not found: ${courseId} (attempt ${retryCount + 1})`);
            return false;
          }
        } catch (error) {
          console.error(`❌ Failed to fetch course data (attempt ${retryCount + 1}):`, error);
          return false;
        }
      };
      
      // Try to fetch with retries
      while (retryCount < maxRetries) {
        const success = await attemptFetch();
        if (success) {
          break;
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`⏳ Retrying in 2 seconds... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      if (retryCount >= maxRetries) {
        console.error('❌ Failed to fetch course data after all retries');
        setError('Course data not found after multiple attempts');
      }
      
      setLoading(false);
    };

    fetchCourseData();
  }, [courseId, user?.uid]);

  // Show loading while fetching course data
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Loading course data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if course data couldn't be fetched
  if (error || !courseData) {
    console.log('❌ No course data available, showing success message and redirecting');
    
    // Redirect to homepage after a short delay
    setTimeout(() => {
      router.replace('/(tabs)/homepage');
    }, 3000);
    
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 32, alignItems: 'center', maxWidth: 300 }}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" style={{ marginBottom: 16 }} />
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>
              Course Generated Successfully!
            </Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
              Your course has been created and saved. You can find it in the chat history.
            </Text>
            <Text style={{ color: colors.primary, textAlign: 'center', fontSize: 14 }}>
              Redirecting to homepage in 3 seconds...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, padding: 16 }}>
        {topic ? (
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 20, marginBottom: 12 }}>{topic}</Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity onPress={() => setActive('notes')} style={{ backgroundColor: active==='notes' ? colors.primary : colors.card, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActive('quiz')} style={{ backgroundColor: active==='quiz' ? colors.primary : colors.card, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActive('flashcards')} style={{ backgroundColor: active==='flashcards' ? colors.primary : colors.card, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>Flashcards</Text>
          </TouchableOpacity>
        </View>

        {active === 'notes' && <NotesView topic={topic} apiData={{ ...courseData, courseId }} />}
        {active === 'quiz' && <QuizView topic={topic} apiData={{ ...courseData, courseId }} />}
        {active === 'flashcards' && <FlashcardsView topic={topic} apiData={{ ...courseData, courseId }} />}
      </View>
    </SafeAreaView>
  );
}
