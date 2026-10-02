// ============================================================================
// SOBERANIA: CÓDICE DE FINAIS DINÁSTICOS & MATRIZ DE EPÍLOGOS (ENDINGS MATRIX)
// ============================================================================

import { DynasticEndingResult, EndingType } from "@/types/sovereign";
import { KingdomState } from "@/types/game";

export interface MasterEndingDefinition {
  id: string;
  type: EndingType;
  title: string;
  subtitle: string;
  epitaph: string;
  descriptionTemplate: string;
  conditionChecker: (state: KingdomState) => boolean;
}

export const MASTER_ENDINGS_CATALOG: MasterEndingDefinition[] = [
  // ── 1. GLÓRIA DOURADA & ERA DE OURO ──
  {
    id: "ending_pax_aurea",
    type: "gloria_dourada",
    title: "A Pax Aurea: O Século de Ouro",
    subtitle: "Prosperidade Inigualável & Harmonia Dinástica",
    epitaph: "Sob vosso cetro, o trigo nunca faltou e o aço repousou nas bainhas ornamentadas.",
    descriptionTemplate: "Vosso reinado entrou para as canções dos bardos e para os tomos sagrados como a era mais luminosa do reino. O tesouro transbordava, os súditos viviam sem o terror da guerra e vossa linhagem foi abençoada com cem anos de sucessão pacífica.",
    conditionChecker: (state) => state.turn >= 25 && state.stability > 75 && state.gold > 500 && state.population > 1200,
  },
  {
    id: "ending_imperio_eterno",
    type: "gloria_dourada",
    title: "O Império Sem Fronteiras",
    subtitle: "Hegemonia Militar Absoluta & Glória Eterna",
    epitaph: "Todos os reis vizinhos dobraram os joelhos e prestaram vassalagem ao vosso brasão.",
    descriptionTemplate: "As legiões do reino marcharam invictas. Não restou inimigo que pudesse erguer estandartes contra vossa vontade. O vosso nome tornou-se sinônimo de poder inabalável.",
    conditionChecker: (state) => state.turn >= 20 && state.military > 85 && state.stability > 60 && state.activeWars.length === 0,
  },

  // ── 2. TIRANIA DE FERRO ──
  {
    id: "ending_tirania_cinzenta",
    type: "tirania_de_ferro",
    title: "A Coroa de Cinzas: O Soberano de Ferro",
    subtitle: "Ordem Absoluta através do Pavor",
    epitaph: "Nenhum homem ousou erguer a voz, pois o silêncio era a única garantia de vida.",
    descriptionTemplate: "A forca tornou-se o monumento mais comum da capital. Vosso governo expurgou traidores, barões e rebeldes sem hesitação. O reino sobreviveu intacto, mas a alma de seu povo foi calada pela sombra da vossa espada.",
    conditionChecker: (state) => (state.psychology?.corruption || 0) > 70 && state.stability > 50,
  },

  // ── 3. COLAPSO ANÁRQUICO & RUÍNA ──
  {
    id: "ending_regicidio_sangrento",
    type: "colapso_anarquico",
    title: "A Noite dos Punhais: O Fim da Coroa",
    subtitle: "Revolta dos Barões & Queda da Linhagem",
    epitaph: "As portas do palácio caíram e a coroa rolou ensanguentada pelos mármores.",
    descriptionTemplate: "Traído por aqueles que vos juraram lealdade em público, o trono foi cercado ao romper da aurora. A dinastia foi declarada extinta em meio ao clamor das espadas e o reino fragmentou-se em feudos em guerra perpétua.",
    conditionChecker: (state) => state.isGameOver && (state.stability <= 5 || (state.livingFactions?.nobility?.approval || 0) < -70),
  },
  {
    id: "ending_fome_negra",
    type: "colapso_anarquico",
    title: "O Grande Silêncio dos Celeiros",
    subtitle: "Desolação Demográfica & Colapso por Fome",
    epitaph: "Nem ouro nem decretos puderam saciar a terra ressequida.",
    descriptionTemplate: "Os celeiros ficaram vazios e as estradas encheram-se de refugiados famintos. Vilas inteiras desapareceram do mapa. Quando os portões do castelo foram finalmente arrombados, os soldados encontraram apenas um trono deserto cercado por cinzas.",
    conditionChecker: (state) => state.isGameOver && state.food <= 0,
  },

  // ── 4. MÁRTIR SACRO ──
  {
    id: "ending_martir_sagrado",
    type: "martirio_sacro",
    title: "O Sacrifício do Rei Abnegado",
    subtitle: "A Vida pela Salvação do Reino",
    epitaph: "Morreu para que seu povo pudesse atravessar a escuridão da noite.",
    descriptionTemplate: "Em meio à catástrofe que ameaçava varrer a civilização, vossa majestade tomou para si o fardo supremo. Vosso túmulo tornou-se santuário de peregrinação perpétua, onde velas nunca se apagam.",
    conditionChecker: (state) => (state.psychology?.honor || 0) > 80 && (state.turn >= 15 || state.isGameOver),
  },

  // ── 5. EXÍLIO SILENCIOSO ──
  {
    id: "ending_exilio_brumas",
    type: "exilio_silencioso",
    title: "O Último Barco para as Brumas",
    subtitle: "A Abdicação Voluntária & O Desaparecimento",
    epitaph: "Deixou a coroa sobre o trono vazio e caminhou em direção ao mar desconhecido.",
    descriptionTemplate: "Cansado dos fardos insolúveis do poder e das mentiras da corte, vós deixastes o manto imperial para trás. Relatos afirmam ter visto um andarilho com olhos de rei nas aldeias costeiras além do horizonte.",
    conditionChecker: (state) => (state.psychology?.tension || 0) > 85 && state.stability > 40,
  },

  // ── 6. NOVO AMANHECER (TRANSFORMAÇÃO) ──
  {
    id: "ending_novo_amanhecer",
    type: "novo_amanhecer",
    title: "O Pacto da Alvorada: A Nova Carta",
    subtitle: "A Transição da Autocracia para a Comunidade de Leis",
    epitaph: "Não governou como senhor de escravos, mas como primeiro cidadão da nação.",
    descriptionTemplate: "Com visão rara, vós convocastes nobres, eruditos, artesãos e sacerdotes para redigir uma Constituição que sobreviveria a qualquer monarca. A coroa tornou-se símbolo moral, e o povo floresceu sob leis justas.",
    conditionChecker: (state) => state.laws.length >= 5 && state.stability > 70 && (state.psychology?.acumen || 0) > 65,
  },
];

/**
 * Avalia o estado atual do jogo e determina se um final dinástico foi alcançado
 */
export function evaluateDynasticEnding(state: KingdomState): DynasticEndingResult | null {
  // Se ainda estiver no começo da campanha (menos de 6 turnos) e não for game over, continua jogando
  if (state.turn < 6 && !state.isGameOver) return null;

  // Busca finais compatíveis
  for (const ending of MASTER_ENDINGS_CATALOG) {
    if (ending.conditionChecker(state)) {
      const score = calculateDynasticScore(state);
      const achievements: string[] = [];

      if (state.turn >= 20) achievements.push("Veterano dos Tronos (20+ Turnos)");
      if (state.gold > 500) achievements.push("Midas Dinástico (Tesouro > 500)");
      if (state.stability > 80) achievements.push("Paz de Mármore (Estabilidade > 80)");
      if (state.laws.length >= 4) achievements.push("Legislador Supremo (4+ Leis Promulgadas)");
      if ((state.psychology?.honor || 0) > 75) achievements.push("Coração Nobre Inabalável");

      return {
        endingId: ending.id,
        type: ending.type,
        title: ending.title,
        subtitle: ending.subtitle,
        epitaph: ending.epitaph,
        finalNarrative: ending.descriptionTemplate,
        survivedYears: state.year,
        survivedTurns: state.turn,
        achievementsUnlocked: achievements,
        dynasticScore: score,
      };
    }
  }

  // Se o jogo acabou por falência de população ou estabilidade e nenhum final específico bateu
  if (state.isGameOver) {
    return {
      endingId: "ending_colapso_generico",
      type: "colapso_anarquico",
      title: "O Crepúsculo dos Soberanos",
      subtitle: "A Dinastia Sucumbiu aos Desafios do Tempo",
      epitaph: state.gameOverReason || "O reino não resistiu ao peso de seus próprios dilemas.",
      finalNarrative: "A dinastia chegou ao fim. As crônicas registraram vossas vitórias e vossas tragédias nos arquivos dos tempos esquecidos.",
      survivedYears: state.year,
      survivedTurns: state.turn,
      achievementsUnlocked: ["Lutou até o Último Fôlego"],
      dynasticScore: calculateDynasticScore(state),
    };
  }

  return null;
}

/**
 * Calcula a pontuação dinástica do reinado
 */
export function calculateDynasticScore(state: KingdomState): number {
  const turnPoints = state.turn * 50;
  const goldPoints = Math.floor(state.gold * 0.5);
  const stabPoints = state.stability * 10;
  const popPoints = Math.floor(state.population * 0.2);
  const lawsPoints = (state.laws?.length || 0) * 100;
  const echoBonus = (state.echoes?.filter((e) => e.resolved).length || 0) * 75;

  return Math.max(0, turnPoints + goldPoints + stabPoints + popPoints + lawsPoints + echoBonus);
}
