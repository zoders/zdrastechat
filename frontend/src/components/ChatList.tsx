import { useState, useEffect } from 'react';
import api from '../api/axios';
import { WS_URL, USE_WEBSOCKET } from '../config';

interface Chat {
  id: string;
  participants: string[];
  last_message?: any;
}

export default function ChatList({
  onChatSelect,
  selectedChatId,
}: {
  onChatSelect: (chatId: string, otherName: string) => void;
  selectedChatId: string | null;
}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);

  const currentUsername = localStorage.getItem('username') || '';

  const loadMyChats = async () => {
    const { data } = await api.get('/chats/');
    setChats(data);
  };

  useEffect(() => {
    loadMyChats();

    if (USE_WEBSOCKET) {
      const token = localStorage.getItem('access_token');
      const socket = new WebSocket(`${WS_URL}/notifications/?token=${token}`);

      socket.onopen = () => console.log('🟢 WS уведомления');
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_updated') loadMyChats();
      };
      socket.onclose = () => console.log('🔴 WS отключён');

      return () => socket.close();
    } else {
      const interval = setInterval(loadMyChats, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  const searchUser = async () => {
    if (!searchUsername.trim()) return;
    try {
      const { data } = await api.get(`/users/search/?username=${searchUsername}`);
      setFoundUser(data.length > 0 ? data[0] : null);
    } catch (e) {
      setFoundUser(null);
    }
  };

  const startChat = async () => {
    if (!foundUser) return;
    try {
      const { data } = await api.post('/chats/create/', {
        participants: [foundUser.id],
      });
      loadMyChats();
      const otherName = foundUser.username;
      onChatSelect(data.id, otherName);
      setFoundUser(null);
      setSearchUsername('');
    } catch (e) {
      alert('Не удалось создать чат');
    }
  };

  const getOtherParticipant = (participants: string[]) => {
    return participants.find(name => name !== currentUsername) || participants[0] || 'Чат';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Точный ник..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="min-w-0 flex-1 bg-gray-800 text-white px-4 rounded-2xl focus:outline-none"
          />
          <button
            onClick={searchUser}
            className="tap-target inline-flex items-center justify-center shrink-0 bg-blue-600 hover:bg-blue-700 px-4 rounded-2xl text-sm"
            aria-label="Найти пользователя"
            title="Найти"
          >
            🔎
          </button>
        </div>

        {foundUser && (
          <div className="mt-3 p-3 bg-gray-800 rounded-2xl flex justify-between items-center gap-3">
            <span className="font-medium truncate">@{foundUser.username}</span>
            <button
              onClick={startChat}
              className="tap-target inline-flex items-center justify-center shrink-0 bg-green-600 hover:bg-green-700 px-4 rounded-2xl text-sm"
              aria-label="Начать чат"
              title="Начать чат"
            >
              ➕
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto overscroll-contain p-2.5 space-y-2">
        {chats.map((chat) => {
          const otherName = getOtherParticipant(chat.participants);
          return (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id, otherName)}
              className={`min-h-16 p-3.5 rounded-2xl cursor-pointer transition-all ${
                selectedChatId === chat.id ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <div className="font-semibold truncate">@{otherName}</div>
              {chat.last_message && (
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {chat.last_message.text}
                </div>
              )}
            </div>
          );
        })}

        {chats.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            Чатов пока нет.<br />
            Найдите пользователя выше
          </div>
        )}
      </div>
    </div>
  );
}
