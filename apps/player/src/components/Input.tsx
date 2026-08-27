import * as React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightSlot?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, rightSlot, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-caption text-text-secondary block"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            id={inputId}
            className={cn(
              'bg-bg-surface-light text-text-base rounded-pill px-4 py-3 outline-none transition-all w-full',
              'focus:ring-1 focus:ring-white',
              error && 'ring-1 ring-text-negative',
              rightSlot && 'pr-12',
              className,
            )}
            ref={ref}
            {...props}
          />
          {rightSlot && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightSlot}
            </div>
          )}
        </div>
        {error && <p className="text-small text-text-negative">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
