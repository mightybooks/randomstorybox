// /lib/errors.ts
export type ECode =
  | "BAD_REQUEST"
  | "VALIDATION_FAILED"
  | "TIMEOUT"
  | "NETWORK"
  | "SERVER"
  | "UNKNOWN";

export class AppError extends Error {
  code: ECode;
  status?: number;
  constructor(code: ECode, message: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const mapStatus = (s: number): ECode =>
  s === 400 ? "BAD_REQUEST"
: s === 422 ? "VALIDATION_FAILED"
: s === 429 ? "SERVER"
: s >= 500 ? "SERVER"
: "UNKNOWN";
