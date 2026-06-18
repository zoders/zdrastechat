import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { sendChatPhoto } from '../api/chats';
import { WS_URL, USE_WEBSOCKET } from '../config';
import ChatHeader from './chat/ChatHeader';
import MessageBubble from './chat/MessageBubble';
import MessageComposer from './chat/MessageComposer';
import ImageViewer from './ui/ImageViewer';
import { chatWindow } from '../styles/ui';
import type { Message, MessagesPage } from '../types/chat';
import { getApiErrorMessage } from '../utils/apiError';

export default function ChatWindow({
  chatId,
  otherName,
  otherAvatarUrl,
  isSidebarOpen,
  toggleSidebar,
}: {
  chatId: string;
  otherName: string;
  otherAvatarUrl: string | null;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isHistoryStartVisible, setIsHistoryStartVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState<{ src: string; alt: string } | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const oldestMessageTimestampRef = useRef<string | null>(null);
  const shouldScrollToBottomRef = useRef(false);
  const scrollBehaviorRef = useRef<ScrollBehavior>('auto');
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

  const mergeMessages = (currentMessages: Message[], incomingMessages: Message[], mode: 'replace' | 'prepend' | 'append') => {
    const byId = new Map<string, Message>();

    const orderedMessages =
      mode === 'prepend'
        ? [...incomingMessages, ...currentMessages]
        : mode === 'append'
          ? [...currentMessages, ...incomingMessages]
          : incomingMessages;

    orderedMessages.forEach((message) => byId.set(message.id, message));
    return Array.from(byId.values());
  };

  const rememberOldestMessage = (nextMessages: Message[]) => {
    oldestMessageTimestampRef.current = nextMessages[0]?.timestamp ?? null;
  };

  const loadLatestMessages = async (scrollBehavior: ScrollBehavior = 'auto') => {
    setIsInitialLoading(true);
    setIsHistoryStartVisible(false);
    const { data } = await api.get<MessagesPage>(`/chats/${chatId}/messages/?limit=30`);
    setMessages(data.results);
    setHasMore(data.has_more);
    rememberOldestMessage(data.results);
    scrollBehaviorRef.current = scrollBehavior;
    shouldScrollToBottomRef.current = true;
    setIsInitialLoading(false);
  };

  const loadOlderMessages = async () => {
    if (!hasMore) {
      if (messages.length > 0) setIsHistoryStartVisible(true);
      return;
    }
    if (isLoadingOlderRef.current || !oldestMessageTimestampRef.current) return;

    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight ?? 0;
    const previousScrollTop = container?.scrollTop ?? 0;

    isLoadingOlderRef.current = true;
    setIsLoadingOlder(true);

    try {
      const before = encodeURIComponent(oldestMessageTimestampRef.current);
      const { data } = await api.get<MessagesPage>(`/chats/${chatId}/messages/?limit=30&before=${before}`);

      setMessages((prev) => {
        const nextMessages = mergeMessages(prev, data.results, 'prepend');
        rememberOldestMessage(nextMessages);
        return nextMessages;
      });
      setHasMore(data.has_more);
      setIsHistoryStartVisible(!data.has_more);

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
    setIsHistoryStartVisible(false);
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
          scrollBehaviorRef.current = 'smooth';
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
      await loadLatestMessages('smooth');
    }

    setNewMessage('');
  };

  const sendPhoto = async (file: File) => {
    try {
      const message = await sendChatPhoto(chatId, file);
      const socket = socketRef.current;

      if (!USE_WEBSOCKET || socket?.readyState !== WebSocket.OPEN) {
        setMessages((prev) => {
          const nextMessages = mergeMessages(prev, [message], 'append');
          rememberOldestMessage(nextMessages);
          scrollBehaviorRef.current = 'smooth';
          shouldScrollToBottomRef.current = true;
          return nextMessages;
        });
      }
    } catch (error) {
      alert(getApiErrorMessage(error, 'Не удалось отправить фото'));
    }
  };

  useEffect(() => {
    if (!shouldScrollToBottomRef.current) return;
    shouldScrollToBottomRef.current = false;
    requestAnimationFrame(() => scrollToBottom(scrollBehaviorRef.current));
  }, [messages]);

  return (
    <div className={chatWindow.root}>
      <ChatHeader
        otherName={otherName}
        otherAvatarUrl={otherAvatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        onAvatarOpen={(src, alt) => setViewerImage({ src, alt })}
      />

      {/* Сообщения */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className={chatWindow.messages}
      >
        {isLoadingOlder && (
          <div className={chatWindow.status}>Загрузка истории...</div>
        )}
        {isHistoryStartVisible && messages.length > 0 && (
          <div className={chatWindow.historyStart}>Начало переписки</div>
        )}
        {isInitialLoading && messages.length === 0 && (
          <div className={chatWindow.initialLoading}>Загрузка сообщений...</div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === currentUserId}
            onImageOpen={(src, alt) => setViewerImage({ src, alt })}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageComposer
        value={newMessage}
        onChange={setNewMessage}
        onSend={sendMessage}
        onPhotoSelect={sendPhoto}
      />
      <ImageViewer
        src={viewerImage?.src ?? null}
        alt={viewerImage?.alt ?? 'Фото'}
        onClose={() => setViewerImage(null)}
      />
    </div>
  );
}
