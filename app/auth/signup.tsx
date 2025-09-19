import { Link, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const colors = useThemeColors();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const router = useRouter();
  const { signUp } = useAuth();
  const scrollViewRef = useRef<any>(null);
  const displayNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

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
          scrollViewRef.current.getScrollResponder().scrollTo({ y: y - 20, animated: true }); // Adjust offset as needed
        },
        () => {}
      );
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await signUp(email.trim(), password, displayName.trim() || undefined);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        router.replace('/auth/login?fromSignup=true');
      }, 2000);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Signup failed. Please try again.');
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
          paddingBottom: keyboardHeight + 20, // Dynamically adjust based on keyboard height
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 0 : 100} // Extra space for Android
      >
        {/* Branding */}
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
            Create Account
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            Sign up to start your learning journey
          </Text>
        </View>

        {/* Form */}
        <View>
          <Text style={{ color: colors.text, fontSize: 14, marginBottom: 8 }}>Display Name</Text>
          <TextInput
            ref={displayNameRef}
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              borderRadius: 10,
              padding: 14,
              marginBottom: 14,
              fontSize: 16,
            }}
            placeholder="Enter your name"
            placeholderTextColor={colors.textTertiary}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            returnKeyType="next"
            onFocus={() => handleInputFocus(displayNameRef)}
            onSubmitEditing={() => emailRef.current?.focus()}
          />
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
            returnKeyType="next"
            onFocus={() => handleInputFocus(passwordRef)}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
          <Text style={{ color: colors.text, fontSize: 14, marginBottom: 8 }}>Confirm Password</Text>
          <TextInput
            ref={confirmPasswordRef}
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              borderRadius: 10,
              padding: 14,
              marginBottom: 12,
              fontSize: 16,
            }}
            placeholder="Confirm your password"
            placeholderTextColor={colors.textTertiary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            returnKeyType="done"
            onFocus={() => handleInputFocus(confirmPasswordRef)}
            onSubmitEditing={handleSignUp}
          />

          {error ? (
            <View style={{ backgroundColor: colors.error, borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.background, fontSize: 14, textAlign: 'center' }}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={{ backgroundColor: colors.success, borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.background, fontSize: 14, textAlign: 'center' }}>{success}</Text>
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
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={{ color: colors.background, fontSize: 16, fontWeight: 'bold' }}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: colors.textTertiary, fontSize: 14 }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: colors.primary }}>
                Sign in here
              </Link>
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}