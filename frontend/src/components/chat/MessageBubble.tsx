import { chatWindow } from '../../styles/ui';
import type { Message } from '../../types/chat';
import { formatMessageTimestamp } from '../../utils/formatMessageTimestamp';
import { resolveMediaUrl } from '../../utils/mediaUrl';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onImageOpen: (src: string, alt: string) => void;
}

export default function MessageBubble({ message, isOwn, onImageOpen }: MessageBubbleProps) {
  const imageUrl = resolveMediaUrl(message.attachment_url);

  return (
    <div className={chatWindow.messageRow(isOwn)}>
      <div className={chatWindow.messageBubble(isOwn)}>
        {imageUrl && (
          <button
            type="button"
            onClick={() => onImageOpen(imageUrl, 'Фото из сообщения')}
            className="mb-2 block overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Открыть фото"
          >
            <img src={imageUrl} alt="Фото из сообщения" className="max-h-64 w-full max-w-[72vw] object-cover sm:max-w-xs" />
          </button>
        )}
        {message.text && <div>{message.text}</div>}
        <div className="text-[10px] opacity-70 mt-1 text-right">
          {formatMessageTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
