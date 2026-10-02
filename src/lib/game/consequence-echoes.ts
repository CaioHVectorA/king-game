// ============================================================================
// SOBERANIA: MOTOR DE ECOS NARRATIVOS (CONSEQUENCE ECHOES / THE WEB OF FATE)
// ============================================================================

import { ConsequenceEcho } from "@/types/sovereign";
import { KingdomState } from "@/types/game";

/**
 * Analisa a decisão do jogador e cria um eco narrativo retardado se ela for marcante
 */
export function detectAndPlantEcho(
  turn: number,
  playerDecision: string,
  eventTitle: string
): ConsequenceEcho | null {
  const norm = playerDecision.toLowerCase();

  // Execução sumária ou banimento
  if (norm.includes("execut") || norm.includes("forca") || norm.includes("morte") || norm.includes("decapit")) {
    return {
      id: `echo_exec_${turn}_${Date.now()}`,
      originTurn: turn,
      triggerTurn: turn + 4,
      title: "O Sangue nos Degraus do Trono",
      causeDecision: playerDecision,
      manifestationDescription: "Familiares e aliados juraram vingança após a execução pública. Boatos dizem que assassinos de aluguel foram contratados nas sombras.",
      potentialConsequences: [
        "Tentativa de veneno na taça real",
        "Motim isolado em um dos distritos periféricos",
      ],
      resolved: false,
    };
  }

  // Perdão real ou concessão de misericórdia
  if (norm.includes("perdo") || norm.includes("miseric") || norm.includes("poup") || norm.includes("libert")) {
    return {
      id: `echo_mercy_${turn}_${Date.now()}`,
      originTurn: turn,
      triggerTurn: turn + 5,
      title: "A Dívida de Gratidão",
      causeDecision: playerDecision,
      manifestationDescription: "Aquele cuja vida foi poupada pelo trono encontrou uma oportunidade rara para demonstrar lealdade quando vossa autoridade foi posta à prova.",
      potentialConsequences: [
        "Alerta antecipado sobre traição de um conselheiro",
        "Apoio inesperado de facções neutras",
      ],
      resolved: false,
    };
  }

  // Confisco ou imposto abusivo
  if (norm.includes("confisc") || norm.includes("impost") || norm.includes("tribut") || norm.includes("ouro")) {
    return {
      id: `echo_tax_${turn}_${Date.now()}`,
      originTurn: turn,
      triggerTurn: turn + 3,
      title: "O Preço da Ganância Soberana",
      causeDecision: playerDecision,
      manifestationDescription: "Os mercadores e proprietários transferiram fortunas para o exterior ou esconderam ouro nos celeiros, causando estagnação nos mercados.",
      potentialConsequences: [
        "Queda na arrecadação tributária no próximo trimestre",
        "Aumento dos preços de grãos e ferramentas",
      ],
      resolved: false,
    };
  }

  // Reforma religiosa ou inquisição
  if (norm.includes("clero") || norm.includes("herege") || norm.includes("igreja") || norm.includes("brux")) {
    return {
      id: `echo_faith_${turn}_${Date.now()}`,
      originTurn: turn,
      triggerTurn: turn + 6,
      title: "O Fogo do Fanatismo Sagrado",
      causeDecision: playerDecision,
      manifestationDescription: "As palavras do governante acenderam o fervor religioso popular, transformando questões cívicas em cruzadas de fé.",
      potentialConsequences: [
        "Inquisição exigindo autonomia jurídica e tribunais próprios",
        "Aumento da lealdade do clero às custas do descontentamento da plebe",
      ],
      resolved: false,
    };
  }

  return null;
}

/**
 * Avalia os ecos que devem disparar no turno atual
 */
export function checkMaturingEchoes(state: KingdomState): {
  activeEchoes: ConsequenceEcho[];
  dueEchoes: ConsequenceEcho[];
  echoNarratives: string[];
} {
  const currentList = state.echoes || [];
  const currentTurn = state.turn;

  const due: ConsequenceEcho[] = [];
  const remaining: ConsequenceEcho[] = [];
  const narratives: string[] = [];

  currentList.forEach((echo) => {
    if (!echo.resolved && currentTurn >= echo.triggerTurn) {
      due.push({ ...echo, resolved: true });
      narratives.push(`◈ ECO DO PASSADO (Turno ${echo.originTurn}): ${echo.title} — ${echo.manifestationDescription}`);
    } else {
      remaining.push(echo);
    }
  });

  return {
    activeEchoes: remaining,
    dueEchoes: due,
    echoNarratives: narratives,
  };
}
