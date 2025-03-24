import { Pinecone } from "@pinecone-io/pinecone";

const pinecone = new Pinecone({
  environment: process.env.PINECONE_ENVIRONMENT || "your-environment",
  apiKey: process.env.PINECONE_API_KEY || "your-API-key",
});

export const index = pinecone.index("document-index");