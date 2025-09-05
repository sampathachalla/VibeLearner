import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    getUserProfile,
    onAuthStateChange,
    signIn,
    signOutUser,
    signUp,
    UserProfile
} from '../services/authService';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile when user changes
  const loadUserProfile = async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  // Handle sign out for both Firebase and demo users
  const handleSignOut = async (): Promise<void> => {
    try {
      console.log('AuthContext: Starting sign out process...');
      console.log('AuthContext: Current user state before sign out:', { user, userProfile });
      
      // Clear local state first
      console.log('AuthContext: Clearing local state...');
      setUser(null);
      setUserProfile(null);
      
      // Clear AsyncStorage data
      console.log('AuthContext: Clearing AsyncStorage...');
      await AsyncStorage.removeItem('userInfo');
      console.log('AuthContext: AsyncStorage cleared');
      
      // If it's a Firebase user, sign out from Firebase
      if (auth.currentUser) {
        console.log('AuthContext: Firebase user detected, calling Firebase signOut...');
        await signOutUser();
        console.log('AuthContext: Firebase signOut completed');
      } else {
        console.log('AuthContext: No Firebase user, skipping Firebase signOut');
      }
      
      console.log('AuthContext: Sign out process completed successfully');
    } catch (error) {
      console.error('AuthContext: Sign out error:', error);
      // Even if there's an error, clear local state
      console.log('AuthContext: Clearing local state despite error...');
      setUser(null);
      setUserProfile(null);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const checkAuthState = async () => {
      try {
        // First check for demo user in AsyncStorage
        const demoUserInfo = await AsyncStorage.getItem('userInfo');
        if (demoUserInfo) {
          const demoUser = JSON.parse(demoUserInfo);
          console.log('Demo user found:', demoUser);
          // Set demo user state
          setUser({ uid: demoUser.id, email: demoUser.email } as User);
          setUserProfile({
            uid: demoUser.id,
            email: demoUser.email,
            displayName: demoUser.username,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            preferences: { theme: 'dark', notifications: true }
          });
          setLoading(false);
          return;
        }
        
        // If no demo user, check Firebase auth state
        const unsubscribe = onAuthStateChange(async (currentUser) => {
          if (!mounted) return;
          
          try {
            setUser(currentUser);
            await loadUserProfile(currentUser);
          } catch (error) {
            console.error('Auth state change error:', error);
          } finally {
            if (mounted) {
              setLoading(false);
            }
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Auth state check error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuthState();

    return () => {
      mounted = false;
    };
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut: handleSignOut,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
