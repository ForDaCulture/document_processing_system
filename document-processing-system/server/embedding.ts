import { Configuration, OpenAIApi } from "openai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || "your-openai-key",
});
const openai = new OpenAIApi(config);

export async function embedText(text: string): Promise<number[]> {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data.data[0].embedding;
  } catch (error: any) {
    throw new Error(`Embedding failed: ${error.message}`);
  }
}