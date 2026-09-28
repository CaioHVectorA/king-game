import { AIInterpretationRequest, AIInterpretationResponse, AIProvider } from "@/types/ai";
import { getSystemPrompt } from "./prompts";
import { parseAIResponse } from "./parser";

export class GroqAIProvider implements AIProvider {
  name: string;
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "llama-3.3-70b-versatile") {
    this.apiKey = apiKey;
    this.model = model;
    this.name = `Groq Cloud (${model})`;
  }

  async interpretAndNarrate(
    request: AIInterpretationRequest
  ): Promise<AIInterpretationResponse> {
    const systemPrompt = getSystemPrompt(request.worldLore, request.storylineId);

    const promptPayload = `
EVENTO ATUAL:
Título: ${request.eventTitle}
Descrição: ${request.eventDescription}

ESTADO ATUAL DO REINO / ASSENTAMENTO:
- Líder / Governante: ${request.stateSummary.rulerName}
- Recursos Financeiros / Créditos: ${request.stateSummary.gold}
- Comida / Rações: ${request.stateSummary.food}
- População / Sobreviventes: ${request.stateSummary.population}
- Estabilidade / Moral: ${request.stateSummary.stability}%
- Poder Militar / Defesa: ${request.stateSummary.military}%
- Facções / Setores: Nobres/Técnicos (${request.stateSummary.factions.nobles}), Mercadores/Suprimentos (${request.stateSummary.factions.merchants}), Clero/Cientistas (${request.stateSummary.factions.clergy}), Camponeses/Trabalhadores (${request.stateSummary.factions.peasants}), Exército/Guarda (${request.stateSummary.factions.military})
- Conflitos / Guerras ativas: ${request.stateSummary.activeWars.length > 0 ? request.stateSummary.activeWars.join(", ") : "Nenhuma"}

HISTÓRICO RECENTE:
${request.recentHistory.length > 0 ? request.recentHistory.map((h) => `- ${h}`).join("\n") : "Início de campanha."}

ORDEM / FALA DO JOGADOR (TEXTO LIVRE):
"${request.playerDecision}"

Retorne o objeto JSON estrito com intent, actions, narrative e confidence (e nextEventProposal se relevante).
`;

    let res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: promptPayload },
        ],
        temperature: 0.3,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      // Se o modelo especificado não existir, tenta o fallback para qwen/qwen3.8-27b
      if (res.status === 404 && this.model !== "qwen/qwen3.8-27b") {
        console.warn(`[GroqAIProvider] Modelo ${this.model} não encontrado. Tentando qwen/qwen3.8-27b...`);
        res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "qwen/qwen3.8-27b",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: promptPayload },
            ],
            temperature: 0.3,
            max_tokens: 1024,
            response_format: { type: "json_object" },
          }),
        });
      }

      if (!res.ok) {
        throw new Error(`Groq request failed [HTTP ${res.status}]: ${errorText}`);
      }
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return parseAIResponse(content, {
      storylineId: request.storylineId,
      playerDecision: request.playerDecision,
    });
  }
}
