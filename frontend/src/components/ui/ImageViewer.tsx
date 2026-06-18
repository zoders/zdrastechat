import { useEffect, useState } from 'react';

interface ImageViewerProps {
  src: string | null;
  alt: string;
  onClose: () => void;
}

export default function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!src) return;

    setScale(1);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white">
      <div className="mobile-safe-top flex items-center justify-between gap-3 p-3">
        <div className="text-sm text-gray-300 truncate">{alt}</div>
        <button
          type="button"
          onClick={onClose}
          className="tap-target rounded-2xl bg-white/10 px-4 text-sm hover:bg-white/20"
          aria-label="Закрыть просмотр"
        >
          Закрыть
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain p-3 flex items-center justify-center">
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain transition-transform"
          style={{ transform: `scale(${scale})` }}
          onDoubleClick={() => setScale((current) => (current === 1 ? 2 : 1))}
        />
      </div>

      <div className="mobile-safe-bottom flex items-center justify-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setScale((current) => Math.max(1, current - 0.25))}
          className="tap-target rounded-2xl bg-white/10 px-4 hover:bg-white/20"
          aria-label="Уменьшить"
        >
          ➖
        </button>
        <div className="w-16 text-center text-sm text-gray-300">{Math.round(scale * 100)}%</div>
        <button
          type="button"
          onClick={() => setScale((current) => Math.min(4, current + 0.25))}
          className="tap-target rounded-2xl bg-white/10 px-4 hover:bg-white/20"
          aria-label="Увеличить"
        >
          ➕
        </button>
      </div>
    </div>
  );
}
