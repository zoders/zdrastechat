import { chatWindow } from '../../styles/ui';
import type { Message } from '../../types/chat';
import { formatMessageTimestamp } from '../../utils/formatMessageTimestamp';

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
          {formatMessageTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
