import assert from "node:assert";
import test from "node:test";
import { createInitialKingdomState } from "../lib/game/state";
import { applyAction, sanitizeAction } from "../lib/game/actions";
import { LIMITS } from "../lib/game/rules";
import { processTurn } from "../lib/game/engine";
import { MockAIProvider } from "../lib/ai/mock";
import { PRNG } from "../lib/game/rng";
import { selectNextEvent } from "../lib/game/events";

test("Game Engine: Limites e Bounds Numéricos", () => {
  const state = createInitialKingdomState({ seed: 42 });

  // 1. Ouro não pode ultrapassar os limites absurdos
  const actionExcessiveGold = sanitizeAction({
    type: "ADD_GOLD",
    amount: 999999,
  });
  assert.ok(actionExcessiveGold.type === "ADD_GOLD");
  assert.strictEqual(actionExcessiveGold.amount, LIMITS.MAX_ACTION_GOLD_DELTA);

  // 2. Estabilidade clampada entre 0 e 100
  const modifiedState1 = applyAction(state, {
    type: "MODIFY_STABILITY",
    amount: 150,
  }).state;
  assert.ok(modifiedState1.stability <= 100);

  const modifiedState2 = applyAction(state, {
    type: "MODIFY_STABILITY",
    amount: -150,
  }).state;
  assert.ok(modifiedState2.stability >= 0);

  // 3. Facções entre -100 e 100
  const factionState = applyAction(state, {
    type: "MODIFY_FACTION",
    faction: "nobles",
    amount: -300,
  }).state;
  assert.ok(factionState.factions.nobles >= -100);
});

test("Game Engine: Sucessão e Morte de Governante", () => {
  let state = createInitialKingdomState({ seed: 123 });
  const initialRulerName = state.currentRuler.name;
  assert.strictEqual(state.heirs.length, 2);

  // Mata o governante atual
  const result = applyAction(state, {
    type: "KILL_RULER",
    cause: "Veneno na taça durante o banquete",
  });
  state = result.state;

  // O herdeiro deve ter assumido
  assert.notStrictEqual(state.currentRuler.name, initialRulerName);
  assert.strictEqual(state.currentRuler.name, "Príncipe Bryan");
  assert.strictEqual(state.heirs.length, 1);
  assert.strictEqual(state.rulersHistory.length, 1);
  assert.strictEqual(state.rulersHistory[0].causeOfDeath, "Veneno na taça durante o banquete");
});

test("Game Engine: Simulação Contínua de 30 Turnos Sem Quebra", async () => {
  let state = createInitialKingdomState({ seed: 999 });
  const prng = new PRNG(state.seed);
  state.currentEvent = selectNextEvent(state, prng);

  const mockAI = new MockAIProvider();

  for (let turn = 1; turn <= 30; turn++) {
    if (state.isGameOver) {
      break;
    }

    assert.ok(state.currentEvent !== null, `Turno ${turn} deve ter um evento ativo`);

    // Alterna entre escolha rápida e decisão livre
    let result;
    if (turn % 2 === 0) {
      // Decisão pré-definida
      const choice = state.currentEvent.choices[0];
      result = await processTurn(state, { gameId: state.id, choiceId: choice.id }, mockAI);
    } else {
      // Decisão livre em texto
      const decisions = [
        "Vou enviar comida para o sul e diminuir os impostos dos camponeses.",
        "Mando o general prender os comerciantes conspiradores.",
        "Quero negociar paz e celebrar um banquete com o clero.",
        "Reforce a guarda das muralhas e cobre ouro dos barões.",
      ];
      const freeText = decisions[turn % decisions.length];
      result = await processTurn(state, { gameId: state.id, freeTextDecision: freeText }, mockAI);
    }

    state = result.state;

    // Verificações de integridade
    assert.ok(!isNaN(state.gold), `Ouro não pode ser NaN no turno ${turn}`);
    assert.ok(!isNaN(state.food), `Comida não pode ser NaN no turno ${turn}`);
    assert.ok(!isNaN(state.stability), `Estabilidade não pode ser NaN no turno ${turn}`);
    assert.ok(!isNaN(state.population), `População não pode ser NaN no turno ${turn}`);
    assert.ok(state.stability >= 0 && state.stability <= 100, `Estabilidade fora dos limites no turno ${turn}`);
    assert.ok(state.factions.nobles >= -100 && state.factions.nobles <= 100);
    assert.ok(state.history.length === turn);
  }

  assert.ok(state.turn >= 30 || state.isGameOver);
});
