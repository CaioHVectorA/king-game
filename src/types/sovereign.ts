// ============================================================================
// SOBERANIA: CONTRATOS DO MOTOR DE JOGO DE ESCOLHAS E NARRATIVA POR IA
// ============================================================================

import { Character, GameAction, KingdomState } from "./game";

/**
 * As Quatro Vozes Psicológicas da Mente do Soberano (Mind Palace)
 * Inspirado nos arquétipos psicológicos de liderança e monólogo interior.
 */
export type MindVoiceId = "cold_reason" | "noble_heart" | "iron_crown" | "primal_instinct";

export interface MindVoice {
  id: MindVoiceId;
  name: string;
  title: string;
  avatar: string;
  color: string;
  affinity: number; // 0 a 100
  whisper: string; // O conselho / sussurro imediato sobre a situação atual
  dominantPhilosophy: string;
}

export interface LeaderPsychology {
  tension: number; // 0 a 100 (Estresse/Paranoia da Coroa)
  corruption: number; // 0 a 100 (Tentação pelo autoritarismo e abuso de poder)
  acumen: number; // 0 a 100 (Capacidade de discernir mentiras de conselheiros)
  honor: number; // 0 a 100 (Compromisso com a palavra dada)
  activeTraits: string[]; // Ex: ["Paranoico", "Visionário", "Gélido", "Mártir"]
  voices: Record<MindVoiceId, MindVoice>;
}

/**
 * Facções Estruturais Vivas
 */
export type FactionId = "nobility" | "clergy" | "commoners" | "military" | "merchants";

export interface LivingFaction {
  id: FactionId;
  name: string;
  leaderName: string;
  leaderTitle: string;
  avatar: string;
  power: number; // 0 a 100 (Influência política no Estado)
  approval: number; // -100 a 100 (Lealdade ao governante)
  radicalsPercentage: number; // 0 a 100 (Risco de revolta aberta)
  demands: string[]; // Demandas não atendidas
  secretsKnown: string[]; // Chantagens que a facção tem contra o trono
  lastActionSummary: string;
}

/**
 * Ecos Narrativos de Consequência (Consequence Echoes)
 * Sementes de decisões do passado que amadurecem e voltam para recompensar ou cobrar o jogador.
 */
export interface ConsequenceEcho {
  id: string;
  originTurn: number;
  triggerTurn: number; // Turno em que o eco se manifesta
  title: string;
  causeDecision: string;
  manifestationDescription: string;
  potentialConsequences: string[];
  resolved: boolean;
  resolutionEffect?: string;
}

/**
 * Éditos e Leis Imperiais
 */
export type EdictCategory = "economia" | "justica" | "militar" | "religiao" | "bem_estar";

export interface EdictDefinition {
  id: string;
  title: string;
  category: EdictCategory;
  summary: string;
  proclamationCost: {
    gold?: number;
    stability?: number;
  };
  monthlyMaintenance: {
    gold?: number;
    food?: number;
  };
  factionEffects: Partial<Record<FactionId, number>>;
  isEnacted: boolean;
  enactedTurn?: number;
  loreQuote: string;
}

/**
 * Teatro Estratégico de Guerra e Províncias (War Table)
 */
export interface RealmProvince {
  id: string;
  name: string;
  garrison: number; // 0 a 100
  development: number; // 0 a 100
  unrest: number; // 0 a 100
  suppliesLevel: "abundante" | "estavel" | "escasso" | "fome";
  threatLevel: "pacifica" | "tensao" | "incursao" | "cerco_iminente";
  controllingFaction: FactionId;
  specialTrait: string;
}

/**
 * Conspiração da Corte (Court Intrigue)
 */
export interface CourtConspiracy {
  id: string;
  target: string;
  instigatorFaction: FactionId;
  progress: number; // 0 a 100 (Ao atingir 100, a conspiração é deflagrada)
  discovered: boolean;
  goal: "golpe_de_estado" | "assassinato" | "desfalque_do_tesouro" | "revolta_popular" | "sabotagem_militar";
  clues: string[];
}

/**
 * Dilema de Escolha Rápida do Trono
 */
export interface ChoiceDilemmaOption {
  id: string;
  label: string;
  intentTag: "diplomatica" | "implacavel" | "mercantil" | "religiosa" | "ousada";
  voiceAdvocate?: MindVoiceId;
  riskDescription: string;
  projectedOutcome: string;
  promptSuggestion?: string;
}

export interface ChoiceDilemma {
  id: string;
  title: string;
  speaker: Character;
  context: string;
  urgentNotice?: string;
  options: ChoiceDilemmaOption[];
  allowFreeText: boolean;
}

/**
 * Finais Dinâmicos Catalogados
 */
export type EndingType = "gloria_dourada" | "tirania_de_ferro" | "colapso_anarquico" | "martirio_sacro" | "exilio_silencioso" | "novo_amanhecer";

export interface DynasticEndingResult {
  endingId: string;
  type: EndingType;
  title: string;
  subtitle: string;
  epitaph: string;
  finalNarrative: string;
  survivedYears: number;
  survivedTurns: number;
  achievementsUnlocked: string[];
  dynasticScore: number;
}
