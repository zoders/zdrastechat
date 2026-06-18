import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import IconButton from '../ui/IconButton';
import TextInput from '../ui/TextInput';
import { chatWindow } from '../../styles/ui';

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onPhotoSelect: (file: File) => void;
}

export default function MessageComposer({
  value,
  onChange,
  onSend,
  onPhotoSelect,
}: MessageComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onPhotoSelect(file);
  };

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
        onClick={() => fileInputRef.current?.click()}
        label="Прикрепить фото"
        title="Прикрепить фото"
        variant="subtle"
        className="px-4 sm:px-5 rounded-3xl"
      >
        🖼️
      </IconButton>
      <IconButton
        onClick={onSend}
        label="Отправить сообщение"
        title="Отправить"
        variant="primary"
        className="px-4 sm:px-6 rounded-3xl"
      >
        📤
      </IconButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
