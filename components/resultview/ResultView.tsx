import { Text, View } from 'react-native';

export default function ResultView() {
  return (
    <View style={{ backgroundColor: '#23263A', borderRadius: 12, padding: 16 }}>
      <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Results</Text>
      <Text style={{ color: '#B0B3B8', marginTop: 8 }}>Your generated content will appear here.</Text>
    </View>
  );
}
