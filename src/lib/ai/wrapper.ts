import { AIInterpretationRequest, AIInterpretationResponse, AIProvider } from "@/types/ai";
import { GroqAIProvider } from "./groq";
import { GeminiAIProvider } from "./gemini";
import { OpenAIAIProvider } from "./openai";
import { MockAIProvider } from "./mock";

export class UnifiedAIWrapper implements AIProvider {
  name: string;
  private providers: AIProvider[] = [];

  constructor() {
    this.initializeProviders();
    const primary = this.providers[0]?.name || "Mock Heuristic";
    this.name = `Unified Wrapper [Primário: ${primary}]`;
  }

  private initializeProviders() {
    const configuredProvider = (process.env.AI_PROVIDER || "").toLowerCase().trim();

    const groqKey = process.env.GROQ_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const openrouterKey = process.env.OPENROUTER_API_KEY?.trim();

    const available: Record<string, AIProvider> = {};

    if (groqKey) {
      const groqModel = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
      available.groq = new GroqAIProvider(groqKey, groqModel);
    }

    if (geminiKey) {
      const geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";
      available.gemini = new GeminiAIProvider(geminiKey, geminiModel);
    }

    if (openaiKey) {
      const openaiModel = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
      const openaiBaseUrl = process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1";
      available.openai = new OpenAIAIProvider(openaiKey, openaiModel, openaiBaseUrl);
    }

    if (openrouterKey) {
      const orModel = process.env.OPENROUTER_MODEL?.trim() || "meta-llama/llama-3.3-70b-instruct";
      available.openrouter = new OpenAIAIProvider(openrouterKey, orModel, "https://openrouter.ai/api/v1");
    }

    const mockProvider = new MockAIProvider();

    // Organiza a cadeia de prioridade com base em AI_PROVIDER
    if (configuredProvider && available[configuredProvider]) {
      this.providers.push(available[configuredProvider]);
    }

    // Adiciona os demais provedores disponíveis na esteira de fallback
    for (const [key, provider] of Object.entries(available)) {
      if (!this.providers.includes(provider)) {
        this.providers.push(provider);
      }
    }

    // Sempre inclui o mock offline como último recurso de segurança
    this.providers.push(mockProvider);
  }

  async interpretAndNarrate(
    request: AIInterpretationRequest
  ): Promise<AIInterpretationResponse> {
    const errors: string[] = [];

    for (const provider of this.providers) {
      try {
        const startTime = Date.now();
        const response = await provider.interpretAndNarrate(request);
        const duration = Date.now() - startTime;
        console.log(`[UnifiedAIWrapper] Sucesso via ${provider.name} (${duration}ms)`);
        return response;
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.warn(`[UnifiedAIWrapper] Provedor ${provider.name} falhou: ${msg}. Tentando próximo...`);
        errors.push(`${provider.name}: ${msg}`);
      }
    }

    // Se todos falharem (raríssimo pois Mock está no final), fallback emergencial
    console.error("[UnifiedAIWrapper] Todos os provedores falharam:", errors);
    return new MockAIProvider().interpretAndNarrate(request);
  }
}
