import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { WS_URL, USE_WEBSOCKET } from '../config';

export default function ChatWindow({
  chatId,
  otherName,
  isSidebarOpen,
  toggleSidebar,
}: {
  chatId: string;
  otherName: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const currentUserId = localStorage.getItem('user_id');

  const loadMessages = async () => {
    const { data } = await api.get(`/chats/${chatId}/messages/`);
    setMessages(data);
  };

  useEffect(() => {
    loadMessages();

    if (USE_WEBSOCKET) {
      const token = localStorage.getItem('access_token');
      const socket = new WebSocket(`${WS_URL}/chat/${chatId}/?token=${token}`);
      socketRef.current = socket;

      socket.onopen = () => console.log(`🟢 WebSocket чата ${chatId}`);
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type !== 'message') return;

        setMessages((prev) => {
          if (prev.some((msg) => msg.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      };
      socket.onclose = () => {
        if (socketRef.current === socket) socketRef.current = null;
        console.log(`🔴 WebSocket чата ${chatId} отключён`);
      };

      return () => {
        socketRef.current = null;
        socket.close();
      };
    } else {
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [chatId]);

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text) return;

    const socket = socketRef.current;
    if (USE_WEBSOCKET && socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ text }));
    } else {
      await api.post(`/chats/${chatId}/send/`, { text });
      await loadMessages();
    }

    setNewMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex items-center px-4 bg-gray-900 z-10">
        
        {/* Кнопка на мобильных (Назад) */}
        <button
          onClick={toggleSidebar}
          className="md:hidden mr-4 text-3xl text-gray-400 hover:text-white"
        >
          ←
        </button>

        {/* Кнопка сворачивания на десктопе */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex items-center justify-center w-9 h-9 text-3xl text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl"
        >
          {isSidebarOpen ? '←' : '→'}
        </button>

        <div className="flex items-center gap-3 ml-2">
          <div className="w-8 h-8 bg-blue-500 rounded-2xl flex items-center justify-center text-sm font-bold">@</div>
          <div className="font-semibold">@{otherName}</div>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-auto p-4 space-y-6 bg-gray-950">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`chat-bubble max-w-xs px-4 py-3 rounded-3xl ${
                msg.sender_id === currentUserId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
              }`}
            >
              <div>{msg.text}</div>
              <div className="text-[10px] opacity-70 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="p-4 border-t border-gray-800 flex gap-3 bg-gray-900">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Сообщение..."
          className="flex-1 bg-gray-800 text-white px-6 py-4 rounded-3xl focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 px-8 rounded-3xl font-medium transition"
        >
          →
        </button>
      </div>
    </div>
  );
}
