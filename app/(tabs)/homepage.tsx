import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContentView from '../../components/homepage/ContentView';
import Header from '../../components/homepage/Header';
import HistoryDrawer from '../../components/homepage/HistoryDrawer';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { clearOldChatQueries, getChatHistory } from '../../services/chatHistory';
import { db } from '../../services/firebase';

// Type for API response data
interface ApiResponseData {
	topic: string;
	quiz_json: any[];
	flashcards_json: any[];
	course_outline_json: any;
	course_outline_html: string;
	timestamp: number;
}

// Extend global to include our API data
declare global {
	var apiResponseData: ApiResponseData | undefined;
}

export default function HomePage() {
	const [historyOpen, setHistoryOpen] = useState(false);
	const [items, setItems] = useState<{ id: string; text: string; time?: string }[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const params = useLocalSearchParams();
	const router = useRouter();
	const { user } = useAuth();
	const colors = useThemeColors();

	useEffect(() => {
		let mounted = true;
		
		// Clear old chat queries first, then load history
		const initializeHistory = async () => {
			try {
				// Clear old direct chat queries
				await clearOldChatQueries(user?.uid);
				
				// Load remaining history (only course responses)
				if (mounted) {
					const saved = await getChatHistory(user?.uid);
					setItems(saved);
				}
			} catch (error) {
				console.error('Failed to initialize history:', error);
			}
		};
		
		initializeHistory();
		
		return () => {
			mounted = false;
		};
	}, [user?.uid]);

	const handleSend = async (text: string): Promise<void> => {
		setIsLoading(true);

		try {
			const response = await fetch('https://coursefetcher-20689072958.us-central1.run.app', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user_id: user?.uid || '',
					topic: text
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log('✅ API response received:', data);

			if (!data.success || !data.course_id) {
				throw new Error('API response missing success or course_id');
			}

			const courseId = data.course_id;
			console.log('🔄 Received courseId from API:', courseId);

			// Increment chatsRemaining when course is successfully generated
			if (user?.uid) {
				try {
					console.log('📈 Incrementing chatsRemaining for new course...');
					
					const userRef = doc(db, "users", user.uid);
					const userDoc = await getDoc(userRef);
					
					if (userDoc.exists()) {
						const currentCount = userDoc.data().chatsRemaining || 0;
						const newCount = currentCount + 1;
						
						await updateDoc(userRef, {
							chatsRemaining: newCount,
							updatedAt: new Date().toISOString()
						});
						
						console.log(`✅ Successfully incremented chatsRemaining from ${currentCount} to ${newCount}`);
					} else {
						console.log('⚠️ User document not found, creating with chatsRemaining: 1');
						
						// Create user document if it doesn't exist
						await setDoc(userRef, {
							uid: user.uid,
							chatsRemaining: 1,
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString()
						}, { merge: true });
						
						console.log('✅ Created user document with chatsRemaining: 1');
					}
				} catch (error) {
					console.error('❌ Failed to increment chatsRemaining:', error);
					// Continue with navigation even if increment fails
				}
			}

			// Update global apiResponseData for other components
			global.apiResponseData = {
				topic: text,
				quiz_json: [],
				flashcards_json: [],
				course_outline_json: null,
				course_outline_html: '',
				timestamp: Date.now()
			};
			console.log('✅ Global apiResponseData updated');

			setIsLoading(false);
			console.log('🚀 Navigating to resultview with courseId:', courseId);

			router.push({
				pathname: '/(tabs)/resultview',
				params: {
					topic: text,
					courseId: courseId
				}
			});

		} catch (error) {
			console.error('❌ API call failed:', error);
			setIsLoading(false);
			// Optionally show an alert to the user
			// Alert.alert('Error', 'Failed to generate course. Please try again.');
		}
	};

	const refreshHistory = () => {
		getChatHistory(user?.uid).then((saved) => setItems(saved));
	};

	const clearAllHistory = async () => {
		try {
			console.log('🗑️ Clearing all chat history...');
			await clearOldChatQueries(user?.uid);
			setItems([]); // Clear the display immediately
			console.log('✅ All chat history cleared');
		} catch (error) {
			console.error('Failed to clear history:', error);
		}
	};

	// Find selected chat if params.id or params.text is present
	const selectedChat = items.find(
		(item) => (params.id && item.id === params.id) || (params.text && item.text === params.text)
	);

	const handleOpenHistory = () => {
		Keyboard.dismiss();
		setHistoryOpen(true);
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
			<View style={{ paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 8 : 16 }}>
				<Header onOpenHistory={handleOpenHistory} />
			</View>
			<ContentView 
				items={items} 
				onSend={handleSend} 
				selectedChat={selectedChat} 
				isLoading={isLoading}
				onLoadingComplete={() => setIsLoading(false)}
			/>
			<HistoryDrawer 
				open={historyOpen} 
				onClose={() => setHistoryOpen(false)} 
				items={items} 
				refreshHistory={refreshHistory} 
				userId={user?.uid}
				onClearAll={clearAllHistory}
			/>
		</SafeAreaView>
	);
}
