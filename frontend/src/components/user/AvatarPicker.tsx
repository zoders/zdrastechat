import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { deleteAvatar, uploadAvatar } from '../../api/users';
import type { UserProfile } from '../../types/user';
import { getApiErrorMessage } from '../../utils/apiError';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import Avatar from '../ui/Avatar';
import IconButton from '../ui/IconButton';
import ImageViewer from '../ui/ImageViewer';

interface AvatarPickerProps {
  user: UserProfile | null;
  onUserChange: (user: UserProfile) => void;
}

export default function AvatarPicker({ user, onUserChange }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const avatarUrl = resolveMediaUrl(user?.avatar_url);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setIsSaving(true);
    try {
      const updatedUser = await uploadAvatar(file);
      onUserChange(updatedUser);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Не удалось загрузить аватарку'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.avatar_url) return;

    setError('');
    setIsSaving(true);
    try {
      await deleteAvatar();
      onUserChange({ ...user, avatar_url: null });
    } catch (error) {
      setError(getApiErrorMessage(error, 'Не удалось удалить аватарку'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setError('');
            if (avatarUrl) {
              setViewerSrc(avatarUrl);
            } else {
              inputRef.current?.click();
            }
          }}
          className="rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          aria-label="Сменить аватарку"
          title="Сменить аватарку"
          disabled={isSaving}
        >
          <Avatar src={avatarUrl} label="Моя аватарка" />
        </button>
        <IconButton
          onClick={() => {
            setError('');
            inputRef.current?.click();
          }}
          label="Выбрать аватарку"
          title="Выбрать аватарку"
          variant="subtle"
          className="text-xs"
          disabled={isSaving}
        >
          🖼️
        </IconButton>
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
        {isSaving && (
          <div className="text-xs text-gray-400">...</div>
        )}
      </div>
      {error && (
        <div className="absolute left-0 top-full z-[60] mt-2 w-64 rounded-2xl border border-red-900/60 bg-red-950/95 px-3 py-2 text-xs leading-relaxed text-red-100 shadow-xl">
          <div className="flex items-start gap-2">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <ImageViewer
        src={viewerSrc}
        alt="Моя аватарка"
        onClose={() => setViewerSrc(null)}
      />
    </div>
  );
}
