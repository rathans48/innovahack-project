import React from "react";
import { AIAdvisory, Alert } from "@/lib/types";

interface AIAdvisoryFeedProps {
  advisory: AIAdvisory;
}

function severityStyle(severity: Alert["severity"]): string {
  switch (severity) {
    case "high":
      return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
    case "medium":
      return "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300";
    default:
      return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300";
  }
}

export default function AIAdvisoryFeed({ advisory }: AIAdvisoryFeedProps) {
  const {
    executive_summary,
    alerts,
    actionable_recommendations,
  } = advisory;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">
        AI Insights & Recommendations
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {executive_summary}
      </p>

      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Alerts
          </h4>
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3 rounded border ${severityStyle(alert.severity)}`}
            >
              <p className="text-sm font-medium">{alert.title}</p>
              <p className="text-xs mt-1">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Actionable Recommendations
        </h4>
        <ul className="space-y-2">
          {actionable_recommendations.map((rec, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <svg
                className="w-4 h-4 mt-0.5 text-green-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}