import { KingdomState } from "@/types/game";

export type DomainCrisis = {
  id: "food_famine" | "gold_insolvency" | "stability_rebellion" | "military_collapse" | "population_exodus";
  metric: "food" | "gold" | "stability" | "military" | "population";
  title: string;
  severity: "crítica" | "grave" | "iminente";
  alertText: string;
  consequencesText: string;
  recommendation: string;
};

/**
 * Avalia o estado do reino e identifica crises ativas quando recursos
 * estão perigosamente próximos de zero.
 */
export function evaluateDomainCrises(state: KingdomState): DomainCrisis[] {
  const crises: DomainCrisis[] = [];

  // 1. Crise de Celeiros / Fome (Comida <= 60 sacas)
  if (state.food <= 60) {
    const isZero = state.food <= 10;
    crises.push({
      id: "food_famine",
      metric: "food",
      title: isZero ? "FOME GENERALIZADA & INANIÇÃO" : "CRISE DE ABASTECIMENTO ALIMENTAR",
      severity: isZero ? "crítica" : "grave",
      alertText: isZero
        ? "Os celeiros estão vazios! Famílias morrem de inanição nas ruas e tumultos armados saquearam os armazéns reais."
        : "As reservas de comida caíram para níveis alarmantes. O racionamento severo gera revolta popular.",
      consequencesText:
        "Mortalidade disparada da população civil e queda acentuada na estabilidade a cada turno sem grãos.",
      recommendation: "Importe comida de reinos vizinhos, decrete requisição de emergência ou abra os silos reais.",
    });
  }

  // 2. Crise de Tesouro / Insolvência (Ouro <= 20 moedas ou negativo)
  if (state.gold <= 20) {
    const isNegative = state.gold < 0;
    crises.push({
      id: "gold_insolvency",
      metric: "gold",
      title: isNegative ? "BANCARROTA REAL & DÍVIDA SOBERANA" : "PENÚRIA DO ERÁRIO REAL",
      severity: isNegative ? "crítica" : "grave",
      alertText: isNegative
        ? `Os cofres reais estão negativos (${state.gold} em dívida). Mercenários e credores ameaçam invadir os palácios!`
        : "O tesouro da corte está quase zerado. Não há moedas para pagar guarnições nem magistrados.",
      consequencesText:
        "Risco de deserção das legiões militares, motim dos funcionários da coroa e perda de lealdade dos nobres.",
      recommendation: "Cobrança extraordinária de tributos, empréstimo com guildas ou corte de despesas de guerra.",
    });
  }

  // 3. Crise de Estabilidade / Insurreição (Estabilidade <= 18)
  if (state.stability <= 18) {
    const isAnarchy = state.stability <= 8;
    crises.push({
      id: "stability_rebellion",
      metric: "stability",
      title: isAnarchy ? "INSURREIÇÃO ANÁRQUICA IMINENTE" : "CRISE DE ORDEM PÚBLICA",
      severity: isAnarchy ? "crítica" : "grave",
      alertText: isAnarchy
        ? "A capital está em chamas! Barricadas populares bloqueiam os acessos e a guarda perdeu o controle dos bairros."
        : "O descontentamento popular atingiu o ápice. Conspirações e boatos de golpe circulam abertamente.",
      consequencesText:
        "Risco imediato de golpe de estado, deposição do soberano ou assassinato orquestrado pela corte.",
      recommendation: "Concessões populares imediatas, festivais, alianças com a igreja ou repressão cirúrgica.",
    });
  }

  // 4. Crise Militar / Defesa Indefesa (Força militar <= 18)
  if (state.military <= 18) {
    const isDefenseless = state.military <= 8;
    crises.push({
      id: "military_collapse",
      metric: "military",
      title: isDefenseless ? "FRONTEIRAS DESGUARNECIDAS & COLAPSO MILITAR" : "VULNERABILIDADE BÉLICA CRÍTICA",
      severity: isDefenseless ? "crítica" : "grave",
      alertText: isDefenseless
        ? "As muralhas e fortes estão desertos. Invasores estrangeiros e bandoleiros marcham sem qualquer oposição."
        : "A guarnição real está desfalcada. Qualquer incursão armada externa terá facilidade para penetrar o território.",
      consequencesText:
        "Vulnerabilidade absoluta a saques de reinos vizinhos, perda imediata de territórios e queda de respeito diplomático.",
      recommendation: "Recrutamento emergencial nas vilas, contratação de mercenários ou concessão de tratados de paz.",
    });
  }

  // 5. Crise de População / Êxodo (População <= 2000 habitantes)
  if (state.population <= 2000) {
    crises.push({
      id: "population_exodus",
      metric: "population",
      title: "ÊXODO POPULACIONAL & DESPOVOAMENTO",
      severity: "grave",
      alertText: "As cidades e vilas estão quase desertas. Campos apodrecem sem trabalhadores e o reino definha.",
      consequencesText:
        "Arrecadação fiscal colapsada e ausência de mão de obra para sustentar celeiros e exércitos.",
      recommendation: "Acolher refugiados de guerras vizinhas, conceder terras livres e isenções tributárias.",
    });
  }

  return crises;
}
