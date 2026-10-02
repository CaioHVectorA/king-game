// ============================================================================
// SOBERANIA: MESA TÁTICA DE GUERRA & PROVÍNCIAS DO REINO (WAR TABLE)
// ============================================================================

import { RealmProvince } from "@/types/sovereign";
import { KingdomState } from "@/types/game";

export const DEFAULT_PROVINCES: RealmProvince[] = [
  {
    id: "prov_capital",
    name: "Cidadela de Ouro & Coroa",
    garrison: 80,
    development: 90,
    unrest: 10,
    suppliesLevel: "abundante",
    threatLevel: "pacifica",
    controllingFaction: "nobility",
    specialTrait: "Sede do Trono Imperial e dos Supremos Tribunais de Justiça.",
  },
  {
    id: "prov_vale_agricola",
    name: "Vale Fértil das Espigas",
    garrison: 30,
    development: 65,
    unrest: 20,
    suppliesLevel: "abundante",
    threatLevel: "pacifica",
    controllingFaction: "commoners",
    specialTrait: "Celeiro vital do reino. Abastece 70% das rações urbanas.",
  },
  {
    id: "prov_baluarte_ferro",
    name: "Passo da Sentinela de Ferro",
    garrison: 75,
    development: 40,
    unrest: 15,
    suppliesLevel: "estavel",
    threatLevel: "tensao",
    controllingFaction: "military",
    specialTrait: "Fortaleza encravada na rocha, barreira contra invasões externas.",
  },
  {
    id: "prov_porto_maritimo",
    name: "Baía dos Galeões & Mercadores",
    garrison: 40,
    development: 85,
    unrest: 25,
    suppliesLevel: "estavel",
    threatLevel: "pacifica",
    controllingFaction: "merchants",
    specialTrait: "Maior ancoradouro comercial e entreposto aduaneiro ultramarino.",
  },
  {
    id: "prov_terras_ermas",
    name: "Ermos da Floresta Sussurrante",
    garrison: 20,
    development: 25,
    unrest: 45,
    suppliesLevel: "escasso",
    threatLevel: "incursao",
    controllingFaction: "clergy",
    specialTrait: "Região misteriosa com mosteiros isolados e focos de bandoleiros.",
  },
  {
    id: "prov_minas_profundas",
    name: "Montanhas dos Altos Fornos",
    garrison: 50,
    development: 55,
    unrest: 35,
    suppliesLevel: "escasso",
    threatLevel: "tensao",
    controllingFaction: "military",
    specialTrait: "Minas de ferro e prata. Fornecem metal para armaduras e armas.",
  },
];

/**
 * Inicializa a mesa de guerra provincial
 */
export function initializeRealmProvinces(): RealmProvince[] {
  return JSON.parse(JSON.stringify(DEFAULT_PROVINCES));
}

/**
 * Reforça a guarnição de uma província
 */
export function reinforceProvince(
  state: KingdomState,
  provinceId: string,
  garrisonAmount: number = 20
): { success: boolean; state: KingdomState; message: string } {
  const provinces = state.provinces || initializeRealmProvinces();
  const prov = provinces.find((p) => p.id === provinceId);

  if (!prov) return { success: false, state, message: "Província não encontrada." };
  if (state.military < 15) return { success: false, state, message: "Poder militar insuficiente para destacar tropas." };

  const updated: RealmProvince[] = provinces.map((p): RealmProvince => {
    if (p.id === provinceId) {
      const nextThreat: RealmProvince["threatLevel"] =
        p.threatLevel === "cerco_iminente" ? "incursao" : p.threatLevel === "incursao" ? "tensao" : p.threatLevel;
      return {
        ...p,
        garrison: Math.min(100, p.garrison + garrisonAmount),
        unrest: Math.max(0, p.unrest - 10),
        threatLevel: nextThreat,
      };
    }
    return p;
  });

  return {
    success: true,
    state: {
      ...state,
      military: Math.max(5, state.military - 5),
      provinces: updated,
    },
    message: `Regimentos imperiais marcharam e reforçaram a guarnição de ${prov.name}!`,
  };
}

/**
 * Pacifica distúrbios civis em uma província
 */
export function pacifyProvince(
  state: KingdomState,
  provinceId: string
): { success: boolean; state: KingdomState; message: string } {
  const provinces = state.provinces || initializeRealmProvinces();
  const prov = provinces.find((p) => p.id === provinceId);

  if (!prov) return { success: false, state, message: "Província inexistente." };
  if (state.gold < 40) return { success: false, state, message: "Ouro insuficiente para financiar caridade e magistrados." };

  const updated = provinces.map((p) => {
    if (p.id === provinceId) {
      return {
        ...p,
        unrest: Math.max(0, p.unrest - 25),
        development: Math.min(100, p.development + 5),
      };
    }
    return p;
  });

  return {
    success: true,
    state: {
      ...state,
      gold: state.gold - 40,
      provinces: updated,
    },
    message: `Magistrados e socorro civil pacificaram os ânimos populares em ${prov.name}.`,
  };
}
