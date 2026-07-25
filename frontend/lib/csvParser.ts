import Papa from "papaparse";
import { Transaction } from "./types";

export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvParseError";
  }
}

const DATE_ALIASES = [
  "date",
  "txn date",
  "value date",
  "transaction date",
  "posting date",
  "trade date",
];
const DESCRIPTION_ALIASES = [
  "description",
  "narration",
  "particulars",
  "memo",
  "details",
  "transaction details",
];
const AMOUNT_ALIASES = ["amount", "txn amount", "transaction amount"];
const DEBIT_ALIASES = ["debit", "withdrawal", "withdrawals", "dr", "debit amount"];
const CREDIT_ALIASES = ["credit", "deposit", "deposits", "cr", "credit amount"];
const CATEGORY_ALIASES = ["category", "categories", "type", "classification"];

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s_]+/g, " ");
}

function findColumn(headers: string[], aliases: string[]): string | null {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias.toLowerCase());
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parseDate(value: string): string {
  const cleaned = value.trim().replace(/[/]/g, "-");
  const parts = cleaned.split(/[-T]/);

  if (parts.length >= 3) {
    // ISO format: YYYY-MM-DD
    if (parts[0].length === 4) {
      const year = parts[0];
      const month = parts[1].padStart(2, "0");
      const day = parts[2].padStart(2, "0");
      assertValidDate(year, month, day, value);
      return `${year}-${month}-${day}`;
    }

    // Ambiguous DD/MM/YYYY vs MM/DD/YYYY — disambiguate using the >12 rule
    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);
    const year = parts[2];

    let day: number, month: number;
    if (first > 12 && second <= 12) {
      day = first; month = second;             // must be DD-MM
    } else if (second > 12 && first <= 12) {
      day = second; month = first;             // must be MM-DD
    } else {
      day = first; month = second;             // genuinely ambiguous — default DD-MM
    }

    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    assertValidDate(year, monthStr, dayStr, value);
    return `${year}-${monthStr}-${dayStr}`;
  }

  const date = new Date(cleaned);
  if (isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
  return date.toISOString().split("T")[0];
}

function assertValidDate(year: string, month: string, day: string, original: string): void {
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    throw new Error(`Invalid date: "${original}" resolved to an impossible date (${year}-${month}-${day})`);
  }
}

function parseAmount(value: string): number {
  const cleaned = value
    .replace(/[$,]/g, "")
    .replace(/\((.*)\)/, "-$1")
    .trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) throw new Error(`Invalid amount: ${value}`);
  return num;
}

export async function parseCsvFile(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(
            new CsvParseError(
              `CSV parse errors: ${results.errors
                .map((e) => e.message)
                .join("; ")}`
            )
          );
          return;
        }

        const rows = results.data as Record<string, string>[];
        if (rows.length === 0) {
          reject(new CsvParseError("No data rows found in CSV"));
          return;
        }

        const headers = results.meta.fields || [];
        const foundHeaders = headers.join(", ");

        const dateCol = findColumn(headers, DATE_ALIASES);
        const descCol = findColumn(headers, DESCRIPTION_ALIASES);
        const amountCol = findColumn(headers, AMOUNT_ALIASES);
        const debitCol = findColumn(headers, DEBIT_ALIASES);
        const creditCol = findColumn(headers, CREDIT_ALIASES);
        const categoryCol = findColumn(headers, CATEGORY_ALIASES);

        const hasSingleAmount = !!amountCol;
        const hasDebitCredit = !!debitCol && !!creditCol;

        if (!dateCol || !descCol || (!hasSingleAmount && !hasDebitCredit)) {
          reject(
            new CsvParseError(
              `Required columns not found. Headers present: ${foundHeaders}. ` +
                `Detected: date="${dateCol}", description="${descCol}", ` +
                `amount="${amountCol}", debit="${debitCol}", credit="${creditCol}"`
            )
          );
          return;
        }

        const transactions: Transaction[] = [];

        for (const row of rows) {
          try {
            const date = parseDate(row[dateCol]);
            const description = row[descCol]?.trim() || "Unknown";

            let amount: number;
            if (hasSingleAmount) {
              amount = parseAmount(row[amountCol] || "0");
            } else {
              const debit = row[debitCol!] ? parseAmount(row[debitCol!]) : 0;
              const credit = row[creditCol!] ? parseAmount(row[creditCol!]) : 0;
              amount = credit - debit;
            }

            const category = categoryCol
              ? row[categoryCol]?.trim() || null
              : null;

            transactions.push({ date, description, amount, category });
          } catch (err) {
            reject(
              new CsvParseError(
                `Failed to parse row: ${
                  err instanceof Error ? err.message : String(err)
                }`
              )
            );
            return;
          }
        }

        resolve(transactions);
      },
      error: (err: Error) => {
        reject(new CsvParseError(`PapaParse error: ${err.message}`));
      },
    });
  });
}

export function validateTransactions(transactions: Transaction[]): void {
  if (transactions.length < 3) {
    throw new CsvParseError(
      `Insufficient transactions: ${transactions.length} rows parsed, minimum 3 required`
    );
  }
}