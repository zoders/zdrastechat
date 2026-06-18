import IconButton from '../ui/IconButton';
import Avatar from '../ui/Avatar';
import { chatWindow } from '../../styles/ui';
import { resolveMediaUrl } from '../../utils/mediaUrl';

interface ChatHeaderProps {
  otherName: string;
  otherAvatarUrl: string | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onAvatarOpen: (src: string, alt: string) => void;
}

export default function ChatHeader({
  otherName,
  otherAvatarUrl,
  isSidebarOpen,
  onToggleSidebar,
  onAvatarOpen,
}: ChatHeaderProps) {
  const desktopLabel = isSidebarOpen ? 'Скрыть список чатов' : 'Показать список чатов';
  const avatarUrl = resolveMediaUrl(otherAvatarUrl);

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
        {isSidebarOpen ? '⬅️' : '➡️'}
      </IconButton>

      <div className={chatWindow.user}>
        <button
          type="button"
          onClick={() => avatarUrl && onAvatarOpen(avatarUrl, `@${otherName}`)}
          disabled={!avatarUrl}
          className="rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-default"
          aria-label="Открыть аватарку"
        >
          <Avatar src={avatarUrl} label={`@${otherName}`} className={chatWindow.avatar} />
        </button>
        <div className="font-semibold truncate">@{otherName}</div>
      </div>
    </div>
  );
}
