import { test } from "node:test";
import assert from "node:assert";
import { createInitialKingdomState } from "@/lib/game/state";
import { applyAction } from "@/lib/game/actions";
import { processEndOfTurnEffects } from "@/lib/game/consequences";
import { PRNG } from "@/lib/game/rng";
import { parseAIResponse } from "@/lib/ai/parser";
import { processTurn } from "@/lib/game/engine";
import { selectNextEvent } from "@/lib/game/events";
import { MockAIProvider } from "@/lib/ai/mock";

test("Situações Atuais: Iniciar, Progredir Turnos e Concluir Operações", () => {
  let state = createInitialKingdomState({
    name: "Assentamento Ferrão",
    storylineId: "zombie_apocalypse",
    seed: 42,
  });

  assert.ok(Array.isArray(state.ongoingSituations), "ongoingSituations deve ser um array");
  assert.strictEqual(state.ongoingSituations.length, 0);

  // Iniciar situação via START_SITUATION
  const resAction = applyAction(state, {
    type: "START_SITUATION",
    title: "Expedição de Reconhecimento",
    situationType: "expedicao",
    durationTurns: 2,
    description: "Dois caminhões enviados ao laboratório com a Dra. Elise Moreau.",
    personnel: "Dra. Elise Moreau",
  });

  state = resAction.state;
  assert.ok(state.ongoingSituations);
  assert.strictEqual(state.ongoingSituations.length, 1);
  assert.strictEqual(state.ongoingSituations[0]?.turnsRemaining, 2);
  assert.strictEqual(state.ongoingSituations[0]?.status, "ativa");

  // Avançar 1 turno
  const prng = new PRNG(100);
  const turn1 = processEndOfTurnEffects(state, prng);
  state = turn1.state;
  assert.ok(state.ongoingSituations);
  assert.strictEqual(state.ongoingSituations[0]?.turnsRemaining, 1);
  assert.strictEqual(state.ongoingSituations[0]?.status, "ativa");

  // Avançar 2º turno (deve concluir)
  const turn2 = processEndOfTurnEffects(state, prng);
  state = turn2.state;
  assert.ok(state.ongoingSituations);
  assert.strictEqual(state.ongoingSituations[0]?.turnsRemaining, 0);
  assert.strictEqual(state.ongoingSituations[0]?.status, "concluida");
  assert.ok(turn2.upkeepMessages.some((m) => m.includes("Situação Concluída")));
});

test("Parser Resiliente: Extração de narrativa em JSON truncado ou imperfeito", () => {
  // Simula resposta truncada no meio do nextEventProposal
  const truncatedJson = `{
    "intent": "Envio de dois caminhões",
    "actions": [
      { "type": "MODIFY_STABILITY", "amount": 5 }
    ],
    "narrative": "Dra. Elise Moreau confirma: 'Sim, vou na cabine do caminhão dianteiro.' Os motores rugem no portão leste.",
    "nextEventProposal": {
      "title": "Emboscada na Rodovia"
  `;

  const parsed = parseAIResponse(truncatedJson, { storylineId: "zombie_apocalypse" });
  assert.ok(parsed.narrative.includes("Dra. Elise Moreau confirma"), "Deve extrair narrativa mesmo com JSON truncado");
  assert.strictEqual(parsed.actions.length, 1);
  assert.strictEqual(parsed.actions[0].type, "MODIFY_STABILITY");

  // Simula erro total sem JSON - deve gerar fallback moderno, NUNCA medieval
  const rawBroken = "Err 500: Server disconnected";
  const brokenParsed = parseAIResponse(rawBroken, {
    storylineId: "zombie_apocalypse",
    playerDecision: "Vou enviar dois caminhões para tal. Você pretende ir junto?",
  });
  assert.ok(!brokenParsed.narrative.toLowerCase().includes("arautos"), "NUNCA deve citar arautos em apocalipse zumbi");
  assert.ok(!brokenParsed.narrative.toLowerCase().includes("corte"), "NUNCA deve citar corte feudal em apocalipse zumbi");
  assert.ok(brokenParsed.narrative.toLowerCase().includes("caminh") || brokenParsed.narrative.toLowerCase().includes("posto de comando"));
});

test("Liberdade de Roleplay: Detecção de Expedições e Assassinato no Engine", async () => {
  let state = createInitialKingdomState({
    name: "Assentamento Ferrão",
    storylineId: "zombie_apocalypse",
    seed: 777,
  });

  const prng = new PRNG(state.seed);
  state.currentEvent = selectNextEvent(state, prng);

  const mockAi = new MockAIProvider();

  // Teste 1: Decisão livre despachando caminhões inicia uma situação de expedição
  const turnResult1 = await processTurn(
    state,
    {
      gameId: state.id,
      freeTextDecision: "Vou enviar dois caminhões blindados com batedores até a Marginal.",
    },
    mockAi
  );

  state = turnResult1.state;
  const hasExpedition = state.ongoingSituations?.some(
    (s) => s.type === "expedicao" || s.title.toLowerCase().includes("expedição")
  );
  assert.ok(hasExpedition, "Deve registrar expedição em ongoingSituations");
  assert.ok(!turnResult1.narrative.toLowerCase().includes("arautos"), "Narrativa não deve ser medieval");

  // Teste 2: Se o jogador manda atirar ou executar o peticionário
  if (state.currentEvent?.characterId) {
    const targetCharId = state.currentEvent.characterId;
    const turnResult2 = await processTurn(
      state,
      {
        gameId: state.id,
        freeTextDecision: "Ordem de tiro imediata! Podem atirar e executar agora mesmo.",
      },
      mockAi
    );

    state = turnResult2.state;
    assert.strictEqual(state.characters[targetCharId]?.alive, false, "Personagem alvejado deve morrer");
    assert.ok(state.deceasedCharacters?.some((d) => d.id === targetCharId), "Deve estar nos falecidos");
  }
});

test("Campanha e Diálogo: Reconhecimento de Fim de Campanha e Gestos de NPC", async () => {
  // 1. Parser de Resposta de IA com Fim de Campanha
  const rawEndingJson = JSON.stringify({
    intent: "Sacrifício final nas muralhas",
    actions: [],
    narrative: "O Comandante detonou as cargas na enseada levando a horda inteira junto.",
    campaignEnding: {
      isEnding: true,
      outcome: "victory",
      title: "O Sacrifício que Salvou o Rio",
      summary: "Com a detonação das cargas, o Reduto da Urca garantiu a sobrevivência dos inocentes.",
    },
  });

  const parsed = parseAIResponse(rawEndingJson, { storylineId: "rio_zombie" });
  assert.strictEqual(parsed.campaignEnding?.isGameOver, true, "Deve reconhecer isGameOver = true");
  assert.strictEqual(parsed.campaignEnding?.isVictory, true, "Deve reconhecer isVictory = true");
  assert.ok(parsed.campaignEnding?.reason.includes("O Sacrifício que Salvou o Rio"));

  // 2. ProcessTurn aplicando Fim de Campanha
  let state = createInitialKingdomState({
    name: "Reduto da Urca",
    storylineId: "rio_zombie",
    seed: 999,
  });
  const prng = new PRNG(state.seed);
  state.currentEvent = selectNextEvent(state, prng);

  // Mock provider que injeta o campaignEnding
  const victoryAI = {
    name: "VictoryAI",
    interpretAndNarrate: async () => ({
      intent: "Vitória épica",
      actions: [],
      narrative: "A horda foi repelida com maestria.",
      campaignEnding: {
        isGameOver: true,
        isVictory: true,
        reason: "A Salvação da Urca: A colônia sobreviveu contra todas as probabilidades.",
      },
    }),
  };

  const turnResult = await processTurn(
    state,
    { gameId: state.id, freeTextDecision: "Construímos a cura definitiva e salvamos o porto." },
    victoryAI as any
  );

  assert.strictEqual(turnResult.state.isGameOver, true, "Deve encerrar a campanha com isGameOver = true");
  assert.strictEqual(turnResult.state.isVictory, true, "Deve marcar como vitória");
  assert.ok(turnResult.state.gameOverReason?.includes("A Salvação da Urca"), "Deve conter o título do desfecho");
});

