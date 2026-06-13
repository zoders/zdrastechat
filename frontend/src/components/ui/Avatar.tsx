import { cn } from '../../utils/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

const sizeClasses = {
  sm: 'w-9 h-9 text-base rounded-2xl',
  md: 'w-11 h-11 text-lg rounded-2xl',
  lg: 'w-16 h-16 text-2xl rounded-3xl',
};

interface AvatarProps {
  src?: string | null;
  label: string;
  size?: AvatarSize;
  className?: string;
}

export default function Avatar({
  src,
  label,
  size = 'sm',
  className,
}: AvatarProps) {
  return (
    <div className={cn('shrink-0 overflow-hidden bg-blue-500 flex items-center justify-center', sizeClasses[size], className)}>
      {src ? (
        <img src={src} alt={label} className="w-full h-full object-cover" />
      ) : (
        <span aria-hidden="true">👤</span>
      )}
    </div>
  );
}
