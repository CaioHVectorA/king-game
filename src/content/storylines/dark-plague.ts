import { StorylineDefinition } from "./types";
import { GameEvent } from "@/types/game";

const plagueEvents: GameEvent[] = [
  {
    id: "plague_water_well",
    title: "Águas Negras nos Poços da Baixa Cidade",
    description:
      "A peste bubônica transformou os canais da capital em cemitérios a céu aberto. O Inquisidor Malakor jura que bruxas envenenaram os aquedutos e exige fogueiras públicas. Vivienne, a boticária real, suplica por fundos para destilar ervas e isolar os doentes.",
    characterId: "inquisitor_malakor",
    tags: ["peste", "inquisição", "saúde"],
    weight: 15,
    choices: [
      {
        id: "fund_apothecary",
        label: "Financiar o laboratório de Vivienne e decretar quarentena médica",
        intentDescription: "Aborda a praga com ciência e higiene ao custo de ouro e fúria clerical.",
        actions: [
          { type: "ADD_GOLD", amount: -120 },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: -25 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 20 },
        ],
      },
      {
        id: "unleash_inquisition",
        label: "Autorizar o Santo Ofício a queimar os heréticos suspeitos",
        intentDescription: "Agrada ao fanatismo religioso e acalma o pânico com bodes expiatórios.",
        actions: [
          { type: "MODIFY_FACTION", faction: "clergy", amount: 30 },
          { type: "MODIFY_STABILITY", amount: -15 },
          { type: "MODIFY_POPULATION", amount: -900 },
        ],
      },
      {
        id: "seal_palace_gates",
        label: "Trancar os portões do palácio real e ignorar os bairros infectados",
        intentDescription: "Preserva a corte real enquanto o povo morre abandonado.",
        actions: [
          { type: "MODIFY_FACTION", faction: "peasants", amount: -40 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: 15 },
          { type: "MODIFY_STABILITY", amount: -10 },
        ],
      },
    ],
  },
  {
    id: "plague_pilgrims_arrival",
    title: "A Procissão dos Flagelantes",
    description:
      "Milhares de peregrinos cobertos de chagas e chicoteando as próprias costas chegaram às portas da capital, clamando pelo fim do mundo e exigindo a abdicação dos nobres pecadores.",
    characterId: "apothecary_vivienne",
    tags: ["fanatismo", "peregrinos", "estabilidade"],
    weight: 12,
    choices: [
      {
        id: "disperse_pilgrims",
        label: "Ordenar que a guarda afaste a procissão com armas para conter o contágio",
        intentDescription: "Evita nova onda de peste na cidade ao custo de violência santa.",
        actions: [
          { type: "MODIFY_MILITARY", amount: -5 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: -20 },
          { type: "MODIFY_STABILITY", amount: 10 },
        ],
      },
      {
        id: "open_chapels",
        label: "Acolher os peregrinos nos templos com esmolas do tesouro régio",
        intentDescription: "Demonstra piedade extrema mas explode os casos da febre.",
        actions: [
          { type: "ADD_GOLD", amount: -80 },
          { type: "MODIFY_POPULATION", amount: -1800 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: 25 },
        ],
      },
    ],
  },
];

export const darkPlagueStoryline: StorylineDefinition = {
  id: "dark_plague",
  name: "A Praga das Sombras",
  subtitle: "Fé Cega, Doença Negra e Decadência Dinástica",
  description:
    "Uma enfermidade sobrenatural assola as províncias. Os sinos fúnebres não cessam, fogueiras da Inquisição ardem nas esquinas e o medo domina o coração dos homens. Governar agora é escolher quem viverá e quem será entregue à terra fofa.",
  era: "Século da Penitência (Ano 1210)",
  difficulty: "Brutal",
  tags: ["Dark Fantasy", "Horror", "Epidemia", "Inquisição", "Sobrevivência"],
  bannerEmoji: "🩸",

  worldLorePrompt: `
Universo: Reino em decomposição moral e sanitária sob a Febre das Sombras.
Atmosfera: Céus plúmbeos, névoa espessa sobre os rios, máscaras de bico de corvo dos boticários, fogueiras crepitando em praça pública.
Conflito: A Inquisição liderada por Malakor vê na peste um castigo divino aos pecados da corte; cientistas e boticários como Vivienne tentam conter a infecção sem superstição.
Tom Literário: Gótico medieval, soturno, evocativo, tratando da fragilidade da vida, podridão de tecidos e desespero das massas.
`,

  initialState: {
    year: 1210,
    month: 11,
    gold: 380,
    food: 420,
    population: 19500,
    stability: 46,
    military: 50,
    factions: {
      nobles: -10,
      merchants: -20,
      clergy: 35,
      peasants: -25,
      military: 15,
    },
    relations: {
      arvandor: -30, // Fronteiras fechadas por quarentena
      eldoria: -40,  // Portos bloqueados
      khar: 0,
    },
    laws: ["Toque de Recolher Noturno", "Quarentena do Fogo Sagrado"],
    flags: {
      plague_active: true,
      inquisition_roaming: true,
    },
    activeWars: [],
  },

  characters: {
    inquisitor_malakor: {
      id: "inquisitor_malakor",
      name: "Grão-Inquisidor Malakor",
      title: "O Martelo dos Hereges",
      role: "Sacerdote",
      loyalty: 30,
      influence: 85,
      alive: true,
      traits: ["Fanático", "Implacável", "Asceta"],
      faction: "clergy",
      avatar: "🔥",
    },
    apothecary_vivienne: {
      id: "apothecary_vivienne",
      name: "Vivienne de Lis",
      title: "Boticária-Mor da Coroa",
      role: "Conselheira",
      loyalty: 70,
      influence: 50,
      alive: true,
      traits: ["Erudita", "Alquimista", "Corajosa"],
      faction: "merchants",
      avatar: "🧪",
    },
    baron_cassian: {
      id: "baron_cassian",
      name: "Barão Cassian",
      title: "Senhor dos Feudos do Lago",
      role: "Nobre",
      loyalty: 45,
      influence: 65,
      alive: true,
      traits: ["Paranoico", "Isolacionista", "Rico"],
      faction: "nobles",
      avatar: "🏰",
    },
  },

  realms: {
    arvandor: {
      id: "arvandor",
      name: "Império de Arvandor",
      population: 38000,
      military: 75,
      wealth: 60,
      relation: -30,
      flags: { borders_sealed: true },
    },
    eldoria: {
      id: "eldoria",
      name: "Portos Fechados de Eldoria",
      population: 24000,
      military: 35,
      wealth: 70,
      relation: -40,
      flags: { maritime_quarantine: true },
    },
    khar: {
      id: "khar",
      name: "Estepes Remotas de Khar",
      population: 30000,
      military: 60,
      wealth: 25,
      relation: 0,
      flags: { uninfected: true },
    },
  },

  events: [...plagueEvents],
};
