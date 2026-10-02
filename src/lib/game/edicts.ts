// ============================================================================
// SOBERANIA: MOTOR DE ÉDITOS, LEIS & REFORMAS DO ESTADO
// ============================================================================

import { EdictDefinition, FactionId } from "@/types/sovereign";
import { KingdomState } from "@/types/game";

export const MASTER_EDICTS_CATALOG: EdictDefinition[] = [
  // ── 1. ECONOMIA & FISCALIDADE ──
  {
    id: "edicto_tributo_dourado",
    title: "Dízimo da Coroa sobre o Comércio Fluvial",
    category: "economia",
    summary: "Taxa de 12% sobre todas as barcaças comerciais nos rios principais.",
    proclamationCost: { gold: 50, stability: 5 },
    monthlyMaintenance: { gold: -40 }, // Rende 40 de ouro por mês!
    factionEffects: { merchants: -20, nobility: 5 },
    isEnacted: false,
    loreQuote: "O rio pertence à terra; a terra pertence à coroa. Que paguem pelo direito de remar.",
  },
  {
    id: "edicto_celeiros_publicos",
    title: "Lei dos Silos Imperiais de Reserva",
    category: "economia",
    summary: "Obriga a retenção de 20% das colheitas para emergências de fome e cerco.",
    proclamationCost: { gold: 120 },
    monthlyMaintenance: { food: -30 }, // Armazena comida
    factionEffects: { commoners: 25, merchants: -10 },
    isEnacted: false,
    loreQuote: "Nenhum homem deve morrer de estômago vazio enquanto as muralhas do castelo estiverem de pé.",
  },
  {
    id: "edicto_moeda_pura",
    title: "Garantia da Pureza Metálica do Denário",
    category: "economia",
    summary: "Proíbe a cunhagem desvalorizada e pune falsificadores com a forca.",
    proclamationCost: { gold: 80, stability: 10 },
    monthlyMaintenance: { gold: 15 },
    factionEffects: { merchants: 30, commoners: 10 },
    isEnacted: false,
    loreQuote: "Uma moeda falsa corrói a honra do trono mais rápido do que um exército invasor.",
  },

  // ── 2. MILITAR & DEFESA ──
  {
    id: "edicto_conscricao_geral",
    title: "Alistamento Compulsório de Jovens",
    category: "militar",
    summary: "Convoca o segundo filho de cada família camponesa para as fileiras da Guarda de Ferro.",
    proclamationCost: { stability: 20 },
    monthlyMaintenance: { gold: 25, food: 20 },
    factionEffects: { military: 35, commoners: -30 },
    isEnacted: false,
    loreQuote: "A paz é um luxo comprado com o aço e o sangue da juventude.",
  },
  {
    id: "edicto_fortificacao_fronteiras",
    title: "Decreto dos Baluartes de Pedra",
    category: "militar",
    summary: "Constrói paliçadas, fossos e torres nas três passagens montanhosas.",
    proclamationCost: { gold: 200 },
    monthlyMaintenance: { gold: 10 },
    factionEffects: { military: 20, nobility: 10 },
    isEnacted: false,
    loreQuote: "Pedra levantada hoje é sangue poupado no inverno.",
  },
  {
    id: "edicto_muralhas_fechadas",
    title: "Lei Marcial & Toque de Recolher Noturno",
    category: "militar",
    summary: "Proíbe reuniões de mais de cinco pessoas após o pôr do sol e patrulha armada contínua.",
    proclamationCost: { stability: 10 },
    monthlyMaintenance: { gold: 20 },
    factionEffects: { military: 15, commoners: -25, clergy: -5 },
    isEnacted: false,
    loreQuote: "Quem não tem conspirações a esconder não precisa vagar pelas vielas à meia-noite.",
  },

  // ── 3. JUSTIÇA & AUTORIDADE ──
  {
    id: "edicto_tribunal_da_coroa",
    title: "Centralização da Suprema Justiça Real",
    category: "justica",
    summary: "Revoga o direito dos barões de enforcarem vassalos sem a chancela do magistrado real.",
    proclamationCost: { gold: 100, stability: 15 },
    monthlyMaintenance: { gold: 15 },
    factionEffects: { nobility: -35, commoners: 30 },
    isEnacted: false,
    loreQuote: "A lâmina da lei pertence a uma só mão: a do Soberano que carrega a Coroa.",
  },
  {
    id: "edicto_anistia_politica",
    title: "Decreto da Graça & Perdão Soberano",
    category: "justica",
    summary: "Concede salvo-conduto a desertores e rebeldes arrependidos.",
    proclamationCost: { stability: 5 },
    monthlyMaintenance: {},
    factionEffects: { commoners: 20, military: -15, nobility: -10 },
    isEnacted: false,
    loreQuote: "A verdadeira grandeza de um rei se mede pelas vidas que ele decide poupar.",
  },

  // ── 4. RELIGIÃO & DOGMA ──
  {
    id: "edicto_inquisicao_sagrada",
    title: "Carta de Pureza Dogmática & Caça às Sombras",
    category: "religiao",
    summary: "Concede poder aos inquisidores para revistarem lares em busca de bruxaria e profanação.",
    proclamationCost: { stability: 15 },
    monthlyMaintenance: { gold: 15 },
    factionEffects: { clergy: 40, commoners: -20, nobility: -10 },
    isEnacted: false,
    loreQuote: "O fogo expia o que a oração não conseguiu curar.",
  },
  {
    id: "edicto_tolerancia_heretica",
    title: "Pacto de Paz Confessional",
    category: "religiao",
    summary: "Garante proteção legal a curandeiros, estrangeiros e cultos da floresta.",
    proclamationCost: { stability: 10 },
    monthlyMaintenance: {},
    factionEffects: { clergy: -40, commoners: 15, merchants: 20 },
    isEnacted: false,
    loreQuote: "As colheitas crescem da mesma forma, não importa o nome do deus a quem o camponês reza.",
  },
  {
    id: "edicto_supremacia_coroa_sobre_altar",
    title: "Ato de Primazia da Coroa sobre o Sumo Clero",
    category: "religiao",
    summary: "Subordina as nomeações de bispos e a posse das terras eclesiásticas ao crivo do monarca.",
    proclamationCost: { gold: 100, stability: 25 },
    monthlyMaintenance: { gold: -30 }, // Arrecada renda das terras da igreja
    factionEffects: { clergy: -45, nobility: 15, merchants: 10 },
    isEnacted: false,
    loreQuote: "Dois senhores não podem partilhar a mesma coroa; Deus rege os céus, o Rei governa o solo.",
  },
  {
    id: "edicto_peregrinacao_sagrada",
    title: "Tratado das Estradas Sagradas & Proteção aos Peregrinos",
    category: "religiao",
    summary: "Estabelece escoltas reais e isenção de pedágios para fiéis em rota para os templos do Graal.",
    proclamationCost: { gold: 60, stability: 5 },
    monthlyMaintenance: { gold: 10 },
    factionEffects: { clergy: 30, commoners: 15, merchants: 10 },
    isEnacted: false,
    loreQuote: "Aquele que viaja em busca da divindade deve encontrar estradas livres de salteadores.",
  },

  // ── 5. ECONOMIA ADICIONAL & REFORMAS ESTRUTURAIS ──
  {
    id: "edicto_monopolio_sal_ferro",
    title: "Monopólio Estatal do Sal & Fundições de Ferro",
    category: "economia",
    summary: "Toda extração e refino de sal e minério de ferro passa a ser propriedade exclusiva da coroa.",
    proclamationCost: { gold: 150, stability: 15 },
    monthlyMaintenance: { gold: -50 }, // Lucro regular mensal
    factionEffects: { merchants: -35, nobility: -15, commoners: -10 },
    isEnacted: false,
    loreQuote: "Sem sal a carne apodrece; sem ferro a espada dobra. Quem controla ambos, governa o destino.",
  },
  {
    id: "edicto_banco_central_ouro",
    title: "Instituição do Tesouro Soberano de Crédito",
    category: "economia",
    summary: "Funda a primeira casa pública de câmbio imperial para emitir notas promissórias e regular empréstimos.",
    proclamationCost: { gold: 220, stability: 10 },
    monthlyMaintenance: { gold: -65 },
    factionEffects: { merchants: 40, nobility: -20 },
    isEnacted: false,
    loreQuote: "O crédito bem gerido move mais navios e ergue mais castelos do que montanhas de prata estagnada.",
  },
  {
    id: "edicto_corporacoes_oficio",
    title: "Estatuto das Guildas & Mestres de Ofício",
    category: "economia",
    summary: "Regulamenta o aprendizado de ferreiros, tecelões e carpinteiros, fixando padrões rígidos de qualidade.",
    proclamationCost: { gold: 75, stability: 5 },
    monthlyMaintenance: { gold: 5 },
    factionEffects: { merchants: 25, commoners: 15 },
    isEnacted: false,
    loreQuote: "O produto malfeito envergonha a praça pública e rouba o comprador humilde.",
  },
  {
    id: "edicto_livre_porto",
    title: "Franquia Portuária & Zonas Francas Marítimas",
    category: "economia",
    summary: "Abre os ancoradouros a embarcações de reinos estrangeiros com tarifas alfandegárias zeradas.",
    proclamationCost: { gold: 90, stability: 10 },
    monthlyMaintenance: { gold: -25, food: -15 },
    factionEffects: { merchants: 45, nobility: -20, commoners: 10 },
    isEnacted: false,
    loreQuote: "Que venham as naus do sul e do oriente; a abundância enriquece quem não teme o forasteiro.",
  },

  // ── 6. MILITARISMO & TÁTICA DE GUERRA ──
  {
    id: "edicto_guarda_imortais",
    title: "Criação da Guarda Imperial dos Imortais",
    category: "militar",
    summary: "Corpo de elite permanente de mil veteranos disciplinados que juram lealdade direta apenas à pessoa do monarca.",
    proclamationCost: { gold: 250, stability: 10 },
    monthlyMaintenance: { gold: 35, food: 20 },
    factionEffects: { military: 40, nobility: -25 },
    isEnacted: false,
    loreQuote: "Enquanto um único Imortal respirar, as portas do palácio jamais cederão aos rebeldes.",
  },
  {
    id: "edicto_doutrina_cavalaria",
    title: "Regimentos Pesados de Cavalaria dos Barões",
    category: "militar",
    summary: "Obriga cada senhor feudal a manter cem cavaleiros de armadura completa prontos para marchar em 48 horas.",
    proclamationCost: { gold: 110, stability: 5 },
    monthlyMaintenance: { food: 25 },
    factionEffects: { nobility: 25, military: 25, commoners: -15 },
    isEnacted: false,
    loreQuote: "O trote dos cavalos pesados estremece a terra antes mesmo que a vanguarda inimiga aviste as lanças.",
  },
  {
    id: "edicto_engenharia_balistica",
    title: "Arsenal Real de Trebuchet & Artilharia Balística",
    category: "militar",
    summary: "Cria oficinas de mestres engenheiros especializadas em aríetes reforçados, catapultas de torção e fogo grego.",
    proclamationCost: { gold: 180 },
    monthlyMaintenance: { gold: 20 },
    factionEffects: { military: 30, merchants: 10 },
    isEnacted: false,
    loreQuote: "Nenhuma muralha é eterna diante do cálculo exato dos arremessadores de pedra.",
  },
  {
    id: "edicto_vigilancia_fronteirica",
    title: "Linha de Atalaias & Torres de Fogo da Garganta",
    category: "militar",
    summary: "Rede interligada de postos avançados com tochas de sinalização para alertar sobre invasões em questão de minutos.",
    proclamationCost: { gold: 130, stability: 5 },
    monthlyMaintenance: { gold: 12 },
    factionEffects: { military: 20, commoners: 15 },
    isEnacted: false,
    loreQuote: "Quando a fogueira no cume acender, o reino inteiro saberá que a horda marcha.",
  },

  // ── 7. JUSTIÇA & CONTROLE SOCIAL ──
  {
    id: "edicto_codigo_civil_uniforme",
    title: "O Grande Código Civil dos Três Reinos",
    category: "justica",
    summary: "Unifica todas as leis provinciais díspares em um único livro encadernado em couro, válido para nobres e servos.",
    proclamationCost: { gold: 140, stability: 20 },
    monthlyMaintenance: { gold: 10 },
    factionEffects: { commoners: 35, nobility: -30, clergy: -10 },
    isEnacted: false,
    loreQuote: "A lei escrita não treme com o berro de um barão nem se apaga com o suborno do mercador.",
  },
  {
    id: "edicto_rede_olhos_coroa",
    title: "Ministério dos Ouvintes Ocultos & Espionagem",
    category: "justica",
    summary: "Infiltra informantes em tavernas, mosteiros e cortes baronais para desmantelar conspirações no berço.",
    proclamationCost: { gold: 160, stability: 15 },
    monthlyMaintenance: { gold: 25 },
    factionEffects: { nobility: -20, clergy: -15, commoners: -15 },
    isEnacted: false,
    loreQuote: "A conspiração que morre antes de nascer não deixa viúvas nem sangue no mármore.",
  },
  {
    id: "edicto_abolicionismo_servidao",
    title: "Decreto de Alforria dos Servos da Gleba",
    category: "justica",
    summary: "Extingue a vinculação hereditária do camponês à terra e permite sua livre circulação e posse de terras comunais.",
    proclamationCost: { gold: 200, stability: 30 },
    monthlyMaintenance: {},
    factionEffects: { commoners: 50, nobility: -50, merchants: 20 },
    isEnacted: false,
    loreQuote: "Nenhum homem nascido sob a luz dos deuses é gado para ser herdado junto às pedras de um feudo.",
  },
  {
    id: "edicto_pena_capital_exemplar",
    title: "Tribunal do cadafalso da Praça Maior",
    category: "justica",
    summary: "Julgamento sumário e execução pública em 24 horas para casos comprovados de alta traição ou motim.",
    proclamationCost: { stability: 15 },
    monthlyMaintenance: { gold: 5 },
    factionEffects: { military: 20, nobility: 10, commoners: -25 },
    isEnacted: false,
    loreQuote: "O medo é a argamassa silenciosa que sustenta impérios quando a lealdade fraqueja.",
  },

  // ── 8. BEM-ESTAR PÚBLICO & CIÊNCIAS ──
  {
    id: "edicto_cordao_sanitario",
    title: "Cordão Sanitário & Quarentena dos Portos e Estradas",
    category: "bem_estar",
    summary: "Isolamento forçado de bairros contaminados por peste com queima de enxofre e fechamento de portões por 40 dias.",
    proclamationCost: { gold: 90, stability: 20 },
    monthlyMaintenance: { food: 15 },
    factionEffects: { commoners: -15, merchants: -30, clergy: 10 },
    isEnacted: false,
    loreQuote: "Mais vale fechar uma vila por um mês do que enterrar metade do reino antes do degelo.",
  },
  {
    id: "edicto_escolas_catedrais",
    title: "Oficinas de Escribas & Escolas da Cidade",
    category: "bem_estar",
    summary: "Financia a instrução básica de leitura, cálculo e gramática para filhos de artesãos e escribas públicos.",
    proclamationCost: { gold: 130, stability: 5 },
    monthlyMaintenance: { gold: 15 },
    factionEffects: { commoners: 30, merchants: 25, clergy: -10 },
    isEnacted: false,
    loreQuote: "Um povo que sabe ler as leis não é facilmente enganado pelos caprichos de juízes venais.",
  },
  {
    id: "edicto_hospitais_caridade",
    title: "Casas de Misericórdia & Abrigo dos Veteranos",
    category: "bem_estar",
    summary: "Cria hospitais públicos para soldados feridos, viúvas de guerra e mendigos desvalidos.",
    proclamationCost: { gold: 110, stability: 5 },
    monthlyMaintenance: { gold: 18, food: 10 },
    factionEffects: { commoners: 35, clergy: 25, military: 20 },
    isEnacted: false,
    loreQuote: "O Estado que pede o sangue do jovem tem a obrigação sagrada de curar as feridas do velho.",
  },
];

/**
 * Retorna os éditos iniciais disponíveis
 */
export function initializeRealmEdicts(): EdictDefinition[] {
  return JSON.parse(JSON.stringify(MASTER_EDICTS_CATALOG));
}

/**
 * Promulga um édito, verificando custos e aplicando penalidades
 */
export function enactEdict(
  state: KingdomState,
  edictId: string
): { success: boolean; state: KingdomState; message: string } {
  const edicts = state.edicts || initializeRealmEdicts();
  const edict = edicts.find((e) => e.id === edictId);

  if (!edict) return { success: false, state, message: "Édicto não catalogado." };
  if (edict.isEnacted) return { success: false, state, message: "Este édito já está em vigor." };

  // Verifica custos
  const reqGold = edict.proclamationCost.gold || 0;
  const reqStab = edict.proclamationCost.stability || 0;

  if (state.gold < reqGold) {
    return { success: false, state, message: `Ouro insuficiente (requer ${reqGold} moedas).` };
  }
  if (state.stability < reqStab) {
    return { success: false, state, message: `Estabilidade do reino muito frágil para proclamar este édito.` };
  }

  // Aplica promulgacao
  const updatedEdicts = edicts.map((e) =>
    e.id === edictId ? { ...e, isEnacted: true, enactedTurn: state.turn } : e
  );

  const nextState: KingdomState = {
    ...state,
    gold: state.gold - reqGold,
    stability: Math.max(0, state.stability - reqStab),
    edicts: updatedEdicts,
    laws: [...state.laws, edict.title],
  };

  return {
    success: true,
    state: nextState,
    message: `O édito "${edict.title}" foi solenemente proclamado e selado com o anel real!`,
  };
}

/**
 * Revoga um édito em vigor
 */
export function revokeEdict(
  state: KingdomState,
  edictId: string
): { success: boolean; state: KingdomState; message: string } {
  const edicts = state.edicts || initializeRealmEdicts();
  const edict = edicts.find((e) => e.id === edictId);

  if (!edict || !edict.isEnacted) {
    return { success: false, state, message: "Este édito não está em vigor." };
  }

  const updatedEdicts = edicts.map((e) =>
    e.id === edictId ? { ...e, isEnacted: false, enactedTurn: undefined } : e
  );

  const nextState: KingdomState = {
    ...state,
    stability: Math.max(0, state.stability - 5), // Pequeno custo de instabilidade por recuo
    edicts: updatedEdicts,
    laws: state.laws.filter((l) => l !== edict.title),
  };

  return {
    success: true,
    state: nextState,
    message: `O édito "${edict.title}" foi revogado por decreto do trono.`,
  };
}
