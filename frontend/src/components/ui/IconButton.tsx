import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { iconButton } from '../../styles/ui';
import { cn } from '../../utils/cn';

type IconButtonVariant = 'ghost' | 'subtle' | 'primary' | 'success';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: IconButtonVariant;
  children: ReactNode;
}

export default function IconButton({
  label,
  variant = 'ghost',
  children,
  className,
  title,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      aria-label={label}
      title={title ?? label}
      className={cn(iconButton.base, iconButton[variant], className)}
    >
      {children}
    </button>
  );
}
