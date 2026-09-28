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
  storylineId?: string;
};

export type AIDynamicEventProposal = {
  title: string;
  description: string;
  characterName?: string;
  characterTitle?: string;
  characterRole?: string;
  characterFaction?: FactionName;
  characterAvatar?: string;
  characterAppearance?: string;
  choices?: Array<{ id: string; label: string; intentDescription?: string }>;
};

export type AICampaignEnding = {
  isGameOver: boolean;
  isVictory?: boolean;
  reason: string;
};

export type AIInterpretationResponse = {
  intent: string;
  actions: GameAction[];
  narrative: string;
  confidence: number;
  nextEventProposal?: AIDynamicEventProposal;
  campaignEnding?: AICampaignEnding;
};

export interface AIProvider {
  name: string;
  interpretAndNarrate(request: AIInterpretationRequest): Promise<AIInterpretationResponse>;
}
