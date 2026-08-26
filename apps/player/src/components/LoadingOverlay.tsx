import { cn } from "@/utils/cn";

interface LoadingOverlayProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

export function LoadingOverlay({
  className,
  size = "md",
}: LoadingOverlayProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <span
        className={cn(
          "animate-spin rounded-full border-spotify-green border-t-transparent",
          sizeMap[size],
        )}
      />
    </div>
  );
}
