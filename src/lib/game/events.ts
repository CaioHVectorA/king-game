import { GameEvent, KingdomState, Requirement } from "@/types/game";
import { PRNG } from "./rng";

export const GAME_EVENTS: GameEvent[] = [
  // 1. Seca
  {
    id: "drought_south",
    title: "Seca Severa nas Terras do Sul",
    description:
      "A estiagem já dura quatro meses. As plantações secaram e os poços dos vilarejos do sul estão vazios. Elenor dos Vales chega à corte rogando pela abertura dos celeiros da coroa ou redução dos tributos.",
    characterId: "elenor_peasant",
    tags: ["natureza", "camponeses", "comida"],
    weight: 12,
    requirements: [{ type: "MIN_FOOD", value: 100 }],
    choices: [
      {
        id: "open_granaries",
        label: "Abrir os celeiros reais e enviar carretas de grãos",
        intentDescription: "Gastar reservas de comida para socorrer os lavradores.",
        actions: [
          { type: "ADD_FOOD", amount: -150, reason: "Ajuda aos famintos" },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 25 },
          { type: "MODIFY_STABILITY", amount: 10 },
        ],
      },
      {
        id: "tax_nobles_for_wells",
        label: "Obrigar os nobres locais a financiarem novos poços",
        intentDescription: "Poupar grãos reais e transferir o encargo aos barões.",
        actions: [
          { type: "MODIFY_FACTION", faction: "nobles", amount: -20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 15 },
          { type: "ADD_GOLD", amount: 60, reason: "Contribuição compulsória dos barões" },
        ],
        delayedEvents: [{ triggerAfterTurns: 3, eventId: "noble_retaliation" }],
      },
      {
        id: "ignore_drought",
        label: "Ignorar a seca. As reservas devem proteger a capital",
        intentDescription: "Preservar recursos da corte a custo do povo.",
        actions: [
          { type: "MODIFY_FACTION", faction: "peasants", amount: -35 },
          { type: "MODIFY_STABILITY", amount: -15 },
          { type: "MODIFY_POPULATION", amount: -1200 },
        ],
        delayedEvents: [{ triggerAfterTurns: 2, eventId: "peasant_revolt" }],
      },
    ],
  },

  // 2. Fome
  {
    id: "famine_shortage",
    title: "Inverno Rigoroso e Crise Alimentar",
    description:
      "A geada destruiu os pomares e os moinhos congelaram. O preço do pão na capital disparou cinco vezes, gerando filas desesperadas e tumultos diante dos palácios.",
    characterId: "chancellor_vane",
    tags: ["inverno", "comida", "estabilidade"],
    weight: 10,
    requirements: [{ type: "MAX_FOOD", value: 350 }],
    choices: [
      {
        id: "buy_foreign_food",
        label: "Comprar estoques de emergência dos mercadores de Eldoria",
        intentDescription: "Gastar tesouro para comprar alimento do exterior.",
        actions: [
          { type: "ADD_GOLD", amount: -180 },
          { type: "ADD_FOOD", amount: 250 },
          { type: "MODIFY_RELATION", targetId: "eldoria", amount: 15 },
        ],
      },
      {
        id: "ration_strictly",
        label: "Impor racionamento militar estrito e punir desperdício",
        intentDescription: "Usar tropas para controlar o consumo.",
        actions: [
          { type: "MODIFY_STABILITY", amount: -10 },
          { type: "MODIFY_FACTION", faction: "military", amount: 10 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -15 },
        ],
      },
    ],
  },

  // 3. Imposto / Comerciantes
  {
    id: "merchant_tax_protest",
    title: "A Fronda dos Mercadores",
    description:
      "Mestre Alistair reúne guildas ricas que ameaçam fechar armazéns e desviar rotas marítimas se as tarifas alfandegárias da coroa não forem imediatamente abolidas.",
    characterId: "merchant_alistair",
    tags: ["economia", "comerciantes"],
    weight: 10,
    choices: [
      {
        id: "concede_tax_relief",
        label: "Conceder isenção temporária nas alfândegas",
        intentDescription: "Agrada os mercadores reduzindo a arrecadação futura.",
        actions: [
          { type: "MODIFY_FACTION", faction: "merchants", amount: 20 },
          { type: "ADD_GOLD", amount: -60 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
      {
        id: "arrest_leaders",
        label: "Prender os agitadores e confiscar seus armazéns",
        intentDescription: "Demonstrar autoridade régia com mão de ferro.",
        actions: [
          { type: "MODIFY_FACTION", faction: "merchants", amount: -40 },
          { type: "ADD_GOLD", amount: 180, reason: "Bens apreendidos da guilda" },
          { type: "MODIFY_STABILITY", amount: -10 },
        ],
        delayedEvents: [{ triggerAfterTurns: 4, eventId: "merchant_smuggling_syndicate" }],
      },
      {
        id: "negotiate_monopoly",
        label: "Oferecer monopólio de especiarias em troca de lealdade",
        intentDescription: "Favorecer a liga mercante em troca de tributo imediato.",
        actions: [
          { type: "MODIFY_FACTION", faction: "merchants", amount: 15 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -15 },
          { type: "ADD_GOLD", amount: 100 },
        ],
      },
    ],
  },

  // 4. Revolta Camponesa
  {
    id: "peasant_revolt",
    title: "Levante Popular: Tochas nas Colinas",
    description:
      "Milhares de trabalhadores rurais armados com foices marcharam até as muralhas de um castelo provincial, exigindo pão e a deposição de cobradores de impostos tiranos.",
    characterId: "elenor_peasant",
    tags: ["revolta", "camponeses", "militar"],
    weight: 8,
    requirements: [{ type: "MAX_FACTION", faction: "peasants", value: -15 }],
    choices: [
      {
        id: "crush_rebellion",
        label: "Enviar o General Thorne para sufocar o motim",
        intentDescription: "Restaurar a ordem pela força das espadas.",
        actions: [
          { type: "MODIFY_MILITARY", amount: -10 },
          { type: "MODIFY_POPULATION", amount: -1500 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -40 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: 15 },
          { type: "MODIFY_STABILITY", amount: 15 },
        ],
      },
      {
        id: "pardon_and_hear",
        label: "Conceder anistia geral e demitir os cobradores corruptos",
        intentDescription: "Pacificação diplomática às custas de prestígio nobre.",
        actions: [
          { type: "MODIFY_FACTION", faction: "peasants", amount: 35 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -20 },
          { type: "ADD_GOLD", amount: -70 },
          { type: "MODIFY_STABILITY", amount: 10 },
        ],
      },
    ],
  },

  // 5. Guerra / Ameaça Arvandor
  {
    id: "war_threat_arvandor",
    title: "Tambores de Guerra na Fronteira de Arvandor",
    description:
      "Embaixadores do Império de Arvandor entregam um ultimato: entreguem as fortalezas do desfiladeiro ocidental ou enfrentem uma invasão em massa de seus regimentos de lanceiros.",
    characterId: "general_thorne",
    tags: ["guerra", "militar", "diplomacia"],
    weight: 9,
    choices: [
      {
        id: "mobilize_for_war",
        label: "Rejeitar a chantagem e mobilizar todas as legiões",
        intentDescription: "Preparar-se para a guerra total.",
        actions: [
          { type: "START_WAR", kingdomId: "arvandor" },
          { type: "ADD_GOLD", amount: -120 },
          { type: "MODIFY_MILITARY", amount: 15 },
          { type: "MODIFY_FACTION", faction: "military", amount: 25 },
        ],
      },
      {
        id: "bribe_ambassadors",
        label: "Subornar emissários e enviar tributo em ouro para conter o avanço",
        intentDescription: "Comprar a paz temporária com tesouro.",
        actions: [
          { type: "ADD_GOLD", amount: -220 },
          { type: "MODIFY_RELATION", targetId: "arvandor", amount: 20 },
          { type: "MODIFY_FACTION", faction: "military", amount: -15 },
        ],
      },
    ],
  },

  // 6. Pedido de Camponeses
  {
    id: "peasant_petition_grain",
    title: "A Petição dos Moinhos Reais",
    description:
      "Uma delegação de aldeões ajoelha-se no grande salão. Eles pedem autorização para usar a lenha da floresta régia e redução no tributo sobre a moagem de trigo.",
    characterId: "elenor_peasant",
    tags: ["camponeses", "leis"],
    weight: 10,
    choices: [
      {
        id: "grant_forest_rights",
        label: "Permitir a colheita de lenha e diminuir a taxa de moagem",
        intentDescription: "Alivia a vida humilde mas desagrada guardas florestais.",
        actions: [
          { type: "MODIFY_FACTION", faction: "peasants", amount: 20 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -10 },
          { type: "ADD_FOOD", amount: 60 },
        ],
      },
      {
        id: "deny_petition",
        label: "Manter o monopólio da coroa. As florestas pertencem ao rei",
        intentDescription: "Preservar a soberania e a receita intactas.",
        actions: [
          { type: "MODIFY_FACTION", faction: "peasants", amount: -15 },
          { type: "ADD_GOLD", amount: 40 },
        ],
      },
    ],
  },

  // 7. Conflito entre Nobres
  {
    id: "noble_feud",
    title: "Sangue e Herança: A Disputa dos Ducados",
    description:
      "O Duque de Oakhaven e a Condessa de Valemont reuniram cavaleiros em armas por causa de uma mina de prata na fronteira de seus domínios. A guerra civil interna é iminente.",
    characterId: "chancellor_vane",
    tags: ["nobres", "justiça", "política"],
    weight: 9,
    choices: [
      {
        id: "confiscate_mine",
        label: "Confiscar a mina para a coroa e desarmar ambos os lados",
        intentDescription: "Aumenta a renda régia enquanto impõe disciplina severa.",
        actions: [
          { type: "ADD_GOLD", amount: 150 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -25 },
          { type: "MODIFY_STABILITY", amount: 10 },
        ],
      },
      {
        id: "favor_oakhaven",
        label: "Arbitrar a favor do Duque de Oakhaven em troca de apoio político",
        intentDescription: "Fortalece um aliado poderoso e aliena a condessa.",
        actions: [
          { type: "MODIFY_FACTION", faction: "nobles", amount: 10 },
          { type: "ADD_GOLD", amount: 70 },
          { type: "MODIFY_STABILITY", amount: -5 },
        ],
      },
    ],
  },

  // 8. Corrupção
  {
    id: "treasury_corruption",
    title: "Ouro Fantasma no Tesouro",
    description:
      "Auditores descobriram que dezenas de sacos de moedas de prata foram substituídos por chumbo pintado no depósito central. O rastro leva a altos oficiais do palácio.",
    characterId: "merchant_alistair",
    tags: ["corrupção", "ouro", "justiça"],
    weight: 8,
    choices: [
      {
        id: "purge_bureaucracy",
        label: "Criar um tribunal de inquisição financeira e executar os culpados",
        intentDescription: "Reprime duramente a corrupção com exemplo público.",
        actions: [
          { type: "ADD_GOLD", amount: 110, reason: "Tesouro recuperado" },
          { type: "MODIFY_STABILITY", amount: 15 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -15 },
        ],
      },
      {
        id: "cover_up",
        label: "Abafar o escândalo discretamente para evitar pânico",
        intentDescription: "Evita rusgas políticas mas perpetua o desvio.",
        actions: [
          { type: "ADD_GOLD", amount: -90 },
          { type: "MODIFY_STABILITY", amount: -10 },
        ],
      },
    ],
  },

  // 9. Assassinato / Atentado
  {
    id: "assassination_attempt",
    title: "Veneno na Taça Real",
    description:
      "Durante o banquete da colheita, o provador do rei caiu convulsionando após beber o vinho do Reno. O assassino escapou pelas passagens secretas da cozinha!",
    characterId: "chancellor_vane",
    tags: ["intriga", "perigo", "sucessão"],
    weight: 7,
    choices: [
      {
        id: "martial_law_investigation",
        label: "Decretar toque de recolher e ordenar tortura de suspeitos",
        intentDescription: "Garante segurança máxima ao custo de terror popular.",
        actions: [
          { type: "MODIFY_MILITARY", amount: 10 },
          { type: "MODIFY_STABILITY", amount: -15 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -20 },
        ],
      },
      {
        id: "tighten_guard",
        label: "Contratar uma guarda pretoriana de veteranos leais",
        intentDescription: "Aumenta a defesa pessoal com soldo garantido.",
        actions: [
          { type: "ADD_GOLD", amount: -100 },
          { type: "MODIFY_MILITARY", amount: 10 },
          { type: "MODIFY_FACTION", faction: "military", amount: 15 },
        ],
      },
    ],
  },

  // 10. Tratado com Eldoria
  {
    id: "treaty_eldoria",
    title: "Pacto das Rotas Douradas",
    description:
      "Eldoria propõe uma aliança comercial irrestrita: redução mútua de impostos portuários e patrulhamento conjunto contra piratas nas baías.",
    characterId: "merchant_alistair",
    tags: ["diplomacia", "economia"],
    weight: 9,
    choices: [
      {
        id: "sign_pact",
        label: "Ratificar a aliança e abrir nossos portos às frotas eldorienses",
        intentDescription: "Estreita laços diplomáticos e dinamiza o comércio.",
        actions: [
          { type: "MODIFY_RELATION", targetId: "eldoria", amount: 30 },
          { type: "ADD_GOLD", amount: 120 },
          { type: "MODIFY_FACTION", faction: "merchants", amount: 20 },
        ],
      },
      {
        id: "reject_pact",
        label: "Recusar. Não permitiremos que mercadores estrangeiros dominem nossos mares",
        intentDescription: "Protecionismo econômico e desconfiança de vizinhos.",
        actions: [
          { type: "MODIFY_RELATION", targetId: "eldoria", amount: -20 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: 15 },
        ],
      },
    ],
  },

  // 11. Casamento Real
  {
    id: "royal_marriage_proposal",
    title: "Proposta de Matrimônio Dinástico",
    description:
      "A nobreza vizinha oferece a mão de sua filha primogênita, acompanhada de um dote vultoso de 200 moedas de ouro e terras agrícolas férteis, em troca de um pacto perpétuo.",
    characterId: "chancellor_vane",
    tags: ["dinastia", "nobreza", "ouro"],
    weight: 7,
    choices: [
      {
        id: "accept_marriage",
        label: "Celebrar as núpcias reais com grandiosa festa popular",
        intentDescription: "Traz riqueza e legitimidade à casa reinante.",
        actions: [
          { type: "ADD_GOLD", amount: 200 },
          { type: "ADD_FOOD", amount: -50, reason: "Banquete régio" },
          { type: "MODIFY_FACTION", faction: "nobles", amount: 20 },
          { type: "MODIFY_STABILITY", amount: 15 },
        ],
      },
      {
        id: "decline_marriage",
        label: "Recusar a aliança para manter independência das linhagens",
        intentDescription: "Evita compromissos externos complexos.",
        actions: [
          { type: "MODIFY_FACTION", faction: "nobles", amount: -15 },
        ],
      },
    ],
  },

  // 12. Caravana Mercante
  {
    id: "foreign_merchant_caravan",
    title: "A Grande Feira das Sedas e Pólvora",
    description:
      "Uma monumental caravana de mercadores do Oriente distante acampou além dos muros. Eles oferecem especiarias raras, armas de fogo primitivas e remédios milagrosos.",
    characterId: "merchant_alistair",
    tags: ["comércio", "tecnologia"],
    weight: 9,
    choices: [
      {
        id: "buy_weapons",
        label: "Adquirir os armamentos para reforçar as tropas do reino",
        intentDescription: "Gasta ouro para alavancar a capacidade bélica.",
        actions: [
          { type: "ADD_GOLD", amount: -110 },
          { type: "MODIFY_MILITARY", amount: 20 },
          { type: "MODIFY_FACTION", faction: "military", amount: 15 },
        ],
      },
      {
        id: "tax_heavy_transit",
        label: "Cobrar taxa exorbitante de trânsito em ouro",
        intentDescription: "Lucrar em cima dos forasteiros.",
        actions: [
          { type: "ADD_GOLD", amount: 130 },
          { type: "MODIFY_FACTION", faction: "merchants", amount: -10 },
        ],
      },
    ],
  },

  // 13. Ameaça Externa (Khar)
  {
    id: "khar_raiders_border",
    title: "Cavaleiros de Khar no Horizonte",
    description:
      "Bandos de saqueadores das estepes de Khar queimaram postos avançados e roubaram rebanhos inteiros nas vilas setentrionais. O General exige ação rápida.",
    characterId: "general_thorne",
    tags: ["fronteira", "militar", "combate"],
    weight: 9,
    choices: [
      {
        id: "strike_back",
        label: "Lançar contra-ofensiva de cavalaria para esmagar os invasores",
        intentDescription: "Demonstra força mas arrisca baixas militares.",
        actions: [
          { type: "MODIFY_MILITARY", amount: -5 },
          { type: "ADD_FOOD", amount: 80, reason: "Gado recuperado" },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "MODIFY_RELATION", targetId: "khar", amount: -25 },
        ],
      },
      {
        id: "build_border_forts",
        label: "Financiar uma cadeia de paliçadas e torres defensivas",
        intentDescription: "Investimento em proteção permanente.",
        actions: [
          { type: "ADD_GOLD", amount: -140 },
          { type: "MODIFY_MILITARY", amount: 15 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
    ],
  },

  // 14. Deserção
  {
    id: "garrison_desertion",
    title: "Soldos em Atraso e Evasão nas Torres",
    description:
      "Soldados das guarnições da montanha abandonaram seus postos após meses de rações curtas e pagamento atrasado. Alguns formaram bandos de salteadores.",
    characterId: "general_thorne",
    tags: ["militar", "ouro", "ordem"],
    weight: 8,
    requirements: [{ type: "MAX_GOLD", value: 150 }],
    choices: [
      {
        id: "pay_back_wages",
        label: "Pagar todos os soldos atrasados com juros imediatamente",
        intentDescription: "Restaura a fidelidade das tropas com ouro.",
        actions: [
          { type: "ADD_GOLD", amount: -120 },
          { type: "MODIFY_MILITARY", amount: 15 },
          { type: "MODIFY_FACTION", faction: "military", amount: 25 },
        ],
      },
      {
        id: "decimate_deserters",
        label: "Enforcar os líderes dos desertores como traidores da coroa",
        intentDescription: "Incutir medo através de punição exemplar sem custo financeiro.",
        actions: [
          { type: "MODIFY_MILITARY", amount: -15 },
          { type: "MODIFY_FACTION", faction: "military", amount: -20 },
          { type: "MODIFY_STABILITY", amount: -10 },
        ],
      },
    ],
  },

  // 15. Epidemia na Capital
  {
    id: "capital_epidemic",
    title: "A Febre Negra nos Bairros Pobres",
    description:
      "Uma peste respiratória se espalha pelas vielas úmidas da capital. Corpos acumulam-se nos canais e o Arcebispo afirma ser punição divina aos pecados do povo.",
    characterId: "archbishop_ignatius",
    tags: ["epidemia", "clero", "saúde"],
    weight: 8,
    choices: [
      {
        id: "cordon_sanitaire",
        label: "Isolar os bairros afetados e financiar boticários e cal",
        intentDescription: "Conter o contágio com ciência e gasto médico.",
        actions: [
          { type: "ADD_GOLD", amount: -110 },
          { type: "MODIFY_POPULATION", amount: -800 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
      {
        id: "pray_and_processions",
        label: "Entregar o tesouro aos mosteiros para novenas de purificação",
        intentDescription: "Agrada ao clero com doações devocionais.",
        actions: [
          { type: "ADD_GOLD", amount: -70 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: 30 },
          { type: "MODIFY_POPULATION", amount: -2200 },
          { type: "MODIFY_STABILITY", amount: -10 },
        ],
      },
    ],
  },

  // 16. Bênção / Crise com o Alto Clero
  {
    id: "clerical_blessing",
    title: "A Dádiva da Chama Divina",
    description:
      "O Arcebispo Ignatius convoca uma solene missa na grande catedral para proclamar que o governo do rei é abençoado pelos céus, mas pede o dízimo da colheita como retribuição.",
    characterId: "archbishop_ignatius",
    tags: ["religião", "clero", "estabilidade"],
    weight: 8,
    choices: [
      {
        id: "give_tithe",
        label: "Doar grãos para a caridade da igreja e beijar o anel sagrado",
        intentDescription: "Conquista fervoroso apoio do clero e do povo piedoso.",
        actions: [
          { type: "ADD_FOOD", amount: -80 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: 25 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 10 },
          { type: "MODIFY_STABILITY", amount: 15 },
        ],
      },
      {
        id: "refuse_tithe",
        label: "Reafirmar que a coroa não se subordina à mitra",
        intentDescription: "Mantém os recursos mas desperta a fúria dos sacerdotes.",
        actions: [
          { type: "MODIFY_FACTION", faction: "clergy", amount: -30 },
          { type: "MODIFY_STABILITY", amount: -10 },
        ],
      },
    ],
  },

  // Eventos de Consequência Atrasada (Delayed Events)
  {
    id: "noble_retaliation",
    title: "Retaliação dos Barões: Fechamento de Feudos",
    description:
      "Em protesto aos tributos forçados para socorrer o sul, nobres influentes bloquearam as estradas de suas propriedades e retiveram os impostos regulares!",
    characterId: "chancellor_vane",
    tags: ["consequencia", "nobres"],
    weight: 5,
    isDelayedTriggerOnly: true,
    choices: [
      {
        id: "arrest_baron",
        label: "Mandar a guarda desarmar e prender o líder dos barões",
        intentDescription: "Demonstra força indiscutível do trono.",
        actions: [
          { type: "MODIFY_MILITARY", amount: -10 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -30 },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "ADD_GOLD", amount: 80 },
        ],
      },
      {
        id: "appease_nobles",
        label: "Conceder novos títulos de terras para reconciliação",
        intentDescription: "Acalma os ânimos nobres mas perde influência régia.",
        actions: [
          { type: "MODIFY_FACTION", faction: "nobles", amount: 20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -15 },
        ],
      },
    ],
  },
  {
    id: "merchant_smuggling_syndicate",
    title: "A Rede Negra de Contrabando",
    description:
      "Após a perseguição à guilda mercante, uma rede clandestina de contrabandistas passou a drenar as taxas da coroa e contrabandear armas para rebeldes.",
    characterId: "merchant_alistair",
    tags: ["consequencia", "comerciantes", "economia"],
    weight: 5,
    isDelayedTriggerOnly: true,
    choices: [
      {
        id: "grant_amnesty_merchants",
        label: "Oferecer perdão e integrar os mercadores à alfândega oficial",
        intentDescription: "Recupera receitas formalizando o comércio.",
        actions: [
          { type: "MODIFY_FACTION", faction: "merchants", amount: 25 },
          { type: "ADD_GOLD", amount: 90 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
      {
        id: "hang_smugglers",
        label: "Enforcar qualquer um pego com carga ilegal nos cais",
        intentDescription: "Guerra aberta contra o mercado negro.",
        actions: [
          { type: "MODIFY_FACTION", faction: "merchants", amount: -20 },
          { type: "MODIFY_MILITARY", amount: -5 },
          { type: "MODIFY_STABILITY", amount: -5 },
        ],
      },
    ],
  },
];

export function isEventEligible(event: GameEvent, state: KingdomState): boolean {
  if (event.isDelayedTriggerOnly) {
    return false; // só é disparado se agendado em delayedEvents
  }

  if (!event.requirements || event.requirements.length === 0) {
    return true;
  }

  for (const req of event.requirements) {
    switch (req.type) {
      case "MIN_GOLD":
        if (state.gold < req.value) return false;
        break;
      case "MAX_GOLD":
        if (state.gold > req.value) return false;
        break;
      case "MIN_FOOD":
        if (state.food < req.value) return false;
        break;
      case "MAX_FOOD":
        if (state.food > req.value) return false;
        break;
      case "MIN_STABILITY":
        if (state.stability < req.value) return false;
        break;
      case "MAX_STABILITY":
        if (state.stability > req.value) return false;
        break;
      case "FLAG_EQUALS":
        if (!!state.flags[req.flag] !== req.value) return false;
        break;
      case "AT_WAR":
        if ((state.activeWars.length > 0) !== req.value) return false;
        break;
      case "MIN_FACTION":
        if ((state.factions[req.faction] ?? 0) < req.value) return false;
        break;
      case "MAX_FACTION":
        if ((state.factions[req.faction] ?? 0) > req.value) return false;
        break;
    }
  }

  return true;
}

import { getStoryline } from "@/content/storylines";

export function selectNextEvent(state: KingdomState, prng: PRNG): GameEvent {
  const storyline = getStoryline(state.storylineId);
  const allEvents = [...storyline.events, ...GAME_EVENTS.filter((e) => !storyline.events.some((se) => se.id === e.id))];

  // 1. Checa se há delayed event agendado para o turno atual
  const dueIndex = state.delayedEvents.findIndex((d) => d.triggerAtTurn <= state.turn);
  if (dueIndex !== -1) {
    const delayed = state.delayedEvents[dueIndex];
    const foundEvent = allEvents.find((e) => e.id === delayed.eventId);
    if (foundEvent) {
      return foundEvent;
    }
  }

  // 2. Filtra eventos elegíveis que não foram os últimos 3 apresentados
  const recentEventTitles = state.history.slice(-3).map((h) => h.eventTitle);
  const eligible = allEvents.filter(
    (e) => isEventEligible(e, state) && !recentEventTitles.includes(e.title)
  );

  const pool = eligible.length > 0 ? eligible : allEvents.filter((e) => !e.isDelayedTriggerOnly);
  const selected = prng.pickWeighted(pool);

  return selected || allEvents[0];
}
