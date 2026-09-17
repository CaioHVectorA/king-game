import { GameAction, FactionName } from "./game";

export type AIInterpretationRequest = {
  eventTitle: string;
  eventDescription: string;
  playerDecision: string;
  stateSummary: {
    gold: number;
    food: number;
    population: number;
    stability: number;
    military: number;
    factions: Record<FactionName, number>;
    rulerName: string;
    activeWars: string[];
  };
  recentHistory: string[];
  charactersPresent?: Array<{ name: string; role: string }>;
  worldLore?: string;
};

export type AIInterpretationResponse = {
  intent: string;
  actions: GameAction[];
  narrative: string;
  confidence: number;
};

export interface AIProvider {
  name: string;
  interpretAndNarrate(request: AIInterpretationRequest): Promise<AIInterpretationResponse>;
}
