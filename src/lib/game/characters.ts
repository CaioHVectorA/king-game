import { Character, FactionName, KingdomState } from "@/types/game";

export const INITIAL_CHARACTERS: Record<string, Character> = {
  // Conselheiro Real Dedicado (encontro de conselho privado)
  counselor_morris: {
    id: "counselor_morris",
    name: "Mestre Morris",
    title: "Conselheiro Pessoal da Coroa",
    role: "Conselheiro Real",
    loyalty: 85,
    influence: 60,
    alive: true,
    traits: ["Sábio", "Observador", "Leal", "Diplomata"],
    faction: "nobles",
    avatar: "📜",
  },

  // Nobreza & Corte
  chancellor_vane: {
    id: "chancellor_vane",
    name: "Lorde Vane",
    title: "Chanceler da Coroa",
    role: "Chanceler",
    loyalty: 35,
    influence: 75,
    alive: true,
    traits: ["Astuto", "Aristocrata", "Ambicioso"],
    faction: "nobles",
    avatar: "👑",
  },
  baron_lucian: {
    id: "baron_lucian",
    name: "Barão Lucian de Aldeiavelha",
    title: "Porta-Voz dos Nobres do Leste",
    role: "Barão Feudal",
    loyalty: 30,
    influence: 65,
    alive: true,
    traits: ["Orgulhoso", "Rancoroso", "Conspirador"],
    faction: "nobles",
    avatar: "🏰",
  },
  lady_isolda: {
    id: "lady_isolda",
    name: "Lady Isolda de Val-Verde",
    title: "Matriarca das Terras Férteis",
    role: "Nobre Latifundiária",
    loyalty: 55,
    influence: 55,
    alive: true,
    traits: ["Tradicionalista", "Econômica", "Calculista"],
    faction: "nobles",
    avatar: "💎",
  },

  // Exército & Guarda
  general_thorne: {
    id: "general_thorne",
    name: "General Thorne",
    title: "Comandante das Legiões",
    role: "General",
    loyalty: 60,
    influence: 80,
    alive: true,
    traits: ["Disciplinado", "Veterano", "Implacável"],
    faction: "military",
    avatar: "⚔️",
  },
  captain_valeria: {
    id: "captain_valeria",
    name: "Capitã Valéria",
    title: "Comandante da Guarda das Muralhas",
    role: "Capitã de Defesa",
    loyalty: 75,
    influence: 60,
    alive: true,
    traits: ["Corajosa", "Incorruptível", "Tática"],
    faction: "military",
    avatar: "🛡️",
  },
  spy_carrick: {
    id: "spy_carrick",
    name: "Carrick da Sombra",
    title: "Mestre dos Espiões do Reino",
    role: "Batedor Chefe",
    loyalty: 50,
    influence: 50,
    alive: true,
    traits: ["Discreto", "Desconfiado", "Invisível"],
    faction: "military",
    avatar: "🗡️",
  },

  // Comércio & Guildas
  merchant_alistair: {
    id: "merchant_alistair",
    name: "Mestre Alistair",
    title: "Porta-voz da Liga Mercante",
    role: "Comerciante",
    loyalty: 40,
    influence: 70,
    alive: true,
    traits: ["Pragmático", "Rico", "Calculista"],
    faction: "merchants",
    avatar: "💰",
  },
  guildmaster_kaelen: {
    id: "guildmaster_kaelen",
    name: "Mestre Kaelen de Ferro",
    title: "Grão-Mestre dos Ferreiros e Artesãos",
    role: "Mestre de Guilda",
    loyalty: 45,
    influence: 60,
    alive: true,
    traits: ["Trabalhador", "Teimoso", "Exigente"],
    faction: "merchants",
    avatar: "🔨",
  },
  smuggler_bruno: {
    id: "smuggler_bruno",
    name: "Bruno das Docas",
    title: "Capitão dos Barqueiros do Rio",
    role: "Contrabandista",
    loyalty: 30,
    influence: 40,
    alive: true,
    traits: ["Oportunista", "Audacioso", "Bem-Informado"],
    faction: "merchants",
    avatar: "⚓",
  },

  // Clero & Fé
  archbishop_ignatius: {
    id: "archbishop_ignatius",
    name: "Arcebispo Ignatius",
    title: "Guardião da Chama Sagrada",
    role: "Sacerdote",
    loyalty: 50,
    influence: 65,
    alive: true,
    traits: ["Piedoso", "Dogmático", "Tradicionalista"],
    faction: "clergy",
    avatar: "🕊️",
  },
  inquisitor_malakor: {
    id: "inquisitor_malakor",
    name: "Inquisidor Malakor",
    title: "Vigário da Chama Purificadora",
    role: "Inquisidor",
    loyalty: 45,
    influence: 70,
    alive: true,
    traits: ["Fanático", "Severo", "Implacável"],
    faction: "clergy",
    avatar: "🔥",
  },
  boticaria_miriam: {
    id: "boticaria_miriam",
    name: "Mestra Miriam dos Remédios",
    title: "Boticária e Médica da Corte",
    role: "Boticária",
    loyalty: 70,
    influence: 45,
    alive: true,
    traits: ["Humanitária", "Erudita", "Paz"],
    faction: "clergy",
    avatar: "🌿",
  },

  // Camponeses & Povo
  elenor_peasant: {
    id: "elenor_peasant",
    name: "Elenor dos Vales",
    title: "Voz dos Lavradores",
    role: "Camponesa",
    loyalty: 20,
    influence: 55,
    alive: true,
    traits: ["Obstinada", "Carismática", "Idealista"],
    faction: "peasants",
    avatar: "🌾",
  },
  thomas_peasant: {
    id: "thomas_peasant",
    name: "Thomas dos Vales",
    title: "Líder dos Camponeses Armados",
    role: "Revolucionário",
    loyalty: 15,
    influence: 60,
    alive: true,
    traits: ["Feroz", "Vingativo", "Corajoso"],
    faction: "peasants",
    avatar: "⚒️",
  },
  old_marta: {
    id: "old_marta",
    name: "Marta do Forno Comunitário",
    title: "Matriarca da Cidade Baixa",
    role: "Trabalhadora",
    loyalty: 40,
    influence: 40,
    alive: true,
    traits: ["Sincera", "Sofrida", "Generosa"],
    faction: "peasants",
    avatar: "👵",
  },
};

/**
 * Tabela de sucessão para personagens executados/mortos.
 * Garante que se Elenor for executada, venha seu irmão Thomas ou seu sucessor,
 * e NUNCA o personagem morto ressuscite.
 */
const SUCCESSOR_MAP: Record<
  string,
  {
    id: string;
    name: string;
    title: string;
    role: string;
    faction: FactionName;
    traits: string[];
    avatar: string;
    motive: string;
  }
> = {
  elenor_peasant: {
    id: "thomas_peasant",
    name: "Thomas dos Vales (Irmão de Elenor)",
    title: "Líder da Vingança dos Lavradores",
    role: "Revolucionário Camponês",
    faction: "peasants",
    traits: ["Vingativo", "Feroz", "Desconfiado"],
    avatar: "⚒️",
    motive: "Assumiu a liderança após a morte de Elenor, cobrando justiça e sangue pela execução de sua irmã.",
  },
  chancellor_vane: {
    id: "baron_lucian",
    name: "Barão Lucian (Sobrinho de Vane)",
    title: "Chanceler em Exercício",
    role: "Chanceler Aristocrata",
    faction: "nobles",
    traits: ["Ambicioso", "Cauteloso", "Vingativo"],
    avatar: "🏰",
    motive: "Herdou a influência da família após a queda de Lorde Vane e jura conter o poder tirânico do trono.",
  },
  general_thorne: {
    id: "captain_valeria",
    name: "General Valéria de Ferro",
    title: "Nova Comandante das Legiões",
    role: "Comandante Geral",
    faction: "military",
    traits: ["Disciplinada", "Fria", "Tática"],
    avatar: "🛡️",
    motive: "Ascendeu ao comando militar supremo após a eliminação de Thorne.",
  },
  merchant_alistair: {
    id: "guildmaster_kaelen",
    name: "Mestre Kaelen (Substituto da Liga)",
    title: "Presidente Provisório das Guildas",
    role: "Porta-Voz Mercante",
    faction: "merchants",
    traits: ["Desconfiado", "Rígido", "Financeiro"],
    avatar: "💰",
    motive: "Assumiu os negócios da liga após a perda trágica de Alistair.",
  },
  archbishop_ignatius: {
    id: "inquisitor_malakor",
    name: "Patriarca Inquisidor Malakor",
    title: "Grão-Vigário da Chama Purificadora",
    role: "Líder Religioso Supremo",
    faction: "clergy",
    traits: ["Fanático", "Severo", "Radical"],
    avatar: "🔥",
    motive: "Tomou o conselho episcopal após a morte de Ignatius com linha-dura contra o trono.",
  },
};

/**
 * Retorna o personagem vivo ou seu sucessor se ele estiver morto.
 */
export function getActiveOrSuccessorCharacter(
  characterId: string,
  state: KingdomState
): Character {
  const current = state.characters[characterId];

  // Se o personagem existe e está vivo, retorna ele
  if (current && current.alive !== false) {
    return current;
  }

  // Se está morto, checa se há sucessor predefinido
  const definedSuccessor = SUCCESSOR_MAP[characterId];
  if (definedSuccessor) {
    const existing = state.characters[definedSuccessor.id];
    if (existing && existing.alive !== false) {
      return existing;
    }
    // Cria e registra o sucessor vivo no estado
    const newChar: Character = {
      id: definedSuccessor.id,
      name: definedSuccessor.name,
      title: definedSuccessor.title,
      role: definedSuccessor.role,
      faction: definedSuccessor.faction,
      loyalty: 25,
      influence: 55,
      alive: true,
      traits: definedSuccessor.traits,
      avatar: definedSuccessor.avatar,
    };
    state.characters[definedSuccessor.id] = newChar;
    return newChar;
  }

  // Gera sucessor procedural dinâmico para a facção
  const faction: FactionName = current?.faction || "peasants";
  return generateProceduralCharacter(faction, current?.role || "Enviado", state);
}

/**
 * Gera um personagem procedural com personalidade e nome únicos
 */
export function generateProceduralCharacter(
  faction: FactionName,
  baseRole: string,
  state: KingdomState
): Character {
  const factionPools: Record<
    FactionName,
    { names: string[]; titles: string[]; avatars: string[]; traits: string[] }
  > = {
    nobles: {
      names: ["Lorde Cassian", "Condessa Helena", "Barão Godfrey", "Duque Rodrigo", "Lady Beatriz"],
      titles: ["Senhor de Terras Altas", "Voz dos Feudais", "Conselheiro Nobre", "Patrício"],
      avatars: ["👑", "🏰", "💎", "🏛️"],
      traits: ["Altivo", "Calculista", "Tradicionalista"],
    },
    military: {
      names: ["Capitão Breno", "Comandante Rurik", "Tenente Apolo", "Sargento Valquíria", "Veterano Dario"],
      titles: ["Defensor dos Portões", "Oficial de Fronteira", "Comandante de Cavalaria", "Batedor"],
      avatars: ["⚔️", "🛡️", "🏹", "🪖"],
      traits: ["Disciplinado", "Corajoso", "Austero"],
    },
    merchants: {
      names: ["Feitor Jonas", "Mercadora Selina", "Mestre Barnabé", "Trocador Silas", "Guildmaster Otto"],
      titles: ["Mestre das Rotas", "Provedor de Armazéns", "Banqueiro das Docas", "Comissário"],
      avatars: ["💰", "📦", "⚖️", "🪙"],
      traits: ["Pragmático", "Negociador", "Rico"],
    },
    clergy: {
      names: ["Irmão Daniel", "Madre Teresa", "Monge Cipriano", "Diácono Elias", "Prior Barnabé"],
      titles: ["Voz da Piedade", "Guardião dos Cânones", "Confessor da Sé", "Escriba Sacro"],
      avatars: ["🕊️", "🕯️", "📜", "⛪"],
      traits: ["Piedoso", "Austero", "Eloquente"],
    },
    peasants: {
      names: ["Mateus do Moinho", "Clara das Hortas", "Bento do Arado", "Joana dos Bosques", "Lucas Ferreiro"],
      titles: ["Voz dos Lavradores", "Líder das Vilas", "Porta-Voz do Povo", "Representante Rural"],
      avatars: ["🌾", "⚒️", "🍞", "🧺"],
      traits: ["Cansado", "Determinado", "Solidário"],
    },
  };

  const pool = factionPools[faction] || factionPools.peasants;
  const randIdx = Math.floor(Math.random() * pool.names.length);
  const name = `${pool.names[randIdx]} ${Math.floor(Math.random() * 90 + 10)}`;
  const id = `proc_${faction}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newChar: Character = {
    id,
    name,
    title: pool.titles[randIdx % pool.titles.length],
    role: baseRole || "Peticionário",
    faction,
    loyalty: 40 + Math.floor(Math.random() * 30),
    influence: 40 + Math.floor(Math.random() * 30),
    alive: true,
    traits: pool.traits,
    avatar: pool.avatars[randIdx % pool.avatars.length],
  };

  state.characters[id] = newChar;
  return newChar;
}
