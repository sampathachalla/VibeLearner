import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { AuthGuard } from '../../components/auth/AuthGuard';

export default function TabsLayout() {
  return (
    <AuthGuard requireAuth={true}>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarActiveTintColor: '#7F8CFF',
					tabBarStyle: { backgroundColor: '#121521', borderTopColor: '#1d2030', display: 'none', height: 0 },
					tabBarLabelStyle: { fontSize: 12 },
				}}
			>
			<Tabs.Screen
				name="homepage"
				options={{
					title: 'Home',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" color={color} size={size} />
					),
				}}
			/>
					<Tabs.Screen
						name="profile"
						options={{
							title: 'Profile',
							tabBarIcon: ({ color, size }) => (
								<Ionicons name="person" color={color} size={size} />
							),
						}}
					/>
			{/* Add more tabs here when ready */}
		</Tabs>
    </AuthGuard>
	);
}
