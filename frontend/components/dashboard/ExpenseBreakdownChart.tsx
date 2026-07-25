import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ExpenseBreakdownItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ExpenseBreakdownChartProps {
  data: ExpenseBreakdownItem[];
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#64748b"];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: ExpenseBreakdownItem }[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm">
      <p className="font-semibold text-gray-900 dark:text-gray-100">
        {item.category}
      </p>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Amount: {formatCurrency(item.amount)}
      </p>
      <p className="text-gray-600 dark:text-gray-400">
        Share: {item.percentage.toFixed(1)}%
      </p>
    </div>
  );
}

export default function ExpenseBreakdownChart({
  data,
}: ExpenseBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Expense Breakdown
        </h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-sm text-gray-500">No expense data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Expense Breakdown
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {data.map((item, idx) => (
          <div key={item.category} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-gray-600 dark:text-gray-400 truncate">
              {item.category}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100 ml-auto">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}