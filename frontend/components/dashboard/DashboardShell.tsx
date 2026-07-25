import React from "react";
import { AnalysisResponse } from "@/lib/types";
import MetricSummaryCards from "./MetricSummaryCards";
import CashflowTrendChart from "./CashflowTrendChart";
import ExpenseBreakdownChart from "./ExpenseBreakdownChart";
import SpikeAlertBanner from "./SpikeAlertBanner";
import AIAdvisoryFeed from "./AIAdvisoryFeed";

interface DashboardShellProps {
  data: AnalysisResponse;
  onReset?: () => void;
}

export default function DashboardShell({
  data,
  onReset,
}: DashboardShellProps) {
  const { metrics, ai_advisory, meta } = data;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Financial Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            SMB Pulse real-time financial metrics and AI advisory.
            <span className="ml-2 text-xs text-gray-400">
              ({meta.transaction_count} transactions)
            </span>
          </p>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded font-medium transition"
          >
            Upload New File
          </button>
        )}
      </div>

      <SpikeAlertBanner spikes={metrics.expense_spikes} />

      <MetricSummaryCards
        metrics={metrics}
        healthScore={ai_advisory.health_score}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashflowTrendChart data={metrics.monthly_trend} />
        <ExpenseBreakdownChart data={metrics.expense_breakdown} />
      </div>

      <AIAdvisoryFeed advisory={ai_advisory} />
    </div>
  );
}