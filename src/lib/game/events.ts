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
    chain: {
      id: "chain_drought",
      step: 1,
      maxSteps: 3,
      branchOnChoice: {
        open_granaries: "drought_step2_granary_depletion",
        tax_nobles_for_wells: "drought_step2_noble_protest",
        ignore_drought: "drought_step2_bread_riot",
      },
    },
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
    chain: {
      id: "chain_conspiracy",
      step: 1,
      maxSteps: 3,
      branchOnChoice: {
        martial_law_investigation: "conspiracy_step2_dungeons_confession",
        tighten_guard: "conspiracy_step2_whispers_in_shadow",
      },
    },
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
    chain: {
      id: "chain_khar_war",
      step: 1,
      maxSteps: 3,
      branchOnChoice: {
        strike_back: "khar_step2_counterattack_ambush",
        build_border_forts: "khar_step2_siege_of_forts",
      },
    },
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
    chain: {
      id: "chain_plague",
      step: 1,
      maxSteps: 3,
      branchOnChoice: {
        cordon_sanitaire: "plague_step2_quarantine_breach",
        pray_and_processions: "plague_step2_holy_hysteria",
      },
    },
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

  // 17. Escadinha de Eventos: A Seca no Sul (Passos 2 e 3)
  {
    id: "drought_step2_granary_depletion",
    title: "Esvaziamento dos Silos & Especulação Mercante",
    description:
      "As carretas reais enviadas aos vilarejos esgotaram as reservas centrais. A Liga Mercante aproveitou a escassez para triplicar o preço dos grãos restantes. Mestre Alistair pede concessão de novos armazéns ou subsídios da coroa.",
    characterId: "merchant_alistair",
    tags: ["cadeia", "seca", "comerciantes"],
    weight: 10,
    chain: {
      id: "chain_drought",
      step: 2,
      maxSteps: 3,
      nextEventId: "drought_step3_agrarian_treaty",
    },
    choices: [
      {
        id: "subsidize_grain_import",
        label: "Subsidiar navios de grãos do além-mar com ouro do tesouro",
        intentDescription: "Gasta ouro para saciar a capital e estabilizar preços.",
        actions: [
          { type: "ADD_GOLD", amount: -130 },
          { type: "ADD_FOOD", amount: 160 },
          { type: "MODIFY_STABILITY", amount: 10 },
        ],
      },
      {
        id: "freeze_grain_prices",
        label: "Tabelar preços à força e ameaçar enforcar açambarcadores",
        intentDescription: "Pressiona comerciantes com mão de ferro.",
        actions: [
          { type: "MODIFY_FACTION", faction: "merchants", amount: -25 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 20 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
    ],
  },
  {
    id: "drought_step2_noble_protest",
    title: "A Fronda dos Poços: Barões em Armas",
    description:
      "Os barões feudais expulsaram a golpes de alabarda os cobradores enviados para taxar a abertura de poços. Lorde Vane adverte que três condados vizinhos se recusam a comparecer à corte.",
    characterId: "chancellor_vane",
    tags: ["cadeia", "seca", "nobres"],
    weight: 10,
    chain: {
      id: "chain_drought",
      step: 2,
      maxSteps: 3,
      nextEventId: "drought_step3_agrarian_treaty",
    },
    choices: [
      {
        id: "send_guard_confiscate_estates",
        label: "Enviar a guarda real para cercar as mansões dos barões rebeldes",
        intentDescription: "Impor submissão militar com risco de guerra interna.",
        actions: [
          { type: "MODIFY_MILITARY", amount: -10 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -35 },
          { type: "ADD_GOLD", amount: 140 },
          { type: "MODIFY_STABILITY", amount: -5 },
        ],
      },
      {
        id: "negotiate_tax_pardon",
        label: "Ceder aos barões e perdoar a taxa em troca de um juramento de lealdade",
        intentDescription: "Acalma a aristocracia mas frustra os camponeses.",
        actions: [
          { type: "MODIFY_FACTION", faction: "nobles", amount: 20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -20 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
    ],
  },
  {
    id: "drought_step2_bread_riot",
    title: "A Marcha dos Famintos às Muralhas",
    description:
      "Ignorados pelo trono, cinco mil lavradores desesperados marcharam pelas estradas do sul até os portões da capital com ancinhos e tochas acesas, exigindo grãos ou a deposição dos intendentes.",
    characterId: "elenor_peasant",
    tags: ["cadeia", "seca", "revolta"],
    weight: 10,
    chain: {
      id: "chain_drought",
      step: 2,
      maxSteps: 3,
      nextEventId: "drought_step3_agrarian_treaty",
    },
    choices: [
      {
        id: "charge_cavalry_rebels",
        label: "Mandar a cavalaria dispersar a multidão pelas lanças",
        intentDescription: "Repressão violenta imediata.",
        actions: [
          { type: "MODIFY_POPULATION", amount: -1400 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -40 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: 15 },
          { type: "MODIFY_STABILITY", amount: -10 },
        ],
      },
      {
        id: "open_gates_bread_treaty",
        label: "Abrir os portões, distribuir pão e ouvir os líderes rurais no pátio",
        intentDescription: "Pacificação popular com custo material.",
        actions: [
          { type: "ADD_FOOD", amount: -120 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 30 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -15 },
          { type: "MODIFY_STABILITY", amount: 10 },
        ],
      },
    ],
  },
  {
    id: "drought_step3_agrarian_treaty",
    title: "O Grande Edito Agrário da Coroa",
    description:
      "A crise da seca atinge seu desfecho histórico. O Conselho Real e representantes de todas as províncias reúnem-se para selar o novo Estatuto da Terra de Valoria.",
    characterId: "counselor_morris",
    tags: ["cadeia", "seca", "conclusao"],
    weight: 10,
    chain: {
      id: "chain_drought",
      step: 3,
      maxSteps: 3,
    },
    choices: [
      {
        id: "crown_protected_reserves",
        label: "Decretar silos perpétuos da coroa sob custódia militar obrigatória",
        intentDescription: "Cria infraestrutura permanente de segurança alimentar.",
        actions: [
          { type: "ADD_GOLD", amount: -90 },
          { type: "MODIFY_STABILITY", amount: 20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 15 },
          { type: "ADD_LAW", law: "Reserva Perpétua de Silos Reais" },
        ],
      },
      {
        id: "agrarian_market_freedom",
        label: "Desregulamentar o comércio de trigo e incentivar a Liga Mercante",
        intentDescription: "Estimula riqueza mercantil e circulação rápida de grãos.",
        actions: [
          { type: "ADD_GOLD", amount: 130 },
          { type: "MODIFY_FACTION", faction: "merchants", amount: 25 },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "ADD_LAW", law: "Livre Trânsito de Cerais" },
        ],
      },
    ],
  },

  // 18. Escadinha de Eventos: A Horda de Khar (Passos 2 e 3)
  {
    id: "khar_step2_counterattack_ambush",
    title: "A Batalha das Ravinas Sangrentas",
    description:
      "Nossa cavalaria caiu em uma armadilha nas ravinas do norte: batedores de Khar fingiram fuga e emboscaram a coluna com arqueiros a cavalo. O General solicita reforços imediatos de infantaria pesada ou ordem de retirada para as colinas.",
    characterId: "general_thorne",
    tags: ["cadeia", "guerra", "militar"],
    weight: 10,
    chain: {
      id: "chain_khar_war",
      step: 2,
      maxSteps: 3,
      nextEventId: "khar_step3_khan_showdown",
    },
    choices: [
      {
        id: "commit_royal_guard_flank",
        label: "Despachar a Guarda Real montada para romper o cerco inimigo",
        intentDescription: "Aposta tudo na vitória militar decisiva.",
        actions: [
          { type: "MODIFY_MILITARY", amount: 15 },
          { type: "ADD_GOLD", amount: -80 },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "MODIFY_RELATION", targetId: "khar", amount: -30 },
        ],
      },
      {
        id: "tactical_retreat_garrison",
        label: "Ordenar recuo estratégico até as fortalezas de pedra",
        intentDescription: "Poupa soldados e assume postura defensiva.",
        actions: [
          { type: "MODIFY_MILITARY", amount: -5 },
          { type: "MODIFY_FACTION", faction: "military", amount: -10 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
    ],
  },
  {
    id: "khar_step2_siege_of_forts",
    title: "O Cerco de Fogo aos Baluartes",
    description:
      "As novas paliçadas suportaram o choque inicial, mas hordas nômades incendiaram os fossos com alcatrão e cortaram as linhas de água potável. O comandante da guarnição pede uma surtida noturna ou socorro da corte.",
    characterId: "general_thorne",
    tags: ["cadeia", "guerra", "defesa"],
    weight: 10,
    chain: {
      id: "chain_khar_war",
      step: 2,
      maxSteps: 3,
      nextEventId: "khar_step3_khan_showdown",
    },
    choices: [
      {
        id: "night_sally_fire",
        label: "Liderar uma surtida noturna com archotes e cavalaria pesada",
        intentDescription: "Ataque surpresa para quebrar o cerco.",
        actions: [
          { type: "MODIFY_MILITARY", amount: 10 },
          { type: "MODIFY_FACTION", faction: "military", amount: 20 },
          { type: "ADD_GOLD", amount: -60 },
        ],
      },
      {
        id: "hold_until_winter",
        label: "Manter a defesa estrita nas torres e aguardar que a neve congele o inimigo",
        intentDescription: "Desgasta o oponente pelo tempo e pelo clima.",
        actions: [
          { type: "ADD_FOOD", amount: -80 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
    ],
  },
  {
    id: "khar_step3_khan_showdown",
    title: "A Tenda de Guerra do Grão-Cã",
    description:
      "O próprio Grão-Cã das Estepes de Khar envia emissários sob bandeira de trégua. Eles trazem um corcel negro e propõem um pacto de não agressão mediante tributo anual em armas, ou guerra total na próxima lua cheia.",
    characterId: "general_thorne",
    tags: ["cadeia", "guerra", "conclusao"],
    weight: 10,
    chain: {
      id: "chain_khar_war",
      step: 3,
      maxSteps: 3,
    },
    choices: [
      {
        id: "sign_steppe_tribute_peace",
        label: "Assinar o pacto de paz e selar a fronteira com comércio e ferro",
        intentDescription: "Garante a paz militar por anos.",
        actions: [
          { type: "MODIFY_RELATION", targetId: "khar", amount: 40 },
          { type: "ADD_GOLD", amount: -100 },
          { type: "MODIFY_STABILITY", amount: 15 },
        ],
      },
      {
        id: "refuse_khan_conquer_plains",
        label: "Rejeitar a paz. Ordenar marcha triunfal para subjugar as estepes",
        intentDescription: "Guerra ofensiva total para conquista perpétua.",
        actions: [
          { type: "START_WAR", kingdomId: "khar" },
          { type: "MODIFY_MILITARY", amount: 20 },
          { type: "ADD_GOLD", amount: -150 },
          { type: "MODIFY_FACTION", faction: "military", amount: 25 },
        ],
      },
    ],
  },

  // 19. Escadinha de Eventos: Conspiração na Corte (Passos 2 e 3)
  {
    id: "conspiracy_step2_dungeons_confession",
    title: "Confissão sob Ferros nas Masmorras",
    description:
      "Sob o interrogatório severo nas catacumbas, o copeiro confessou ter recebido ouro com o brasão de uma das maiores casas nobres para pôr cicuta na taça do soberano. Cartas comprometedoras foram apreendidas.",
    characterId: "captain_valeria",
    tags: ["cadeia", "conspiracao", "justica"],
    weight: 10,
    chain: {
      id: "chain_conspiracy",
      step: 2,
      maxSteps: 3,
      nextEventId: "conspiracy_step3_tribunal",
    },
    choices: [
      {
        id: "raid_noble_manor_evidence",
        label: "Invadir a mansão do nobre acusado e apreender todos os selos e bens",
        intentDescription: "Ação direta e rápida para garantir provas cabais.",
        actions: [
          { type: "ADD_GOLD", amount: 160 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -30 },
          { type: "MODIFY_STABILITY", amount: 10 },
        ],
      },
      {
        id: "keep_silent_trap_cabal",
        label: "Manter silêncio e montar uma armadilha para capturar toda a cabala",
        intentDescription: "Espionagem e paciência para expurgar a raiz da traição.",
        actions: [
          { type: "MODIFY_MILITARY", amount: 10 },
          { type: "MODIFY_STABILITY", amount: 5 },
          { type: "ADD_GOLD", amount: -50 },
        ],
      },
    ],
  },
  {
    id: "conspiracy_step2_whispers_in_shadow",
    title: "O Espião Noturno das Alcovas",
    description:
      "A nova guarda de veteranos capturou um mensageiro escalando as ameias secretas do palácio. Em sua bolsa havia a planta detalhada dos aposentos reais e um mapa de fuga selado com sinete da corte.",
    characterId: "spy_carrick",
    tags: ["cadeia", "conspiracao", "espionagem"],
    weight: 10,
    chain: {
      id: "chain_conspiracy",
      step: 2,
      maxSteps: 3,
      nextEventId: "conspiracy_step3_tribunal",
    },
    choices: [
      {
        id: "interrogate_mastermind_expose",
        label: "Interrogar o mensageiro e expor o nome do traidor no Grande Salão",
        intentDescription: "Humilhação e justiça pública contra o conspirador.",
        actions: [
          { type: "MODIFY_STABILITY", amount: 15 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -20 },
        ],
      },
      {
        id: "turn_spy_into_double_agent",
        label: "Chantagear o espião para alimentar os traidores com desinformação",
        intentDescription: "Intriga sofisticada para manipular os inimigos internos.",
        actions: [
          { type: "ADD_GOLD", amount: 80 },
          { type: "MODIFY_MILITARY", amount: 10 },
        ],
      },
    ],
  },
  {
    id: "conspiracy_step3_tribunal",
    title: "O Grande Tribunal por Alta Traição",
    description:
      "O líder da conspiração contra a vida do soberano foi conduzido a ferros diante do trono na presença de toda a nobreza e do clero. Cabe à coroa proferir a sentença final que marcará a autoridade da dinastia.",
    characterId: "chancellor_vane",
    tags: ["cadeia", "conspiracao", "conclusao"],
    weight: 10,
    chain: {
      id: "chain_conspiracy",
      step: 3,
      maxSteps: 3,
    },
    choices: [
      {
        id: "public_execution_and_confiscation",
        label: "Execução pública no cadafalso e confisco total dos feudos da família",
        intentDescription: "Punição máxima e implacável para incutir terror.",
        actions: [
          { type: "EXECUTE_OR_EXILE_CHARACTER", characterId: "chancellor_vane", actionType: "execute" },
          { type: "ADD_GOLD", amount: 220 },
          { type: "MODIFY_STABILITY", amount: 20 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -25 },
        ],
      },
      {
        id: "perpetual_exile_and_ransom",
        label: "Desterro perpétuo para além-mar mediante vultoso resgate em ouro",
        intentDescription: "Preserva a paz aristocrática e enriquece os cofres.",
        actions: [
          { type: "EXECUTE_OR_EXILE_CHARACTER", characterId: "chancellor_vane", actionType: "exile" },
          { type: "ADD_GOLD", amount: 300 },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: 10 },
        ],
      },
    ],
  },

  // 20. Escadinha de Eventos: A Peste na Cidade (Passos 2 e 3)
  {
    id: "plague_step2_quarantine_breach",
    title: "Fogo no Lazareto: O Rompimento do Cordão",
    description:
      "Desesperados e sem mantimentos, os moradores das zonas isoladas atearam fogo às barricadas e tentam furar o cerco para as praças limpas. A Boticária Miriam implora por fundos para destilar tinturas de ervas medicinais raras.",
    characterId: "boticaria_miriam",
    tags: ["cadeia", "peste", "saude"],
    weight: 10,
    chain: {
      id: "chain_plague",
      step: 2,
      maxSteps: 3,
      nextEventId: "plague_step3_reckoning",
    },
    choices: [
      {
        id: "fund_alchemical_apothecary",
        label: "Financiar a produção em massa das tinturas e distribuir aos doentes",
        intentDescription: "Investimento médico de ponta para salvar a população.",
        actions: [
          { type: "ADD_GOLD", amount: -120 },
          { type: "MODIFY_POPULATION", amount: 500 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 25 },
          { type: "MODIFY_STABILITY", amount: 10 },
        ],
      },
      {
        id: "contain_with_fire_and_iron",
        label: "Reforçar as barricadas com piqueiros armados e repelir os fugitivos",
        intentDescription: "Contenção estrita a qualquer custo humano.",
        actions: [
          { type: "MODIFY_POPULATION", amount: -1500 },
          { type: "MODIFY_MILITARY", amount: 10 },
          { type: "MODIFY_STABILITY", amount: -10 },
        ],
      },
    ],
  },
  {
    id: "plague_step2_holy_hysteria",
    title: "A Marcha dos Flagelantes e o Fogo Sacro",
    description:
      "As novenas e procissões aglomeraram os cidadãos e a praga acelerou. Monges extremistas liderados pelo Inquisidor Malakor tomaram as ruas culpando alquimistas e estrangeiros pela fúria celestial e exigem fogueiras de purificação.",
    characterId: "inquisitor_malakor",
    tags: ["cadeia", "peste", "religiao"],
    weight: 10,
    chain: {
      id: "chain_plague",
      step: 2,
      maxSteps: 3,
      nextEventId: "plague_step3_reckoning",
    },
    choices: [
      {
        id: "authorize_purifying_inquisition",
        label: "Entregar o governo sanitário aos inquisidores da Chama Sacra",
        intentDescription: "Satisfaz o fervor religioso intolerante.",
        actions: [
          { type: "MODIFY_FACTION", faction: "clergy", amount: 35 },
          { type: "MODIFY_POPULATION", amount: -1200 },
          { type: "MODIFY_STABILITY", amount: -15 },
        ],
      },
      {
        id: "disperse_flagellants_science",
        label: "Banir os flagelantes das ruas e ordenar limpeza pública dos canais",
        intentDescription: "Ordem cívica e higienismo contra o fanatismo.",
        actions: [
          { type: "MODIFY_FACTION", faction: "clergy", amount: -25 },
          { type: "MODIFY_STABILITY", amount: 15 },
          { type: "ADD_GOLD", amount: -60 },
        ],
      },
    ],
  },
  {
    id: "plague_step3_reckoning",
    title: "A Cura de Valoria ou o Renascimento das Cinzas",
    description:
      "A onda epidêmica começa a arrefecer, deixando lições cruciais para a dinastia. Mestre Morris apresenta o plano de restauração da capital e de proteção sanitária das futuras gerações.",
    characterId: "counselor_morris",
    tags: ["cadeia", "peste", "conclusao"],
    weight: 10,
    chain: {
      id: "chain_plague",
      step: 3,
      maxSteps: 3,
    },
    choices: [
      {
        id: "found_royal_infirmaries",
        label: "Fundar o Colégio de Médicos e Hospitais Reais em cada província",
        intentDescription: "Criação duradoura de infraestrutura de saúde.",
        actions: [
          { type: "ADD_GOLD", amount: -110 },
          { type: "MODIFY_STABILITY", amount: 20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 20 },
          { type: "ADD_LAW", law: "Hospitais da Coroa e Higiene Pública" },
        ],
      },
      {
        id: "consecrate_plague_monument",
        label: "Erguer um monumento de gratidão divina e doar terras aos conventos",
        intentDescription: "Memorial sagrado e consagração espiritual.",
        actions: [
          { type: "ADD_GOLD", amount: -70 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: 25 },
          { type: "MODIFY_STABILITY", amount: 10 },
        ],
      },
    ],
  },

  // 21. Audiências Privadas do Conselheiro Real (Mestre Morris)
  {
    id: "counselor_audience_state",
    title: "Audiência Privada: O Balanço do Reino",
    description:
      "Mestre Morris solicita uma audiência a portas fechadas no conselho privado. Com pergaminhos e registros oficiais, ele expõe as fraquezas da arrecadação, o estado de alerta das guarnições e o clamor das facções.",
    characterId: "counselor_morris",
    tags: ["conselho", "governo", "relatorio"],
    weight: 6,
    choices: [
      {
        id: "focus_treasury_growth",
        label: "Priorizar o acúmulo financeiro e auditoria rigorosa das contas",
        intentDescription: "Foca em riqueza e combate a desperdícios.",
        actions: [
          { type: "ADD_GOLD", amount: 90 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
      {
        id: "focus_popular_welfare",
        label: "Priorizar a tranquilidade popular e garantir celeiros fartos",
        intentDescription: "Foca em segurança alimentar e estabilidade social.",
        actions: [
          { type: "ADD_FOOD", amount: 100 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 15 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
      {
        id: "focus_military_might",
        label: "Priorizar a disciplina das legiões e vigilância das muralhas",
        intentDescription: "Foca na força bélica e prontidão defensiva.",
        actions: [
          { type: "MODIFY_MILITARY", amount: 15 },
          { type: "MODIFY_FACTION", faction: "military", amount: 15 },
          { type: "ADD_GOLD", amount: -50 },
        ],
      },
    ],
  },
  {
    id: "counselor_audience_crisis",
    title: "Conselho de Emergência: Riscos Iminentes",
    description:
      "Mestre Morris bate às portas da alcova régia: uma ou mais métricas do reino entraram em patamar alarmante. O conselheiro vos apresenta medidas duras e decisivas para salvar o reino do colapso antes que seja tarde.",
    characterId: "counselor_morris",
    tags: ["conselho", "crise", "emergencia"],
    weight: 8,
    requirements: [{ type: "MAX_STABILITY", value: 35 }],
    choices: [
      {
        id: "emergency_crown_reserve_release",
        label: "Despejar as últimas reservas da câmara secreta para estabilizar o reino",
        intentDescription: "Gasto de emergência salvador.",
        actions: [
          { type: "ADD_GOLD", amount: -100 },
          { type: "MODIFY_STABILITY", amount: 25 },
        ],
      },
      {
        id: "decree_crown_martial_law",
        label: "Proclamar lei marcial total e transferir poderes à coroa",
        intentDescription: "Ordem extrema pela força militar.",
        actions: [
          { type: "MODIFY_MILITARY", amount: 20 },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -20 },
        ],
      },
    ],
  },
  {
    id: "counselor_audience_strategy",
    title: "Conselho de Estado: O Futuro da Dinastia",
    description:
      "Com a corte apaziguada, Mestre Morris apresenta a carta magna da dinastia para os próximos anos. Trata-se de definir qual marca vosso nome deixará gravado na história dos séculos.",
    characterId: "counselor_morris",
    tags: ["conselho", "estrategia", "dinastia"],
    weight: 5,
    choices: [
      {
        id: "dynasty_of_justice",
        label: "Consagrar Valoria como reino da Lei Justa e dos Tribunais Livres",
        intentDescription: "Promulga leis garantistas e prestígio moral.",
        actions: [
          { type: "MODIFY_STABILITY", amount: 15 },
          { type: "ADD_LAW", law: "Código de Justiça Soberana" },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 15 },
        ],
      },
      {
        id: "dynasty_of_commerce",
        label: "Transformar Valoria na maior potência mercantil do continente",
        intentDescription: "Favorece guildas e rotas marítimas abertas.",
        actions: [
          { type: "ADD_GOLD", amount: 120 },
          { type: "MODIFY_FACTION", faction: "merchants", amount: 20 },
          { type: "ADD_LAW", law: "Livre Comércio Imperial" },
        ],
      },
    ],
  },
];

export function isEventEligible(event: GameEvent, state: KingdomState): boolean {
  if (event.isDelayedTriggerOnly) {
    return false; // só é disparado se agendado em delayedEvents
  }

  // Se o evento é um passo intermediário ou final de uma escadinha (step > 1),
  // só deve ser disparado via agendamento da cadeia, nunca aleatoriamente!
  if (event.chain && event.chain.step > 1) {
    return false;
  }

  // Se o personagem principal do evento foi executado ou está morto,
  // e o evento for uma petição direta do indivíduo (sem sucessor na cadeia), bloqueia
  if (event.characterId) {
    const isDead =
      state.characters[event.characterId]?.alive === false ||
      state.deceasedCharacters?.some((d) => d.id === event.characterId);

    if (isDead) {
      const char = state.characters[event.characterId];
      if (!char || char.alive === false) {
        // Se é um evento que menciona o nome próprio de um falecido e não tem cadeia ativa, bloqueia
        if (event.title.includes("Elenor") || event.title.includes("Thorne") || event.title.includes("Vane")) {
          return false;
        }
      }
    }
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
  const isCustomTheme =
    state.storylineId === "zombie_apocalypse" ||
    state.storylineId === "rio_zombie" ||
    state.storylineId === "colony_exodus";
  const allEvents = isCustomTheme && storyline.events.length > 0
    ? storyline.events
    : [...storyline.events, ...GAME_EVENTS.filter((e) => !storyline.events.some((se) => se.id === e.id))];

  // 1. Checa se há um evento dinâmico criado pela IA no turno anterior aguardando execução
  if (state.pendingDynamicEvent) {
    const dynamicEvt = state.pendingDynamicEvent;
    state.pendingDynamicEvent = null;
    return dynamicEvt;
  }

  // 2. Checa se há uma cadeia narrativa ativa ("escadinha de eventos") com próximo passo agendado
  if (state.activeChains) {
    for (const [chainId, chainProgress] of Object.entries(state.activeChains)) {
      const nextId = (chainProgress as any).nextEventId;
      if (nextId) {
        // Limpa o próximo agendado após resgatar para prosseguir a escadinha
        (chainProgress as any).nextEventId = undefined;
        const chainEvent = allEvents.find((e) => e.id === nextId);
        if (chainEvent) {
          return chainEvent;
        }
      }
    }
  }

  // 3. Checa se há delayed event agendado para o turno atual
  const dueIndex = state.delayedEvents.findIndex((d) => d.triggerAtTurn <= state.turn);
  if (dueIndex !== -1) {
    const delayed = state.delayedEvents[dueIndex];
    state.delayedEvents.splice(dueIndex, 1);
    const foundEvent = allEvents.find((e) => e.id === delayed.eventId);
    if (foundEvent) {
      return foundEvent;
    }
  }

  // 4. Audiência de Conselho Privado (apenas para cenários medievais clássicos) a cada 5 turnos
  if (!isCustomTheme && state.turn > 1 && state.turn % 5 === 0) {
    const counselorAudience = allEvents.find((e) => e.id === "counselor_audience_state");
    if (counselorAudience) {
      return counselorAudience;
    }
  }

  // 5. Filtra eventos elegíveis que não foram os últimos 3 apresentados
  const recentEventTitles = state.history.slice(-3).map((h) => h.eventTitle);
  const eligible = allEvents.filter(
    (e) => isEventEligible(e, state) && !recentEventTitles.includes(e.title)
  );

  const pool = eligible.length > 0 ? eligible : allEvents.filter((e) => !e.isDelayedTriggerOnly && (!e.chain || e.chain.step === 1));
  const selected = prng.pickWeighted(pool);

  return selected || allEvents[0];
}
