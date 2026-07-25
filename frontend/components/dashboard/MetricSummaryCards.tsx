import React from "react";
import { Metrics } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface MetricSummaryCardsProps {
  metrics: Metrics;
  healthScore: number;
}

export default function MetricSummaryCards({
  metrics,
  healthScore,
}: MetricSummaryCardsProps) {
  const runwayDisplay =
    metrics.runway_days === null
      ? "Healthy"
      : metrics.runway_days <= 0
      ? "Critical"
      : `${metrics.runway_days} days`;

  const runwayColor =
    metrics.runway_status === "healthy"
      ? "text-green-600"
      : metrics.runway_status === "warning"
      ? "text-amber-600"
      : "text-red-600";

  const healthColor =
    healthScore >= 70
      ? "text-green-600"
      : healthScore >= 40
      ? "text-amber-600"
      : "text-red-600";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          Burn Rate
        </p>
        <p className="text-2xl font-bold mt-1 text-amber-600">
          {formatCurrency(metrics.burn_rate_monthly)}
        </p>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Runway</p>
        <p className={`text-2xl font-bold mt-1 ${runwayColor}`}>
          {runwayDisplay}
        </p>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          Net Cashflow
        </p>
        <p
          className={`text-2xl font-bold mt-1 ${
            metrics.net_cashflow_avg >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatCurrency(metrics.net_cashflow_avg)}
        </p>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          Health Score
        </p>
        <p className={`text-2xl font-bold mt-1 ${healthColor}`}>
          {healthScore}/100
        </p>
      </div>
    </div>
  );
}