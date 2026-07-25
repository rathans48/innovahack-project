import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MonthlyTrendItem } from "@/lib/types";
import { formatCurrency, abbreviateINR } from "@/lib/utils";

interface CashflowTrendChartProps {
  data: MonthlyTrendItem[];
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 dark:text-gray-400 capitalize">
            {entry.name}:
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CashflowTrendChart({ data }: CashflowTrendChartProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Monthly Cashflow Trend
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={abbreviateINR}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            fill="url(#revenueGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            fill="url(#expenseGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="net"
            stroke="#3b82f6"
            fill="none"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-1 text-xs">
        {data.slice(-3).map((item) => (
          <div key={item.month} className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {item.month}
            </span>
            <span className="font-medium">
              Rev: {formatCurrency(item.revenue)} / Exp:{" "}
              {formatCurrency(item.expense)} / Net:{" "}
              <span
                className={
                  item.net >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {formatCurrency(item.net)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}