import { AIInterpretationRequest, AIInterpretationResponse, AIProvider } from "@/types/ai";
import { getSystemPrompt } from "./prompts";
import { parseAIResponse } from "./parser";

export class OpenAIAIProvider implements AIProvider {
  name: string;
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(
    apiKey: string,
    model = "gpt-4o-mini",
    baseUrl = "https://api.openai.com/v1"
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.name = baseUrl.includes("openrouter")
      ? `OpenRouter (${model})`
      : `OpenAI (${model})`;
  }

  async interpretAndNarrate(
    request: AIInterpretationRequest
  ): Promise<AIInterpretationResponse> {
    const promptPayload = `
EVENTO ATUAL:
Título: ${request.eventTitle}
Descrição: ${request.eventDescription}

ESTADO ATUAL DO REINO:
- Monarca: ${request.stateSummary.rulerName}
- Ouro: ${request.stateSummary.gold}
- Comida: ${request.stateSummary.food}
- População: ${request.stateSummary.population}
- Estabilidade: ${request.stateSummary.stability}%
- Poder Militar: ${request.stateSummary.military}%
- Facções: Nobres (${request.stateSummary.factions.nobles}), Mercadores (${request.stateSummary.factions.merchants}), Clero (${request.stateSummary.factions.clergy}), Camponeses (${request.stateSummary.factions.peasants}), Exército (${request.stateSummary.factions.military})
- Guerras ativas: ${request.stateSummary.activeWars.length > 0 ? request.stateSummary.activeWars.join(", ") : "Nenhuma"}

HISTÓRICO RECENTE:
${request.recentHistory.length > 0 ? request.recentHistory.map((h) => `- ${h}`).join("\n") : "Início de campanha."}

DECISÃO DO JOGADOR (TEXTO LIVRE):
"${request.playerDecision}"

Retorne o objeto JSON estrito com intent, actions, narrative e confidence.
`;

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: getSystemPrompt(request.worldLore) },
          { role: "user", content: promptPayload },
        ],
        temperature: 0.2,
        max_tokens: 350,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI request failed with status ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return parseAIResponse(content);
  }
}
