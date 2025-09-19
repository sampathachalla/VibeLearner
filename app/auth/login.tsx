import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Image,
    Keyboard,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';

// ✅ Smooth continuous typewriter effect
type TypewriterTextProps = {
  text: string;
  speed?: number;
  style?: any;
};

function TypewriterText({ text, speed = 100, style }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const loop = () => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i));
        i++;
        if (i > text.length) {
          i = 0;
        }
      }, speed);
      return interval;
    };

    const interval = loop();
    return () => clearInterval(interval);
  }, [text, speed]);

  return <Text style={style}>{displayedText}</Text>;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const colors = useThemeColors();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const router = useRouter();
  const { signIn } = useAuth();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<any>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setError('');
      if (params.fromSignup === 'true') {
        setShowSignupSuccess(true);
        setTimeout(() => setShowSignupSuccess(false), 3000);
      } else {
        setShowSignupSuccess(false);
      }
    }, [params.fromSignup])
  );

  // Handle keyboard height dynamically
  useEffect(() => {
    const keyboardDidShow = (event: any) => {
      setKeyboardHeight(event.endCoordinates.height);
    };
    const keyboardDidHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Scroll to focused input
  const handleInputFocus = (ref: React.RefObject<TextInput | null>) => {
    if (scrollViewRef.current && ref.current) {
      ref.current.measureLayout(
        scrollViewRef.current.getScrollResponder().getInnerViewNode(),
        (x: number, y: number) => {
          scrollViewRef.current.getScrollResponder().scrollTo({ y: y - 20, animated: true });
        },
        () => {}
      );
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const entered = email.trim().toLowerCase();
      const isDemo = (entered === 'sam@example.com' || entered === 'sampath') && password === 'sam2001';

      if (isDemo) {
        const user = {
          id: 'demo-user',
          username: 'sam',
          email: entered,
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        router.replace('/(tabs)/homepage');
        return;
      }

      await signIn(email.trim(), password);
      router.replace('/(tabs)/homepage');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          paddingBottom: keyboardHeight + 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 0 : 100}
      >
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 40 }}>
          <Image
            source={require('../../assets/VibeLearnerIcon.png')}
            style={{
              width: 80,
              height: 80,
              marginBottom: 16,
              borderRadius: 16,
            }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.text }}>VibeLearner</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginTop: 6 }}>
            Welcome Back
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            Sign in to continue your learning journey
          </Text>
        </View>

        <View>
          {showSignupSuccess && (
            <View style={{ backgroundColor: colors.success, borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.background, fontSize: 14, textAlign: 'center' }}>
                Account created successfully! Please sign in with your credentials.
              </Text>
            </View>
          )}
          <Text style={{ color: colors.text, fontSize: 14, marginBottom: 8 }}>Email Address</Text>
          <TextInput
            ref={emailRef}
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              borderRadius: 10,
              padding: 14,
              marginBottom: 14,
              fontSize: 16,
            }}
            placeholder="Enter your email"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            onFocus={() => handleInputFocus(emailRef)}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <Text style={{ color: colors.text, fontSize: 14, marginBottom: 8 }}>Password</Text>
          <TextInput
            ref={passwordRef}
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              borderRadius: 10,
              padding: 14,
              marginBottom: 8,
              fontSize: 16,
            }}
            placeholder="Enter your password"
            placeholderTextColor={colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onFocus={() => handleInputFocus(passwordRef)}
            onSubmitEditing={handleLogin}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Remember me</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={{ color: colors.primary, fontSize: 12 }}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          {error ? (
            <View style={{ backgroundColor: colors.error, borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.background, fontSize: 14, textAlign: 'center' }}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={{
              backgroundColor: loading ? colors.surfaceVariant : colors.primary,
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 16,
              opacity: loading ? 0.7 : 1,
            }}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={{ color: colors.background, fontSize: 16, fontWeight: 'bold' }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: colors.textTertiary, fontSize: 14 }}>
              Don't have an account?{' '}
              <Text style={{ color: colors.primary }} onPress={() => router.push('/auth/signup')}>
                Sign up here
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}