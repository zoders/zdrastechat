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
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const oldestMessageTimestampRef = useRef<string | null>(null);
  const shouldScrollToBottomRef = useRef(false);
  const isLoadingOlderRef = useRef(false);

  const currentUserId = localStorage.getItem('user_id');

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 120;
  };

  const mergeMessages = (currentMessages: any[], incomingMessages: any[], mode: 'replace' | 'prepend' | 'append') => {
    const byId = new Map<string, any>();

    const orderedMessages =
      mode === 'prepend'
        ? [...incomingMessages, ...currentMessages]
        : mode === 'append'
          ? [...currentMessages, ...incomingMessages]
          : incomingMessages;

    orderedMessages.forEach((message) => byId.set(message.id, message));
    return Array.from(byId.values());
  };

  const rememberOldestMessage = (nextMessages: any[]) => {
    oldestMessageTimestampRef.current = nextMessages[0]?.timestamp ?? null;
  };

  const loadLatestMessages = async () => {
    setIsInitialLoading(true);
    const { data } = await api.get(`/chats/${chatId}/messages/?limit=30`);
    setMessages(data.results);
    setHasMore(data.has_more);
    rememberOldestMessage(data.results);
    shouldScrollToBottomRef.current = true;
    setIsInitialLoading(false);
  };

  const loadOlderMessages = async () => {
    if (!hasMore || isLoadingOlderRef.current || !oldestMessageTimestampRef.current) return;

    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight ?? 0;
    const previousScrollTop = container?.scrollTop ?? 0;

    isLoadingOlderRef.current = true;
    setIsLoadingOlder(true);

    try {
      const before = encodeURIComponent(oldestMessageTimestampRef.current);
      const { data } = await api.get(`/chats/${chatId}/messages/?limit=30&before=${before}`);

      setMessages((prev) => {
        const nextMessages = mergeMessages(prev, data.results, 'prepend');
        rememberOldestMessage(nextMessages);
        return nextMessages;
      });
      setHasMore(data.has_more);

      requestAnimationFrame(() => {
        if (!container) return;
        container.scrollTop = container.scrollHeight - previousScrollHeight + previousScrollTop;
      });
    } finally {
      isLoadingOlderRef.current = false;
      setIsLoadingOlder(false);
    }
  };

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || container.scrollTop > 80) return;
    loadOlderMessages();
  };

  useEffect(() => {
    setMessages([]);
    setHasMore(false);
    oldestMessageTimestampRef.current = null;
    loadLatestMessages();

    if (USE_WEBSOCKET) {
      const token = localStorage.getItem('access_token');
      const socket = new WebSocket(`${WS_URL}/chat/${chatId}/?token=${token}`);
      socketRef.current = socket;

      socket.onopen = () => console.log(`🟢 WebSocket чата ${chatId}`);
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type !== 'message') return;

        setMessages((prev) => {
          const nextMessages = mergeMessages(prev, [data.message], 'append');
          rememberOldestMessage(nextMessages);
          shouldScrollToBottomRef.current = data.message.sender_id === currentUserId || isNearBottom();
          return nextMessages;
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
      const interval = setInterval(loadLatestMessages, 2000);
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
      await loadLatestMessages();
    }

    setNewMessage('');
  };

  useEffect(() => {
    if (!shouldScrollToBottomRef.current) return;
    shouldScrollToBottomRef.current = false;
    requestAnimationFrame(() => scrollToBottom('smooth'));
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
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="flex-1 overflow-auto p-4 space-y-6 bg-gray-950"
      >
        {isLoadingOlder && (
          <div className="text-center text-xs text-gray-500">Загрузка истории...</div>
        )}
        {!hasMore && messages.length > 0 && (
          <div className="text-center text-xs text-gray-600">Начало переписки</div>
        )}
        {isInitialLoading && messages.length === 0 && (
          <div className="text-center text-sm text-gray-500 mt-10">Загрузка сообщений...</div>
        )}
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
