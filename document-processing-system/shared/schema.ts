import { z } from "zod";

export type DocumentStatus = "pending" | "processed" | "needsReview" | "approved" | "rejected";

export interface Document {
  id: string;
  name: string;
  path: string;
  type: string;
  status: DocumentStatus;
  processedAt: Date;
  confidence: number;
}

export interface ExtractedData {
  id: string;
  documentId: string;
  data: {
    date: string;
    invoiceNumber: string;
    amount: string;
    vendor: string;
    confidenceScores: {
      date: number;
      invoiceNumber: number;
      amount: number;
      vendor: number;
    };
  };
}

export interface AISuggestion {
  field: string;
  currentValue: string;
  suggestion: string;
  confidence: number;
  reason: string;
}

export interface AISuggestionRequest {
  documentId: string;
  extractedData: ExtractedData["data"];
}

export interface AISuggestionResponse {
  documentId: string;
  suggestions: AISuggestion[];
}

// Zod schemas for validation
export const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  type: z.string(),
  status: z.nativeEnum(DocumentStatus),
  processedAt: z.date(),
  confidence: z.number().min(0).max(100),
});

export const extractedDataSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  data: z.object({
    date: z.string(),
    invoiceNumber: z.string(),
    amount: z.string(),
    vendor: z.string(),
    confidenceScores: z.object({
      date: z.number().min(0).max(100),
      invoiceNumber: z.number().min(0).max(100),
      amount: z.number().min(0).max(100),
      vendor: z.number().min(0).max(100),
    }),
  }),
});

export const aiSuggestionRequestSchema = z.object({
  documentId: z.string(),
  extractedData: extractedDataSchema.shape.data,
});

export const aiSuggestionSchema = z.object({
  field: z.string(),
  currentValue: z.string(),
  suggestion: z.string(),
  confidence: z.number().min(0).max(100),
  reason: z.string(),
});

export const aiSuggestionResponseSchema = z.object({
  documentId: z.string(),
  suggestions: z.array(aiSuggestionSchema),
});