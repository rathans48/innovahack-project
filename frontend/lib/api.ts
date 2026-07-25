import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AnalyzeRequest, AnalysisResponse } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: AxiosError) => Promise.reject(error)
);

export async function analyzeCashflow(
  payload: AnalyzeRequest
): Promise<AnalysisResponse> {
  try {
    const response = await api.post<AnalysisResponse>(
      "/api/analyze-cashflow",
      payload
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { detail?: string })?.detail ??
        error.message ??
        "Failed to analyze cashflow";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
}

export { api };