import { useThemeColors } from '@/hooks/useThemeColors';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Loader from './Loader';
import PromptInput from './PromptInput';
import PromptOutput from './PromptOutput';

// Temporary ContentView placeholder. You can replace this with your actual chat/content UI.
export default function ContentView({ 
  items: _items, 
  onSend, 
  selectedChat, 
  isLoading: parentIsLoading, 
  onLoadingComplete 
}: { 
  items: { id: string; text: string; time?: string }[]; 
  onSend: (text: string) => Promise<void>; 
  selectedChat?: { id: string; text: string; time?: string };
  isLoading: boolean;
  onLoadingComplete: () => void;
}) {
  const insets = useSafeAreaInsets();
  const kbTranslateY = useRef(new Animated.Value(0)).current;
  const [kbHeight, setKbHeight] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colors = useThemeColors();

  // Update local loading state when parent loading state changes
  useEffect(() => {
    if (parentIsLoading) {
      setShowLoader(true);
      setIsLoading(true);
    } else {
      setShowLoader(false);
      setIsLoading(false);
    }
  }, [parentIsLoading]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      const h = e?.endCoordinates?.height ?? 0;
      setKbHeight(h);
      Animated.timing(kbTranslateY, {
        toValue: -h,
        duration: e?.duration ?? 250,
        useNativeDriver: true,
      }).start();
    };

    const onHide = (e: any) => {
      setKbHeight(0);
      Animated.timing(kbTranslateY, {
        toValue: 0,
        duration: e?.duration ?? 200,
        useNativeDriver: true,
      }).start();
    };

    const subShow = Keyboard.addListener(showEvent as any, onShow);
    const subHide = Keyboard.addListener(hideEvent as any, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [kbTranslateY]);

  const handleSendMessage = async (text: string) => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    setPendingTopic(text);
    setShowLoader(true);
    setIsLoading(true);
    
    try {
      console.log('📤 Sending message:', text);
      await onSend(text);
      console.log('✅ Message sent successfully, navigation should happen');
      // The navigation will be handled by the homepage component after API success
      // Don't close the loader here - let the homepage handle it
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Show error or fallback behavior
      setShowLoader(false);
      setIsLoading(false);
      onLoadingComplete();
    }
  };

  // Items are managed by the parent (homepage) so they can also feed the HistoryDrawer.

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
        {/* Show selected chat if present */}
        {selectedChat ? (
          <View style={{ backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18 }}>Chat</Text>
            <Text style={{ color: colors.text, marginTop: 8 }}>{selectedChat.text}</Text>
            {selectedChat.time ? (
              <Text style={{ color: colors.primary, marginTop: 6, fontSize: 12 }}>{selectedChat.time}</Text>
            ) : null}
          </View>
        ) : (
          <View style={{ marginTop: 8 }}>
            <PromptOutput />
          </View>
        )}
      </ScrollView>

      {/* Prompt Input docked at bottom above safe area and lifted with keyboard */}
      <Animated.View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 + insets.bottom, transform: [{ translateY: kbTranslateY }] }}>
        <PromptInput
          onSend={handleSendMessage}
          disabled={isLoading}
        />
      </Animated.View>

      {/* Show loader when sending message - keep it active until API completes */}
      {showLoader && (
        <Loader
          onDone={() => {
            // This should not be called during normal operation
            console.log('⚠️ Loader onDone called - this should not happen during normal flow');
            setShowLoader(false);
            setIsLoading(false);
          }}
        />
      )}
    </View>
  );
}
