import { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { useNavigate } from 'react-router-dom';

export default function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedOtherName, setSelectedOtherName] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const handleChatSelect = (chatId: string, otherName: string) => {
    setSelectedChatId(chatId);
    setSelectedOtherName(otherName);
    // На мобильных после выбора чата закрываем список
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Список чатов */}
      <div
        className={`border-r border-gray-800 flex flex-col transition-all duration-300 
          ${isSidebarOpen 
            ? 'w-80 md:w-80' 
            : 'w-0 md:w-80 overflow-hidden'} 
          md:relative fixed inset-y-0 left-0 z-50 bg-gray-900 md:bg-transparent`}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900">
          <h1 className="text-2xl font-bold text-blue-400">ZdrasteChat</h1>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-2xl"
          >
            Выйти
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
          <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
            <p className="text-xl">Выберите чат слева</p>
            <p className="text-sm text-gray-600 mt-2">или начните новый</p>
          </div>
        )}
      </div>

      {/* Затемнение на мобильных */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}