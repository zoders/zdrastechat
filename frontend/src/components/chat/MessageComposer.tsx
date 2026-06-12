import IconButton from '../ui/IconButton';
import TextInput from '../ui/TextInput';
import { chatWindow } from '../../styles/ui';

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export default function MessageComposer({
  value,
  onChange,
  onSend,
}: MessageComposerProps) {
  return (
    <div className={chatWindow.composer}>
      <TextInput
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && onSend()}
        placeholder="Сообщение..."
        shape="pill"
        className="flex-1 sm:px-6"
      />
      <IconButton
        onClick={onSend}
        label="Отправить сообщение"
        title="Отправить"
        variant="primary"
        className="px-4 sm:px-6 rounded-3xl"
      >
        📤
      </IconButton>
    </div>
  );
}
