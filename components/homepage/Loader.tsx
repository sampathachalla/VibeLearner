import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

const steps = [
  { key: 'notes', label: 'Creating notes', icon: 'document-text-outline' as const },
  { key: 'quiz', label: 'Generating quiz', icon: 'help-circle-outline' as const },
  { key: 'flash', label: 'Building flashcards', icon: 'flash-outline' as const },
];

export default function Loader({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const colors = useThemeColors();

  useEffect(() => {
    let mounted = true;
    
    // Animate progress bar continuously until manually stopped
    const animateProgress = () => {
      if (!mounted) return;
      
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        if (mounted) {
          // Reset progress and continue animating
          progress.setValue(0);
          animateProgress();
        }
      });
    };

    // Start the continuous animation
    animateProgress();

    // Step ticker that cycles through steps
    const stepInterval = setInterval(() => {
      if (mounted) {
        setStep((prevStep) => (prevStep + 1) % steps.length);
      }
    }, 2000); // Change step every 2 seconds

    return () => {
      mounted = false;
      clearInterval(stepInterval);
    };
  }, [progress]);

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <View style={{ width: '100%', maxWidth: 420, backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        {steps.map((s, i) => (
          <View key={s.key} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
            <Ionicons name={s.icon} size={20} color={i === step ? colors.primary : colors.textTertiary} />
            <Text style={{ color: i === step ? colors.text : colors.textSecondary, marginLeft: 10 }}>{s.label}</Text>
          </View>
        ))}
        <View style={{ height: 8, backgroundColor: colors.surfaceVariant, borderRadius: 6, overflow: 'hidden', marginTop: 12 }}>
          <Animated.View style={{ height: 8, width: widthInterpolate as any, backgroundColor: colors.primary }} />
        </View>
      </View>
    </View>
  );
}
