import {
  GameAction,
  GameEvent,
  GameHistoryEntry,
  KingdomState,
  TurnInput,
  TurnResult,
} from "@/types/game";
import { AIProvider } from "@/types/ai";
import { applyAction, GameActionSchema, sanitizeAction } from "./actions";
import { checkGameOver, checkSuccession } from "./rules";
import { selectNextEvent } from "./events";
import { processEndOfTurnEffects } from "./consequences";
import { PRNG } from "./rng";
import { cloneKingdomState } from "./state";
import { appendLivingDocument } from "./documents";
import { detectAndPlantEcho, checkMaturingEchoes } from "./consequence-echoes";
import { evolvePsychology, updateVoiceWhispers } from "./mind-palace";
import { evaluateFactionsTurn } from "./factions-matrix";
import { calculateDynasticScore, evaluateDynasticEnding } from "./endings-codex";

export async function processTurn(
  currentState: KingdomState,
  input: TurnInput,
  aiProvider: AIProvider
): Promise<TurnResult> {
  // 1. Clona estado para mutação segura
  let state = cloneKingdomState(currentState);
  const prng = new PRNG(state.seed + state.turn);

  const currentEvent = state.currentEvent;
  if (!currentEvent) {
    // Se por algum motivo não havia evento no estado, seleciona um
    state.currentEvent = selectNextEvent(state, prng);
    return {
      state,
      appliedActions: [],
      effectsSummary: ["O conselho reuniu-se para apresentar a situação."],
      narrative: "O reinado tem início sob olhares atentos de toda a corte.",
      aiUsed: false,
    };
  }

  let actionsToApply: GameAction[] = [];
  let narrative = "";
  let decisionLabel = "";
  let aiUsed = false;
  let tokensEstimated = 0;

  // 2. Trata Decisão Pré-definida (Opção A)
  if (input.choiceId) {
    const choice = currentEvent.choices.find((c) => c.id === input.choiceId);
    if (!choice) {
      throw new Error(`Escolha inválida: ${input.choiceId}`);
    }

    decisionLabel = choice.label;
    actionsToApply = [...choice.actions];

    // Se a escolha tiver delayed events próprios
    if (choice.delayedEvents) {
      for (const delayed of choice.delayedEvents) {
        actionsToApply.push({
          type: "SCHEDULE_EVENT",
          eventId: delayed.eventId,
          triggerAfterTurns: delayed.triggerAfterTurns,
        });
      }
    }

    const petitionerName =
      currentEvent.characterId && state.characters[currentEvent.characterId]
        ? state.characters[currentEvent.characterId].name
        : "o peticionário";

    narrative = `Perante ${petitionerName}, você proclamou: "${choice.label}". Vossas ordens foram executadas perante a corte.`;

    // Escadinha de eventos: se o evento atual fizer parte de uma cadeia narrativa
    if (currentEvent.chain) {
      const chain = currentEvent.chain;
      let nextEventId: string | undefined = undefined;
      if (chain.branchOnChoice && chain.branchOnChoice[input.choiceId]) {
        nextEventId = chain.branchOnChoice[input.choiceId];
      } else if (chain.nextEventId) {
        nextEventId = chain.nextEventId;
      }

      if (nextEventId) {
        if (!state.activeChains) state.activeChains = {};
        state.activeChains[chain.id] = {
          currentStep: chain.step + 1,
          lastChoiceId: input.choiceId,
          nextEventId,
        } as any;
      }
    }
  }
  // 3. Trata Decisão Livre (Opção B - IA)
  else if (input.freeTextDecision && input.freeTextDecision.trim().length > 0) {
    aiUsed = true;
    decisionLabel = input.freeTextDecision.trim();

    // Histórico de decisões recentes para continuidade de roleplay e consequências
    const recentHistory = state.history
      .slice(-5)
      .map((h) => `Turno ${h.turn} (Ano ${h.year}): Decreto "${h.playerDecision}" em [${h.eventTitle}] -> Consequência: ${h.narrative}`);

    const petitionerInfo =
      currentEvent.characterId && state.characters[currentEvent.characterId]
        ? `${state.characters[currentEvent.characterId].name} (${state.characters[currentEvent.characterId].title || state.characters[currentEvent.characterId].role})`
        : "Peticionário perante o Trono";

    try {
      const aiResponse = await aiProvider.interpretAndNarrate({
        eventTitle: currentEvent.title,
        eventDescription: `[Peticionário em Audiência: ${petitionerInfo}] ${currentEvent.description}`,
        playerDecision: decisionLabel,
        stateSummary: {
          gold: state.gold,
          food: state.food,
          population: state.population,
          stability: state.stability,
          military: state.military,
          factions: state.factions,
          rulerName: state.currentRuler?.name ?? "Soberano",
          activeWars: state.activeWars,
        },
        recentHistory,
        worldLore: state.worldLorePrompt,
        storylineId: state.storylineId,
      });

      // Validação estrita de cada ação pelo Zod Schema
      const validatedActions: GameAction[] = [];
      for (const rawAction of aiResponse.actions) {
        const parseResult = GameActionSchema.safeParse(rawAction);
        if (parseResult.success) {
          validatedActions.push(sanitizeAction(parseResult.data as GameAction));
        } else {
          console.warn("Ação da IA descartada por schema inválido:", rawAction, parseResult.error);
        }
      }

      // Salvaguarda Soberana de Roleplay:
      // 1. Se o jogador tentou matar, atirar, executar ou sacrificar alguém presente
      const killRegex = /\b(execut(ar|e|em|em-no|em-na|em-o|em-a)?|mat(ar|e|em|em-no|em-na|em-o|em-a)?|atirar|atire|atirem|disparar|dispare|disparem|enforc(ar|e|em)?|decapit(ar|e|em)?|degol(ar|e|em)?|corte(m)? a cabe[çc]a|morte ao|mande(m)? matar|eliminar|sacrificar)\b/i;
      if (killRegex.test(decisionLabel) && currentEvent.characterId) {
        if (!validatedActions.some((a) => a.type === "EXECUTE_OR_EXILE_CHARACTER")) {
          validatedActions.push({
            type: "EXECUTE_OR_EXILE_CHARACTER",
            characterId: currentEvent.characterId,
            actionType: "execute",
          });
        }
      }

      // 2. Se o jogador iniciou uma expedição (ex: caminhões, traineiras, batedores, comboio)
      const expeditionRegex = /\b(caminh[õo]es|traineira(s)?|barco(s)?|balsa(s)?|canoa(s)?|expedi[çc][ãa]o|comboio|batedores|patrulha externa|equipe de busca|equipe armada)\b/i;
      if (expeditionRegex.test(decisionLabel)) {
        if (!validatedActions.some((a) => a.type === "START_SITUATION")) {
          const charName = currentEvent.characterId && state.characters[currentEvent.characterId]
            ? state.characters[currentEvent.characterId].name
            : "Equipe Designada";
          const expTitle = state.storylineId === "rio_zombie"
            ? "Expedição de Traineiras na Baía"
            : state.storylineId === "zombie_apocalypse"
            ? "Expedição de Comboio & Amostras"
            : "Expedição de Reconhecimento";

          validatedActions.push({
            type: "START_SITUATION",
            title: expTitle,
            situationType: "expedicao",
            durationTurns: 3,
            description: `Expedição despachada: "${decisionLabel.slice(0, 120)}"`,
            personnel: charName,
          });
        }
      }

      // 3. Se o jogador fez um discurso público
      const speechRegex = /\b(discurso|pronunciamento|falar ao povo|alto-falante|rádio à comunidade|proclama[çc][ãa]o)\b/i;
      if (speechRegex.test(decisionLabel)) {
        if (!validatedActions.some((a) => a.type === "START_SITUATION" && (a as any).situationType === "discurso")) {
          validatedActions.push({
            type: "START_SITUATION",
            title: "Proclamação e Discurso Público",
            situationType: "discurso",
            durationTurns: 2,
            description: `Discurso à população: "${decisionLabel.slice(0, 120)}"`,
            personnel: state.currentRuler?.name || "Liderança",
          });
        }
      }

      actionsToApply = validatedActions;
      narrative = aiResponse.narrative || `Sua determinação foi executada: "${decisionLabel}".`;
      tokensEstimated = 180; // Estimativa média de tokens

      // IA como árbitro de fim de campanha: reconhece vitória decisiva ou colapso catastrófico
      if (aiResponse.campaignEnding?.isGameOver) {
        state.isGameOver = true;
        state.gameOverReason = aiResponse.campaignEnding.reason;
        if (aiResponse.campaignEnding.isVictory) {
          if (!state.flags) state.flags = {};
          state.flags.isVictory = true;
          state.isVictory = true;
        }
      }

      // IA como criadora: se a IA propôs o próximo desdobramento dinâmico (escadinha de eventos)
      if (aiResponse.nextEventProposal) {
        const proposal = aiResponse.nextEventProposal;
        const dynamicCharId = `ai_char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        if (proposal.characterName) {
          state.characters[dynamicCharId] = {
            id: dynamicCharId,
            name: proposal.characterName,
            title: proposal.characterTitle || "Peticionário de Estado",
            role: proposal.characterRole || "Emissário",
            faction: proposal.characterFaction || "peasants",
            loyalty: 50,
            influence: 50,
            alive: true,
            traits: ["Procedural", "Dinâmico"],
            avatar: proposal.characterAvatar || "👤",
          };
        }

        const dynamicEvent: GameEvent = {
          id: `dynamic_evt_${Date.now()}`,
          title: proposal.title,
          description: proposal.description,
          characterId: proposal.characterName ? dynamicCharId : currentEvent.characterId,
          tags: ["dinamico", "ia", "escadinha"],
          weight: 100,
          isDynamic: true,
          generatedByAI: true,
          choices:
            proposal.choices && proposal.choices.length > 0
              ? proposal.choices.map((c, idx) => ({
                  id: c.id || `dyn_choice_${idx}`,
                  label: c.label,
                  intentDescription: c.intentDescription || "Decisão soberana diante da consequência.",
                  actions: [],
                }))
              : [
                  { id: "dyn_opt_1", label: "Aprovar as medidas e selar o pacto", actions: [] },
                  { id: "dyn_opt_2", label: "Recusar a proposta e mobilizar as sentinelas", actions: [] },
                ],
        };

        state.pendingDynamicEvent = dynamicEvent;
      } else if (currentEvent.chain) {
        // Se a IA não propôs um evento dinâmico exclusivo mas o evento tem uma cadeia predefinida, avança
        const chain = currentEvent.chain;
        const branchKeys = chain.branchOnChoice ? Object.values(chain.branchOnChoice) : [];
        const nextEventId = chain.nextEventId || (branchKeys.length > 0 ? branchKeys[0] : undefined);
        if (nextEventId) {
          if (!state.activeChains) state.activeChains = {};
          state.activeChains[chain.id] = {
            currentStep: chain.step + 1,
            nextEventId,
          } as any;
        }
      }
    } catch (err) {
      console.error("Falha no provedor de IA:", err);
      // Fallback gracioso e contextual caso a IA falhe totalmente
      actionsToApply = [];
      if (state.storylineId === "rio_zombie") {
        narrative = decisionLabel.toLowerCase().includes("traineira") || decisionLabel.toLowerCase().includes("barco")
          ? "Os motores da traineira a diesel tossem fumaça na orla da Urca enquanto as sentinelas terminam de carregar fardos de peixe salgado e caixas de munição 7.62. A equipe zarpou pela Baía de Guanabara."
          : "Sua ordem ecoou pelo rádio das sentinelas na Urca. As tropas acataram a diretriz e mobilizaram as equipes defensivas imediatamente.";
      } else if (state.storylineId === "zombie_apocalypse") {
        narrative = decisionLabel.toLowerCase().includes("caminh")
          ? "Os motores dos dois caminhões rugem no pátio leste enquanto a equipe termina de carregar suprimentos e munição. Dra. Elise Moreau sobe na cabine ao lado do motorista, confirmando pelo rádio que a expedição está a caminho."
          : "Sua ordem foi transmitida pelo rádio do posto de comando. A equipe acatou a determinação imediatamente e mobilizou os recursos necessários.";
      } else if (state.storylineId === "colony_exodus") {
        narrative = "Os terminais da estação registraram suas instruções e as equipes ajustaram os parâmetros operacionais conforme ordenado.";
      } else {
        narrative = "Vossas determinações foram transmitidas aos ministros e os preparativos foram iniciados prontamente.";
      }
    }
  } else {
    throw new Error("Nenhuma decisão fornecida para o turno.");
  }

  // 4. Aplica as ações validadas pelo Game Engine e atualiza Livros do Mundo (Códice Vivo)
  const effectsSummary: string[] = [];
  for (const act of actionsToApply) {
    const result = applyAction(state, act);
    state = result.state;
    if (result.effectMessage) {
      effectsSummary.push(result.effectMessage);
    }

    // Registro dinâmico de novos fatos, despachos e sentenças nos Livros do Mundo
    if (act.type === "START_SITUATION") {
      state.documents = appendLivingDocument(state.documents || [], {
        title: `Despacho de Situação: ${act.title}`,
        subtitle: `Registro Operacional do Turno ${state.turn}`,
        category: act.situationType === "expedicao" ? "relatorio" : "edito",
        author: act.personnel || state.currentRuler?.name || "Comando Central",
        content: `Diretriz oficial estabelecida:\n"${act.description}"\n\nDuração estipulada: ${act.durationTurns} turnos.\nResponsável designado: ${act.personnel || "Equipes de prontidão"}.`,
        turn: state.turn,
      });
    } else if (act.type === "EXECUTE_OR_EXILE_CHARACTER") {
      const targetChar = state.characters[act.characterId];
      state.documents = appendLivingDocument(state.documents || [], {
        title: `Sentença de ${act.actionType === "execute" ? "Execução Sumária" : "Exílio"}: ${targetChar?.name || "Oficial"}`,
        subtitle: `Decreto do Turno ${state.turn}`,
        category: "edito",
        author: state.currentRuler?.name || "Autoridade Soberana",
        content: `Por ordem direta e irrevogável, ${targetChar ? `${targetChar.name} (${targetChar.title || targetChar.role})` : "o oficial acusado"} foi submetido(a) a ${act.actionType === "execute" ? "fuzilamento/execução sumária" : "desterro perpétuo além dos muros defensivos"}.\n\nCausa: Rompimento grave de lealdade em momento de emergência.\nDatação: Ano ${state.year}, Mês ${state.month}.`,
        turn: state.turn,
      });
    }
  }

  // 5. Checa se alguma ação gerou morte/sucessão de monarca
  const successionCheck = checkSuccession(state);
  let successionOccurred = false;
  let newRuler = undefined;

  if (successionCheck.requiresSuccession && successionCheck.nextRuler) {
    successionOccurred = true;
    newRuler = successionCheck.nextRuler;
    const oldRuler = state.currentRuler;
    state.rulersHistory.push({
      ...oldRuler,
      deathYear: state.year,
      causeOfDeath: successionCheck.cause || "Sucessão forçada",
    });
    state.currentRuler = successionCheck.nextRuler;
    state.heirs = state.heirs.slice(1);
    effectsSummary.push(`Sucessão Real: ${newRuler.title} ${newRuler.name} assume o governo.`);
  }

  // 6. Efeitos de virada de turno e manutenção econômica/demográfica
  const endTurnEffects = processEndOfTurnEffects(state, prng);
  state = endTurnEffects.state;
  if (endTurnEffects.successionOccurred) {
    successionOccurred = true;
    newRuler = state.currentRuler;
  }
  for (const msg of endTurnEffects.upkeepMessages) {
    effectsSummary.push(msg);
  }

  // 6.1 Manutenção dos Éditos em Vigor
  if (state.edicts) {
    for (const edict of state.edicts) {
      if (edict.isEnacted) {
        if (edict.monthlyMaintenance?.gold) {
          state.gold = Math.max(0, state.gold - edict.monthlyMaintenance.gold);
        }
        if (edict.monthlyMaintenance?.food) {
          state.food = Math.max(0, state.food - edict.monthlyMaintenance.food);
        }
      }
    }
  }

  // 6.2 Ecos Narrativos Kármicos
  const plantedEcho = detectAndPlantEcho(state.turn, decisionLabel, currentEvent.title);
  if (plantedEcho) {
    state.echoes = [...(state.echoes || []), plantedEcho];
  }
  const echoEval = checkMaturingEchoes(state);
  state.echoes = echoEval.activeEchoes;
  for (const echoText of echoEval.echoNarratives) {
    effectsSummary.push(echoText);
  }

  // 6.3 Evolução Psicológica do Soberano (Mind Palace)
  if (state.psychology) {
    state.psychology = evolvePsychology(state.psychology, decisionLabel, {
      stabilityDelta: state.stability - currentState.stability,
    });
  }

  // 6.4 Matriz de Facções Vivas
  const factionEval = evaluateFactionsTurn(state);
  state.livingFactions = factionEval.updatedFactions;
  for (const threatMsg of factionEval.threatsTriggered) {
    effectsSummary.push(threatMsg);
  }

  // 6.5 Pontuação Dinástica
  state.dynasticScore = calculateDynasticScore(state);

  // 7. Registro de Histórico Dinástico
  const historyEntry: GameHistoryEntry = {
    id: `hist_${state.turn}_${Date.now()}`,
    turn: state.turn - 1, // Turno em que ocorreu a decisão
    year: state.year,
    month: state.month,
    eventTitle: currentEvent.title,
    playerDecision: decisionLabel,
    narrative,
    effectsSummary,
    rulerName: state.currentRuler?.name ?? "Soberano",
  };
  state.history = [...state.history, historyEntry];

  // 8. Checagem de Fim de Jogo
  const gameOverCheck = checkGameOver(state);
  if (gameOverCheck.isGameOver || state.isGameOver) {
    state.isGameOver = true;
    state.gameOverReason = state.gameOverReason || gameOverCheck.reason;
    state.currentEvent = null;

    return {
      state,
      appliedActions: actionsToApply,
      effectsSummary,
      narrative,
      aiUsed,
      aiCostEstimate: {
        model: aiProvider.name,
        tokensEstimated,
      },
      successionOccurred,
      newRuler,
      gameOver: true,
      gameOverReason: state.gameOverReason,
      isVictory: state.isVictory || Boolean(state.flags?.isVictory),
    };
  }

  // 9. Seleciona o Próximo Evento
  state.currentEvent = selectNextEvent(state, prng);

  // 9.1 Atualiza os sussurros do Mind Palace para o novo dilema
  if (state.currentEvent && state.psychology) {
    const petitionerChar = state.currentEvent.characterId ? state.characters[state.currentEvent.characterId] : undefined;
    state.psychology.voices = updateVoiceWhispers(state, state.currentEvent.description, petitionerChar?.name);
  }

  return {
    state,
    appliedActions: actionsToApply,
    effectsSummary,
    narrative,
    aiUsed,
    aiCostEstimate: {
      model: aiProvider.name,
      tokensEstimated,
    },
    successionOccurred,
    newRuler,
    gameOver: false,
  };
}
