import { KingdomState } from "@/types/game";
import { clamp, LIMITS } from "./rules";
import { PRNG } from "./rng";

export function processEndOfTurnEffects(state: KingdomState, prng: PRNG): {
  state: KingdomState;
  upkeepMessages: string[];
  successionOccurred: boolean;
} {
  const next = { ...state };
  const upkeepMessages: string[] = [];
  let successionOccurred = false;

  // 1. Avanço de tempo
  next.turn += 1;
  next.month += 1;
  let newYear = false;

  if (next.month > 12) {
    next.month = 1;
    next.year += 1;
    newYear = true;

    if (next.currentRuler) {
      next.currentRuler = {
        ...next.currentRuler,
        age: next.currentRuler.age + 1,
        reignYears: next.currentRuler.reignYears + 1,
      };

      // Morte natural por velhice após os 65 anos
      if (next.currentRuler.age >= 65) {
        const deathChance = (next.currentRuler.age - 60) * 0.05;
        if (prng.next() < deathChance) {
          upkeepMessages.push(
            `O idoso governante ${next.currentRuler.name} adormeceu em paz e descansou para sempre.`
          );
          next.rulersHistory = [
            ...next.rulersHistory,
            {
              ...next.currentRuler,
              deathYear: next.year,
              causeOfDeath: "Velhice e causas naturais",
            },
          ];

          if (next.heirs.length > 0) {
            const [heir, ...rest] = next.heirs;
            next.currentRuler = heir;
            next.heirs = rest;
            successionOccurred = true;
            upkeepMessages.push(`O herdeiro ${heir.name} foi coroado o novo soberano.`);
          } else {
            next.isGameOver = true;
            next.gameOverReason = "O soberano morreu de velhice sem herdeiros. O trono foi disputado em uma guerra civil.";
          }
        }
      }
    }
  }

  // 2. Economia e Manutenção Mensal
  // Receita de impostos: baseada na população e mercadores
  const merchantBonus = Math.round(((next.factions.merchants ?? 0) / 100) * 20);
  const baseTaxes = Math.round(25 + (next.population / 1000) + merchantBonus);
  next.gold += baseTaxes;

  // Manutenção Militar
  const militaryCost = Math.round(15 + ((next.military / 100) * 25));
  next.gold -= militaryCost;

  // Consumo de Comida pela População
  const foodConsumption = Math.round(20 + (next.population / 1500));
  next.food -= foodConsumption;

  // Penalidade por Fome se a Comida esgotar
  if (next.food < 0) {
    const starved = Math.min(next.population, Math.abs(next.food) * 15 + 200);
    next.population -= starved;
    next.food = 0;
    next.stability = clamp(next.stability - 8, LIMITS.MIN_STABILITY, LIMITS.MAX_STABILITY);
    upkeepMessages.push(`Escassez de alimentos: ${starved} cidadãos pereceram pela fome.`);
  }

  // Penalidade por Dívida da Coroa
  if (next.gold < 0) {
    next.stability = clamp(next.stability - 4, LIMITS.MIN_STABILITY, LIMITS.MAX_STABILITY);
    upkeepMessages.push(`A coroa está endividada (${next.gold} Ouro), causando inquietação entre credores.`);
  }

  // Guerras Ativas: desgaste contínuo
  if (next.activeWars.length > 0) {
    const warExhaustion = next.activeWars.length * 2;
    next.gold -= next.activeWars.length * 15;
    next.military = clamp(next.military - warExhaustion, LIMITS.MIN_MILITARY, LIMITS.MAX_MILITARY);
    next.stability = clamp(next.stability - 1, LIMITS.MIN_STABILITY, LIMITS.MAX_STABILITY);
  }

  // Limpar delayed events já consumidos neste turno
  next.delayedEvents = next.delayedEvents.filter((d) => d.triggerAtTurn > next.turn);

  // Clampar recursos
  next.gold = clamp(next.gold, LIMITS.MIN_GOLD, LIMITS.MAX_GOLD);
  next.food = clamp(next.food, LIMITS.MIN_FOOD, LIMITS.MAX_FOOD);
  next.population = Math.max(0, next.population);
  next.stability = clamp(next.stability, LIMITS.MIN_STABILITY, LIMITS.MAX_STABILITY);
  next.military = clamp(next.military, LIMITS.MIN_MILITARY, LIMITS.MAX_MILITARY);

  return { state: next, upkeepMessages, successionOccurred };
}
