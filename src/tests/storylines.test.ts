import assert from "node:assert";
import test from "node:test";
import { STORYLINES, getStoryline } from "../content/storylines";
import { createInitialKingdomState } from "../lib/game/state";
import { getSystemPrompt } from "../lib/ai/prompts";
import { UnifiedAIWrapper } from "../lib/ai/wrapper";

test("Storylines: Validação do Catálogo de Linhas de História", () => {
  assert.ok(STORYLINES.length >= 3, "Deve haver pelo menos 3 storylines configuradas");

  for (const sl of STORYLINES) {
    assert.ok(sl.id && sl.id.length > 0, "Storyline deve ter id");
    assert.ok(sl.name && sl.name.length > 0, "Storyline deve ter name");
    assert.ok(sl.worldLorePrompt && sl.worldLorePrompt.length > 20, "Storyline deve ter lore prompt descritivo");
    assert.ok(Object.keys(sl.characters).length >= 2, `${sl.id} deve ter pelo menos 2 personagens`);
    assert.ok(Object.keys(sl.realms).length >= 2, `${sl.id} deve ter reinos vizinhos`);
    assert.ok(sl.events.length >= 1, `${sl.id} deve ter eventos customizados`);
    assert.ok(sl.initialState.population > 0, `${sl.id} deve ter população positiva`);
  }
});

test("Storylines: Instanciação de Cenários Distintos", () => {
  // 1. Cenário Khar Invasion (Guerra e Fronteira)
  const kharState = createInitialKingdomState({ storylineId: "khar_invasion" });
  assert.strictEqual(kharState.storylineId, "khar_invasion");
  assert.strictEqual(kharState.military, 82);
  assert.ok(kharState.activeWars.includes("khar"), "Deve iniciar em guerra com a Horda de Khar");
  assert.ok(kharState.characters["general_ironwall"] !== undefined, "Deve ter o Comandante Valerius");

  // 2. Cenário Dark Plague (Peste e Inquisição)
  const plagueState = createInitialKingdomState({ storylineId: "dark_plague" });
  assert.strictEqual(plagueState.storylineId, "dark_plague");
  assert.strictEqual(plagueState.flags["plague_active"], true, "A praga deve estar ativa");
  assert.ok(plagueState.characters["inquisitor_malakor"] !== undefined, "Deve ter o Inquisidor Malakor");

  // 3. Cenário Valoria Clássico
  const classicState = createInitialKingdomState({ storylineId: "valoria_classic" });
  assert.strictEqual(classicState.storylineId, "valoria_classic");
  assert.strictEqual(classicState.stability, 72);
});

test("AI Wrapper & Lore Injection: Conexão e Injeção de Contexto", async () => {
  const storyline = getStoryline("dark_plague");
  const prompt = getSystemPrompt(storyline.worldLorePrompt);
  assert.ok(prompt.includes("LORE E CONTEXTO NARRATIVO DESTE CENÁRIO"), "Prompt deve conter seção de lore");
  assert.ok(prompt.includes("Febre das Sombras"), "Prompt deve citar termos do universo de praga");

  // Testa o UnifiedAIWrapper executando requisição com mock de fallback
  const wrapper = new UnifiedAIWrapper();
  assert.ok(wrapper.name.includes("Unified Wrapper"));

  const response = await wrapper.interpretAndNarrate({
    eventTitle: "Águas Negras nos Poços",
    eventDescription: "A peste assola a capital...",
    playerDecision: "Vou ordenar que Vivienne destile remédios e isolar os doentes nos monastérios.",
    stateSummary: {
      gold: 380,
      food: 420,
      population: 19500,
      stability: 46,
      military: 50,
      factions: { nobles: -10, merchants: -20, clergy: 35, peasants: -25, military: 15 },
      rulerName: "Alden II",
      activeWars: [],
    },
    recentHistory: [],
    worldLore: storyline.worldLorePrompt,
  });

  assert.ok(response.intent && response.intent.length > 0);
  assert.ok(Array.isArray(response.actions));
  assert.ok(response.narrative && response.narrative.length > 5);
});
