import assert from "node:assert";
import test from "node:test";
import { createInitialKingdomState } from "../lib/game/state";
import { processTurn } from "../lib/game/engine";
import { MockAIProvider } from "../lib/ai/mock";

test("Replayability & Metas Dinásticas: Inicialização e Conclusão", async () => {
  let state = createInitialKingdomState({ seed: 321 });

  // 1. O estado deve inicializar com metas dinásticas
  assert.ok(Array.isArray(state.dynasticGoals));
  assert.ok(state.dynasticGoals.length >= 3);
  const goalSurvive = state.dynasticGoals.find((g) => g.id === "goal_survive_10");
  assert.ok(goalSurvive);
  assert.strictEqual(goalSurvive.completed, false);

  // 2. Simula o alcance de estabilidade alta
  state.stability = 85;
  state.currentEvent = {
    id: "test_event",
    title: "Evento Teste de Metas",
    description: "Teste de encerramento.",
    choices: [{ id: "opt_1", label: "Prosseguir", actions: [] }],
    tags: ["teste"],
    weight: 1,
  };

  const mockAI = new MockAIProvider();
  const result = await processTurn(state, { gameId: state.id, choiceId: "opt_1" }, mockAI);
  state = result.state;

  // A meta de paz e ordem social (estabilidade >= 80) deve ter sido concluída
  const goalStability = state.dynasticGoals?.find((g) => g.id === "goal_stability_peak");
  assert.ok(goalStability);
  assert.strictEqual(goalStability.completed, true);
  assert.ok(result.effectsSummary.some((eff) => eff.includes("Meta Dinástica Concluída")));
});
