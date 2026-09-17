import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIInterpretationRequest, AIInterpretationResponse, AIProvider } from "@/types/ai";
import { getSystemPrompt } from "./prompts";
import { parseAIResponse } from "./parser";

export class GeminiAIProvider implements AIProvider {
  name: string;
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName = "gemini-1.5-flash") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
    this.name = `Google Gemini (${modelName})`;
  }

  async interpretAndNarrate(
    request: AIInterpretationRequest
  ): Promise<AIInterpretationResponse> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.2, // Baixa temperatura para consistência estrutural
        maxOutputTokens: 350,
        responseMimeType: "application/json",
      },
      systemInstruction: getSystemPrompt(request.worldLore),
    });

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

    const result = await model.generateContent(promptPayload);
    const textResponse = result.response.text();
    return parseAIResponse(textResponse);
  }
}
