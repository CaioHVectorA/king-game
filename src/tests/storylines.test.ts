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

test("Storylines: Zombie Apocalypse & Sistema de Crises", () => {
  // 1. Instanciação Zombie Apocalypse
  const zombieState = createInitialKingdomState({ storylineId: "zombie_apocalypse" });
  assert.strictEqual(zombieState.storylineId, "zombie_apocalypse");
  assert.strictEqual(zombieState.flags["muros_intactos"], true);
  assert.ok(zombieState.characters["commander_drak"] !== undefined);
  assert.ok(zombieState.realms["horda_leste"] !== undefined);
  assert.ok(zombieState.documents && zombieState.documents.length >= 3);

  // 2. Sistema de Crises do Domínio
  const { evaluateDomainCrises } = require("../lib/game/crises");
  
  // Estado saudável: sem crises
  const healthyCrises = evaluateDomainCrises(zombieState);
  assert.strictEqual(healthyCrises.length, 0, "Estado inicial saudável não deve ter crises ativas");

  // Simula fome extrema (comida quase zerada)
  const famineState = { ...zombieState, food: 15 };
  const famineCrises = evaluateDomainCrises(famineState);
  assert.ok(famineCrises.some((c: any) => c.id === "food_famine"), "Deve detectar crise de fome com comida <= 60");

  // Simula insolvência (ouro zerado)
  const brokeState = { ...zombieState, gold: 0 };
  const brokeCrises = evaluateDomainCrises(brokeState);
  assert.ok(brokeCrises.some((c: any) => c.id === "gold_insolvency"), "Deve detectar crise de insolvência com ouro <= 20");

  // 3. Geração de Mapa Urbano com Escala Real
  const { generateCityMap } = require("../lib/game/map");
  const cityMap = generateCityMap("zombie_apocalypse", 42);
  assert.ok(cityMap.cityName.includes("Bastião"));
  assert.ok(cityMap.districts.length >= 6);
  assert.ok(cityMap.totalAreaKm2 > 0);
  assert.ok(cityMap.metricScaleText.includes("metros"));
});

test("Storylines: Rio de Janeiro Zombie Apocalypse (Zona Morta: Rio dos Condenados)", () => {
  // 1. Instanciação e verificação do cenário RJ estilo TLOU/TWD
  const rioState = createInitialKingdomState({ storylineId: "rio_zombie" });
  assert.strictEqual(rioState.storylineId, "rio_zombie");
  assert.ok(rioState.characters["capitao_bras"] !== undefined, "Deve conter Capitão Brás");
  assert.ok(rioState.characters["dr_camargo"] !== undefined, "Deve conter Dr. Marcelo Camargo");
  assert.ok(rioState.characters["padre_bento"] !== undefined, "Deve conter Padre Bento");
  assert.ok(rioState.realms["milicia_linha_vermelha"] !== undefined, "Deve conter Milícia da Linha Vermelha");
  assert.ok(rioState.realms["culto_estaladores_tijuca"] !== undefined, "Deve conter Culto/Ninho dos Estaladores da Tijuca");

  // 2. Rótulos e Unidades customizadas do domínio
  const rioStoryline = getStoryline("rio_zombie");
  assert.ok(rioStoryline.resourceLabels !== undefined, "Deve possuir resourceLabels customizados");
  assert.strictEqual(rioStoryline.resourceLabels?.gold.name, "Munição & Sucata");
  assert.strictEqual(rioStoryline.resourceLabels?.food.name, "Peixes & Ração Seca");
  assert.strictEqual(rioStoryline.resourceLabels?.population.unit, "almas");

  // 3. Mapa Urbano de Urca & Pão de Açúcar
  const { generateCityMap } = require("../lib/game/map");
  const rioCityMap = generateCityMap("rio_zombie", 12345);
  assert.ok(rioCityMap.cityName.includes("Urca"), "Mapa urbano deve ser do Reduto da Urca");
  assert.ok(rioCityMap.districts.some((d: any) => d.name.includes("São João")), "Deve ter Posto de Comando de São João");
  assert.ok(rioCityMap.districts.some((d: any) => d.name.includes("Traineiras")), "Deve ter Trapiche das Traineiras");
  assert.ok(rioCityMap.districts.some((d: any) => d.name.includes("Fiocruz")), "Deve ter Laboratório da Fiocruz");

  // 4. Cólices e Documentos Vivos
  assert.ok(rioState.documents, "Documentos devem estar definidos");
  assert.ok(rioState.documents.length >= 4, "Deve ter pelo menos 4 documentos iniciais");
  assert.ok(
    rioState.documents.some((d: any) => d.subtitle?.includes("Fiocruz") || d.title.includes("Estaladores")),
    "Deve ter registro da Fiocruz / Estaladores"
  );
  assert.ok(rioState.documents.some((d: any) => d.category === "dossie"), "Deve conter documento do tipo dossie");

  // 5. Teste de adição de Livro / Documento Vivo
  const { appendLivingDocument } = require("../lib/game/documents");
  const updatedDocs = appendLivingDocument(rioState.documents || [], {
    title: "Relatório de Patrulha na Praia Vermelha",
    category: "relatorio",
    author: "Sargento Dias",
    content: "Avistamos três estaladores na encosta do morro. Nenhuma baixa.",
    turn: 2,
  });
  assert.strictEqual(updatedDocs.length, (rioState.documents?.length || 0) + 1);
  assert.strictEqual(updatedDocs[updatedDocs.length - 1].updatedAtTurn, 2);
});

