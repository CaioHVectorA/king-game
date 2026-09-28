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
  appearance?: string;
};

export type Ruler = {
  id: string;
  name: string;
  dynasty: string;
  title: string;
  age: number;
  reignYears: number;
  traits: string[];
  archetype?: string;
  origin?: string;
  personalIntent?: string;
  avatar?: string;
};

export type DocumentEntry = {
  id: string;
  title: string;
  subtitle?: string;
  category: "tratado" | "edito" | "diario" | "relatorio" | "sagrado" | "dossie" | "mapa";
  author?: string;
  content: string;
  updatedAtTurn?: number;
};

export type ConversationMessage = {
  id: string;
  sender: "character" | "player";
  characterName: string;
  text: string;
  actionGesture?: string;
  timestamp: number;
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

export type SituationType = "expedicao" | "guerra" | "crise" | "projeto" | "discurso" | "investigacao";

export type OngoingSituation = {
  id: string;
  title: string;
  type: SituationType;
  description: string;
  startedAtTurn: number;
  totalTurns: number;
  turnsRemaining: number;
  status: "ativa" | "concluida" | "critica";
  assignedPersonnel?: string;
  consequencesSummary?: string;
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
  | { type: "EXECUTE_OR_EXILE_CHARACTER"; characterId: string; actionType: "execute" | "exile" }
  | {
      type: "START_SITUATION";
      title: string;
      situationType: SituationType;
      durationTurns: number;
      description: string;
      personnel?: string;
    }
  | { type: "RESOLVE_SITUATION"; situationId: string; resultText: string };

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

export type EventChainInfo = {
  id: string;
  step: number;
  maxSteps: number;
  nextEventId?: string;
  branchOnChoice?: Record<string, string>;
};

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
  chain?: EventChainInfo;
  isDynamic?: boolean;
  generatedByAI?: boolean;
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

export type KingdomPrologue = {
  rulerTitle: string;
  rulerName: string;
  dynasty: string;
  age: number;
  traits: string[];
  reputation: string;
  predecessorName: string;
  predecessorRelation: string;
  ascensionCircumstance: string;
  recentEvents: string[];
  initialCrisis: string;
  courtWhisper: string;
  proceduralVariation: string;
};

export type KingdomState = {
  id: string;
  name: string;
  storylineId?: string;
  storylineTitle?: string;
  worldLorePrompt?: string;
  seed: number;
  prologue?: KingdomPrologue;
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
  deceasedCharacters?: Array<{
    id: string;
    name: string;
    turn: number;
    year: number;
    cause: string;
  }>;
  activeChains?: Record<string, { currentStep: number; lastChoiceId?: string }>;
  ongoingSituations?: OngoingSituation[];
  realms: Record<string, Realm>;

  documents?: DocumentEntry[];
  conversationHistory?: ConversationMessage[];

  delayedEvents: DelayedEvent[];
  history: GameHistoryEntry[];

  currentEvent: GameEvent | null;
  pendingDynamicEvent?: GameEvent | null;

  isGameOver: boolean;
  gameOverReason?: string;
  isVictory?: boolean;
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
  isVictory?: boolean;
};
