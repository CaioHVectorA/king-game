import { z } from "zod";
import { FactionName, GameAction, KingdomState } from "@/types/game";
import { clamp, LIMITS, sanitizeDelta } from "./rules";
import { getActiveOrSuccessorCharacter } from "./characters";

export const FactionNameSchema = z.enum([
  "nobles",
  "merchants",
  "clergy",
  "peasants",
  "military",
]);

export const GameActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ADD_GOLD"),
    amount: z.number(),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal("ADD_FOOD"),
    amount: z.number(),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal("MODIFY_POPULATION"),
    amount: z.number(),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal("MODIFY_STABILITY"),
    amount: z.number(),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal("MODIFY_MILITARY"),
    amount: z.number(),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal("MODIFY_FACTION"),
    faction: FactionNameSchema,
    amount: z.number(),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal("SET_FLAG"),
    flag: z.string().min(1).max(50),
    value: z.boolean(),
  }),
  z.object({
    type: z.literal("START_WAR"),
    kingdomId: z.string(),
  }),
  z.object({
    type: z.literal("END_WAR"),
    kingdomId: z.string(),
  }),
  z.object({
    type: z.literal("MODIFY_RELATION"),
    targetId: z.string(),
    amount: z.number(),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal("SCHEDULE_EVENT"),
    eventId: z.string(),
    triggerAfterTurns: z.number().int().min(1).max(24),
  }),
  z.object({
    type: z.literal("KILL_RULER"),
    cause: z.string().max(100),
  }),
  z.object({
    type: z.literal("ADD_LAW"),
    law: z.string().max(60),
  }),
  z.object({
    type: z.literal("REMOVE_LAW"),
    law: z.string().max(60),
  }),
  z.object({
    type: z.literal("EXECUTE_OR_EXILE_CHARACTER"),
    characterId: z.string(),
    actionType: z.enum(["execute", "exile"]),
  }),
  z.object({
    type: z.literal("START_SITUATION"),
    title: z.string().max(100),
    situationType: z.enum(["expedicao", "guerra", "crise", "projeto", "discurso", "investigacao"]),
    durationTurns: z.number().int().min(1).max(20).default(3),
    description: z.string().max(400),
    personnel: z.string().max(120).optional(),
  }),
  z.object({
    type: z.literal("RESOLVE_SITUATION"),
    situationId: z.string(),
    resultText: z.string().max(400),
  }),
]);

export function sanitizeAction(action: GameAction): GameAction {
  switch (action.type) {
    case "ADD_GOLD":
      return {
        ...action,
        amount: sanitizeDelta(action.amount, LIMITS.MAX_ACTION_GOLD_DELTA),
      };
    case "ADD_FOOD":
      return {
        ...action,
        amount: sanitizeDelta(action.amount, LIMITS.MAX_ACTION_FOOD_DELTA),
      };
    case "MODIFY_POPULATION":
      return {
        ...action,
        amount: sanitizeDelta(action.amount, LIMITS.MAX_ACTION_POPULATION_DELTA),
      };
    case "MODIFY_STABILITY":
      return {
        ...action,
        amount: sanitizeDelta(action.amount, LIMITS.MAX_ACTION_STAT_DELTA),
      };
    case "MODIFY_MILITARY":
      return {
        ...action,
        amount: sanitizeDelta(action.amount, LIMITS.MAX_ACTION_STAT_DELTA),
      };
    case "MODIFY_FACTION":
      return {
        ...action,
        amount: sanitizeDelta(action.amount, LIMITS.MAX_ACTION_FACTION_DELTA),
      };
    case "MODIFY_RELATION":
      return {
        ...action,
        amount: sanitizeDelta(action.amount, LIMITS.MAX_ACTION_FACTION_DELTA),
      };
    case "SCHEDULE_EVENT":
      return {
        ...action,
        triggerAfterTurns: clamp(Math.round(action.triggerAfterTurns), 1, 12),
      };
    default:
      return action;
  }
}

export function applyAction(
  state: KingdomState,
  rawAction: GameAction
): { state: KingdomState; effectMessage: string } {
  const action = sanitizeAction(rawAction);
  const next = { ...state };
  let effectMessage = "";

  switch (action.type) {
    case "ADD_GOLD": {
      const prev = next.gold;
      next.gold = clamp(next.gold + action.amount, LIMITS.MIN_GOLD, LIMITS.MAX_GOLD);
      const diff = next.gold - prev;
      effectMessage = diff >= 0 ? `+${diff} Ouro` : `${diff} Ouro`;
      break;
    }
    case "ADD_FOOD": {
      const prev = next.food;
      next.food = clamp(next.food + action.amount, LIMITS.MIN_FOOD, LIMITS.MAX_FOOD);
      const diff = next.food - prev;
      effectMessage = diff >= 0 ? `+${diff} Comida` : `${diff} Comida`;
      break;
    }
    case "MODIFY_POPULATION": {
      const prev = next.population;
      next.population = Math.max(0, next.population + action.amount);
      const diff = next.population - prev;
      effectMessage = diff >= 0 ? `+${diff} População` : `${diff} População`;
      break;
    }
    case "MODIFY_STABILITY": {
      const prev = next.stability;
      next.stability = clamp(
        next.stability + action.amount,
        LIMITS.MIN_STABILITY,
        LIMITS.MAX_STABILITY
      );
      const diff = next.stability - prev;
      effectMessage = diff >= 0 ? `+${diff}% Estabilidade` : `${diff}% Estabilidade`;
      break;
    }
    case "MODIFY_MILITARY": {
      const prev = next.military;
      next.military = clamp(
        next.military + action.amount,
        LIMITS.MIN_MILITARY,
        LIMITS.MAX_MILITARY
      );
      const diff = next.military - prev;
      effectMessage = diff >= 0 ? `+${diff}% Poder Militar` : `${diff}% Poder Militar`;
      break;
    }
    case "MODIFY_FACTION": {
      const factionKey = action.faction as FactionName;
      const prev = next.factions[factionKey] ?? 0;
      const updated = clamp(prev + action.amount, LIMITS.MIN_FACTION, LIMITS.MAX_FACTION);
      next.factions = {
        ...next.factions,
        [factionKey]: updated,
      };
      const diff = updated - prev;
      const factionNamesPt: Record<FactionName, string> = {
        nobles: "Nobres",
        merchants: "Comerciantes",
        clergy: "Clero",
        peasants: "Camponeses",
        military: "Exército",
      };
      effectMessage =
        diff >= 0
          ? `+${diff} Aprovação (${factionNamesPt[factionKey]})`
          : `${diff} Aprovação (${factionNamesPt[factionKey]})`;
      break;
    }
    case "SET_FLAG": {
      next.flags = {
        ...next.flags,
        [action.flag]: action.value,
      };
      effectMessage = action.value ? `Marcador ativado: ${action.flag}` : `Marcador removido: ${action.flag}`;
      break;
    }
    case "START_WAR": {
      if (!next.activeWars.includes(action.kingdomId)) {
        next.activeWars = [...next.activeWars, action.kingdomId];
      }
      effectMessage = `Guerra declarada contra ${action.kingdomId}!`;
      break;
    }
    case "END_WAR": {
      next.activeWars = next.activeWars.filter((k) => k !== action.kingdomId);
      effectMessage = `Paz estabelecida com ${action.kingdomId}.`;
      break;
    }
    case "MODIFY_RELATION": {
      const current = next.relations[action.targetId] ?? 0;
      const updated = clamp(current + action.amount, -100, 100);
      next.relations = {
        ...next.relations,
        [action.targetId]: updated,
      };
      effectMessage = `Relação com ${action.targetId}: ${updated > current ? "+" : ""}${updated - current}`;
      break;
    }
    case "SCHEDULE_EVENT": {
      next.delayedEvents = [
        ...next.delayedEvents,
        {
          id: `delayed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          eventId: action.eventId,
          triggerAtTurn: next.turn + action.triggerAfterTurns,
        },
      ];
      effectMessage = `Um desfecho futuro foi selado.`;
      break;
    }
    case "KILL_RULER": {
      if (next.currentRuler) {
        next.rulersHistory = [
          ...next.rulersHistory,
          {
            ...next.currentRuler,
            deathYear: next.year,
            causeOfDeath: action.cause,
          },
        ];
        if (next.heirs.length > 0) {
          const [newRuler, ...remainingHeirs] = next.heirs;
          next.currentRuler = newRuler;
          next.heirs = remainingHeirs;
          effectMessage = `O monarca faleceu (${action.cause}). ${newRuler.title} ${newRuler.name} ascendeu ao trono!`;
        } else {
          next.isGameOver = true;
          next.gameOverReason = `O soberano tombou (${action.cause}) sem deixar herdeiros. O trono foi disputado em uma violenta anarquia.`;
          effectMessage = `O soberano faleceu sem herdeiros.`;
        }
      }
      break;
    }
    case "ADD_LAW": {
      if (!next.laws.includes(action.law)) {
        next.laws = [...next.laws, action.law];
        effectMessage = `Nova lei decretada: "${action.law}"`;
      }
      break;
    }
    case "REMOVE_LAW": {
      next.laws = next.laws.filter((l) => l !== action.law);
      effectMessage = `Lei revogada: "${action.law}"`;
      break;
    }
    case "EXECUTE_OR_EXILE_CHARACTER": {
      // Normaliza ID caso venha abreviado da IA (ex: "thorne" -> "general_thorne")
      const charIdMap: Record<string, string> = {
        thorne: "general_thorne",
        elenor: "elenor_peasant",
        vane: "chancellor_vane",
        alistair: "merchant_alistair",
        ignatius: "archbishop_ignatius",
        morris: "counselor_morris",
      };
      const canonicalId = charIdMap[action.characterId.toLowerCase()] || action.characterId;
      const char = next.characters[canonicalId] || next.characters[action.characterId];

      if (char) {
        const targetId = char.id;
        next.characters = {
          ...next.characters,
          [targetId]: {
            ...char,
            alive: false,
          },
        };

        // Registra formalmente na lista perpétua de falecidos
        const deceasedList = next.deceasedCharacters ? [...next.deceasedCharacters] : [];
        if (!deceasedList.some((d) => d.id === targetId)) {
          deceasedList.push({
            id: targetId,
            name: char.name,
            turn: next.turn,
            year: next.year,
            cause:
              action.actionType === "execute"
                ? "Executado(a) por decreto soberano"
                : "Banido(a) perpétuo(a) das terras da coroa",
          });
        }
        next.deceasedCharacters = deceasedList;

        // Garante que o sucessor correspondente seja instanciado imediatamente
        getActiveOrSuccessorCharacter(targetId, next);

        effectMessage =
          action.actionType === "execute"
            ? `${char.name} foi executado(a) publicamente por decreto real. A vaga foi transferida.`
            : `${char.name} foi banido(a) perpétua e sumariamente das terras do reino.`;
      }
      break;
    }
    case "START_SITUATION": {
      const ongoing = next.ongoingSituations ? [...next.ongoingSituations] : [];
      const sitId = `sit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const duration = Math.max(1, action.durationTurns || 3);
      ongoing.push({
        id: sitId,
        title: action.title,
        type: action.situationType,
        description: action.description,
        startedAtTurn: next.turn,
        totalTurns: duration,
        turnsRemaining: duration,
        status: "ativa",
        assignedPersonnel: action.personnel,
      });
      next.ongoingSituations = ongoing;
      effectMessage = `Nova situação iniciada: "${action.title}" (${duration} turnos de duração).`;
      break;
    }
    case "RESOLVE_SITUATION": {
      if (next.ongoingSituations && next.ongoingSituations.length > 0) {
        next.ongoingSituations = next.ongoingSituations.map((s) =>
          s.id === action.situationId || s.title.toLowerCase().includes(action.situationId.toLowerCase())
            ? { ...s, status: "concluida" as const, turnsRemaining: 0, consequencesSummary: action.resultText }
            : s
        );
        effectMessage = `Situação concluída: ${action.resultText}`;
      }
      break;
    }
  }

  return { state: next, effectMessage };
}
