import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Redirect to login if authentication is required but user is not logged in
        router.replace('/auth/login');
      } else if (!requireAuth && user) {
        // Redirect to homepage if user is already logged in and trying to access auth pages
        router.replace('/(tabs)/homepage');
      }
    }
  }, [user, loading, requireAuth, router]);

  // Don't show anything while loading to prevent flash
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#181A20', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color="#7F8CFF" />
        <Text style={{ color: '#B0B3B8', marginTop: 16, fontSize: 16 }}>
          Loading...
        </Text>
      </View>
    );
  }

  // Show children if authentication state matches requirements
  if ((requireAuth && user) || (!requireAuth && !user)) {
    return <>{children}</>;
  }

  // Return loading view while redirecting
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#181A20', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <ActivityIndicator size="large" color="#7F8CFF" />
      <Text style={{ color: '#B0B3B8', marginTop: 16, fontSize: 16 }}>
        Redirecting...
      </Text>
    </View>
  );
};
