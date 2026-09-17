import { StorylineDefinition } from "./types";
import { GameEvent } from "@/types/game";

const kharEvents: GameEvent[] = [
  {
    id: "khar_siege_gate",
    title: "O Cerco do Desfiladeiro do Trovão",
    description:
      "A cavalaria pesada de Khar cercou a principal fortaleza de passagem da fronteira. Milhares de flechas com fogo caem dia e noite. O General pede permissão para uma investida desesperada ou recuo tático.",
    characterId: "general_ironwall",
    tags: ["guerra", "cerco", "militar"],
    weight: 15,
    choices: [
      {
        id: "sally_forth",
        label: "Liderar contra-ataque de cavalaria de choque pelas colinas",
        intentDescription: "Racha o cerco inimigo com grandes perdas de veteranos.",
        actions: [
          { type: "MODIFY_MILITARY", amount: -15 },
          { type: "MODIFY_STABILITY", amount: 15 },
          { type: "MODIFY_FACTION", faction: "military", amount: 25 },
          { type: "ADD_GOLD", amount: 90, reason: "Despojos de guerra dos chefes de clã" },
        ],
      },
      {
        id: "reinforce_walls_gold",
        label: "Contratar lanceiros mercenários eldorienses e comprar tempo",
        intentDescription: "Gasta ouro para manter as muralhas sem arriscar a guarda real.",
        actions: [
          { type: "ADD_GOLD", amount: -160 },
          { type: "MODIFY_MILITARY", amount: 15 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
      {
        id: "tribute_khar",
        label: "Pagar tributo em rebanhos e armas para retirar o cerco",
        intentDescription: "Salva os soldados ao custo da honra e dos alimentos.",
        actions: [
          { type: "ADD_FOOD", amount: -180 },
          { type: "MODIFY_FACTION", faction: "military", amount: -30 },
          { type: "MODIFY_STABILITY", amount: -15 },
        ],
      },
    ],
  },
  {
    id: "scorched_earth_farms",
    title: "Tática de Terra Arrasada",
    description:
      "A vanguarda nômade avança pelas campinas setentrionais. Seus batedores queimarão celeiros de qualquer forma. O Conselho Militar propõe queimar nossas próprias lavouras antes que sirvam de alimento ao invasor.",
    characterId: "general_ironwall",
    tags: ["guerra", "camponeses", "comida"],
    weight: 12,
    choices: [
      {
        id: "burn_crops",
        label: "Incendiar os campos e evacuar os colonos para a capital",
        intentDescription: "Mata o invasor de inanição mas deixa milhares desabrigados.",
        actions: [
          { type: "ADD_FOOD", amount: -160 },
          { type: "MODIFY_POPULATION", amount: -1500 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -25 },
          { type: "MODIFY_MILITARY", amount: 10 },
        ],
      },
      {
        id: "defend_farms",
        label: "Guarnecer cada vila com piquetes de infantaria",
        intentDescription: "Protege os agricultores ao custo de dispersão de tropas.",
        actions: [
          { type: "MODIFY_MILITARY", amount: -10 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 25 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -10 },
        ],
      },
    ],
  },
];

export const kharInvasionStoryline: StorylineDefinition = {
  id: "khar_invasion",
  name: "A Fúria das Estepes",
  subtitle: "Guerra de Sobrevivência e Cerco das Fronteiras",
  description:
    "A Horda dos Senhores da Guerra de Khar unificou as tribos do norte e marchou com fúria avassaladora contra vossas fortalezas. Os recursos são escassos, o metal é forjado em lanças e cada decreto define a sobrevivência da nação.",
  era: "Tempo de Guerra Total (Ano 1150)",
  difficulty: "Desafiador",
  tags: ["Guerra", "Militarismo", "Sobrevivência", "Estratégia"],
  bannerEmoji: "⚔️",

  worldLorePrompt: `
Universo: Fronteira Setentrional do Reino, linha de fortalezas de pedra cinzenta.
Cenário Atual: A Grande Horda de Khar cercou o desfiladeiro ocidental. Tambores de guerra de couro de boi ecoam nos vales.
Cultura: Marcial e austera. Ferrarias trabalham dia e noite, estandartes manchados de poeira e sangue.
Tensão Central: Se o exército falhar, o reino será saqueado. Se o povo morrer de fome pela guerra, haverá motim interno.
Estilo Narrativo: Épico, cru, tenso, com vocabulário de infantaria, cavalaria de choque, balistas e cerco militar.
`,

  initialState: {
    year: 1150,
    month: 6,
    gold: 320,
    food: 480,
    population: 22000,
    stability: 55,
    military: 82,
    factions: {
      nobles: 10,
      merchants: -10,
      clergy: 5,
      peasants: -5,
      military: 45,
    },
    relations: {
      arvandor: 10, // Arvandor receia a horda e apoia discretamente
      eldoria: -10,
      khar: -95, // Guerra mortal
    },
    laws: ["Mobilização Geral de Armas", "Racionamento Bélico Obrigatório"],
    flags: {
      under_siege: true,
      wartime_economy: true,
    },
    activeWars: ["khar"],
  },

  characters: {
    general_ironwall: {
      id: "general_ironwall",
      name: "Comandante Valerius",
      title: "O Escudo do Norte",
      role: "General",
      loyalty: 75,
      influence: 85,
      alive: true,
      traits: ["Implacável", "Tático de Cerco", "Cicatrizes de Ferro"],
      faction: "military",
      avatar: "🛡️",
    },
    blacksmith_bronn: {
      id: "blacksmith_bronn",
      name: "Mestre Bronn",
      title: "Mestre das Armaduras e Forjas",
      role: "Comerciante",
      loyalty: 40,
      influence: 60,
      alive: true,
      traits: ["Robusto", "Metalurgista", "Inflexível"],
      faction: "merchants",
      avatar: "🔨",
    },
    sister_maela: {
      id: "sister_maela",
      name: "Madre Maela",
      title: "Chefe dos Enfermeiros da Fé",
      role: "Sacerdotisa",
      loyalty: 60,
      influence: 55,
      alive: true,
      traits: ["Compassiva", "Curandeira", "Corajosa"],
      faction: "clergy",
      avatar: "🕊️",
    },
  },

  realms: {
    khar: {
      id: "khar",
      name: "A Grande Horda de Khar",
      population: 40000,
      military: 95,
      wealth: 35,
      relation: -95,
      flags: { raiders: true, relentless: true },
    },
    arvandor: {
      id: "arvandor",
      name: "Império de Arvandor",
      population: 42000,
      military: 70,
      wealth: 65,
      relation: 15,
      flags: { cautious_ally: true },
    },
    eldoria: {
      id: "eldoria",
      name: "Cidades Livres de Eldoria",
      population: 26000,
      military: 40,
      wealth: 90,
      relation: -5,
      flags: { arms_dealers: true },
    },
  },

  events: [...kharEvents],
};
