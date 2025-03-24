import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { aiService } from "./services/ai-service";
import { Document, ExtractedData, AISuggestionRequest, AISuggestionResponse } from "../shared/schema";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "healthy" });
});

router.get("/documents", async (req: Request, res: Response) => {
  try {
    const documents = await storage.getDocuments();
    res.status(200).json(documents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/documents/:id", async (req: Request, res: Response) => {
  try {
    const document = await storage.getDocument(req.params.id);
    if (!document) return res.status(404).json({ error: "Document not found" });
    res.status(200).json(document);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/documents/upload", (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  // Handled in index.ts middleware
});

router.get("/documents/:id/download", async (req: Request, res: Response) => {
  try {
    const document = await storage.getDocument(req.params.id);
    if (!document) return res.status(404).json({ error: "Document not found" });
    res.download(path.join("uploads", document.path));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/documents/:id/data", async (req: Request, res: Response) => {
  try {
    const data = await storage.getExtractedData(req.params.id);
    if (!data) return res.status(404).json({ error: "Data not found" });
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/documents/:id/suggestions", async (req: Request, res: Response) => {
  try {
    const suggestions = await storage.getSuggestions(req.params.id);
    res.status(200).json(suggestions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/documents/:id/suggestions/generate", async (req: Request, res: Response) => {
  try {
    const document = await storage.getDocument(req.params.id);
    if (!document) return res.status(404).json({ error: "Document not found" });
    const extractedData = await storage.getExtractedData(req.params.id);
    if (!extractedData) return res.status(404).json({ error: "Extracted data not found" });

    const request: AISuggestionRequest = { documentId: req.params.id, extractedData: extractedData.data };
    const suggestions = await aiService.generateSuggestions(request);
    await storage.saveSuggestions(req.params.id, suggestions);
    res.status(201).json(suggestions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/suggestions/:id", async (req: Request, res: Response) => {
  try {
    const { apply } = req.body as { apply: boolean };
    await storage.updateSuggestionStatus(req.params.id, apply);
    res.status(200).json({ message: "Suggestion updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/config/ai", async (req: Request, res: Response) => {
  try {
    res.status(200).json({ apiKey: aiService.getApiKey() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/config/ai", async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body as { apiKey: string };
    aiService.setApiKey(apiKey);
    res.status(200).json({ message: "API key updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router };