import { KingdomState, Ruler } from "@/types/game";
import { getStoryline } from "@/content/storylines";
import { generateSeededPrologue } from "./prologue";
import { getStorylineDocuments } from "./documents";
import { INITIAL_CHARACTERS } from "./characters";
import { PRNG } from "./rng";

export function createInitialKingdomState(params?: {
  name?: string;
  rulerName?: string;
  rulerTitle?: string;
  archetype?: string;
  origin?: string;
  personalIntent?: string;
  seed?: number;
  storylineId?: string;
}): KingdomState {
  const seed = params?.seed ?? Math.floor(Math.random() * 1000000);
  const storyline = getStoryline(params?.storylineId);
  const isSciFi = storyline.id === "colony_exodus";
  const kingdomName = params?.name || (isSciFi ? "Estação Orbital Exodus-7" : "Reino de Valoria");
  const rulerName = params?.rulerName || (isSciFi ? "Diretora Vance" : "Alden II");

  const initialRuler: Ruler = {
    id: "ruler_1",
    name: rulerName,
    dynasty: isSciFi ? "Diretoria Exodus" : "Casa de Valente",
    title: params?.rulerTitle || (isSciFi ? "Diretor-Geral" : "Sua Majestade Real"),
    age: 36,
    reignYears: 1,
    traits: isSciFi ? ["Pragmático", "Cibernético", "Estratégico"] : ["Justo", "Cauteloso", "Estratégico"],
    avatar: isSciFi ? "🛰️" : "👑",
    archetype: params?.archetype,
    origin: params?.origin,
    personalIntent: params?.personalIntent,
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
  const prologue = generateSeededPrologue({
    storylineId: storyline.id,
    ruler: initialRuler,
    kingdomName,
    seed,
  });

  const enrichedWorldLore = `${storyline.worldLorePrompt}

ANTECEDENTES DA COROAÇÃO (SEED ${seed}):
- Soberano: ${initialRuler.name} (${initialRuler.traits.join(", ")}) - ${prologue.reputation}
- Antecessor: ${prologue.predecessorName} (${prologue.predecessorRelation}). Causa da transição: ${prologue.ascensionCircumstance}
- Acontecimentos Imediatos: ${prologue.proceduralVariation}
- Rumor da Corte: "${prologue.courtWhisper}"
`;

  return {
    id: `game_${Date.now()}_${seed}`,
    name: kingdomName,
    storylineId: storyline.id,
    storylineTitle: storyline.name,
    worldLorePrompt: enrichedWorldLore,
    seed,
    prologue,
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

    characters: (() => {
      const isCustomTheme =
        storyline.id === "rio_zombie" ||
        storyline.id === "zombie_apocalypse" ||
        storyline.id === "colony_exodus";

      const baseCharacters = isCustomTheme
        ? { ...storyline.characters }
        : { ...INITIAL_CHARACTERS, ...storyline.characters };

      const charPrng = new PRNG(seed + 777);
      const RANDOM_TRAIT_POOL = [
        "Obstinado", "Desconfiado", "Idealista", "Vigilante", "Cansado da Guerra",
        "Disciplinado", "Rancoroso", "Leal", "Perspicaz", "Pragmático", "Silencioso",
        "Audacioso", "Calculista", "Empático", "Incorruptível", "Implacável"
      ];

      const seededChars: Record<string, any> = {};
      for (const [id, char] of Object.entries(baseCharacters)) {
        const loyaltyDelta = Math.floor(charPrng.next() * 15) - 7;
        const influenceDelta = Math.floor(charPrng.next() * 11) - 5;
        const extraTrait = RANDOM_TRAIT_POOL[Math.floor(charPrng.next() * RANDOM_TRAIT_POOL.length)];
        const existingTraits = Array.isArray(char.traits) ? [...char.traits] : [];
        if (!existingTraits.includes(extraTrait)) {
          existingTraits.push(extraTrait);
        }

        seededChars[id] = {
          ...char,
          loyalty: Math.max(15, Math.min(95, (char.loyalty || 50) + loyaltyDelta)),
          influence: Math.max(15, Math.min(95, (char.influence || 50) + influenceDelta)),
          traits: existingTraits,
        };
      }
      return seededChars;
    })(),
    deceasedCharacters: [],
    activeChains: {},
    ongoingSituations: [],
    realms: { ...storyline.realms },

    delayedEvents: [],
    history: [],

    currentEvent: null,
    pendingDynamicEvent: null,

    documents: getStorylineDocuments(storyline.id),
    conversationHistory: [],

    isGameOver: false,
    gameOverReason: undefined,
  };
}

export function cloneKingdomState(state: KingdomState): KingdomState {
  return JSON.parse(JSON.stringify(state));
}
