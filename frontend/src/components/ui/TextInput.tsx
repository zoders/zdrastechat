import type { InputHTMLAttributes } from 'react';
import { input } from '../../styles/ui';
import { cn } from '../../utils/cn';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  shape?: 'rounded' | 'pill';
}

export default function TextInput({
  shape = 'rounded',
  className,
  ...props
}: TextInputProps) {
  return (
    <input
      {...props}
      className={cn(input.base, input[shape], className)}
    />
  );
}
