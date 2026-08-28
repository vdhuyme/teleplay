import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ErrorStateProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  icon: Icon,
  title = 'Something went wrong',
  message,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        'border border-dashed border-red-500/20 rounded-xl bg-red-500/5',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10">
          <Icon className="w-7 h-7 text-red-500" />
        </div>
      )}
      <h3 className="text-feature-heading font-semibold text-red-500">
        {title}
      </h3>
      <p className="mt-1 text-body-medium text-text-secondary max-w-sm">
        {message}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
