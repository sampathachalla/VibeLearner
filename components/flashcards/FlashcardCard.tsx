import { useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

export type FlashcardProps = {
  term: string;
  definition: string;
};

export default function FlashcardCard({ term, definition }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const rotate = useRef(new Animated.Value(0)).current; // 0 -> front, 1 -> back
  const scale = useRef(new Animated.Value(1)).current;
  const colors = useThemeColors();

  const frontInterpolate = useMemo(
    () => rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }),
    [rotate]
  );
  const backInterpolate = useMemo(
    () => rotate.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] }),
    [rotate]
  );

  const onToggle = () => {
    const to = flipped ? 0 : 1;
    // tiny tap feedback + flip
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.98, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, damping: 10, stiffness: 120, mass: 0.6, useNativeDriver: true }),
      ]),
      Animated.timing(rotate, { toValue: to, duration: 260, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]).start(() => setFlipped(!flipped));
  };

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Flashcard" onPress={onToggle}>
      <Animated.View style={[
        styles.card, 
        { 
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          transform: [{ perspective: 800 }, { scale }, { rotateY: frontInterpolate }] 
        }
      ]}> 
        <Text style={[styles.term, { color: colors.text }]}>{term}</Text>
        <Text style={[styles.hint, { color: colors.textTertiary }]}>Tap to reveal</Text>
      </Animated.View>
      <Animated.View style={[
        styles.card, 
        styles.cardBack, 
        { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          transform: [{ perspective: 800 }, { scale }, { rotateY: backInterpolate }] 
        }
      ]}> 
        <Text style={[styles.definition, { color: colors.textSecondary }]}>{definition}</Text>
        <Text style={[styles.hint, { color: colors.textTertiary }]}>Tap to flip back</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1d2030',
    borderRadius: 16,
    padding: 22,
    minHeight: 300,
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#23263A',
    borderWidth: 1,
    borderColor: '#2d3042',
  },
  term: { color: 'white', fontSize: 26, fontWeight: '800' },
  definition: { color: '#B0B3B8', fontSize: 18, lineHeight: 24 },
  hint: { color: '#8A8FA0', marginTop: 12, fontSize: 12 },
});
