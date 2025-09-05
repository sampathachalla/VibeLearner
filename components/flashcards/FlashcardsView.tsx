import { useAuth } from '@/context/AuthContext';
import { db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import FlashcardCarousel from './FlashcardCarousel';
import { cybersecurityFlashcards } from './flascarddata';
import { useThemeColors } from '@/hooks/useThemeColors';

type Card = { 
  module_title?: string; 
  term: string; 
  definition: string; 
};

export default function FlashcardsView({ topic, apiData }: { topic?: string; apiData?: any }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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

    const loadFlashcards = async () => {
      try {
        setLoading(true);
        setError(null);

        // If we have a courseId, fetch from Firestore
        if (courseId && user?.uid) {
          console.log('🔄 Fetching flashcards from Firestore for courseId:', courseId);
          const courseRef = doc(db, 'users', user.uid, 'courses', courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (courseDoc.exists()) {
            const data = courseDoc.data();
            console.log('✅ Course data fetched for flashcards:', data);
            
            // Use flashcards data from Firestore
            if (data.flashcards && Array.isArray(data.flashcards)) {
              console.log('📝 Using flashcards data from Firestore');
              // Ensure flashcards have the correct structure
              const formattedFlashcards = data.flashcards.map((card: any, index: number) => ({
                module_title: card.module_title || `Module ${index + 1}`,
                term: card.term || card.question || '',
                definition: card.definition || card.answer || ''
              }));
              setCards(formattedFlashcards);
              return;
            }
          } else {
            console.log('❌ Course not found in Firestore:', courseId);
          }
        }

        // Check if we have API data for this topic
        if (apiData && apiData.topic === topic && apiData.flashcards_json) {
          console.log('📝 Using API data for flashcards');
          const flashcardData = Array.isArray(apiData.flashcards_json) ? apiData.flashcards_json : [];
          // Ensure flashcards have the correct structure
          const formattedFlashcards = flashcardData.map((card: any, index: number) => ({
            module_title: card.module_title || `Module ${index + 1}`,
            term: card.term || card.question || '',
            definition: card.definition || card.answer || ''
          }));
          setCards(formattedFlashcards);
        } else {
          // Use cybersecurity flashcards as fallback
          console.log('📝 Using fallback flashcards data');
          setCards(cybersecurityFlashcards);
        }
      } catch (err) {
        console.error('Error loading flashcards:', err);
        setError('Failed to load flashcards');
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, [topic, courseId, user?.uid, apiData]);

  const groups = useMemo(() => {
    const map: Record<string, Card[]> = {};
    if (!Array.isArray(cards)) {

      return map;
    }
    for (const c of cards) {
      if (c && c.module_title) {
        map[c.module_title] = map[c.module_title] || [];
        map[c.module_title].push(c);
      }
    }
    return map;
  }, [cards]);

  if (loading) {
    return (
      <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Loading flashcards…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16 }}>
        <Text style={{ color: colors.error, fontWeight: '700' }}>Error</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', padding: 0, alignItems: 'center', justifyContent: 'center' }}>
      {/* Centered carousel of flip-cards */}
      <View style={{ width: '100%', paddingVertical: 8, alignItems: 'center', justifyContent: 'center' }}>
        {Array.isArray(cards) && cards.length > 0 ? (
          <FlashcardCarousel 
            cards={cards
              .filter(c => c && c.term && c.definition) // Filter out invalid cards
              .map((c) => ({ 
                term: c.term || 'No term', 
                definition: c.definition || 'No definition' 
              }))
            } 
          />
        ) : (
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            {Array.isArray(cards) ? 'No flashcards available.' : 'Loading flashcards...'}
          </Text>
        )}
      </View>
    </View>
  );
}
