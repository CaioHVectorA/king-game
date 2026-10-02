// ============================================================================
// SOBERANIA: MOTOR DE FACÇÕES VIVAS & DINÂMICA DE PODER DA CORTE
// ============================================================================

import { FactionId, LivingFaction } from "@/types/sovereign";
import { KingdomState } from "@/types/game";

export const DEFAULT_LIVING_FACTIONS: Record<FactionId, LivingFaction> = {
  nobility: {
    id: "nobility",
    name: "Alta Nobreza & Barões",
    leaderName: "Duque Raymond de Val-Dourado",
    leaderTitle: "Porta-Voz da Nobreza Feudal",
    avatar: "👑",
    power: 65,
    approval: 10,
    radicalsPercentage: 15,
    demands: [
      "Isenção tributária para feudos ancestrais",
      "Veto nobre na convocação extraordinária de conscritos",
    ],
    secretsKnown: [
      "Sabe de empréstimos clandestinos contraídos pela coroa no reinado anterior.",
    ],
    lastActionSummary: "Reuniu os barões em comitê privado para exigir terras de fronteira.",
  },
  clergy: {
    id: "clergy",
    name: "A Santa Sé & O Clero",
    leaderName: "Patriarca Alistair",
    leaderTitle: "Voz do Sagrado Sínodo",
    avatar: "⛪",
    power: 50,
    approval: 20,
    radicalsPercentage: 10,
    demands: [
      "Dízimo sagrado intransferível",
      "Perseguição aos cultos heréticos e alquimia profana",
    ],
    secretsKnown: [
      "Registros de linhagens ilegítimas nos arquivos canônicos da catedral.",
    ],
    lastActionSummary: "Proclamou homilia alertando que as desgraças do reino são punição divina.",
  },
  commoners: {
    id: "commoners",
    name: "Plebe, Artesãos & Lavradores",
    leaderName: "Mestra Elena Brandt",
    leaderTitle: "Líder das Guildas de Artesãos",
    avatar: "🌾",
    power: 45,
    approval: 0,
    radicalsPercentage: 25,
    demands: [
      "Preço máximo tabelado para o trigo e cevada",
      "Abolição dos tributos sobre as pontes municipais",
    ],
    secretsKnown: [
      "Conhece as rotas secretas de contrabando através dos esgotos da capital.",
    ],
    lastActionSummary: "Organizou protesto pacífico na praça dos mercados exigindo celeiros abertos.",
  },
  military: {
    id: "military",
    name: "Guarda de Ferro & Generais",
    leaderName: "General Thorne",
    leaderTitle: "Marechal de Campo das Legiões",
    avatar: "🛡️",
    power: 60,
    approval: 15,
    radicalsPercentage: 20,
    demands: [
      "Soldo militar reajustado em prata pura",
      "Construção de três baluartes de defesa na linha sul",
    ],
    secretsKnown: [
      "Detém o mapa das fraquezas estruturais das muralhas da capital.",
    ],
    lastActionSummary: "Convocou conselho marcial para revisar as defesas de prontidão contra cerco.",
  },
  merchants: {
    id: "merchants",
    name: "Guilda Mercantil & Banqueiros",
    leaderName: "Mestre Gaspar Van Der Berg",
    leaderTitle: "Presidente da Liga Mercantil",
    avatar: "💰",
    power: 55,
    approval: 5,
    radicalsPercentage: 10,
    demands: [
      "Livre navegação pelos rios provinciais",
      "Proteção armada para caruanas com recursos da coroa",
    ],
    secretsKnown: [
      "Controla a dívida externa soberana junto aos reinos vizinhos.",
    ],
    lastActionSummary: "Ameaçou reter navios de grãos se as tarifas alfandegárias aumentarem.",
  },
};

/**
 * Inicializa o ecossistema de facções vivas
 */
export function initializeLivingFactions(): Record<FactionId, LivingFaction> {
  return JSON.parse(JSON.stringify(DEFAULT_LIVING_FACTIONS));
}

/**
 * Atualiza o estado social e as facções no final do turno
 */
export function evaluateFactionsTurn(state: KingdomState): {
  updatedFactions: Record<FactionId, LivingFaction>;
  threatsTriggered: string[];
} {
  const currentFactions = state.livingFactions || initializeLivingFactions();
  const updated: Record<FactionId, LivingFaction> = { ...currentFactions };
  const threats: string[] = [];

  // Alinhamento com as métricas clássicas de facção do estado (factions.nobles, etc.)
  if (state.factions) {
    if (updated.nobility) updated.nobility.approval = state.factions.nobles;
    if (updated.clergy) updated.clergy.approval = state.factions.clergy;
    if (updated.commoners) updated.commoners.approval = state.factions.peasants;
    if (updated.military) updated.military.approval = state.factions.military;
    if (updated.merchants) updated.merchants.approval = state.factions.merchants;
  }

  // Verifica radicalização
  (Object.keys(updated) as FactionId[]).forEach((fid) => {
    const f = updated[fid];
    if (f.approval < -30) {
      f.radicalsPercentage = Math.min(100, f.radicalsPercentage + 10);
      if (f.radicalsPercentage >= 50) {
        threats.push(`⚠ A facção [${f.name}] atingiu nível de sedição aberta (${f.radicalsPercentage}% de radicais armados)!`);
      }
    } else if (f.approval > 20) {
      f.radicalsPercentage = Math.max(5, f.radicalsPercentage - 5);
    }
  });

  return {
    updatedFactions: updated,
    threatsTriggered: threats,
  };
}

export const evaluateLivingFactions = evaluateFactionsTurn;

/**
 * Modifica o respeito ou poder de uma facção específica
 */
export function modifyLivingFaction(
  factions: Record<FactionId, LivingFaction>,
  factionId: FactionId,
  approvalDelta: number,
  powerDelta: number = 0,
  actionSummary?: string
): Record<FactionId, LivingFaction> {
  const fac = factions[factionId];
  if (!fac) return factions;

  const nextApproval = Math.min(100, Math.max(-100, fac.approval + approvalDelta));
  const nextPower = Math.min(100, Math.max(10, fac.power + powerDelta));

  return {
    ...factions,
    [factionId]: {
      ...fac,
      approval: nextApproval,
      power: nextPower,
      lastActionSummary: actionSummary || fac.lastActionSummary,
    },
  };
}
