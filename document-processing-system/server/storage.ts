import { Document, ExtractedData, AISuggestion, DocumentStatus } from "../shared/schema";
import path from "path";
import fs from "fs";

export class Storage {
  private documents: Map<string, Document> = new Map();
  private extractedData: Map<string, ExtractedData> = new Map();
  private suggestions: Map<string, AISuggestionResponse> = new Map();

  initialize(): void {
    // Initialize storage (e.g., load from disk if needed)
  }

  async createDocument(document: Omit<Document, "id">): Promise<Document> {
    const id = Date.now().toString();
    const newDocument: Document = { ...document, id, status: "pending", processedAt: new Date(), confidence: Math.floor(Math.random() * 30) + 70 };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.documents.get(id) || null;
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    const document = this.documents.get(id);
    if (!document) throw new Error("Document not found");
    this.documents.set(id, { ...document, ...updates });
  }

  async createExtractedData(data: Omit<ExtractedData, "id">): Promise<ExtractedData> {
    const id = Date.now().toString();
    const newData: ExtractedData = { ...data, id };
    this.extractedData.set(id, newData);
    return newData;
  }

  async getExtractedData(documentId: string): Promise<ExtractedData | null> {
    return Array.from(this.extractedData.values()).find(data => data.documentId === documentId) || null;
  }

  async saveSuggestions(documentId: string, suggestions: AISuggestionResponse): Promise<void> {
    this.suggestions.set(documentId, suggestions);
  }

  async getSuggestions(documentId: string): Promise<AISuggestionResponse | null> {
    return this.suggestions.get(documentId) || null;
  }

  async updateSuggestionStatus(suggestionId: string, apply: boolean): Promise<void> {
    // Logic to apply or unapply suggestions (simplified for MVP)
    console.log(`Suggestion ${suggestionId} ${apply ? "applied" : "unapplied"}`);
  }
}

export const storage = new Storage();