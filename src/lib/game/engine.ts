import {
  GameAction,
  GameHistoryEntry,
  KingdomState,
  TurnInput,
  TurnResult,
} from "@/types/game";
import { AIProvider } from "@/types/ai";
import { applyAction, GameActionSchema, sanitizeAction } from "./actions";
import { checkGameOver, checkSuccession } from "./rules";
import { selectNextEvent } from "./events";
import { processEndOfTurnEffects } from "./consequences";
import { PRNG } from "./rng";
import { cloneKingdomState } from "./state";

export async function processTurn(
  currentState: KingdomState,
  input: TurnInput,
  aiProvider: AIProvider
): Promise<TurnResult> {
  // 1. Clona estado para mutação segura
  let state = cloneKingdomState(currentState);
  const prng = new PRNG(state.seed + state.turn);

  const currentEvent = state.currentEvent;
  if (!currentEvent) {
    // Se por algum motivo não havia evento no estado, seleciona um
    state.currentEvent = selectNextEvent(state, prng);
    return {
      state,
      appliedActions: [],
      effectsSummary: ["O conselho reuniu-se para apresentar a situação."],
      narrative: "O reinado tem início sob olhares atentos de toda a corte.",
      aiUsed: false,
    };
  }

  let actionsToApply: GameAction[] = [];
  let narrative = "";
  let decisionLabel = "";
  let aiUsed = false;
  let tokensEstimated = 0;

  // 2. Trata Decisão Pré-definida (Opção A)
  if (input.choiceId) {
    const choice = currentEvent.choices.find((c) => c.id === input.choiceId);
    if (!choice) {
      throw new Error(`Escolha inválida: ${input.choiceId}`);
    }

    decisionLabel = choice.label;
    actionsToApply = [...choice.actions];

    // Se a escolha tiver delayed events próprios
    if (choice.delayedEvents) {
      for (const delayed of choice.delayedEvents) {
        actionsToApply.push({
          type: "SCHEDULE_EVENT",
          eventId: delayed.eventId,
          triggerAfterTurns: delayed.triggerAfterTurns,
        });
      }
    }

    narrative = `Você decretou: "${choice.label}". A corte acatou suas ordens imediatas.`;
  }
  // 3. Trata Decisão Livre (Opção B - IA)
  else if (input.freeTextDecision && input.freeTextDecision.trim().length > 0) {
    aiUsed = true;
    decisionLabel = input.freeTextDecision.trim();

    // Contexto compacto (apenas o necessário para economia de tokens)
    const recentHistory = state.history
      .slice(-3)
      .map((h) => `${h.eventTitle}: ${h.playerDecision}`);

    try {
      const aiResponse = await aiProvider.interpretAndNarrate({
        eventTitle: currentEvent.title,
        eventDescription: currentEvent.description,
        playerDecision: decisionLabel,
        stateSummary: {
          gold: state.gold,
          food: state.food,
          population: state.population,
          stability: state.stability,
          military: state.military,
          factions: state.factions,
          rulerName: state.currentRuler?.name ?? "Soberano",
          activeWars: state.activeWars,
        },
        recentHistory,
        worldLore: state.worldLorePrompt,
      });

      // Validação estrita de cada ação pelo Zod Schema
      const validatedActions: GameAction[] = [];
      for (const rawAction of aiResponse.actions) {
        const parseResult = GameActionSchema.safeParse(rawAction);
        if (parseResult.success) {
          validatedActions.push(sanitizeAction(parseResult.data as GameAction));
        } else {
          console.warn("Ação da IA descartada por schema inválido:", rawAction, parseResult.error);
        }
      }

      actionsToApply = validatedActions;
      narrative = aiResponse.narrative || `Sua ordem soberana foi comunicada: "${decisionLabel}".`;
      tokensEstimated = 180; // Estimativa média de tokens
    } catch (err) {
      console.error("Falha no provedor de IA:", err);
      // Fallback gracioso caso a IA falhe totalmente
      actionsToApply = [
        {
          type: "MODIFY_STABILITY",
          amount: -2,
          reason: "Confusão ministerial com ordens vagas",
        },
      ];
      narrative =
        "O Conselho Real teve dificuldades em articular exatamente vossas ordens atípicas, gerando murmúrios entre os escribas, mas algumas diretrizes foram seguidas.";
    }
  } else {
    throw new Error("Nenhuma decisão fornecida para o turno.");
  }

  // 4. Aplica as ações validadas pelo Game Engine
  const effectsSummary: string[] = [];
  for (const act of actionsToApply) {
    const result = applyAction(state, act);
    state = result.state;
    if (result.effectMessage) {
      effectsSummary.push(result.effectMessage);
    }
  }

  // 5. Checa se alguma ação gerou morte/sucessão de monarca
  const successionCheck = checkSuccession(state);
  let successionOccurred = false;
  let newRuler = undefined;

  if (successionCheck.requiresSuccession && successionCheck.nextRuler) {
    successionOccurred = true;
    newRuler = successionCheck.nextRuler;
    const oldRuler = state.currentRuler;
    state.rulersHistory.push({
      ...oldRuler,
      deathYear: state.year,
      causeOfDeath: successionCheck.cause || "Sucessão forçada",
    });
    state.currentRuler = successionCheck.nextRuler;
    state.heirs = state.heirs.slice(1);
    effectsSummary.push(`Sucessão Real: ${newRuler.title} ${newRuler.name} assume o governo.`);
  }

  // 6. Efeitos de virada de turno e manutenção econômica/demográfica
  const endTurnEffects = processEndOfTurnEffects(state, prng);
  state = endTurnEffects.state;
  if (endTurnEffects.successionOccurred) {
    successionOccurred = true;
    newRuler = state.currentRuler;
  }
  for (const msg of endTurnEffects.upkeepMessages) {
    effectsSummary.push(msg);
  }

  // 7. Registro de Histórico Dinástico
  const historyEntry: GameHistoryEntry = {
    id: `hist_${state.turn}_${Date.now()}`,
    turn: state.turn - 1, // Turno em que ocorreu a decisão
    year: state.year,
    month: state.month,
    eventTitle: currentEvent.title,
    playerDecision: decisionLabel,
    narrative,
    effectsSummary,
    rulerName: state.currentRuler?.name ?? "Soberano",
  };
  state.history = [...state.history, historyEntry];

  // 8. Checagem de Fim de Jogo
  const gameOverCheck = checkGameOver(state);
  if (gameOverCheck.isGameOver) {
    state.isGameOver = true;
    state.gameOverReason = gameOverCheck.reason;
    state.currentEvent = null;

    return {
      state,
      appliedActions: actionsToApply,
      effectsSummary,
      narrative,
      aiUsed,
      aiCostEstimate: {
        model: aiProvider.name,
        tokensEstimated,
      },
      successionOccurred,
      newRuler,
      gameOver: true,
      gameOverReason: gameOverCheck.reason,
    };
  }

  // 9. Seleciona o Próximo Evento
  state.currentEvent = selectNextEvent(state, prng);

  return {
    state,
    appliedActions: actionsToApply,
    effectsSummary,
    narrative,
    aiUsed,
    aiCostEstimate: {
      model: aiProvider.name,
      tokensEstimated,
    },
    successionOccurred,
    newRuler,
    gameOver: false,
  };
}
