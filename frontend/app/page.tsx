"use client";

import React, { useState } from "react";
import UploadDropzone from "@/components/upload/UploadDropzone";
import DashboardShell from "@/components/dashboard/DashboardShell";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { parseCsvFile, validateTransactions } from "@/lib/csvParser";
import { analyzeCashflow } from "@/lib/api";
import { Transaction, AnalyzeRequest, AnalysisResponse } from "@/lib/types";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(
    null
  );

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseCsvFile(file);
      validateTransactions(parsed);
      setTransactions(parsed);

      const payload: AnalyzeRequest = {
        company_name: "My Business",
        currency: "INR",
        transactions: parsed,
      };

      const result = await analyzeCashflow(payload);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTransactions(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          SMB Pulse
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Smart Financial Monitoring & AI Insights
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4 max-w-2xl mx-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
            Analyzing your data... this may take up to a minute on first load. Free-tier hosting.
          </p>
          <LoadingSkeleton className="h-12 w-full" />
          <LoadingSkeleton className="h-48 w-full" />
        </div>
      ) : analysisResult ? (
        <DashboardShell data={analysisResult} onReset={handleReset} />
      ) : (
        <UploadDropzone onFileUpload={handleFileUpload} isLoading={loading} />
      )}
    </main>
  );
}