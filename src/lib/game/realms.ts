import { Realm } from "@/types/game";

export const INITIAL_REALMS: Record<string, Realm> = {
  arvandor: {
    id: "arvandor",
    name: "Império de Arvandor",
    population: 45000,
    military: 85,
    wealth: 70,
    relation: -15, // leve tensão
    flags: { militarist: true },
  },
  eldoria: {
    id: "eldoria",
    name: "Principado de Eldoria",
    population: 28000,
    military: 45,
    wealth: 95,
    relation: 30, // amigável comercialmente
    flags: { trade_hub: true },
  },
  khar: {
    id: "khar",
    name: "Horda de Khar",
    population: 32000,
    military: 75,
    wealth: 30,
    relation: -40, // hostil
    flags: { raiders: true },
  },
};
