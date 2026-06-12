import { chatWindow } from '../../styles/ui';
import type { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={chatWindow.messageRow(isOwn)}>
      <div className={chatWindow.messageBubble(isOwn)}>
        <div>{message.text}</div>
        <div className="text-[10px] opacity-70 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
