import { KingdomState, Ruler } from "@/types/game";
import { getStoryline } from "@/content/storylines";

export function createInitialKingdomState(params?: {
  name?: string;
  rulerName?: string;
  seed?: number;
  storylineId?: string;
}): KingdomState {
  const seed = params?.seed ?? Math.floor(Math.random() * 1000000);
  const storyline = getStoryline(params?.storylineId);
  const kingdomName = params?.name || "Reino de Valoria";
  const rulerName = params?.rulerName || "Alden II";

  const initialRuler: Ruler = {
    id: "ruler_1",
    name: rulerName,
    dynasty: "Casa de Valente",
    title: "Sua Majestade Real",
    age: 36,
    reignYears: 4,
    traits: ["Justo", "Cauteloso", "Estratégico"],
    avatar: "👑",
  };

  const heirs: Ruler[] = [
    {
      id: "heir_1",
      name: "Príncipe Bryan",
      dynasty: "Casa de Valente",
      title: "Príncipe Herdeiro",
      age: 18,
      reignYears: 0,
      traits: ["Audaz", "Guerreiro"],
      avatar: "🗡️",
    },
    {
      id: "heir_2",
      name: "Princesa Lyra",
      dynasty: "Casa de Valente",
      title: "Princesa Real",
      age: 15,
      reignYears: 0,
      traits: ["Erudita", "Diplomata"],
      avatar: "📜",
    },
  ];

  const init = storyline.initialState;

  return {
    id: `game_${Date.now()}_${seed}`,
    name: kingdomName,
    storylineId: storyline.id,
    storylineTitle: storyline.name,
    worldLorePrompt: storyline.worldLorePrompt,
    seed,
    turn: 1,
    year: init.year,
    month: init.month,

    gold: init.gold,
    food: init.food,
    population: init.population,
    stability: init.stability,
    military: init.military,

    factions: { ...init.factions },
    relations: { ...init.relations },
    flags: { ...init.flags },

    activeWars: [...init.activeWars],
    laws: [...init.laws],

    currentRuler: initialRuler,
    heirs,
    rulersHistory: [],

    characters: { ...storyline.characters },
    realms: { ...storyline.realms },

    delayedEvents: [],
    history: [],

    currentEvent: null,

    isGameOver: false,
    gameOverReason: undefined,
  };
}

export function cloneKingdomState(state: KingdomState): KingdomState {
  return JSON.parse(JSON.stringify(state));
}
