import { View } from 'react-native';
import { deleteChatHistoryItem } from '../../services/chatHistory';
import ChatItem from './ChatItem';

export default function ChatList({ 
  items, 
  onDelete 
}: { 
  items: { id: string; text: string; time?: string; isApiResponse?: boolean }[], 
  onDelete?: (id: string) => void 
}) {
  const handleDelete = async (id: string) => {
    await deleteChatHistoryItem(id);
    if (onDelete) onDelete(id);
  };
  return (
    <View>
      {items.map((item, idx) => (
        <View key={item.id} style={{ marginBottom: idx === items.length - 1 ? 0 : 10 }}>
          <ChatItem 
            text={item.text} 
            time={item.time} 
            isApiResponse={item.isApiResponse}
            onDelete={() => handleDelete(item.id)} 
          />
        </View>
      ))}
    </View>
  );
}
