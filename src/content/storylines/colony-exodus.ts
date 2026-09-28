import { StorylineDefinition } from "./types";
import { GameEvent } from "@/types/game";

const colonyOpeningEvents: GameEvent[] = [
  {
    id: "colony_reactor_flux",
    title: "Instabilidade Crítica no Reator de Plasma",
    description:
      "A Engenheira-Chefe Vance entra na ponte de comando com um tablet exibindo picos térmicos no núcleo de fusão. 'Diretor, as bobinas magnéticas estão falhando. Se não desviarmos energia dos suportes vitais do setor habitacional inferior ou autorizarmos queima forçada com risco de desgaste permanente, a estação sofrerá apagão geral.'",
    characterId: "chief_engineer",
    tags: ["energia", "sci-fi", "sobrevivência"],
    weight: 20,
    choices: [
      {
        id: "divert_lower_sectors",
        label: "Desviar energia dos setores residenciais inferiores para estabilizar o reator",
        intentDescription: "Garante a segurança da estação ao custo do descontentamento operário.",
        actions: [
          { type: "ADD_GOLD", amount: -40 },
          { type: "MODIFY_STABILITY", amount: -15 },
          { type: "MODIFY_MILITARY", amount: 10 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -25 },
          { type: "MODIFY_FACTION", faction: "military", amount: 15 },
        ],
      },
      {
        id: "emergency_coolant_purge",
        label: "Pagar purga de emergência com reservas de deutério do consórcio",
        intentDescription: "Preserva a população mas consome recursos valiosos de troca.",
        actions: [
          { type: "ADD_GOLD", amount: -120 },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "MODIFY_FACTION", faction: "merchants", amount: -15 },
        ],
      },
    ],
  },
  {
    id: "colony_hydroponic_blight",
    title: "Praga Fúngica nos Domos Hidropônicos A-3",
    description:
      "Dr. Julian Reid relata que uma contaminação química atingiu a síntese de biomassa proteica. 'Nossas rações para os próximos três ciclos caíram pela metade. Devemos impor racionamento calórico estrito nas fábricas ou adquirir lotes hidropônicos sintéticos da frota de sucateiros a preço de extorsão.'",
    characterId: "doctor_reid",
    tags: ["comida", "saúde", "sci-fi"],
    weight: 15,
    choices: [
      {
        id: "ration_caloric_intake",
        label: "Decretar racionamento calórico estrito para todos os setores civis",
        intentDescription: "Economiza biomassa mas causa protestos e fraqueza na força de trabalho.",
        actions: [
          { type: "ADD_FOOD", amount: 80 },
          { type: "MODIFY_STABILITY", amount: -15 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -20 },
        ],
      },
      {
        id: "buy_scavenger_rations",
        label: "Comprar suprimentos sintéticos dos sucateiros asteroidais",
        intentDescription: "Alivia a fome imediata através de gastos elevados de créditos.",
        actions: [
          { type: "ADD_GOLD", amount: -100 },
          { type: "ADD_FOOD", amount: 120 },
          { type: "MODIFY_FACTION", faction: "merchants", amount: 15 },
        ],
      },
    ],
  },
];

export const colonyExodusStoryline: StorylineDefinition = {
  id: "colony_exodus",
  name: "Estação Orbital Exodus-7",
  subtitle: "Sobrevivência Pós-Colapso e Gestão de Recursos Vitais",
  description:
    "A superfície planetária foi devastada. Você comanda a última megaestação orbital da civilização humana, equilibrando energia de plasma, ar respirável, motins operários e a cobiça de frotas de sucateiros do cinturão de asteroides.",
  era: "Futuro Distópico / Sci-Fi Orbital (Ano 2389)",
  difficulty: "Desafiador",
  tags: ["Sci-Fi", "Sobrevivência", "Recursos Vitais", "Distopia"],
  bannerEmoji: "🚀",

  worldLorePrompt: `
Universo: Estação Orbital Exodus-7 em órbita geoestacionária de uma Terra desolada por guerra nuclear e tempestades de plasma.
Cultura: Alta tecnologia decadente, pragmatismo militar de sobrevivência, contraste entre a elite de cientistas/engenheiros da cúpula de comando e os operários fabris dos decks inferiores.
Autoridade: O Diretor-Geral / Comandante da Estação possui poder supremo de decreto, aconselhado pela I.A. de bordo e pelos chefes de setor.
Recursos: Ouro representa Créditos de Energia e Cripto-Dólares; Comida representa Biomassa e Rações Hidropônicas; População representa Colonos Ativos e Técnicos; Ordem representa Estabilidade Civil e Ausência de Motins; Exército representa Forças de Segurança e Drones de Contenção.
Estilo Narrativo: Frio, técnico, urgente, claustrofóbico e cinematográfico. Termos como "Diretor", "Ponte de Comando", "Nível Inferior", "Descompressão".
`,

  initialState: {
    year: 2389,
    month: 1,
    gold: 380, // Créditos de Energia
    food: 520, // Rações Hidropônicas
    population: 34000, // Colonos Ativos
    stability: 65, // Integridade Social
    military: 55, // Força Policial de Segurança
    factions: {
      nobles: 15, // Alta Diretoria / Conselho Corporativo
      merchants: 20, // Guilda de Mineradores Asteroidais
      clergy: 10, // Cientistas & Culto do Horizonte Cósmico
      peasants: -10, // Sindicato de Operários dos Decks Inferiores
      military: 25, // Segurança da Estação
    },
    relations: {
      salvage_fleet: -10,
      bunker_surface: 15,
      orbital_pirates: -50,
    },
    laws: ["Protocolo de Oxigênio Nível 2", "Toque de Recolher nos Hangares"],
    flags: {
      reactor_stable: true,
      cryo_units_online: true,
    },
    activeWars: [],
  },

  characters: {
    protocol_edi: {
      id: "protocol_edi",
      name: "Protocolo EDI",
      role: "Conselheira Sintética de Bordo",
      title: "I.A. Central da Estação",
      loyalty: 80,
      influence: 75,
      alive: true,
      faction: "clergy",
      traits: ["Analítica", "Imparcial", "Infalível"],
      avatar: "🤖",
    },
    chief_engineer: {
      id: "chief_engineer",
      name: "Sarah Vance",
      role: "Engenheira-Chefe",
      title: "Supervisora do Reator",
      loyalty: 65,
      influence: 70,
      alive: true,
      faction: "peasants",
      traits: ["Pragmática", "Incansável"],
      avatar: "⚙️",
    },
    security_marshal: {
      id: "security_marshal",
      name: "Marechal Alex Roman",
      role: "Comandante da Segurança",
      title: "Chefe das Forças de Contenção",
      loyalty: 70,
      influence: 65,
      alive: true,
      faction: "military",
      traits: ["Severo", "Vigilante"],
      avatar: "🛡️",
    },
    doctor_reid: {
      id: "doctor_reid",
      name: "Dr. Julian Reid",
      role: "Diretor Médico e Biológico",
      title: "Mestre dos Domos Hidropônicos",
      loyalty: 60,
      influence: 55,
      alive: true,
      faction: "clergy",
      traits: ["Brilhante", "Metódico"],
      avatar: "🧪",
    },
  },

  realms: {
    salvage_fleet: {
      id: "salvage_fleet",
      name: "Frota de Sucateiros Asteroidais",
      population: 12000,
      military: 45,
      wealth: 70,
      relation: -10,
      flags: { hostile: false },
    },
    bunker_surface: {
      id: "bunker_surface",
      name: "Complexo Bunker Subterrâneo 04",
      population: 8500,
      military: 35,
      wealth: 40,
      relation: 15,
      flags: { allied: false },
    },
  },

  events: [...colonyOpeningEvents],
};
