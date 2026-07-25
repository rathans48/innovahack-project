import React from "react";

interface LoadingSkeletonProps {
  className?: string;
}

export default function LoadingSkeleton({
  className = "h-24 w-full",
}: LoadingSkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
      aria-label="Loading..."
    />
  );
}
