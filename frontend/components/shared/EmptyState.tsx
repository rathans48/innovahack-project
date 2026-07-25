import React from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = "No Data Available",
  description = "Please upload a CSV file to generate financial insights.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 rounded-lg my-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
