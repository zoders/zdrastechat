import { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { useNavigate } from 'react-router-dom';
import IconButton from '../components/ui/IconButton';
import useAppViewport from '../hooks/useAppViewport';
import { chatLayout } from '../styles/ui';

export default function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedOtherName, setSelectedOtherName] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isMobile } = useAppViewport();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const handleChatSelect = (chatId: string, otherName: string) => {
    setSelectedChatId(chatId);
    setSelectedOtherName(otherName);
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <div className={chatLayout.shell}>
      {/* Список чатов */}
      <div className={chatLayout.sidebar(isSidebarOpen)}>
        <div className={chatLayout.sidebarHeader}>
          <h1 className="text-xl font-bold text-blue-400 truncate">ZdrasteChat</h1>
          <IconButton
            onClick={handleLogout}
            label="Выйти"
            title="Выйти"
            variant="subtle"
            className="text-sm px-3"
          >
            🚪
          </IconButton>
        </div>

        <ChatList 
          onChatSelect={handleChatSelect} 
          selectedChatId={selectedChatId} 
        />
      </div>

      {/* Окно чата */}
      <div className={chatLayout.main}>
        {selectedChatId ? (
          <ChatWindow 
            chatId={selectedChatId} 
            otherName={selectedOtherName}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        ) : (
          <div className={chatLayout.empty}>
            <p className="text-xl">Выберите чат</p>
            <p className="text-sm text-gray-600 mt-2">или начните новый</p>
            {isMobile && (
              <IconButton
                onClick={() => setIsSidebarOpen(true)}
                label="Открыть список чатов"
                variant="primary"
                className="mt-5 px-5"
              >
                💬 Чаты
              </IconButton>
            )}
          </div>
        )}
      </div>

      {/* Затемнение на мобильных */}
      {isSidebarOpen && isMobile && (
        <div 
          className={chatLayout.mobileOverlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
