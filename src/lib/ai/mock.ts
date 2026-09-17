import { AIInterpretationRequest, AIInterpretationResponse, AIProvider } from "@/types/ai";
import { GameAction } from "@/types/game";

export class MockAIProvider implements AIProvider {
  name = "Mock Heuristic AI (Offline)";

  async interpretAndNarrate(
    request: AIInterpretationRequest
  ): Promise<AIInterpretationResponse> {
    const text = request.playerDecision.toLowerCase();
    const actions: GameAction[] = [];
    const narrativeParts: string[] = [];
    let intent = "Decreto Real";

    // 1. Detecção de Comida / Grãos / Celeiros
    if (text.includes("comida") || text.includes("grão") || text.includes("alimento") || text.includes("celeiro")) {
      if (text.includes("enviar") || text.includes("dar") || text.includes("distribuir") || text.includes("abrir")) {
        actions.push({ type: "ADD_FOOD", amount: -100 });
        actions.push({ type: "MODIFY_FACTION", faction: "peasants", amount: 20 });
        actions.push({ type: "MODIFY_STABILITY", amount: 5 });
        narrativeParts.push("Carroças de mantimentos foram enviadas prontamente aos que passavam necessidade.");
        intent = "Distribuição de Alimentos";
      } else if (text.includes("confiscar") || text.includes("recolher") || text.includes("armazenar")) {
        actions.push({ type: "ADD_FOOD", amount: 150 });
        actions.push({ type: "MODIFY_FACTION", faction: "peasants", amount: -15 });
        narrativeParts.push("Os cobradores da coroa recolheram cereais adicionais para os silos reais.");
        intent = "Confisco de Mantimentos";
      }
    }

    // 2. Detecção de Ouro / Dinheiro / Impostos / Tesouro
    if (text.includes("ouro") || text.includes("dinheiro") || text.includes("imposto") || text.includes("tributo") || text.includes("taxa")) {
      if (text.includes("aumentar") || text.includes("cobrar") || text.includes("criar") || text.includes("financiar")) {
        if (text.includes("nobre")) {
          actions.push({ type: "ADD_GOLD", amount: 120 });
          actions.push({ type: "MODIFY_FACTION", faction: "nobles", amount: -20 });
          narrativeParts.push("Uma contribuição extraordinária foi imposta sobre as grandes propriedades nobres.");
          intent = "Taxação da Nobreza";
        } else if (text.includes("comerciante") || text.includes("mercador")) {
          actions.push({ type: "ADD_GOLD", amount: 110 });
          actions.push({ type: "MODIFY_FACTION", faction: "merchants", amount: -20 });
          narrativeParts.push("Novos direitos aduaneiros foram estabelecidos sobre os produtos das guildas.");
          intent = "Taxação Mercantil";
        } else {
          actions.push({ type: "ADD_GOLD", amount: 140 });
          actions.push({ type: "MODIFY_FACTION", faction: "peasants", amount: -20 });
          actions.push({ type: "MODIFY_STABILITY", amount: -5 });
          narrativeParts.push("Os coletores reais percorreram as aldeias recolhendo a prata devida à coroa.");
          intent = "Arrecadação Geral";
        }
      } else if (text.includes("reduzir") || text.includes("baixar") || text.includes("isentar") || text.includes("gastar") || text.includes("pagar")) {
        actions.push({ type: "ADD_GOLD", amount: -100 });
        actions.push({ type: "MODIFY_STABILITY", amount: 8 });
        actions.push({ type: "MODIFY_FACTION", faction: "merchants", amount: 15 });
        narrativeParts.push("O alívio fiscal e o investimento trouxeram novo fôlego ao comércio local.");
        intent = "Alívio Fiscal";
      }
    }

    // 3. Detecção de Exército / Guarda / Tropas / Prisão
    if (text.includes("exercito") || text.includes("exército") || text.includes("tropa") || text.includes("guarda") || text.includes("soldado") || text.includes("militar")) {
      if (text.includes("reforçar") || text.includes("treinar") || text.includes("alistamento") || text.includes("contratar")) {
        actions.push({ type: "ADD_GOLD", amount: -80 });
        actions.push({ type: "MODIFY_MILITARY", amount: 15 });
        actions.push({ type: "MODIFY_FACTION", faction: "military", amount: 15 });
        narrativeParts.push("Novos recrutas empunharam lanças e preencheram as fileiras de guarda das muralhas.");
        intent = "Fortalecimento Militar";
      }
    }

    // 4. Detecção de Prisão / Execução / Punição
    if (text.includes("prender") || text.includes("enforcar") || text.includes("executar") || text.includes("calabouço") || text.includes("punir")) {
      actions.push({ type: "MODIFY_STABILITY", amount: 5 });
      if (text.includes("comerciante")) {
        actions.push({ type: "MODIFY_FACTION", faction: "merchants", amount: -30 });
        actions.push({ type: "ADD_GOLD", amount: 80 });
        narrativeParts.push("Os agitadores das guildas foram trancafiados nas masmorras e seus bens apreendidos.");
        intent = "Prisão e Confisco";
      } else if (text.includes("nobre") || text.includes("barão") || text.includes("duque")) {
        actions.push({ type: "MODIFY_FACTION", faction: "nobles", amount: -35 });
        actions.push({ type: "MODIFY_STABILITY", amount: -10 });
        narrativeParts.push("Nobres conspiradores foram levados a ferros sob o choque estarrecido dos nobres.");
        intent = "Prisão de Aristocratas";
      } else {
        actions.push({ type: "MODIFY_FACTION", faction: "peasants", amount: -15 });
        narrativeParts.push("A mão firme da justiça monárquica puniu publicamente os descontentes.");
        intent = "Punição Exemplar";
      }
    }

    // 5. Detecção de Guerra ou Paz
    if (text.includes("guerra") || text.includes("invadir") || text.includes("atacar")) {
      actions.push({ type: "START_WAR", kingdomId: "arvandor" });
      actions.push({ type: "MODIFY_MILITARY", amount: 10 });
      actions.push({ type: "ADD_GOLD", amount: -90 });
      narrativeParts.push("As trombetas soaram pelas colinas e as tropas marcharam para o combate.");
      intent = "Declaração de Guerra";
    } else if (text.includes("paz") || text.includes("trégua") || text.includes("tratado") || text.includes("acordo")) {
      actions.push({ type: "END_WAR", kingdomId: "arvandor" });
      actions.push({ type: "MODIFY_STABILITY", amount: 10 });
      narrativeParts.push("Selos reais foram apostos ao pergaminho de trégua, dissipando o espectro do conflito.");
      intent = "Acordo de Paz";
    }

    // 6. Detecção de Igreja / Templo / Clero / Bênção
    if (text.includes("igreja") || text.includes("templo") || text.includes("padre") || text.includes("bispo") || text.includes("arcebispo") || text.includes("rezar")) {
      actions.push({ type: "MODIFY_FACTION", faction: "clergy", amount: 20 });
      actions.push({ type: "MODIFY_STABILITY", amount: 5 });
      narrativeParts.push("Os sinos das catedrais dobraram em louvor aos decretos de vossa piedade.");
      intent = "Favorecimento Religioso";
    }

    // 7. Cheat ou pedido impossível ("infinito", "999999", "me dê todo ouro", "matar todos")
    if (text.includes("9999") || text.includes("infinito") || text.includes("imortal")) {
      actions.push({ type: "MODIFY_STABILITY", amount: -5 });
      actions.push({ type: "ADD_GOLD", amount: 50 });
      narrativeParts.push("O Conselho Real conteve vossos caprichos extravagantes com prudência burocrática, ajustando os cofres moderadamente.");
      intent = "Decreto Delirante Filtrado";
    }

    // Fallback se nada específico foi detectado
    if (actions.length === 0) {
      actions.push({ type: "MODIFY_STABILITY", amount: 2 });
      actions.push({ type: "MODIFY_FACTION", faction: "nobles", amount: 5 });
      narrativeParts.push(`O soberano proferiu suas palavras com firmeza: "${request.playerDecision}". Os ministros executaram o decreto conforme seus julgamentos.`);
      intent = "Ordem Governamental";
    }

    return {
      intent,
      actions,
      narrative: narrativeParts.join(" "),
      confidence: 0.95,
    };
  }
}
