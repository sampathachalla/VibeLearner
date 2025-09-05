import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo, { UserProfile } from '@/components/profile/ProfileInfo';
// import ProfileStats from '@/components/profile/ProfileStats';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getChatHistory } from '@/services/chatHistory';
import { db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chatCount, setChatCount] = useState(0);
  const [chatsRemaining, setChatsRemaining] = useState(0);
  const { signOut, user, userProfile } = useAuth();
  const colors = useThemeColors();

  useFocusEffect(
    useCallback(() => {
      console.log('Profile: Loading chat history...');
      console.log('Profile: Current user:', user);
      
      // Pass userId if available, otherwise load from local storage
      const userId = user?.uid;
      console.log('Profile: Using userId:', userId);
      
      // No auto-sync needed - chatsRemaining is updated automatically after course generation
      
      const loadProfileData = async () => {
        if (userId) {
          try {
            // Fetch chatsRemaining from Firestore
            console.log('Profile: Fetching chatsRemaining from Firestore...');
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const firestoreChatsRemaining = userDoc.data().chatsRemaining || 0;
              console.log('Profile: Fetched chatsRemaining from Firestore:', firestoreChatsRemaining);
              setChatsRemaining(firestoreChatsRemaining);
            } else {
              console.log('Profile: User document not found in Firestore');
              setChatsRemaining(0);
            }
          } catch (error) {
            console.error('Profile: Error fetching chatsRemaining:', error);
            setChatsRemaining(0);
          }
          
          // Load chat history
          try {
            const items = await getChatHistory(userId);
            console.log('Profile: Chat history loaded:', items);
            console.log('Profile: Chat count:', items.length);
            setChatCount(items.length);
          } catch (error) {
            console.error('Profile: Error loading chat history:', error);
          }
        }
      };
      
      loadProfileData();
    }, [user])
  );

  // Use actual user data from AuthContext
  const userData: UserProfile = {
    username: userProfile?.displayName || user?.email?.split('@')[0] || 'User',
    email: userProfile?.email || user?.email || 'No email',
    password: '********',
    chatCount: chatsRemaining, // Use chatsRemaining from Firestore instead of local chat count
  };

  const handleSignOut = () => {
    console.log('Sign out button pressed');
    console.log('Current user state:', { user, userProfile });
    
    // Simple confirmation without Alert for now
    console.log('Proceeding with sign out...');
    
    // Call signOut directly
    signOut().then(() => {
      console.log('Sign out completed successfully');
    }).catch((error) => {
      console.error('Sign out error:', error);
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
          backgroundColor: colors.background,
        }}
      >
        {/* Back button within safe area */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          accessibilityRole="button" 
          accessibilityLabel="Go back" 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 10, 
            backgroundColor: colors.card, 
            alignItems: 'center', 
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <ProfileHeader />
        <ProfileInfo user={userData} />
        {/* <ProfileStats chatCount={userData.chatCount} /> */}
        
        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: colors.error,
            borderRadius: 10,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: colors.background, fontSize: 16, fontWeight: '700', fontFamily: 'Nunito' }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
