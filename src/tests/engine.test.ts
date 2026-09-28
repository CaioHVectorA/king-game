import assert from "node:assert";
import test from "node:test";
import { createInitialKingdomState } from "../lib/game/state";
import { applyAction, sanitizeAction } from "../lib/game/actions";
import { LIMITS } from "../lib/game/rules";
import { processTurn } from "../lib/game/engine";
import { MockAIProvider } from "../lib/ai/mock";
import { PRNG } from "../lib/game/rng";
import { selectNextEvent, GAME_EVENTS } from "../lib/game/events";
import { resolveEncounter } from "../lib/game/encounters";
import { getActiveOrSuccessorCharacter } from "../lib/game/characters";

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

test("Game Engine: Morte Permanente e Sucessão de Personagens", () => {
  let state = createInitialKingdomState({ seed: 555 });
  const elenorBefore = state.characters["elenor_peasant"];
  assert.ok(elenorBefore && elenorBefore.alive === true);

  // Executa Elenor
  const actionResult = applyAction(state, {
    type: "EXECUTE_OR_EXILE_CHARACTER",
    characterId: "elenor_peasant",
    actionType: "execute",
  });
  state = actionResult.state;

  // 1. Elenor deve estar morta e registrada na lista de falecidos
  assert.strictEqual(state.characters["elenor_peasant"].alive, false);
  assert.ok(state.deceasedCharacters?.some((d) => d.id === "elenor_peasant"));

  // 2. Ao invocar o personagem daquela posição, o sucessor (Thomas) deve assumir
  const activeChar = getActiveOrSuccessorCharacter("elenor_peasant", state);
  assert.strictEqual(activeChar.id, "thomas_peasant");
  assert.strictEqual(activeChar.alive, true);

  // 3. Ao resolver um encontro de camponeses, Elenor NUNCA mais deve ser o peticionário
  const droughtEvent = GAME_EVENTS.find((e) => e.id === "drought_south")!;
  const encounter = resolveEncounter(droughtEvent, state);
  assert.notStrictEqual(encounter.character.id, "elenor_peasant");
  assert.strictEqual(encounter.character.id, "thomas_peasant");
  assert.ok(encounter.dialogue.includes("Após o fim de meu antecessor"));
});

test("Game Engine: Escadinha Narrativa de Eventos (Event Chains)", async () => {
  let state = createInitialKingdomState({ seed: 777 });
  const mockAI = new MockAIProvider();

  // Inicia explicitamente com a Seca no Sul (Passo 1)
  const droughtEvent = GAME_EVENTS.find((e) => e.id === "drought_south")!;
  state.currentEvent = droughtEvent;

  // Turno 1: Soberano escolhe abrir os celeiros (choiceId: open_granaries)
  const result1 = await processTurn(
    state,
    { gameId: state.id, choiceId: "open_granaries" },
    mockAI
  );
  state = result1.state;

  // Turno 2: A escadinha DEVE agendar e apresentar o Esvaziamento dos Silos (Passo 2)
  assert.ok(state.currentEvent !== null);
  assert.strictEqual(state.currentEvent.id, "drought_step2_granary_depletion");
  assert.strictEqual(state.currentEvent.chain?.step, 2);

  // Turno 2: Soberano escolhe subsidiar navios de grãos (choiceId: subsidize_grain_import)
  const result2 = await processTurn(
    state,
    { gameId: state.id, choiceId: "subsidize_grain_import" },
    mockAI
  );
  state = result2.state;

  // Turno 3: A escadinha DEVE culminar no Grande Edito Agrário (Passo 3)
  assert.ok(state.currentEvent !== null);
  assert.strictEqual(state.currentEvent.id, "drought_step3_agrarian_treaty");
  assert.strictEqual(state.currentEvent.chain?.step, 3);
});

test("Game Engine: Eventos Dinâmicos Procedurais Propostos pela IA", async () => {
  let state = createInitialKingdomState({ seed: 888 });

  // Cria um provedor que propõe um evento dinâmico
  const dynamicAI = {
    name: "Dynamic Creative AI",
    async interpretAndNarrate() {
      return {
        intent: "Expansão de Frotas",
        actions: [{ type: "ADD_GOLD" as const, amount: -80 }],
        narrative: "Vossa ordem de erguer uma esquadra pirata foi executada.",
        confidence: 0.95,
        nextEventProposal: {
          title: "O Almirante Corsário nas Docas",
          description: "Os galeões armados atracaram nas docas sob aplausos de contrabandistas.",
          characterName: "Capitão Bruno das Docas",
          characterRole: "Corsário",
          choices: [
            { id: "sail_free", label: "Autorizar ataque a frotas inimigas" },
          ],
        },
      };
    },
  };

  const droughtEvent = GAME_EVENTS.find((e) => e.id === "drought_south")!;
  state.currentEvent = droughtEvent;

  // Executa turno com texto livre
  const turnResult = await processTurn(
    state,
    { gameId: state.id, freeTextDecision: "Quero criar uma frota corsária no norte" },
    dynamicAI
  );
  state = turnResult.state;

  // O próximo evento deve ser exatamente a criação dinâmica da IA
  assert.ok(state.currentEvent !== null);
  assert.strictEqual(state.currentEvent.title, "O Almirante Corsário nas Docas");
  assert.strictEqual(state.currentEvent.isDynamic, true);
  assert.strictEqual(state.currentEvent.generatedByAI, true);
});

test("Game Engine: Audiência Privada do Conselheiro Real", () => {
  const state = createInitialKingdomState({ seed: 1010 });
  const counselorEvent = GAME_EVENTS.find((e) => e.id === "counselor_audience_state")!;
  assert.ok(counselorEvent);

  const encounter = resolveEncounter(counselorEvent, state);
  assert.strictEqual(encounter.character.id, "counselor_morris");
  assert.strictEqual(encounter.character.role, "Conselheiro Real");
  assert.ok(encounter.character.appearance.includes("Mestre Morris"));
});
