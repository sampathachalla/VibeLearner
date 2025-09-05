import { useTheme } from '@/context/ThemeContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { deleteChatHistoryItem, getUserCourses } from '@/services/chatHistory';
import { db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type HistoryItem = { id: string; text: string; time?: string };

type CourseItem = { 
  id: string; 
  text: string; 
  time?: string;
  isCourse: boolean;
  courseData: any;
};

type CombinedItem = HistoryItem | CourseItem;

type Props = {
  open: boolean;
  onClose?: () => void;
  items?: HistoryItem[];
  refreshHistory?: () => void;
  userId?: string;
  onClearAll?: () => Promise<void>;
};

export default function HistoryDrawer({ open, onClose, items = [], refreshHistory, userId, onClearAll }: Props) {
  const x = useRef(new Animated.Value(-width)).current;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [courseData, setCourseData] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const colors = useThemeColors();
  const { isDark } = useTheme();
  // Remove extra gap: set topPad to 0 for all platforms
  const topPad = 0;

  useEffect(() => {
    Animated.timing(x, {
      toValue: open ? 0 : -width,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [open]);

  // Fetch course data when drawer opens
  useEffect(() => {
    if (open && userId) {
      fetchCourseData();
    }
  }, [open, userId]);

  const fetchCourseData = async () => {
    if (!userId) return;
    
    try {
      setLoadingCourses(true);
      const courses = await getUserCourses(userId);
      console.log('📚 Fetched courses for user:', userId);
      console.log('📚 Number of courses:', courses.length);
      
      courses.forEach((course, index) => {
        console.log(`📚 Course ${index + 1}:`, {
          courseId: course.courseId,
          title: course.meta?.title || 'No title',
          topic: course.meta?.topic || course.topic || 'No topic',
          generated_at: course.meta?.generated_at || course.createdAt,
          id: course.id
        });
      });
      
      setCourseData(courses);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Combine chats and courses into a single list
  const allItems: CombinedItem[] = [
    ...items,
    ...courseData
      .sort((a, b) => {
        // Sort by creation date, newest first
        const dateA = new Date(a.meta?.generated_at || a.createdAt || a.timestamp || 0);
        const dateB = new Date(b.meta?.generated_at || b.createdAt || b.timestamp || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .map(course => ({
        id: course.id || course.courseId,
        text: course.meta?.title || course.topic || course.title || 'Untitled Course',
        time: course.meta?.generated_at || course.createdAt || course.timestamp,
        isCourse: true,
        courseData: course
      }))
  ];

  // Type guard to check if item is a course
  const isCourseItem = (item: CombinedItem): item is CourseItem => {
    return 'isCourse' in item && item.isCourse === true;
  };

  return (
        <Animated.View style={[styles.container, { 
      transform: [{ translateX: x }],
      backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.1)'
    }]}>
      <View style={[styles.panel, { 
        paddingTop: topPad, 
        backgroundColor: colors.surface,
        borderRightWidth: 1,
        borderRightColor: colors.border
      }]}> 
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[styles.title, { color: colors.text }]}>Chat History</Text>
        </View>

        <ScrollView 
          style={[styles.content]} 
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          {loadingCourses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading history...</Text>
            </View>
          ) : allItems.length === 0 ? (
            <Text style={{ color: colors.textTertiary, marginTop: 16 }}>No chats or courses yet</Text>
          ) : (
            <View style={{ marginTop: 16 }}>
              {allItems.map((item) => (
                <View key={item.id} style={[styles.historyItem, { 
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: colors.text,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 2,
                  elevation: isDark ? 3 : 2
                }]}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      if (isCourseItem(item)) {
                        // Navigate to course with courseId only - data will be fetched from Firestore
                        router.push({ 
                          pathname: '/(tabs)/resultview', 
                          params: { 
                            topic: item.text,
                            courseId: item.courseData.courseId || item.courseData.id
                          } 
                        });
                      } else {
                        // Navigate to regular chat
                        router.push({ pathname: '/(tabs)/resultview', params: { topic: item.text } });
                      }
                      onClose?.();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${isCourseItem(item) ? 'course' : 'chat'}: ${item.text}`}
                  >
                    <View style={styles.itemContent}>
                      <View style={styles.itemHeader}>
                        <Text numberOfLines={1} style={[styles.itemText, isCourseItem(item) && styles.courseText, { color: isCourseItem(item) ? colors.text : colors.textSecondary }]}>
                          {isCourseItem(item) ? '📚 ' : '• '}
                          {isCourseItem(item) 
                            ? (item.courseData.meta?.topic || item.courseData.topic || item.text)
                            : item.text
                          }
                        </Text>
                      </View>
                      {isCourseItem(item) && (
                        <Text style={[styles.courseId, { color: colors.textTertiary }]}>Title: {item.courseData.meta?.title || item.courseData.topic || 'Untitled Course'}</Text>
                      )}
                      {item.time && (
                        <Text style={[styles.itemTime, { color: colors.textTertiary }]}>
                          {new Date(item.time).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        if (isCourseItem(item)) {
                          // Delete course from Firestore
                          if (!userId) {
                            console.error('❌ No userId available for course deletion');
                            return;
                          }
                          
                          const courseId = item.courseData.courseId || item.courseData.id;
                          console.log('🗑️ Deleting course from Firestore:', courseId);
                          
                          await deleteDoc(doc(db, 'users', userId, 'courses', courseId));
                          console.log('✅ Course deleted from Firestore successfully:', courseId);
                          
                          // Decrement chatsRemaining when course is deleted
                          try {
                            console.log('📉 Decrementing chatsRemaining after course deletion...');
                            
                            const userRef = doc(db, "users", userId);
                            const userDoc = await getDoc(userRef);
                            
                            if (userDoc.exists()) {
                              const currentCount = userDoc.data().chatsRemaining || 0;
                              if (currentCount > 0) {
                                const newCount = currentCount - 1;
                                
                                await updateDoc(userRef, {
                                  chatsRemaining: newCount,
                                  updatedAt: new Date().toISOString()
                                });
                                
                                console.log(`✅ Successfully decremented chatsRemaining from ${currentCount} to ${newCount}`);
                              } else {
                                console.log('⚠️ chatsRemaining already at 0, cannot decrease further');
                              }
                            } else {
                              console.log('⚠️ User document not found during course deletion');
                            }
                          } catch (error) {
                            console.error('❌ Failed to decrement chatsRemaining:', error);
                            // Continue with refresh even if decrement fails
                          }
                          
                          // Refresh course list
                          fetchCourseData();
                        } else {
                          // Delete regular chat from Firestore
                          if (!userId) {
                            console.error('❌ No userId available for chat deletion');
                            return;
                          }
                          
                          console.log('🗑️ Deleting chat from Firestore:', item.id);
                          await deleteChatHistoryItem(item.id, userId);
                          console.log('✅ Chat deleted from Firestore successfully:', item.id);
                          
                          // Refresh chat history
                          refreshHistory?.();
                        }
                      } catch (error) {
                        console.error('❌ Failed to delete item:', error);
                        // You could show a toast or alert here to inform the user
                      }
                    }}
                    style={styles.deleteButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${isCourseItem(item) ? 'course' : 'chat'}`}
                  >
                    <Ionicons name="trash-outline" size={20} color="#F87171" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.bottomBar, { bottom: 16 + insets.bottom, backgroundColor: 'transparent' }]}> 
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.primary }]}> 
            <Text style={{ color: colors.background, fontWeight: '700' }}>Close</Text> 
          </TouchableOpacity> 
                      <TouchableOpacity
              onPress={() => {
                onClose?.();
                router.push('/(tabs)/profile');
              }}
              style={[styles.settingsBtn, { backgroundColor: 'transparent' }]}
              accessibilityLabel="Open settings"
              accessibilityRole="button"
            >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: Math.min(width * 0.8, 320),
    // backgroundColor will be set dynamically
    paddingHorizontal: 16,
    // No paddingTop here
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: Math.min(width * 0.8, 320),
    // backgroundColor will be set dynamically
    paddingHorizontal: 16,
    // No paddingTop here
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 0, textAlign: 'center', fontFamily: 'Montserrat' },
  content: {
    flex: 1,
    marginTop: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    // backgroundColor will be set dynamically
    borderRadius: 8,
    padding: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemText: { 
    // color will be set dynamically
    fontSize: 14,
    flex: 1,
  },
  courseText: {
    // color will be set dynamically
    fontWeight: '500',
  },
  courseBadge: {
    // backgroundColor will be set dynamically
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  courseBadgeText: {
    // color will be set dynamically
    fontSize: 10,
    fontWeight: '600',
  },
  courseId: {
    // color will be set dynamically
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  itemTime: {
    // color will be set dynamically
    fontSize: 11,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  loadingText: {
    // color will be set dynamically
    marginTop: 8,
  },
  bottomBar: { position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  closeBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  settingsBtn: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
