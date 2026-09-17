import { StorylineDefinition } from "./types";
import { INITIAL_CHARACTERS } from "@/lib/game/characters";
import { INITIAL_REALMS } from "@/lib/game/realms";
import { GameEvent } from "@/types/game";

const valoriaOpeningEvents: GameEvent[] = [
  {
    id: "valoria_coronation_jubilee",
    title: "O Jubileu da Coroação nos Salões de Mármore",
    description:
      "Embaixadores e barões de todas as províncias chegam à capital para celebrar o aniversário de coroação da dinastia. Mestre Alistair e Lorde Vane debatem se a coroa deve oferecer um banquete suntuoso com esmolas ou reservar os cofres para fortificações.",
    characterId: "chancellor_vane",
    tags: ["celebração", "corte", "ouro"],
    weight: 15,
    choices: [
      {
        id: "grand_jubilee_feast",
        label: "Promover grandioso banquete e distribuir carretas de pão ao povo",
        intentDescription: "Gasta recursos para elevar ao máximo a lealdade das massas e da nobreza.",
        actions: [
          { type: "ADD_GOLD", amount: -110 },
          { type: "ADD_FOOD", amount: -60 },
          { type: "MODIFY_STABILITY", amount: 15 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: 15 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 20 },
        ],
      },
      {
        id: "austere_prayer",
        label: "Celebrar com orações austeras na Sé e doar ouro aos mosteiros",
        intentDescription: "Agrada ao clero mantendo gastos reais comedidos.",
        actions: [
          { type: "ADD_GOLD", amount: -50 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: 25 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
    ],
  },
];

export const valoriaClassicStoryline: StorylineDefinition = {
  id: "valoria_classic",
  name: "As Crônicas de Valoria",
  subtitle: "A Época de Ouro e Conspirações Feudais",
  description:
    "O Reino de Valoria desfruta de uma paz próspera, porém frágil. Entre os salões de mármore e as guildas portuárias, nobres e mercadores disputam a riqueza do trono enquanto o alto clero exige obediência espiritual.",
  era: "Alta Idade Média (Ano 1142)",
  difficulty: "Equilibrado",
  tags: ["Política", "Comércio", "Diplomacia", "Clássico"],
  bannerEmoji: "👑",

  worldLorePrompt: `
Universo: Reino de Valoria e as Terras Centrais.
Cultura: Nobreza feudal tradicional que valoriza linhagens antigas e banquetes suntuosos, contrastada pela emergente Liga Mercante de Eldoria.
Clima Religioso: Culto da Chama Sagrada liderado pelo Arcebispo, zeloso contra heresias e dízimos em atraso.
Tensão Central: Os barões temem a perda de terras para as guildas, e os camponeses suportam o peso dos tributos nas épocas de seca.
Estilo Narrativo: Solene, cortesão, com foco em intrigas palacianas e decisões de estado ponderadas.
`,

  initialState: {
    year: 1142,
    month: 3,
    gold: 450,
    food: 700,
    population: 26500,
    stability: 72,
    military: 60,
    factions: {
      nobles: 15,
      merchants: 25,
      clergy: 20,
      peasants: 10,
      military: 30,
    },
    relations: {
      arvandor: -15,
      eldoria: 30,
      khar: -40,
    },
    laws: ["Dízimo Real Padrão", "Alistamento Obrigatório de Fronteira"],
    flags: {
      spring_season: true,
      coronation_completed: true,
    },
    activeWars: [],
  },

  characters: { ...INITIAL_CHARACTERS },
  realms: { ...INITIAL_REALMS },
  events: [...valoriaOpeningEvents],
};
