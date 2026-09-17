import { KingdomState, Ruler } from "@/types/game";

export const LIMITS = {
  MIN_STABILITY: 0,
  MAX_STABILITY: 100,
  MIN_MILITARY: 0,
  MAX_MILITARY: 100,
  MIN_FACTION: -100,
  MAX_FACTION: 100,
  MIN_GOLD: -1000,
  MAX_GOLD: 100000,
  MIN_FOOD: 0,
  MAX_FOOD: 50000,
  MIN_POPULATION: 0,

  // Maximum allowed magnitude for a single AI action (anti-cheat/hallucination defense)
  MAX_ACTION_GOLD_DELTA: 600,
  MAX_ACTION_FOOD_DELTA: 600,
  MAX_ACTION_POPULATION_DELTA: 2500,
  MAX_ACTION_STAT_DELTA: 35,
  MAX_ACTION_FACTION_DELTA: 40,
} as const;

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function sanitizeDelta(val: number, maxMagnitude: number): number {
  if (isNaN(val)) return 0;
  return clamp(val, -maxMagnitude, maxMagnitude);
}

export type GameOverCheck = {
  isGameOver: boolean;
  reason?: string;
};

export function checkGameOver(state: KingdomState): GameOverCheck {
  if (state.population <= 0) {
    return {
      isGameOver: true,
      reason: "O reino pereceu. Não restou nenhum habitante em suas terras devastadas.",
    };
  }

  if (state.stability <= 0 && state.factions.military < -60 && state.factions.peasants < -60) {
    return {
      isGameOver: true,
      reason: "Colapso total do reino. Uma insurreição anárquica destruiu as muralhas da capital e desfez a coroa.",
    };
  }

  if (!state.currentRuler && (!state.heirs || state.heirs.length === 0)) {
    return {
      isGameOver: true,
      reason: "Fim da dinastia. Sem herdeiros para governar, o reino se fragmentou entre senhores de guerra locais.",
    };
  }

  return { isGameOver: false };
}

export type SuccessionCheck = {
  requiresSuccession: boolean;
  cause?: string;
  nextRuler?: Ruler;
};

export function checkSuccession(state: KingdomState): SuccessionCheck {
  // If stability is rock bottom, high risk of coup/murder
  if (state.stability <= 5 && state.factions.nobles < -70) {
    return {
      requiresSuccession: true,
      cause: "Assassinato orquestrado pela nobreza conspiratória em um golpe de estado.",
      nextRuler: state.heirs[0],
    };
  }

  return { requiresSuccession: false };
}
