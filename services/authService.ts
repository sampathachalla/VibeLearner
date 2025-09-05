import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User
} from "firebase/auth";
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
  };
}

// Sign up with email and password
export const signUp = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create user profile in local storage
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName || user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {
        theme: 'dark',
        notifications: true
      }
    };

    // Store user profile in AsyncStorage
    await AsyncStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(userProfile));

    // Create user profile in Firestore (users/{uid})
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: userProfile.displayName || null,
        photoURL: user.photoURL || null,
        createdAt: userProfile.createdAt.toISOString(),
        lastLoginAt: userProfile.lastLoginAt.toISOString(),
        preferences: userProfile.preferences || {},
        chatsRemaining: 0,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      // Non-fatal for signup; profile screen will also upsert
      console.warn('Firestore user create failed:', e);
    }

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login time in local storage
    try {
      const existingProfile = await AsyncStorage.getItem(`userProfile_${user.uid}`);
      if (existingProfile) {
        const profile = JSON.parse(existingProfile);
        profile.lastLoginAt = new Date();
        await AsyncStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(profile));
      }
    } catch (error) {
      // Silently handle local storage errors
    }

    // Update Firestore lastLoginAt
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      // If doc does not exist yet, create it
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          preferences: { theme: 'dark', notifications: true },
          chatsRemaining: 0,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore user upsert on sign-in failed:', err);
      }
    }

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message);
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get user profile from local storage
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const profileData = await AsyncStorage.getItem(`userProfile_${uid}`);
    if (profileData) {
      return JSON.parse(profileData) as UserProfile;
    }
    return null;
  } catch (error: any) {
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
};

// Update user profile in local storage
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const existingProfile = await AsyncStorage.getItem(`userProfile_${uid}`);
    if (existingProfile) {
      const profile = JSON.parse(existingProfile);
      const updatedProfile = { ...profile, ...updates };
      await AsyncStorage.setItem(`userProfile_${uid}`, JSON.stringify(updatedProfile));
    }
  } catch (error: any) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
