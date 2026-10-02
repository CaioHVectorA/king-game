import assert from "node:assert";
import test from "node:test";
import { createInitialKingdomState } from "../lib/game/state";
import { initializeLeaderPsychology, evolvePsychology, updateVoiceWhispers } from "../lib/game/mind-palace";
import { detectAndPlantEcho, checkMaturingEchoes } from "../lib/game/consequence-echoes";
import { initializeRealmEdicts, enactEdict, revokeEdict } from "../lib/game/edicts";
import { initializeRealmProvinces, reinforceProvince, pacifyProvince } from "../lib/game/war-theater";
import { evaluateLivingFactions, initializeLivingFactions, evaluateFactionsTurn } from "../lib/game/factions-matrix";
import { evaluateDynasticEnding, calculateDynasticScore } from "../lib/game/endings-codex";
import { processTurn } from "../lib/game/engine";
import { MockAIProvider } from "../lib/ai/mock";

test("Soberania: Psicologia do Líder & As 4 Vozes do Mind Palace", () => {
  const psy = initializeLeaderPsychology("Diplomata Cínico", "Consolidar os cofres");
  assert.ok(psy.acumen > 50, "Diplomata deve ter perspicácia elevada");
  assert.strictEqual(Object.keys(psy.voices).length, 4, "Deve possuir as 4 vozes ativas");

  // Evolução por decisão implacável
  const evolved = evolvePsychology(psy, "Executar sumariamente o líder rebelde na forca pública", { stabilityDelta: -5 });
  assert.ok(evolved.corruption > psy.corruption, "Execução deve aumentar a corrupção do governante");
  assert.ok(evolved.tension > psy.tension, "Execução deve aumentar a tensão e estresse mental");
  assert.ok(evolved.voices.iron_crown.affinity > psy.voices.iron_crown.affinity, "Afinidade com a Coroa de Ferro deve subir");

  // Sussurros dinâmicos sob escassez de ouro
  const state = createInitialKingdomState();
  state.gold = 100;
  state.psychology = psy;
  const whispers = updateVoiceWhispers(state, "Crise de dívida com os banqueiros", "Mestre Gaspar");
  assert.ok(whispers.cold_reason.whisper.includes("sangram") || whispers.cold_reason.whisper.includes("cofres"), "Razão gélida deve alertar sobre sangria dos cofres");
});

test("Soberania: Ecos Narrativos Kármicos e Consequências Retardadas", () => {
  const echo = detectAndPlantEcho(2, "Executar os traidores na forca", "Julgamento da Conspiração");
  assert.ok(echo !== null, "Deve detectar decisão marcante e plantar eco");
  assert.strictEqual(echo?.triggerTurn, 6, "Eco deve maturar 4 turnos depois");

  const state = createInitialKingdomState();
  state.turn = 6;
  state.echoes = [echo!];

  const evalResult = checkMaturingEchoes(state);
  assert.strictEqual(evalResult.dueEchoes.length, 1, "Eco deve disparar no turno 6");
  assert.strictEqual(evalResult.activeEchoes.length, 0, "Eco disparado sai da fila ativa");
  assert.ok(evalResult.echoNarratives[0].includes("ECO DO PASSADO"), "Deve gerar narrativa de aviso");
});

test("Soberania: Sistema de Éditos, Promulgação e Manutenção Contínua", () => {
  let state = createInitialKingdomState();
  state.gold = 300;
  state.stability = 60;
  state.edicts = initializeRealmEdicts();

  const res = enactEdict(state, "edicto_tributo_dourado");
  assert.strictEqual(res.success, true, "Deve promulgar édito com sucesso");
  assert.strictEqual(res.state.gold, 250, "Deve deduzir custo de 50 de ouro");
  assert.ok(res.state.laws.includes("Dízimo da Coroa sobre o Comércio Fluvial"), "Deve constar nas leis ativas");

  // Revogação
  const revokeRes = revokeEdict(res.state, "edicto_tributo_dourado");
  assert.strictEqual(revokeRes.success, true, "Deve revogar com sucesso");
  assert.ok(!revokeRes.state.laws.includes("Dízimo da Coroa sobre o Comércio Fluvial"), "Deve ter removido das leis");
});

test("Soberania: Mesa de Guerra Provincial & Pacificação de Distúrbios", () => {
  let state = createInitialKingdomState();
  state.provinces = initializeRealmProvinces();
  state.military = 50;
  state.gold = 200;

  // Reforço da guarnição
  const reinRes = reinforceProvince(state, "prov_terras_ermas", 30);
  assert.strictEqual(reinRes.success, true, "Deve reforçar fronteira");
  const prov = reinRes.state.provinces?.find((p) => p.id === "prov_terras_ermas");
  assert.strictEqual(prov?.garrison, 50, "Guarnição deve ter subido de 20 para 50");

  // Pacificação civil
  const pacRes = pacifyProvince(reinRes.state, "prov_porto_maritimo");
  assert.strictEqual(pacRes.success, true, "Deve pacificar distrito mercantil");
  const port = pacRes.state.provinces?.find((p) => p.id === "prov_porto_maritimo");
  assert.strictEqual(port?.unrest, 0, "Distúrbio deve ter caído para 0");
});

test("Soberania: Simulação de Facções Vivas & Radicalização", () => {
  let state = createInitialKingdomState();
  state.livingFactions = initializeLivingFactions();
  state.factions.nobles = -40; // Nobreza muito descontente

  const facEval = evaluateFactionsTurn(state);
  assert.ok(facEval.updatedFactions.nobility.radicalsPercentage > 15, "Radicais devem ter aumentado");
});

test("Soberania: Códice de Finais Dinásticos e Pontuação", () => {
  let state = createInitialKingdomState();
  state.turn = 26;
  state.stability = 80;
  state.gold = 600;
  state.population = 1500;

  const ending = evaluateDynasticEnding(state);
  assert.ok(ending !== null, "Deve atingir o final da Pax Aurea");
  assert.strictEqual(ending?.type, "gloria_dourada");
  assert.ok(calculateDynasticScore(state) > 1000, "Pontuação dinástica deve ser substancial");
});
