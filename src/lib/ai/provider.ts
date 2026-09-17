import { AIProvider } from "@/types/ai";
import { UnifiedAIWrapper } from "./wrapper";

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  // Retorna uma instância do UnifiedAIWrapper que gerencia Groq, Gemini, OpenAI e Mock
  if (!cachedProvider) {
    cachedProvider = new UnifiedAIWrapper();
  }
  return cachedProvider;
}
