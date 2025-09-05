# Firebase Integration Setup

This document outlines the Firebase integration in the VibeLearner app, including authentication, Firestore, and Cloud Storage.

## 🔥 Firebase Services Integrated

### 1. **Authentication**
- Email/Password authentication
- User profile management
- Persistent login state
- Sign up, sign in, sign out functionality

### 2. **Firestore Database**
- User profiles
- Chat history
- Learning sessions
- User progress tracking
- Topic analytics

### 3. **Cloud Storage**
- Profile pictures
- Learning materials
- Session screenshots
- Notes and quiz results

## 📁 File Structure

```
services/
├── firebase.ts          # Firebase configuration
├── authService.ts       # Authentication functions
├── firestoreService.ts  # Firestore operations
└── storageService.ts    # Cloud Storage operations

context/
└── AuthContext.tsx      # Authentication context provider

components/
└── auth/
    └── AuthGuard.tsx    # Route protection component

app/
├── _layout.tsx          # Root layout with AuthProvider
├── auth/
│   ├── _layout.tsx      # Auth layout with AuthGuard
│   ├── login.tsx        # Login screen
│   └── signup.tsx       # Signup screen
└── (tabs)/
    ├── _layout.tsx      # Protected tabs layout
    ├── homepage.tsx     # Main app screen
    └── profile.tsx      # User profile screen
```

## 🔧 Configuration

### Firebase Config
The Firebase configuration is stored in `services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyABbqMcAPogUJA6Ogg_IEx4FPgtBEKa3Mw",
  authDomain: "vibelearner-f264f.firebaseapp.com",
  projectId: "vibelearner-f264f",
  storageBucket: "vibelearner-f264f.firebasestorage.app",
  messagingSenderId: "376403002035",
  appId: "1:376403002035:web:890ae346f4513695a466c6",
  measurementId: "G-GZJHRXJL0L"
};
```

## 🚀 Usage

### Authentication

#### Sign Up
```typescript
import { useAuth } from '../context/AuthContext';

const { signUp } = useAuth();

const handleSignUp = async () => {
  try {
    await signUp(email, password, displayName);
    // User will be automatically redirected to homepage
  } catch (error) {
    console.error('Signup error:', error);
  }
};
```

#### Sign In
```typescript
import { useAuth } from '../context/AuthContext';

const { signIn } = useAuth();

const handleSignIn = async () => {
  try {
    await signIn(email, password);
    // User will be automatically redirected to homepage
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

#### Sign Out
```typescript
import { useAuth } from '../context/AuthContext';

const { signOut } = useAuth();

const handleSignOut = async () => {
  try {
    await signOut();
    // User will be automatically redirected to login
  } catch (error) {
    console.error('Sign out error:', error);
  }
};
```

### Firestore Operations

#### Save Chat History
```typescript
import { saveChatHistory } from '../services/firestoreService';

const saveChat = async (userId: string, chatItem: any) => {
  try {
    await saveChatHistory(userId, chatItem);
  } catch (error) {
    console.error('Failed to save chat:', error);
  }
};
```

#### Create Learning Session
```typescript
import { createLearningSession } from '../services/firestoreService';

const createSession = async (userId: string, topic: string, apiResponse: any) => {
  try {
    const sessionId = await createLearningSession(userId, topic, apiResponse);
    console.log('Session created:', sessionId);
  } catch (error) {
    console.error('Failed to create session:', error);
  }
};
```

#### Get User Progress
```typescript
import { getUserProgress } from '../services/firestoreService';

const getProgress = async (userId: string) => {
  try {
    const progress = await getUserProgress(userId);
    console.log('User progress:', progress);
  } catch (error) {
    console.error('Failed to get progress:', error);
  }
};
```

### Cloud Storage

#### Upload Profile Picture
```typescript
import { uploadProfilePicture } from '../services/storageService';

const uploadProfile = async (userId: string, file: File) => {
  try {
    const result = await uploadProfilePicture(userId, file);
    console.log('Profile picture uploaded:', result.url);
  } catch (error) {
    console.error('Failed to upload profile picture:', error);
  }
};
```

#### Upload Learning Material
```typescript
import { uploadLearningMaterial } from '../services/storageService';

const uploadMaterial = async (userId: string, sessionId: string, file: File) => {
  try {
    const result = await uploadLearningMaterial(userId, sessionId, file);
    console.log('Material uploaded:', result.url);
  } catch (error) {
    console.error('Failed to upload material:', error);
  }
};
```

## 🔒 Security Rules

Make sure to set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat history - users can only access their own chats
    match /chatHistory/{chatId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Learning sessions - users can only access their own sessions
    match /learningSessions/{sessionId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // User progress - users can only access their own progress
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

And Cloud Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 Testing

### Demo Credentials
The app includes demo credentials for testing:
- **Email**: sam@example.com
- **Password**: sam2001

### Development Mode
In development mode, you'll see debug information in the result view showing:
- Current user authentication status
- API data availability
- Data counts for quiz, flashcards, and notes

## 📱 Features

### ✅ Implemented
- [x] Firebase Authentication (Email/Password)
- [x] User Profile Management
- [x] Chat History Storage
- [x] Learning Session Tracking
- [x] User Progress Analytics
- [x] Route Protection
- [x] Persistent Login State
- [x] Error Handling
- [x] Loading States

### 🔄 In Progress
- [ ] Profile Picture Upload
- [ ] Learning Material Storage
- [ ] Session Screenshots
- [ ] Advanced Analytics

### 📋 Planned
- [ ] Social Authentication (Google, Apple)
- [ ] Password Reset
- [ ] Email Verification
- [ ] Offline Support
- [ ] Data Export/Import

## 🚨 Important Notes

1. **Demo Mode**: The app still supports demo mode for testing without Firebase
2. **Error Handling**: All Firebase operations include proper error handling
3. **Loading States**: Authentication state is properly managed with loading indicators
4. **Route Protection**: All main app routes are protected and require authentication
5. **Data Persistence**: User data persists across app restarts

## 🔧 Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check if `services/firebase.ts` is properly configured
2. **Authentication errors**: Verify Firebase Auth is enabled in Firebase Console
3. **Firestore permission errors**: Check security rules in Firebase Console
4. **Storage upload failures**: Verify Cloud Storage is enabled and rules are set

### Debug Mode
Enable debug logging by checking the console for detailed error messages and data flow information.
