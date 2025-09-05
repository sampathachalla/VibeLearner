import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { cybersecurityNotes } from './notesData';

function SectionTitle({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();
  return <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 22, marginTop: 24, marginBottom: 8 }}>{children}</Text>;
}
function SubTitle({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();
  return <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 17, marginTop: 16 }}>{children}</Text>;
}
function Chip({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();
  return <Text style={{ backgroundColor: colors.surfaceVariant, color: colors.primary, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, fontSize: 13, marginRight: 6 }}>{children}</Text>;
}
function Term({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();
  return <Text style={{ backgroundColor: colors.card, color: colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, fontSize: 13, marginRight: 6 }}>{children}</Text>;
}

export default function NotesView({ topic, apiData }: { topic?: string; apiData?: any }) {
  const [notes, setNotes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

    // Load notes data from Firestore or API response
    const loadNotes = async () => {
      try {
        setLoading(true);
        setError(null);

        // If we have a courseId, fetch from Firestore
        if (courseId && user?.uid) {
          console.log('🔄 Fetching notes from Firestore for courseId:', courseId);
          const courseRef = doc(db, 'users', user.uid, 'courses', courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (courseDoc.exists()) {
            const data = courseDoc.data();
            console.log('✅ Course data fetched for notes:', data);
            
            // Use course_outline from Firestore
            if (data.course_outline) {
              setNotes(data.course_outline);
              return;
            }
          } else {
            console.log('❌ Course not found in Firestore:', courseId);
          }
        }
        
        // Check if we have API data for this topic
        if (apiData && apiData.topic === topic && apiData.course_outline_json) {
          console.log('📝 Using API data for notes');
          const notesData = apiData.course_outline_json;
          setNotes(notesData);
        } else {
          // Use cybersecurity notes as fallback
          console.log('📝 Using fallback notes data');
          setNotes(cybersecurityNotes);
        }
      } catch (err) {
        console.error('Error loading notes:', err);
        setError('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [topic, courseId, user?.uid, apiData]);

  // Add fallback data structure if modules is missing
  const safeNotes = useMemo(() => {
    if (!notes) return null;
    
    
    // Ensure we have a valid structure
    const fallbackNotes = {
      title: 'Course Content',
      estimated_duration: '15-30 minutes',
      learning_objectives: [],
      introduction: 'This course provides comprehensive learning materials.',
      modules: []
    };
    
    return {
      ...fallbackNotes,
      ...notes,
      modules: Array.isArray(notes.modules) ? notes.modules : []
    };
  }, [notes]);

  if (loading) {
    return (
      <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Loading notes...</Text>
      </View>
    );
  }
  if (error || !safeNotes) {
    return (
      <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Notes</Text>
        <Text style={{ color: colors.error, marginTop: 8 }}>{error || 'No notes found.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background, padding: 18 }}>
      {/* Cover Section */}
      <View style={{ marginBottom: 18, paddingTop: 18 }}>
        <Text style={{ fontSize: 32, fontWeight: '700', color: colors.text, marginBottom: 6 }}>{safeNotes.title || 'Untitled Course'}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 8 }}>
          Estimated Duration: {safeNotes.estimated_duration}
        </Text>
        <Text style={{ color: colors.textTertiary, fontSize: 13, marginBottom: 8 }}>Generated: {new Date().toISOString().slice(0, 10)}</Text>
      </View>
      {/* Learning Objectives */}
      <SubTitle>Learning Objectives</SubTitle>
      <View style={{ marginBottom: 10 }}>
        {Array.isArray(safeNotes.learning_objectives) && safeNotes.learning_objectives.map((item: string, idx: number) => (
          <Text key={idx} style={{ color: colors.textSecondary, marginLeft: 8, fontSize: 15 }}>• {item}</Text>
        ))}
      </View>
      {/* Table of Contents */}
      <SectionTitle>Contents</SectionTitle>
      <View style={{ backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 18 }}>
        {safeNotes.modules.map((mod: any, idx: number) => (
          <Text key={idx} style={{ color: colors.primary, fontWeight: '600', fontSize: 15, marginBottom: 2 }}>
            {`Chapter ${idx + 1}: ${mod.module_title}`}
          </Text>
        ))}
      </View>
      {/* Introduction */}
      <SectionTitle>Introduction</SectionTitle>
      <Text style={{ color: colors.text, fontSize: 16, marginBottom: 10, lineHeight: 24 }}>{safeNotes.introduction}</Text>
      {/* Modules */}
      {safeNotes.modules.map((mod: any, idx: number) => (
        <View key={idx} style={{ marginBottom: 28, paddingTop: 10, borderTopWidth: idx > 0 ? 2 : 0, borderTopColor: colors.border }}>
          <SectionTitle>{`Chapter ${idx + 1}: ${mod.module_title}`}</SectionTitle>
          {/* Estimated time */}
          {mod.estimated_time && (
            <Text style={{ color: colors.textTertiary, fontSize: 13, marginBottom: 4 }}>Estimated Time: {mod.estimated_time}</Text>
          )}
          {/* Learning outcomes */}
          {Array.isArray(mod.module_learning_outcomes) && mod.module_learning_outcomes.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <SubTitle>Learning Outcomes</SubTitle>
              <View style={{ marginLeft: 8 }}>
                {mod.module_learning_outcomes.map((out: string, i: number) => (
                  <Text key={i} style={{ color: colors.textSecondary, fontSize: 15 }}>• {out}</Text>
                ))}
              </View>
            </View>
          )}
          {/* Keywords */}
          {Array.isArray(mod.keywords) && mod.keywords.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              <SubTitle>Keywords</SubTitle>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 8 }}>
                {mod.keywords.map((kw: string, i: number) => (
                  <Term key={i}>{kw}</Term>
                ))}
              </View>
            </View>
          )}
          {/* Core concepts */}
          {Array.isArray(mod.core_concepts) && mod.core_concepts.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <SubTitle>Core Concepts</SubTitle>
              {mod.core_concepts.map((concept: any, i: number) => (
                <View key={i} style={{ backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 10 }}>
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>{concept.concept}</Text>
                  <Text style={{ color: colors.text, marginTop: 4, lineHeight: 20 }}>{concept.explanation}</Text>
                </View>
              ))}
            </View>
          )}
          {/* Summary points */}
          {Array.isArray(mod.summary_points) && mod.summary_points.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <SubTitle>Summary Points</SubTitle>
              <View style={{ marginLeft: 8 }}>
                {mod.summary_points.map((pt: string, i: number) => (
                  <Text key={i} style={{ color: '#B0B3B8', fontSize: 15 }}>• {pt}</Text>
                ))}
              </View>
            </View>
          )}
          {/* Check your understanding */}
          {Array.isArray(mod.quiz_qa) && mod.quiz_qa.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <SubTitle>Check your understanding</SubTitle>
              {mod.quiz_qa.map((qa: any, i: number) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center', fontSize: 16 }}>Q: {qa.question}</Text>
                  {/* If options exist, display them full width and centered */}
                  {Array.isArray(qa.options) && qa.options.length > 0 && (
                    <View style={{ marginTop: 6, marginBottom: 6, alignItems: 'center' }}>
                      {qa.options.map((opt: string, idx: number) => (
                        <Text key={idx} style={{ backgroundColor: '#23263A', color: '#7F8CFF', borderRadius: 8, padding: 10, marginVertical: 4, textAlign: 'center', width: '90%', fontSize: 15 }}>
                          {opt}
                        </Text>
                      ))}
                    </View>
                  )}
                  <Text style={{ color: '#B0B3B8', marginLeft: 8, textAlign: 'center' }}>A: {qa.answer}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
