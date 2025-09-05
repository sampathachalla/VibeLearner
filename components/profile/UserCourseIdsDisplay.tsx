import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { getUserCourseIds, getUserCourses } from '../../services/chatHistory';

interface CourseData {
  id: string;
  courseId: string;
  topic: string;
  timestamp: number;
  createdAt: string;
}

const UserCourseIdsDisplay: React.FC<{ userId: string }> = ({ userId }) => {
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both course IDs and full course data
        const [ids, courses] = await Promise.all([
          getUserCourseIds(userId),
          getUserCourses(userId)
        ]);
        
        setCourseIds(ids);
        setCourseData(courses);
      } catch (err: any) {
        setError(`Error fetching course data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#7F8CFF" size="large" />
        <Text style={styles.loadingText}>Loading course data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (courseIds.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No courses found for this user.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Course Data for User</Text>
      <Text style={styles.userIdText}>User ID: {userId}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course IDs ({courseIds.length})</Text>
        <FlatList
          data={courseIds}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.courseIdItem}>
              <Text style={styles.courseIdText}>{item}</Text>
            </View>
          )}
          style={styles.list}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course Details ({courseData.length})</Text>
        <FlatList
          data={courseData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.courseItem}>
              <Text style={styles.courseTitle}>{item.topic}</Text>
              <Text style={styles.courseId}>ID: {item.courseId}</Text>
              <Text style={styles.courseDate}>
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          style={styles.list}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23263A',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  title: {
    color: '#7F8CFF',
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 8,
  },
  userIdText: {
    color: '#B0B3B8',
    fontSize: 14,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#7F8CFF',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
  },
  list: {
    maxHeight: 200,
  },
  courseIdItem: {
    backgroundColor: '#181A20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  courseIdText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  courseItem: {
    backgroundColor: '#181A20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  courseTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  courseId: {
    color: '#B0B3B8',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  courseDate: {
    color: '#8A8FA0',
    fontSize: 12,
  },
  loadingText: {
    color: '#B0B3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF7F7F',
    textAlign: 'center',
  },
  noDataText: {
    color: '#8A8FA0',
    textAlign: 'center',
  },
});

export default UserCourseIdsDisplay;
