import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        'border border-dashed border-bg-surface rounded-xl bg-bg-card/30',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-bg-surface">
          <Icon className="w-7 h-7 text-text-secondary" />
        </div>
      )}
      <h3 className="text-feature-heading font-semibold text-text-base">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-body-medium text-text-secondary max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
