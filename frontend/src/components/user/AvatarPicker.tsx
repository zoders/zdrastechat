import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { deleteAvatar, uploadAvatar } from '../../api/users';
import type { UserProfile } from '../../types/user';
import Avatar from '../ui/Avatar';
import IconButton from '../ui/IconButton';

interface AvatarPickerProps {
  user: UserProfile | null;
  onUserChange: (user: UserProfile) => void;
}

export default function AvatarPicker({ user, onUserChange }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsSaving(true);
    try {
      const updatedUser = await uploadAvatar(file);
      onUserChange(updatedUser);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.avatar_url) return;

    setIsSaving(true);
    try {
      await deleteAvatar();
      onUserChange({ ...user, avatar_url: null });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Сменить аватарку"
        title="Сменить аватарку"
        disabled={isSaving}
      >
        <Avatar src={user?.avatar_url} label="Моя аватарка" />
      </button>
      {user?.avatar_url && (
        <IconButton
          onClick={handleDelete}
          label="Удалить аватарку"
          title="Удалить аватарку"
          variant="subtle"
          className="text-xs"
          disabled={isSaving}
        >
          🗑️
        </IconButton>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
