export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string | null;
}

export interface AnalyzeRequest {
  company_name: string;
  currency: string;
  transactions: Transaction[];
}

export interface ExpenseBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrendItem {
  month: string;
  revenue: number;
  expense: number;
  net: number;
}

export interface ExpenseSpike {
  category: string;
  month: string;
  amount: number;
  prior_avg: number;
  pct_increase: number;
}

export interface Metrics {
  current_balance: number;
  monthly_revenue_avg: number;
  monthly_expense_avg: number;
  net_cashflow_avg: number;
  burn_rate_monthly: number;
  runway_days: number | null;
  runway_status: "healthy" | "warning" | "critical";
  expense_breakdown: ExpenseBreakdownItem[];
  monthly_trend: MonthlyTrendItem[];
  expense_spikes: ExpenseSpike[];
}

export interface Alert {
  severity: "high" | "medium" | "low";
  title: string;
  message: string;
}

export interface AIAdvisory {
  health_score: number;
  executive_summary: string;
  alerts: Alert[];
  actionable_recommendations: [string, string, string];
}

export interface Meta {
  analysis_period: {
    start: string;
    end: string;
  };
  transaction_count: number;
}

export interface AnalysisResponse {
  metrics: Metrics;
  ai_advisory: AIAdvisory;
  meta: Meta;
}