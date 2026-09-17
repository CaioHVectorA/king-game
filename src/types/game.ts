export type FactionName = "nobles" | "merchants" | "clergy" | "peasants" | "military";

export type Factions = {
  nobles: number;
  merchants: number;
  clergy: number;
  peasants: number;
  military: number;
};

export type Character = {
  id: string;
  name: string;
  title?: string;
  role: string;
  loyalty: number; // -100 to 100
  influence: number; // 0 to 100
  alive: boolean;
  traits: string[];
  faction?: FactionName;
  avatar?: string;
};

export type Ruler = {
  id: string;
  name: string;
  dynasty: string;
  title: string;
  age: number;
  reignYears: number;
  traits: string[];
  avatar?: string;
};

export type Realm = {
  id: string;
  name: string;
  population: number;
  military: number;
  wealth: number;
  relation: number; // -100 to 100
  flags: Record<string, boolean>;
};

export type GameAction =
  | { type: "ADD_GOLD"; amount: number; reason?: string }
  | { type: "ADD_FOOD"; amount: number; reason?: string }
  | { type: "MODIFY_POPULATION"; amount: number; reason?: string }
  | { type: "MODIFY_STABILITY"; amount: number; reason?: string }
  | { type: "MODIFY_MILITARY"; amount: number; reason?: string }
  | { type: "MODIFY_FACTION"; faction: FactionName; amount: number; reason?: string }
  | { type: "SET_FLAG"; flag: string; value: boolean }
  | { type: "START_WAR"; kingdomId: string }
  | { type: "END_WAR"; kingdomId: string }
  | { type: "MODIFY_RELATION"; targetId: string; amount: number; reason?: string }
  | { type: "SCHEDULE_EVENT"; eventId: string; triggerAfterTurns: number }
  | { type: "KILL_RULER"; cause: string }
  | { type: "ADD_LAW"; law: string }
  | { type: "REMOVE_LAW"; law: string }
  | { type: "EXECUTE_OR_EXILE_CHARACTER"; characterId: string; actionType: "execute" | "exile" };

export type DelayedEvent = {
  id: string;
  eventId: string;
  triggerAtTurn: number;
  sourceEventId?: string;
};

export type GameChoice = {
  id: string;
  label: string;
  intentDescription?: string;
  actions: GameAction[];
  delayedEvents?: Array<{ triggerAfterTurns: number; eventId: string }>;
};

export type Requirement =
  | { type: "MIN_GOLD"; value: number }
  | { type: "MAX_GOLD"; value: number }
  | { type: "MIN_FOOD"; value: number }
  | { type: "MAX_FOOD"; value: number }
  | { type: "MIN_STABILITY"; value: number }
  | { type: "MAX_STABILITY"; value: number }
  | { type: "FLAG_EQUALS"; flag: string; value: boolean }
  | { type: "AT_WAR"; value: boolean }
  | { type: "MIN_FACTION"; faction: FactionName; value: number }
  | { type: "MAX_FACTION"; faction: FactionName; value: number };

export type GameEvent = {
  id: string;
  title: string;
  description: string;
  characterId?: string;
  requirements?: Requirement[];
  choices: GameChoice[];
  tags: string[];
  weight: number;
  isDelayedTriggerOnly?: boolean;
};

export type GameHistoryEntry = {
  id: string;
  turn: number;
  year: number;
  month: number;
  eventTitle: string;
  playerDecision: string;
  narrative: string;
  effectsSummary: string[];
  rulerName: string;
};

export type KingdomState = {
  id: string;
  name: string;
  storylineId?: string;
  storylineTitle?: string;
  worldLorePrompt?: string;
  seed: number;
  turn: number;
  year: number;
  month: number; // 1 to 12

  gold: number;
  food: number;
  population: number;
  stability: number; // 0 to 100
  military: number; // 0 to 100

  factions: Factions;
  relations: Record<string, number>;
  flags: Record<string, boolean>;

  activeWars: string[];
  laws: string[];

  currentRuler: Ruler;
  heirs: Ruler[];
  rulersHistory: Array<Ruler & { deathYear: number; causeOfDeath: string }>;

  characters: Record<string, Character>;
  realms: Record<string, Realm>;

  delayedEvents: DelayedEvent[];
  history: GameHistoryEntry[];

  currentEvent: GameEvent | null;

  isGameOver: boolean;
  gameOverReason?: string;
};

export type TurnInput = {
  gameId: string;
  choiceId?: string;
  freeTextDecision?: string;
};

export type TurnResult = {
  state: KingdomState;
  appliedActions: GameAction[];
  effectsSummary: string[];
  narrative: string;
  aiUsed: boolean;
  aiCostEstimate?: {
    model: string;
    tokensEstimated: number;
  };
  successionOccurred?: boolean;
  newRuler?: Ruler;
  gameOver?: boolean;
  gameOverReason?: string;
};
