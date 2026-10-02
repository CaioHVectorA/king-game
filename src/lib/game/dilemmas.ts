// ============================================================================
// SOBERANIA: MOTOR DE DILEMAS & ESCOLHAS ESTRUTURADAS (CHOICE MATRIX)
// ============================================================================

import { ChoiceDilemma, ChoiceDilemmaOption, MindVoiceId } from "@/types/sovereign";
import { GameEvent, KingdomState, Character } from "@/types/game";

/**
 * Converte um evento do jogo em um dilema estruturado rico para a interface
 */
export function buildChoiceDilemma(event: GameEvent, state: KingdomState): ChoiceDilemma {
  const foundChar = event.characterId && state.characters ? state.characters[event.characterId] : undefined;
  const char: Character = foundChar || {
    id: "emissary_crown",
    name: "Emissário da Corte",
    title: "Voz do Conselho",
    role: "Porta-Voz",
    avatar: "📜",
    loyalty: 80,
    influence: 50,
    alive: true,
    traits: ["Diligente"],
  };

  const options: ChoiceDilemmaOption[] = (event.choices || []).map((c, idx) => {
    let intent: ChoiceDilemmaOption["intentTag"] = "ousada";
    let voice: MindVoiceId = "cold_reason";

    if (idx === 0) {
      intent = "diplomatica";
      voice = "noble_heart";
    } else if (idx === 1) {
      intent = "implacavel";
      voice = "iron_crown";
    } else if (idx === 2) {
      intent = "mercantil";
      voice = "cold_reason";
    } else {
      intent = "ousada";
      voice = "primal_instinct";
    }

    return {
      id: c.id,
      label: c.label,
      intentTag: intent,
      voiceAdvocate: voice,
      riskDescription: c.intentDescription || "Esta deliberação alterará o equilíbrio de poder do reino.",
      projectedOutcome: "Consequências imediatas serão calculadas pelo Conselho e aplicadas à dinastia.",
      promptSuggestion: c.label,
    };
  });

  // Se o evento não tinha opções estruturadas prévias, cria opções arquetípicas
  if (options.length === 0) {
    options.push(
      {
        id: "opt_conciliate",
        label: "Buscar conciliação pacífica e amparar os afetados",
        intentTag: "diplomatica",
        voiceAdvocate: "noble_heart",
        riskDescription: "Exigirá recursos do tesouro ou dos celeiros para apaziguar a crise.",
        projectedOutcome: "Fortalece a estima do povo e a legitimidade moral do trono.",
        promptSuggestion: "Decreto que busquemos conciliação pacífica e destinemos mantimentos para amparar os afetados.",
      },
      {
        id: "opt_iron_fist",
        label: "Impor decreto de força e calar dissidências com a guarda",
        intentTag: "implacavel",
        voiceAdvocate: "iron_crown",
        riskDescription: "Aumentará o descontentamento popular e a tensão social nas ruas.",
        projectedOutcome: "Demonstração pública de poder inquestionável da coroa.",
        promptSuggestion: "Ordeno que a Guarda Real mobilize forças e sufoque qualquer dissidência com punho de ferro.",
      },
      {
        id: "opt_pragmatic_deal",
        label: "Negociar concessões tributárias e acordos comerciais",
        intentTag: "mercantil",
        voiceAdvocate: "cold_reason",
        riskDescription: "Os nobres e mercadores exigirão privilégios duradouros em troca.",
        projectedOutcome: "Preserva as reservas financeiras e estabiliza o fluxo de abastecimento.",
        promptSuggestion: "Proponho uma mesa de negociações para ajustar tarifas e concessões tributárias pragmáticas.",
      }
    );
  }

  const isUrgent = event.tags?.some((t) => ["urgente", "crise", "guerra", "perigo"].includes(t.toLowerCase()));

  return {
    id: `dilemma_${event.id}`,
    title: event.title,
    speaker: char,
    context: event.description,
    urgentNotice: isUrgent ? "ESTE DILEMA EXIGE DECISÃO IMEDIATA PERANTE O TRONO" : undefined,
    options,
    allowFreeText: true,
  };
}
