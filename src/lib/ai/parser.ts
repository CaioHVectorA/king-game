import { z } from "zod";
import { GameActionSchema } from "../game/actions";
import { AIInterpretationResponse } from "@/types/ai";
import { GameAction } from "@/types/game";

export const AIDynamicEventProposalSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  characterName: z.string().optional(),
  characterTitle: z.string().optional(),
  characterRole: z.string().optional(),
  characterFaction: z.enum(["nobles", "merchants", "clergy", "peasants", "military"]).optional(),
  characterAvatar: z.string().optional(),
  characterAppearance: z.string().optional(),
  choices: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        intentDescription: z.string().optional(),
      })
    )
    .optional(),
});

export const AICampaignEndingSchema = z.object({
  isGameOver: z.boolean(),
  isVictory: z.boolean().optional(),
  reason: z.string().min(3),
});

export const AIInterpretationResponseSchema = z.object({
  intent: z.string().default("Decisão"),
  actions: z.array(GameActionSchema).default([]),
  narrative: z.string().min(3),
  confidence: z.number().min(0).max(1).default(0.85),
  nextEventProposal: AIDynamicEventProposalSchema.optional(),
  campaignEnding: AICampaignEndingSchema.optional(),
});

/**
 * Tenta reparar JSONs truncados por limite de tokens (ex: strings não fechadas ou chaves faltantes)
 */
function tryRepairTruncatedJson(str: string): any | null {
  try {
    return JSON.parse(str);
  } catch {
    const suffixes = [
      "}",
      "}}",
      "}}}" ,
      '"}',
      '"}}',
      '"}}}',
      "]}",
      "]}}",
      '"]}',
      '"]}}',
      "}]}",
      "}]}}",
    ];

    for (const suffix of suffixes) {
      try {
        return JSON.parse(str + suffix);
      } catch {}
    }

    // Se truncou no meio de uma chave ou propriedade incompleta, recua até a última vírgula válida
    const lastComma = str.lastIndexOf(",");
    if (lastComma !== -1) {
      const sliced = str.substring(0, lastComma);
      for (const suffix of suffixes) {
        try {
          return JSON.parse(sliced + suffix);
        } catch {}
      }
    }
  }
  return null;
}

export function parseAIResponse(
  rawText: string,
  context?: { storylineId?: string; playerDecision?: string }
): AIInterpretationResponse {
  // 1. Extração preventiva de narrativa diretamente do texto bruto COMPLETO
  let extractedNarrative: string | null = null;
  const narrativeMatch = rawText.match(/"narrative"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (narrativeMatch && narrativeMatch[1]) {
    extractedNarrative = narrativeMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").trim();
  } else {
    const unclosedNarrativeMatch = rawText.match(/"narrative"\s*:\s*"([^"\r\n]{10,})/);
    if (unclosedNarrativeMatch && unclosedNarrativeMatch[1]) {
      extractedNarrative = unclosedNarrativeMatch[1].trim();
    }
  }

  let cleaned = rawText.trim();

  // Remove blocos de código markdown se existirem (```json ... ``` ou ``` ... ```)
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    const narrativePos = cleaned.lastIndexOf('"narrative"');
    if (firstBrace !== -1 && lastBrace > firstBrace && (narrativePos === -1 || lastBrace > narrativePos)) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    } else if (firstBrace !== -1) {
      cleaned = cleaned.substring(firstBrace);
    }
  }

  // 2. Tenta parsear JSON completo ou reparado
  let jsonParsed: any = null;
  try {
    jsonParsed = JSON.parse(cleaned);
  } catch {
    jsonParsed = tryRepairTruncatedJson(cleaned);
  }

  // Se conseguiu obter um objeto JSON:
  if (jsonParsed && typeof jsonParsed === "object") {
    const intent = typeof jsonParsed.intent === "string" && jsonParsed.intent.trim()
      ? jsonParsed.intent.trim()
      : "Decisão Estratégica";

    const narrative = (typeof jsonParsed.narrative === "string" && jsonParsed.narrative.trim().length >= 3)
      ? jsonParsed.narrative.trim()
      : extractedNarrative || getThemedFallbackNarrative(context?.storylineId, context?.playerDecision);

    // Valida cada ação individualmente com safeParse para não descartar todo o payload se uma estiver errada
    const validActions: GameAction[] = [];
    if (Array.isArray(jsonParsed.actions)) {
      for (const act of jsonParsed.actions) {
        const parsed = GameActionSchema.safeParse(act);
        if (parsed.success) {
          validActions.push(parsed.data as GameAction);
        }
      }
    }

    // Valida nextEventProposal se existir
    let nextEventProposal = undefined;
    if (jsonParsed.nextEventProposal && typeof jsonParsed.nextEventProposal === "object") {
      const parsedProposal = AIDynamicEventProposalSchema.safeParse(jsonParsed.nextEventProposal);
      if (parsedProposal.success) {
        nextEventProposal = parsedProposal.data;
      }
    }

    // Valida campaignEnding se existir (reconhecimento pela IA de fim de campanha ou vitória)
    let campaignEnding = undefined;
    const rawEnding = jsonParsed.campaignEnding || jsonParsed.campaign_ending;
    if (rawEnding && typeof rawEnding === "object") {
      const isGameOver = Boolean(
        rawEnding.isGameOver ??
        rawEnding.is_game_over ??
        rawEnding.gameOver ??
        rawEnding.isEnding ??
        rawEnding.is_ending
      );
      const isVictory = Boolean(
        rawEnding.isVictory ??
        rawEnding.is_victory ??
        rawEnding.victory ??
        (typeof rawEnding.outcome === "string" && rawEnding.outcome.toLowerCase() === "victory")
      );
      let reason = "";
      if (rawEnding.title && rawEnding.summary) {
        reason = `${rawEnding.title}: ${rawEnding.summary}`;
      } else {
        reason = String(
          rawEnding.reason ||
          rawEnding.message ||
          rawEnding.summary ||
          rawEnding.title ||
          "Fim de campanha reconhecido pelo Mestre."
        );
      }
      reason = reason.trim();

      const parsedEnding = AICampaignEndingSchema.safeParse({
        isGameOver,
        isVictory,
        reason,
      });
      if (parsedEnding.success) {
        campaignEnding = parsedEnding.data;
      }
    }

    return {
      intent,
      actions: validActions,
      narrative,
      confidence: typeof jsonParsed.confidence === "number" ? jsonParsed.confidence : 0.9,
      nextEventProposal,
      campaignEnding,
    };
  }

  // 3. Fallback inteligente e contextual (nunca medieval em apocalipse ou ficção científica)
  console.warn("JSON não pôde ser parseado completamente. Usando narrativa contextual e salvaguarda.");
  const finalNarrative = extractedNarrative || getThemedFallbackNarrative(context?.storylineId, context?.playerDecision);

  return {
    intent: context?.playerDecision ? `Ordem: "${context.playerDecision.slice(0, 30)}…"` : "Decisão de Comando",
    actions: [],
    narrative: finalNarrative,
    confidence: 0.7,
  };
}

function getThemedFallbackNarrative(storylineId?: string, playerDecision?: string): string {
  const isRioZombie = storylineId === "rio_zombie";
  const isZombie = storylineId === "zombie_apocalypse";
  const isSciFi = storylineId === "colony_exodus";

  if (isRioZombie) {
    if (playerDecision && playerDecision.toLowerCase().includes("traineira")) {
      return "Os motores a diesel da traineira de Zé do Porto tossem fumaça preta na enseada da Urca enquanto as sentinelas terminam de carregar os fardos de peixe salgado e as caixas de munição 7.62. A expedição zarpou pelas águas escuras da Baía de Guanabara.";
    }
    return "Sua ordem ecoou pelo rádio das sentinelas na muralha da Urca. As tropas e batedores do Forte de São João acataram a diretriz e mobilizaram as equipes imediatamente.";
  }

  if (isZombie) {
    if (playerDecision && playerDecision.toLowerCase().includes("caminh")) {
      return "Os motores dos dois caminhões rugem no pátio leste enquanto a equipe termina de carregar os fardos de suprimentos e munição. Dra. Elise Moreau sobe na cabine ao lado do motorista com seu estojo hermético, confirmando pelo rádio que a expedição está a caminho.";
    }
    return "Sua ordem foi transmitida pelo rádio do posto de comando. A equipe tática de prontidão acatou a determinação imediatamente e mobilizou os recursos necessários.";
  }

  if (isSciFi) {
    return "Os terminais da estação registraram suas diretrizes operacionais. As equipes de engenharia e suporte iniciaram os procedimentos nos módulos pertinentes.";
  }

  return "Vossas palavras foram ouvidas com atenção e os oficiais mobilizaram-se prontamente para cumprir a determinação soberana.";
}
