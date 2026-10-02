// ============================================================================
// SOBERANIA: MOTOR DA MENTE DO GOVERNANTE (MIND PALACE & VOZES INTERIORES)
// ============================================================================

import { LeaderPsychology, MindVoice, MindVoiceId } from "@/types/sovereign";
import { KingdomState } from "@/types/game";

export const INITIAL_VOICES: Record<MindVoiceId, MindVoice> = {
  cold_reason: {
    id: "cold_reason",
    name: "A Razão Gélida",
    title: "O Cálculo de Estado",
    avatar: "⚖️",
    color: "#38bdf8", // Sky blue
    affinity: 50,
    dominantPhilosophy: "Pragmatismo, estatística, descarte de sentimentalismos e lucro estratégico a longo prazo.",
    whisper: "Avalie os números antes dos homens. Lágrimas não enchem celeiros nem pagam mercenários.",
  },
  noble_heart: {
    id: "noble_heart",
    name: "O Coração Nobre",
    title: "A Voz do Juramento",
    avatar: "🕊️",
    color: "#4ade80", // Emerald green
    affinity: 50,
    dominantPhilosophy: "Misericórdia, honra dinástica, dever sagrado para com os fracos e pacto social.",
    whisper: "Um trono erguido sobre ossos de inocentes desmorona na primeira tempestade. Mantenha a palavra sagrada.",
  },
  iron_crown: {
    id: "iron_crown",
    name: "A Coroa de Ferro",
    title: "O Instinto de Tirania",
    avatar: "👑",
    color: "#f59e0b", // Amber gold
    affinity: 50,
    dominantPhilosophy: "Autoridade inquestionável, terror seletivo, controle absoluto e purga de rivais.",
    whisper: "Se hesiteis por um segundo, os barões vos devorarão. É melhor ser temido que amado.",
  },
  primal_instinct: {
    id: "primal_instinct",
    name: "O Instinto Oculto",
    title: "A Fera das Profundezas",
    avatar: "👁️",
    color: "#c084fc", // Purple mystic
    affinity: 50,
    dominantPhilosophy: "Sobrevivência visceral, caos imprevisível, pressentimento místico e desconfiança de todos.",
    whisper: "Há veneno nas taças e falsidade nos sorrisos. Queime as pontes antes que o cerco se feche.",
  },
};

/**
 * Cria a psicologia inicial baseada no arquétipo e na intenção do líder
 */
export function initializeLeaderPsychology(archetype: string = "Estrategista", intent: string = ""): LeaderPsychology {
  const normArchetype = archetype.toLowerCase();

  let initialTension = 15;
  let initialCorruption = 5;
  let initialAcumen = 40;
  let initialHonor = 50;
  const traits: string[] = [];

  if (normArchetype.includes("militar") || normArchetype.includes("ferro") || normArchetype.includes("bope")) {
    traits.push("Veterano Vigiado", "Pulso Firme");
    initialCorruption += 10;
    initialHonor += 15;
  } else if (normArchetype.includes("diplomata") || normArchetype.includes("cínico")) {
    traits.push("Língua de Prata", "Calculista");
    initialAcumen += 25;
    initialCorruption += 15;
  } else if (normArchetype.includes("visionári") || normArchetype.includes("engenhei")) {
    traits.push("Pensador Futurista", "Inovador");
    initialAcumen += 20;
    initialHonor += 20;
  } else if (normArchetype.includes("religio") || normArchetype.includes("monge") || normArchetype.includes("regente")) {
    traits.push("Zelo Inabalável", "Austero");
    initialHonor += 25;
    initialCorruption -= 5;
  } else {
    traits.push("Herdeiro Consciente", "Observador Atento");
  }

  return {
    tension: Math.min(100, Math.max(0, initialTension)),
    corruption: Math.min(100, Math.max(0, initialCorruption)),
    acumen: Math.min(100, Math.max(0, initialAcumen)),
    honor: Math.min(100, Math.max(0, initialHonor)),
    activeTraits: traits,
    voices: {
      cold_reason: { ...INITIAL_VOICES.cold_reason },
      noble_heart: { ...INITIAL_VOICES.noble_heart },
      iron_crown: { ...INITIAL_VOICES.iron_crown },
      primal_instinct: { ...INITIAL_VOICES.primal_instinct },
    },
  };
}

/**
 * Atualiza os sussurros das 4 vozes de acordo com a situação e o evento atual
 */
export function updateVoiceWhispers(
  state: KingdomState,
  eventContext: string,
  characterName?: string
): Record<MindVoiceId, MindVoice> {
  const psy = state.psychology || initializeLeaderPsychology(state.currentRuler?.archetype);
  const updated = { ...psy.voices };

  const isLowGold = state.gold < 300;
  const isLowFood = state.food < 350;
  const isHighTension = psy.tension > 60;
  const isAtWar = state.activeWars && state.activeWars.length > 0;

  // 1. A Razão Gélida
  if (isLowGold) {
    updated.cold_reason.whisper = "Os cofres sangram. Toda decisão neste instante deve visar arrecadação imediata ou corte drástico de despesas.";
  } else if (isLowFood) {
    updated.cold_reason.whisper = "A fome derruba impérios antes das espadas. Racionamento matemático é a única rota viável.";
  } else {
    updated.cold_reason.whisper = `Analise a proposta de ${characterName || "nossos emissários"}: qual o custo marginal de aceitar versus recusar?`;
  }

  // 2. O Coração Nobre
  if (state.population < 800) {
    updated.noble_heart.whisper = "Nosso povo está definhando! Se não os protegermos agora, seremos soberanos apenas de tumbas vazias.";
  } else if (state.stability < 35) {
    updated.noble_heart.whisper = "O desespero nas ruas clama por justiça e amparo, não por mais carrascos e impostos.";
  } else {
    updated.noble_heart.whisper = "A coroa existe para servir e salvaguardar a vida. Faça a escolha que vos permita dormir sem pesadelos.";
  }

  // 3. A Coroa de Ferro
  if (isAtWar) {
    updated.iron_crown.whisper = "Estamos em guerra! Dissidência interna é traição sumária. Subjugue qualquer barão ou general que pestanejar.";
  } else if (state.military < 30) {
    updated.iron_crown.whisper = "Nossas muralhas estão desarmadas. Uma demonstração pública de força implacável impedirá motins iminentes.";
  } else {
    updated.iron_crown.whisper = `Faça ${characterName || "o requerente"} ajoelhar e lembrar que vossa vontade é a lei irrevogável do domínio.`;
  }

  // 4. O Instinto Oculto
  if (isHighTension) {
    updated.primal_instinct.whisper = "Seus olhos tremem, vosso coração dispara. Há uma conspiração oculta se movendo sob nossos pés esta noite!";
  } else {
    updated.primal_instinct.whisper = "Não confie no primeiro relatório. Os bajuladores são os primeiros a empunhar as adagas quando as tochas se apagam.";
  }

  return updated;
}

/**
 * Aplica impactos psicológicos causados pela decisão tomada
 */
export function evolvePsychology(
  psy: LeaderPsychology,
  decisionText: string,
  resultImpact: { goldDelta?: number; stabilityDelta?: number }
): LeaderPsychology {
  const norm = decisionText.toLowerCase();
  const nextVoices = JSON.parse(JSON.stringify(psy.voices));
  let tensionDelta = 0;
  let corruptionDelta = 0;
  let honorDelta = 0;
  let acumenDelta = 0;

  // Análise semântica da decisão
  if (norm.includes("execut") || norm.includes("matar") || norm.includes("forca") || norm.includes("tortur")) {
    corruptionDelta += 8;
    tensionDelta += 6;
    nextVoices.iron_crown.affinity += 5;
  } else if (norm.includes("perdo") || norm.includes("ajud") || norm.includes("aliment") || norm.includes("miseric")) {
    honorDelta += 6;
    corruptionDelta -= 4;
    nextVoices.noble_heart.affinity += 5;
  } else if (norm.includes("tribut") || norm.includes("taxa") || norm.includes("ouro") || norm.includes("comerci")) {
    acumenDelta += 4;
    nextVoices.cold_reason.affinity += 5;
  } else if (norm.includes("espi") || norm.includes("infiltr") || norm.includes("investig") || norm.includes("segred")) {
    acumenDelta += 6;
    tensionDelta += 4;
    nextVoices.primal_instinct.affinity += 5;
  }

  // Se a estabilidade caiu muito, a tensão do líder sobe
  if ((resultImpact.stabilityDelta || 0) < -10) {
    tensionDelta += 12;
  } else if ((resultImpact.stabilityDelta || 0) > 10) {
    tensionDelta -= 8;
  }

  return {
    ...psy,
    tension: Math.min(100, Math.max(0, psy.tension + tensionDelta)),
    corruption: Math.min(100, Math.max(0, psy.corruption + corruptionDelta)),
    honor: Math.min(100, Math.max(0, psy.honor + honorDelta)),
    acumen: Math.min(100, Math.max(0, psy.acumen + acumenDelta)),
    voices: nextVoices,
  };
}
