import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
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
        <input
          type={type}
          id={inputId}
          className={cn(
            "bg-bg-surface-light text-text-base rounded-pill px-4 py-3 outline-none transition-all w-full",
            "focus:ring-1 focus:ring-white",
            error && "ring-1 ring-text-negative",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-small text-text-negative">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
