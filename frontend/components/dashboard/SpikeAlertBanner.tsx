import React from "react";
import { ExpenseSpike } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SpikeAlertBannerProps {
  spikes: ExpenseSpike[];
}

export default function SpikeAlertBanner({ spikes }: SpikeAlertBannerProps) {
  if (spikes.length === 0) return null;

  return (
    <div className="my-4 space-y-2">
      {spikes.map((spike, idx) => (
        <div
          key={idx}
          className="p-4 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 rounded-r shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">
              Expense Spike: {spike.category} ({spike.month})
            </span>
            <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded font-bold">
              +{spike.pct_increase.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs mt-1">
            Amount: {formatCurrency(spike.amount)} (Prior avg:{" "}
            {formatCurrency(spike.prior_avg)})
          </p>
        </div>
      ))}
    </div>
  );
}