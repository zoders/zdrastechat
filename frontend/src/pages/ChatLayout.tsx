import { useEffect, useState } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { useNavigate } from 'react-router-dom';

export default function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedOtherName, setSelectedOtherName] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateViewport = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`);
      setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('resize', updateViewport);
    };
  }, []);

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
    <div className="app-shell flex bg-gray-950 text-white overflow-hidden">
      {/* Список чатов */}
      <div
        className={`border-r border-gray-800 flex flex-col transition-all duration-300
          ${isSidebarOpen 
            ? 'w-[86vw] max-w-80 md:w-80'
            : 'w-0 md:w-80 overflow-hidden'}
          md:relative fixed inset-y-0 left-0 z-50 bg-gray-900 md:bg-transparent`}
      >
        <div className="mobile-safe-top p-3 border-b border-gray-800 flex items-center justify-between gap-3 bg-gray-900">
          <h1 className="text-xl font-bold text-blue-400 truncate">ZdrasteChat</h1>
          <button
            onClick={handleLogout}
            className="tap-target inline-flex items-center justify-center shrink-0 text-sm px-3 bg-gray-800 hover:bg-gray-700 rounded-2xl"
            aria-label="Выйти"
            title="Выйти"
          >
            🚪
          </button>
        </div>

        <ChatList 
          onChatSelect={handleChatSelect} 
          selectedChatId={selectedChatId} 
        />
      </div>

      {/* Окно чата */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {selectedChatId ? (
          <ChatWindow 
            chatId={selectedChatId} 
            otherName={selectedOtherName}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 flex-col px-6 text-center">
            <p className="text-xl">Выберите чат</p>
            <p className="text-sm text-gray-600 mt-2">или начните новый</p>
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="tap-target inline-flex items-center justify-center mt-5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl"
              >
                💬 Чаты
              </button>
            )}
          </div>
        )}
      </div>

      {/* Затемнение на мобильных */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
