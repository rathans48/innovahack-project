import React from "react";

interface FileValidationBadgeProps {
  isValid: boolean;
  message?: string;
}

export default function FileValidationBadge({
  isValid,
  message,
}: FileValidationBadgeProps) {
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        isValid
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      <span
        className={`w-2 h-2 mr-2 rounded-full ${
          isValid ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {message || (isValid ? "Valid CSV File" : "Invalid File Format")}
    </div>
  );
}
