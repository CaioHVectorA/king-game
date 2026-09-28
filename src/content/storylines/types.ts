import { Character, Factions, GameEvent, Realm } from "@/types/game";

export type StorylineDifficulty = "Fácil" | "Equilibrado" | "Desafiador" | "Brutal";

export type StorylineInitialState = {
  year: number;
  month: number;
  gold: number;
  food: number;
  population: number;
  stability: number;
  military: number;
  factions: Factions;
  relations: Record<string, number>;
  laws: string[];
  flags: Record<string, boolean>;
  activeWars: string[];
};

export type StorylineResourceLabels = {
  gold: { name: string; icon: string; description: string; unit?: string };
  food: { name: string; icon: string; description: string; unit?: string };
  population: { name: string; icon: string; description: string; unit?: string };
  stability: { name: string; icon: string; description: string; unit?: string };
  military: { name: string; icon: string; description: string; unit?: string };
};

export type StorylineDefinition = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  era: string;
  difficulty: StorylineDifficulty;
  tags: string[];
  bannerEmoji: string;

  // Rótulos e unidades variáveis de estado do domínio
  resourceLabels?: StorylineResourceLabels;

  // Diretrizes narrativas e de lore para a IA
  worldLorePrompt: string;

  // Estado inicial parametrizado
  initialState: StorylineInitialState;

  // Conselho e personagens característicos
  characters: Record<string, Character>;

  // Reinos vizinhos e geopolítica
  realms: Record<string, Realm>;

  // Eventos exclusivos desta linha narrativa
  events: GameEvent[];
};
