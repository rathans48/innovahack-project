"use client";

import React, { useState, ChangeEvent } from "react";
import FileValidationBadge from "./FileValidationBadge";

interface UploadDropzoneProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export default function UploadDropzone({
  onFileUpload,
  isLoading = false,
}: UploadDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setValidationError("Please upload a valid .csv file.");
      setSelectedFile(null);
      return;
    }
    setValidationError(null);
    setSelectedFile(file);
    onFileUpload(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <div
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
      >
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Drag & drop your financial CSV file here, or browse
        </p>
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
          Browse File
          <input
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
            disabled={isLoading}
          />
        </label>
      </div>

      {selectedFile && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedFile.name}
          </span>
          <FileValidationBadge
            isValid={!validationError}
            message={validationError ?? undefined}
          />
        </div>
      )}
    </div>
  );
}
