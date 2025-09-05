import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export type ChatItem = { 
  id: string; 
  text: string; 
  time?: string;
  isApiResponse?: boolean;
  apiData?: any;
  courseId?: string;
  userId?: string;
};

// Local storage for offline access
const STORAGE_KEY = 'vibelearner.chat_history.v1';
const MAX_ITEMS = 100;

// Firestore collections
const COURSES_COLLECTION = 'courses';
const CHAT_HISTORY_COLLECTION = 'chat_history';

export async function getChatHistory(userId?: string): Promise<ChatItem[]> {
  try {
    // Try to get from Firestore first if userId is provided
    if (userId) {
      try {
        const userChatsQuery = query(
          collection(db, CHAT_HISTORY_COLLECTION),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(userChatsQuery);
        const firestoreItems: ChatItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          firestoreItems.push({
            id: doc.id,
            text: data.text,
            time: data.time,
            isApiResponse: data.isApiResponse,
            apiData: data.apiData,
            courseId: data.courseId,
            userId: data.userId
          });
        });
        // Sort by timestamp (newest first)
        return firestoreItems.sort((a, b) => {
          const timeA = a.time ? new Date(a.time).getTime() : 0;
          const timeB = b.time ? new Date(b.time).getTime() : 0;
          return timeB - timeA;
        });
      } catch (error) {
        console.warn('Failed to fetch from Firestore, falling back to local storage:', error);
      }
    }

    // Fallback to local storage
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.id === 'string' && typeof x.text === 'string');
  } catch {
    return [];
  }
}

export async function setChatHistory(items: ChatItem[], userId?: string): Promise<void> {
  try {
    const trimmed = items.slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    
    // Also sync to Firestore if userId is provided
    if (userId) {
      try {
        // Clear existing user chats and add new ones
        const userChatsQuery = query(
          collection(db, CHAT_HISTORY_COLLECTION),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(userChatsQuery);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // Add new items
        const addPromises = trimmed.map(item => {
          const chatRef = doc(collection(db, CHAT_HISTORY_COLLECTION));
          return setDoc(chatRef, {
            text: item.text || '',
            time: item.time || '',
            isApiResponse: item.isApiResponse || false,
            apiData: item.apiData || null,
            courseId: item.courseId || null,
            userId: userId,
            createdAt: new Date().toISOString()
          });
        });
        await Promise.all(addPromises);
      } catch (error) {
        console.warn('Failed to sync to Firestore:', error);
      }
    }
  } catch {
    // no-op
  }
}

export async function addChatHistoryItem(item: ChatItem, userId?: string): Promise<void> {
  const current = await getChatHistory();
  const next = [item, ...current];
  await setChatHistory(next, userId);
  
  // If this is an API response with course data, save to courses collection
  if (item.isApiResponse && item.apiData && userId) {
    try {
      const courseId = `course_${Date.now()}_${userId}`;
      // Save to users/{userId}/courses subcollection to match the expected structure
      const courseRef = doc(db, "users", userId, "courses", courseId);
      
      await setDoc(courseRef, {
        courseId: courseId,
        userId: userId,
        topic: item.apiData.topic || '',
        quiz: item.apiData.quiz_json || [],
        flashcards: item.apiData.flashcards_json || [],
        course_outline: item.apiData.course_outline_json || null,
        course_outline_html: item.apiData.course_outline_html || '',
        meta: {
          topic: item.apiData.topic || '',
          title: item.apiData.topic || 'Untitled Course',
          generated_at: new Date().toISOString(),
          duration: "15-30 minutes",
          level: "Engineer",
          modules: 3,
          total_flashcards: item.apiData.flashcards_json?.length || 0,
          total_quizzes: item.apiData.quiz_json?.length || 0
        },
        timestamp: item.apiData.timestamp || Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Update the chat item with courseId
      item.courseId = courseId;
      
      // Update the user's chatsRemaining field to reflect the new course count
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const currentCount = userDoc.data().chatsRemaining || 0;
          await updateDoc(userRef, {
            chatsRemaining: currentCount + 1,
            updatedAt: new Date().toISOString()
          });
          console.log(`✅ Updated user ${userId} chatsRemaining from ${currentCount} to ${currentCount + 1}`);
        } else {
          // If user document doesn't exist, create it with chatsRemaining: 1
          await setDoc(userRef, {
            uid: userId,
            chatsRemaining: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
          console.log(`✅ Created user ${userId} with chatsRemaining: 1`);
        }
      } catch (error) {
        console.warn('Failed to update user chatsRemaining:', error);
      }
      
    } catch (error) {
      console.warn('Failed to save course to Firestore:', error);
    }
  }
}

export async function clearChatHistory(userId?: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    
    // Also clear from Firestore if userId is provided
    if (userId) {
      try {
        const userChatsQuery = query(
          collection(db, CHAT_HISTORY_COLLECTION),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(userChatsQuery);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (error) {
        console.warn('Failed to clear Firestore chat history:', error);
      }
    }
  } catch {
    // no-op
  }
}

export async function deleteChatHistoryItem(id: string, userId?: string): Promise<void> {
  try {
    console.log('🗑️ Deleting chat history item:', id);
    
    // Delete from local storage
    const current = await getChatHistory(userId);
    const deletedItem = current.find(item => item.id === id);
    const next = current.filter(item => item.id !== id);
    await setChatHistory(next, userId);
    
    // Also delete from Firestore if userId is provided
    if (userId) {
      try {
        const userChatsQuery = query(
          collection(db, CHAT_HISTORY_COLLECTION),
          where('userId', '==', userId),
          where('text', '==', deletedItem?.text || '')
        );
        const querySnapshot = await getDocs(userChatsQuery);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log(`✅ Deleted ${querySnapshot.docs.length} chat items from Firestore`);
        
        // If this was a course response, decrease the user's chatsRemaining count
        if (deletedItem && deletedItem.isApiResponse && deletedItem.apiData) {
          try {
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const currentCount = userDoc.data().chatsRemaining || 0;
              if (currentCount > 0) {
                await updateDoc(userRef, {
                  chatsRemaining: currentCount - 1,
                  updatedAt: new Date().toISOString()
                });
                console.log(`✅ Decreased user ${userId} chatsRemaining from ${currentCount} to ${currentCount - 1}`);
              } else {
                console.log(`⚠️ User ${userId} chatsRemaining already at 0, cannot decrease further`);
              }
            }
          } catch (error) {
            console.warn('Failed to update user chatsRemaining after deletion:', error);
          }
        }
        
      } catch (error) {
        console.warn('Failed to delete chat item from Firestore:', error);
      }
    }
  } catch (error) {
    console.error('Failed to delete chat history item:', error);
  }
}

// Clear old direct chat queries and keep only course responses
export async function clearOldChatQueries(userId?: string): Promise<void> {
  try {
    console.log('🧹 Clearing old direct chat queries...');
    
    // Clear from local storage
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Keep only course responses (isApiResponse: true)
        const filteredItems = parsed.filter((item: ChatItem) => item.isApiResponse === true);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredItems));
        console.log(`✅ Cleared ${parsed.length - filteredItems.length} old chat queries from local storage`);
      }
    }
    
    // Clear from Firestore if userId is provided
    if (userId) {
      try {
        const userChatsQuery = query(
          collection(db, CHAT_HISTORY_COLLECTION),
          where('userId', '==', userId),
          where('isApiResponse', '==', false) // Only get non-course responses
        );
        const querySnapshot = await getDocs(userChatsQuery);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log(`✅ Cleared ${querySnapshot.docs.length} old chat queries from Firestore`);
      } catch (error) {
        console.warn('Failed to clear old chat queries from Firestore:', error);
      }
    }
  } catch (error) {
    console.error('Failed to clear old chat queries:', error);
  }
}

// Get course by ID from Firestore
export async function getCourseById(courseId: string, userId?: string): Promise<any> {
  try {
    if (!userId) {
      console.error('UserId is required to fetch course');
      return null;
    }
    
    const courseRef = doc(db, "users", userId, "courses", courseId);
    const courseDoc = await getDoc(courseRef);
    if (courseDoc.exists()) {
      return courseDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Failed to get course by ID:', error);
    return null;
  }
}

// Get course count from user's courses subcollection
export async function getUserCourseCount(userId: string): Promise<number> {
  try {
    const coursesRef = collection(db, "users", userId, "courses");
    const snapshot = await getDocs(coursesRef);
    const count = snapshot.size;
    console.log(`📊 Course count for user ${userId}: ${count}`);
    return count;
  } catch (error) {
    console.error("❌ Failed to fetch user courses:", error);
    return 0;
  }
}

// Get all courses for a user
export async function getUserCourses(userId: string): Promise<any[]> {
  try {
    const coursesRef = collection(db, "users", userId, "courses");
    const snapshot = await getDocs(coursesRef);
    const courses: any[] = [];
    snapshot.forEach((doc) => {
      courses.push({
        id: doc.id,
        courseId: doc.id, // Use document ID as courseId
        ...doc.data()
      });
    });
    return courses.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get user courses:', error);
    return [];
  }
}

// Get course IDs for a user
export async function getUserCourseIds(userId: string): Promise<string[]> {
  try {
    const userCoursesQuery = query(
      collection(db, COURSES_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(userCoursesQuery);
    const courseIds: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.courseId) {
        courseIds.push(data.courseId);
      }
    });
    return courseIds;
  } catch (error) {
    console.error('Failed to get user course IDs:', error);
    return [];
  }
}

// Get chat history with course information for a user
export async function getChatHistoryWithCourses(userId: string): Promise<ChatItem[]> {
  try {
    // Get chat history
    const chatHistory = await getChatHistory(userId);
    
    // Get user's courses
    const userCourses = await getUserCourses(userId);
    const courseMap = new Map();
    userCourses.forEach(course => {
      courseMap.set(course.courseId, course);
    });
    
    // Enhance chat history with course information
    const enhancedChatHistory = chatHistory.map(chat => {
      if (chat.isApiResponse && chat.apiData && chat.apiData.topic) {
        // Find matching course by topic
        const matchingCourse = userCourses.find(course => 
          course.topic === chat.apiData.topic
        );
        if (matchingCourse) {
          return {
            ...chat,
            courseId: matchingCourse.courseId,
            courseData: matchingCourse
          };
        }
      }
      return chat;
    });
    
    return enhancedChatHistory;
  } catch (error) {
    console.error('Failed to get chat history with courses:', error);
    return [];
  }
}

// Get courses by chat history for a user
export async function getCoursesByChatHistory(userId: string): Promise<{ chatId: string; courseId: string; courseData: any }[]> {
  try {
    const chatHistory = await getChatHistory(userId);
    const userCourses = await getUserCourses(userId);
    const courseMap = new Map();
    userCourses.forEach(course => {
      courseMap.set(course.courseId, course);
    });
    
    const chatCourses: { chatId: string; courseId: string; courseData: any }[] = [];
    
    chatHistory.forEach(chat => {
      if (chat.isApiResponse && chat.apiData && chat.apiData.topic) {
        const matchingCourse = userCourses.find(course => 
          course.topic === chat.apiData.topic
        );
        if (matchingCourse) {
          chatCourses.push({
            chatId: chat.id,
            courseId: matchingCourse.courseId,
            courseData: matchingCourse
          });
        }
      }
    });
    
    return chatCourses;
  } catch (error) {
    console.error('Failed to get courses by chat history:', error);
    return [];
  }
}

// Sync user's chatsRemaining field with actual course count
export async function syncUserCourseCount(userId: string): Promise<void> {
  try {
    console.log(`🔄 Syncing course count for user ${userId}...`);
    
    // Get actual course count from Firestore
    const coursesRef = collection(db, "users", userId, "courses");
    const snapshot = await getDocs(coursesRef);
    const actualCourseCount = snapshot.size;
    
    console.log(`📊 User ${userId} has ${actualCourseCount} actual courses`);
    
    // Update user document with correct count
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentCount = userDoc.data().chatsRemaining || 0;
      if (currentCount !== actualCourseCount) {
        await updateDoc(userRef, {
          chatsRemaining: actualCourseCount,
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ Synced user ${userId} chatsRemaining from ${currentCount} to ${actualCourseCount}`);
      } else {
        console.log(`✅ User ${userId} chatsRemaining already correct: ${actualCourseCount}`);
      }
    } else {
      // Create user document if it doesn't exist
      await setDoc(userRef, {
        uid: userId,
        chatsRemaining: actualCourseCount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log(`✅ Created user ${userId} with chatsRemaining: ${actualCourseCount}`);
    }
  } catch (error) {
    console.error('Failed to sync user course count:', error);
  }
}

// Delete a course directly and update chatsRemaining
export async function deleteCourse(courseId: string, userId: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting course ${courseId} for user ${userId}...`);
    
    // Delete the course document
    const courseRef = doc(db, "users", userId, "courses", courseId);
    await deleteDoc(courseRef);
    console.log(`✅ Course ${courseId} deleted from Firestore`);
    
    // Decrease the user's chatsRemaining count
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentCount = userDoc.data().chatsRemaining || 0;
        if (currentCount > 0) {
          await updateDoc(userRef, {
            chatsRemaining: currentCount - 1,
            updatedAt: new Date().toISOString()
          });
          console.log(`✅ Decreased user ${userId} chatsRemaining from ${currentCount} to ${currentCount - 1}`);
        } else {
          console.log(`⚠️ User ${userId} chatsRemaining already at 0, cannot decrease further`);
        }
      }
    } catch (error) {
      console.warn('Failed to update user chatsRemaining after course deletion:', error);
    }
    
  } catch (error) {
    console.error('Failed to delete course:', error);
    throw error;
  }
}

// Force update chatsRemaining to a specific value (for immediate fixes)
export async function forceUpdateChatsRemaining(userId: string, newCount: number): Promise<void> {
  try {
    console.log(`🚀 Force updating chatsRemaining to ${newCount} for user ${userId}...`);
    
    const userRef = doc(db, "users", userId);
    
    await updateDoc(userRef, {
      chatsRemaining: newCount,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ Successfully force updated chatsRemaining to ${newCount}`);
    
    // Verify the update
    const verifyDoc = await getDoc(userRef);
    if (verifyDoc.exists()) {
      const verifiedCount = verifyDoc.data().chatsRemaining;
      console.log(`🔍 Verification: Firestore now shows chatsRemaining: ${verifiedCount}`);
    }
  } catch (error) {
    console.error('❌ Failed to force update chatsRemaining:', error);
    throw error;
  }
}
