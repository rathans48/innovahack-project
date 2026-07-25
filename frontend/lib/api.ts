import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AnalyzeRequest, AnalysisResponse } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: AxiosError) => Promise.reject(error)
);

export async function analyzeCashflow(payload: AnalyzeRequest): Promise<AnalysisResponse> {
  try {
    const response = await api.post<AnalysisResponse>("/api/analyze-cashflow", payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { detail?: unknown };
      let message: string;

      if (typeof data?.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data?.detail)) {
        // FastAPI/Pydantic validation error shape: [{ loc, msg, type }, ...]
        message = data.detail
          .map((e: any) => (typeof e === "string" ? e : e?.msg ?? JSON.stringify(e)))
          .join("; ");
      } else {
        message = error.message ?? "Failed to analyze cashflow";
      }

      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
}

export { api };