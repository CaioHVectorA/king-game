import { z } from "zod";
import { GameActionSchema } from "../game/actions";
import { AIInterpretationResponse } from "@/types/ai";

export const AIInterpretationResponseSchema = z.object({
  intent: z.string().default("Decisão soberana"),
  actions: z.array(GameActionSchema).default([]),
  narrative: z.string().min(5),
  confidence: z.number().min(0).max(1).default(0.85),
});

export function parseAIResponse(rawText: string): AIInterpretationResponse {
  let cleaned = rawText.trim();

  // Remove blocos de código markdown se existirem (```json ... ``` ou ``` ... ```)
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    // Tenta encontrar o primeiro '{' e o último '}'
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    const jsonParsed = JSON.parse(cleaned);
    const validated = AIInterpretationResponseSchema.parse(jsonParsed);
    return validated as AIInterpretationResponse;
  } catch (err) {
    console.error("Erro ao validar resposta JSON da IA:", err, "Texto recebido:", rawText);
    // Tenta consertar ou retorna fallback amigável
    return {
      intent: "Ordem da Coroa",
      actions: [
        {
          type: "MODIFY_STABILITY",
          amount: -1,
          reason: "Dúvidas na interpretação dos decretos reais",
        },
      ],
      narrative:
        "Os arautos tentaram proclamar vossas palavras, contudo a corte debateu longamente seu significado prático antes de tomar providências.",
      confidence: 0.5,
    };
  }
}
