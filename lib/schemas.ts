import { z } from "zod";

export const GenerateRequest = z.object({
  prompt: z.string().min(10),
  style: z.enum(["byungmat", "msr", "king", "ephron"]),
  words: z.array(z.string().min(1)).length(5),
});
export type GenerateRequest = z.infer<typeof GenerateRequest>;

export const GenerateResponse = z.object({
  result: z.string().min(30),
  meta: z.object({ durationMs: z.number().int().optional(), model: z.string().optional() }).optional(),
});
export type GenerateResponse = z.infer<typeof GenerateResponse>;

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
  s === 400 ? "BAD_REQUEST" : s === 422 ? "VALIDATION_FAILED" : s === 429 ? "SERVER" : s >= 500 ? "SERVER" : "UNKNOWN";
