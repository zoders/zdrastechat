import IconButton from '../ui/IconButton';
import { chatWindow } from '../../styles/ui';

interface ChatHeaderProps {
  otherName: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function ChatHeader({
  otherName,
  isSidebarOpen,
  onToggleSidebar,
}: ChatHeaderProps) {
  const desktopLabel = isSidebarOpen ? 'Скрыть список чатов' : 'Показать список чатов';

  return (
    <div className={chatWindow.header}>
      <IconButton
        onClick={onToggleSidebar}
        label="Открыть список чатов"
        title="Чаты"
        className="md:hidden mr-2 text-xl"
      >
        💬
      </IconButton>

      <IconButton
        onClick={onToggleSidebar}
        label={desktopLabel}
        title={desktopLabel}
        className="hidden md:flex text-lg"
      >
        {isSidebarOpen ? '📕' : '📖'}
      </IconButton>

      <div className={chatWindow.user}>
        <div className={chatWindow.avatar}>👤</div>
        <div className="font-semibold truncate">@{otherName}</div>
      </div>
    </div>
  );
}
