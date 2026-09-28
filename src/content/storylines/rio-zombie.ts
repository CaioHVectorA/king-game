import { StorylineDefinition } from "./types";
import { GameEvent } from "@/types/game";

// ─── EVENTOS EXCLUSIVOS: ZONA MORTA — RIO DOS CONDENADOS ─────────────────────

const rioZombieEvents: GameEvent[] = [
  {
    id: "rz_tunel_infestado",
    title: "O Enxame no Túnel Novo",
    description:
      "Capitão Brás chega com a respiração ofegante e fuligem na farda. 'Comandante, um caminhão de refugiados bateu dentro do Túnel Novo e explodiu. O barulho atraiu uma colônia inteira de Estaladores. Os infectados estão a quinhentos metros da nossa barricada na Praia de Botafogo. Se usarmos dinamite para selar a galeria, perderemos o acesso terrestre à Zona Sul para sempre.'",
    characterId: "capitao_bras",
    tags: ["militar", "defesa", "crise", "zumbi"],
    weight: 25,
    choices: [
      {
        id: "detonar_tunel",
        label: "Detonar as cargas e desabar o teto do túnel sobre a horda",
        intentDescription: "Elimina a ameaça imediata, mas isola o reduto de qualquer rota terrestre.",
        actions: [
          { type: "ADD_GOLD", amount: -40, reason: "Explosivos e pólvora consumidos" },
          { type: "MODIFY_STABILITY", amount: 15, reason: "Perímetro da praia garantido" },
          { type: "MODIFY_FACTION", faction: "military", amount: 20 },
          { type: "MODIFY_FACTION", faction: "merchants", amount: -25, reason: "Rotas comerciais cortadas" },
        ],
      },
      {
        id: "linha_de_fogo",
        label: "Montar linha de fuzis na entrada e combater a horda em campo aberto",
        intentDescription: "Preserva a rota, mas consome enorme munição e arrisca a vida dos soldados.",
        actions: [
          { type: "ADD_GOLD", amount: -90, reason: "Gasto maciço de munição 7.62" },
          { type: "MODIFY_MILITARY", amount: -15, reason: "Sentinelas feridos ou infectados" },
          { type: "MODIFY_POPULATION", amount: -40 },
          { type: "MODIFY_FACTION", faction: "military", amount: -10 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 15, reason: "Coragem demonstrada em defesa do povo" },
        ],
      },
    ],
  },
  {
    id: "rz_amostra_estalador",
    title: "Amostra Viva de Estalador Alfa",
    description:
      "Tainá da Tijuca arrasta uma carcaça ainda convulsionando, presa por cabos de aço e correntes marítimas. É um infectado mutante com placas fúngicas blindando o crânio. O Dr. Camargo treme de excitação com luvas nas mãos: 'Comandante! Esse exemplar de estágio 3 ainda respira. Se me permitir levá-lo ao laboratório do forte, posso sintetizar anticorpos para o esporo!' Mas Capitão Brás aponta o fuzil para a cabeça do monstro: 'Isso é uma bomba biológica dentro das nossas muralhas. Uma mordida e a Urca inteira cai!'",
    characterId: "dr_camargo",
    tags: ["ciência", "cura", "conflito_interno"],
    weight: 20,
    choices: [
      {
        id: "autorizar_pesquisa",
        label: "Permitir a dissecação sob vigilância militar máxima no laboratório",
        intentDescription: "Avanço promissor para a cura contra o fungo, mas gera pânico entre civis.",
        actions: [
          { type: "MODIFY_FACTION", faction: "clergy", amount: 30, reason: "Cientistas da Fiocruz apoiados" },
          { type: "MODIFY_FACTION", faction: "military", amount: -20, reason: "Sentinelas revoltados com o risco" },
          { type: "MODIFY_STABILITY", amount: -10, reason: "Medo de vazamento biológico" },
        ],
      },
      {
        id: "executar_amostra",
        label: "Ordenar que Brás fuzile a aberração na praia e queime com querosene",
        intentDescription: "Elimina qualquer risco sanitário, mas destrói esperanças médicas de vacina.",
        actions: [
          { type: "MODIFY_FACTION", faction: "military", amount: 15 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: -25 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
    ],
  },
  {
    id: "rz_ultimato_milicia",
    title: "O Ultimato da Linha Vermelha",
    description:
      "Um rádio sintonizado chia com a voz rouca do Major Carcará, chefe dos blindados da Linha Vermelha: 'Atenção, almofadinhas da Urca. Sabemos que suas redes puxaram peixe gordo essa semana. Queremos trezentos cartuchos de fuzil e vinte caixas de pescado entregues na Ponte até o pôr do sol. Se recusarem, nossos morteiros artesanais vão transformar suas traineiras em lenha e atrair todos os bichos da baía para o seu portão.'",
    characterId: "ze_do_porto",
    tags: ["diplomacia", "guerra", "chantagem"],
    weight: 18,
    choices: [
      {
        id: "pagar_tributo",
        label: "Ceder ao tributo e enviar peixes e cartuchos para evitar o bombardeio",
        intentDescription: "Evita o ataque imediato, mas fortalece a milícia e humilha seus homens.",
        actions: [
          { type: "ADD_GOLD", amount: -60 },
          { type: "ADD_FOOD", amount: -80 },
          { type: "MODIFY_STABILITY", amount: -15 },
          { type: "MODIFY_FACTION", faction: "military", amount: -20 },
        ],
      },
      {
        id: "emboscada_maritima",
        label: "Armar os barcos de Zé do Porto com franco-atiradores e emboscar os milicianos",
        intentDescription: "Golpe tático de surpresa na orla de São Cristóvão.",
        actions: [
          { type: "ADD_GOLD", amount: -30 },
          { type: "MODIFY_MILITARY", amount: -10 },
          { type: "MODIFY_STABILITY", amount: 15 },
          { type: "MODIFY_FACTION", faction: "military", amount: 20 },
          { type: "MODIFY_FACTION", faction: "merchants", amount: 15 },
        ],
      },
      {
        id: "declarar_guerra_aberta",
        label: "Rejeitar a ameaça pelo rádio e declarar guerra aberta contra a Milícia",
        intentDescription: "Mobilização total das defesas da Urca.",
        actions: [
          { type: "START_WAR", kingdomId: "milicia_linha_vermelha" },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "MODIFY_FACTION", faction: "military", amount: 25 },
        ],
      },
    ],
  },
  {
    id: "rz_chuva_de_esporos",
    title: "Nuvens de Esporos do Corcovado",
    description:
      "Tainá da Tijuca desce correndo da trilha com a máscara de gás pingando seiva amarela: 'Vento forte do noroeste! A colônia de fungos nos penhascos da Floresta da Tijuca estourou em florada. Uma névoa espessa de esporos amarelos está descendo sobre Botafogo e a enseada. Quem respirar sem filtro vira Corredor em seis horas. Só temos máscaras suficientes para os soldados e metade dos civis.'",
    characterId: "taina_tracker",
    tags: ["natureza", "esporos", "dilema_moral"],
    weight: 22,
    choices: [
      {
        id: "priorizar_trabalhadores",
        label: "Distribuir filtros para sentinelas e operários vitais; trancar os demais nos abrigos subterrâneos",
        intentDescription: "Garante a sobrevivência da infraestrutura com sacrifício de isolamento severo.",
        actions: [
          { type: "ADD_GOLD", amount: -50, reason: "Filtros industriais gastos" },
          { type: "MODIFY_POPULATION", amount: -25, reason: "Infiltração de esporos em barracos mal vedados" },
          { type: "MODIFY_STABILITY", amount: -15 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -20 },
        ],
      },
      {
        id: "evacuar_para_o_mar",
        label: "Embarcar o máximo de famílias nas traineiras e ancorar longe da névoa na baía",
        intentDescription: "Usa o mar como refúgio natural contra os esporos terrestres.",
        actions: [
          { type: "ADD_FOOD", amount: -50 },
          { type: "MODIFY_STABILITY", amount: 12 },
          { type: "MODIFY_FACTION", faction: "merchants", amount: 20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 15 },
        ],
      },
    ],
  },
  {
    id: "rz_traineira_a_deriva",
    title: "A Traineira Fantasma de Niterói",
    description:
      "Zé do Porto aponta a luneta para uma traineira de pesca à deriva perto da Fortaleza de Santa Cruz. 'Comandante, aquele barco zarpou da Baía de Guanabara sem motor, só na maré. Vemos pessoas desmaiadas no convés — parecem mulheres e crianças com desnutrição severa. Mas há marcas de sangue nas amuradas. Pode haver infectados trancados no porão de gelo ou portadores assintomáticos.'",
    characterId: "ze_do_porto",
    tags: ["mar", "resgate", "risco_viral"],
    weight: 16,
    choices: [
      {
        id: "resgate_com_quarentena",
        label: "Rebocar a traineira para a Ilha de Cotunduba e impor 14 dias de quarentena rígida",
        intentDescription: "Salva vidas humanas sem arriscar a segurança do reduto principal.",
        actions: [
          { type: "ADD_FOOD", amount: -40, reason: "Rações de socorro aos náufragos" },
          { type: "MODIFY_POPULATION", amount: 65, reason: "Novos braços integrados à colônia" },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 15 },
        ],
      },
      {
        id: "afundar_embarcacao",
        label: "Negar aproximação e disparar contra o casco para afundar o barco na barra",
        intentDescription: "Pragmatismo implacável para blindar a colônia contra qualquer contágio.",
        actions: [
          { type: "MODIFY_STABILITY", amount: -20, reason: "Horror entre os civis ao verem o afundamento" },
          { type: "MODIFY_FACTION", faction: "military", amount: 10 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: -20 },
        ],
      },
    ],
  },
  {
    id: "rz_culto_cristo",
    title: "Os Fanáticos do Cristo Redentor",
    description:
      "Padre Bento surge no portão externo com pés descalços envoltos em trapos e seguidores de tochas acesas. 'Governador da carne! Os Estaladores não são demônios, são os Anjos da Peste enviados para varrer a vaidade humana! Exigimos que cessem a caça aos infectados e nos entreguem os doentes do isolamento para que subam a montanha sagrada até o Cristo. Se recusarem, os céus farão os mortos uivarem em suas portas!'",
    characterId: "padre_bento",
    tags: ["fanatismo", "religião", "crise_social"],
    weight: 15,
    choices: [
      {
        id: "reprimir_culto",
        label: "Prender Padre Bento e dispersar os fanáticos com canhões d'água e bastões",
        intentDescription: "Impõe a razão e o laicismo na colônia com uso firme da força.",
        actions: [
          { type: "MODIFY_FACTION", faction: "clergy", amount: -30 },
          { type: "MODIFY_FACTION", faction: "military", amount: 15 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
      {
        id: "negociar_tregua",
        label: "Oferecer remédios para a comunidade do Corcovado em troca de manterem a trilha segura",
        intentDescription: "Mantém os fanáticos pacificados e assegura batedores na montanha.",
        actions: [
          { type: "ADD_FOOD", amount: -30 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: 20 },
          { type: "MODIFY_STABILITY", amount: -5 },
        ],
      },
    ],
  },
  {
    id: "rz_cepa_alfa_jardim_botanico",
    title: "A Cepa Alfa no Jardim Botânico",
    description:
      "Dr. Camargo desdobra um mapa aéreo de satélite antigo da Zona Sul: 'Comandante, encontramos os registros do primeiro paciente infectado em 2016. A matriz do esporo mutante nasceu na estufa de fungos raros do Jardim Botânico. Se organizarmos uma expedição blindada até lá, poderemos recolher o espécime original da Cepa Alfa. Isso daria à Urca o monopólio da cura em toda a América do Sul.'",
    characterId: "dr_camargo",
    tags: ["expedicao", "cura", "epico"],
    weight: 14,
    choices: [
      {
        id: "lancar_grande_expedicao",
        label: "Enviar 2 caminhões blindados e 6 batedores de Tainá até o Jardim Botânico",
        intentDescription: "Missão perigosa nas profundezas infestadas da Zona Sul.",
        actions: [
          {
            type: "START_SITUATION",
            title: "Expedição da Cepa Alfa — Jardim Botânico",
            situationType: "expedicao",
            durationTurns: 3,
            description: "Comboio blindado com batedores e virologistas cruzando as ruínas de Botafogo até as estufas.",
            personnel: "Dr. Camargo & Tainá da Tijuca",
          },
          { type: "ADD_GOLD", amount: -80 },
          { type: "MODIFY_MILITARY", amount: -10 },
          { type: "MODIFY_STABILITY", amount: 15 },
        ],
      },
      {
        id: "abortar_risco_excessivo",
        label: "Recusar a expedição — o Jardim Botânico é um cemitério verde de estaladores",
        intentDescription: "Preserva homens e munição para a defesa dos muros.",
        actions: [
          { type: "MODIFY_STABILITY", amount: -10 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: -15 },
        ],
      },
    ],
  },
  {
    id: "rz_sabotagem_dessalinizador",
    title: "Sabotagem nas Bombas de Água",
    description:
      "Alarme de emergência ecoa na praia. O sistema de dessalinização improvisado que puxa água limpa das nascentes do Pão de Açúcar foi sabotado com ácido sulfúrico. A colônia tem apenas dois dias de água potável nos reservatórios. Rastros na areia indicam que os sabotadores receberam cartuchos da Linha Vermelha para secar a Urca por dentro.",
    characterId: "capitao_bras",
    tags: ["sabotagem", "recursos", "crise_mortal"],
    weight: 20,
    choices: [
      {
        id: "racionamento_marcial",
        label: "Decretar toque de recolher total e mobilizar todas as equipes para reparar as bombas",
        intentDescription: "Restaura o sistema com esforço contínuo dos trabalhadores.",
        actions: [
          { type: "ADD_GOLD", amount: -50, reason: "Peças de cobre e filtros gastos" },
          { type: "ADD_FOOD", amount: -30 },
          { type: "MODIFY_STABILITY", amount: -15 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -10 },
        ],
      },
      {
        id: "comprar_agua_paqueta",
        label: "Enviar barcos de Zé do Porto para comprar cisternas de Paquetá às pressas",
        intentDescription: "Resolve a sede com ouro/munição, mas torna a colônia dependente de terceiros.",
        actions: [
          { type: "ADD_GOLD", amount: -120 },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "MODIFY_FACTION", faction: "merchants", amount: 25 },
        ],
      },
    ],
  },
  {
    id: "rz_julgamento_desertor",
    title: "O Sentinela Adormecido",
    description:
      "Capitão Brás traz um jovem de joelhos amarrado com arame farpado. É Lucas, vigia do Posto Três da Praia Vermelha. 'Ele dormiu durante o plantão da madrugada. Dois Corredores escalaram os rochedos e invadiram o dormitório B. Uma mulher e uma criança foram mordidas antes de abatermos as criaturas. O protocolo militar exige fuzilamento público por traição e negligência.' A mãe do rapaz suplica chorando aos seus pés.",
    characterId: "capitao_bras",
    tags: ["justica", "moral", "disciplina"],
    weight: 16,
    choices: [
      {
        id: "fuzilar_desertor",
        label: "Confirmar a pena de fuzilamento para manter a disciplina férrea da sentinela",
        intentDescription: "Demonstra rigor inflexível perante a guarda armada.",
        actions: [
          { type: "MODIFY_MILITARY", amount: 15 },
          { type: "MODIFY_STABILITY", amount: 5 },
          { type: "MODIFY_FACTION", faction: "military", amount: 20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -25 },
        ],
      },
      {
        id: "desterro_para_mar",
        label: "Comutar a pena para exílio em jangada sem remos na Baía",
        intentDescription: "Evita o derramamento de sangue interno, mas deixa o destino nas mãos da maré.",
        actions: [
          { type: "MODIFY_STABILITY", amount: -5 },
          { type: "MODIFY_FACTION", faction: "military", amount: -10 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 10 },
        ],
      },
      {
        id: "perdao_com_trabalho_forcado",
        label: "Perdoar a vida e condená-lo a limpar os fossos de esporos na linha de frente",
        intentDescription: "Punição útil e arriscada que preserva a vida do jovem.",
        actions: [
          { type: "MODIFY_STABILITY", amount: -10 },
          { type: "MODIFY_FACTION", faction: "military", amount: -20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 25 },
        ],
      },
    ],
  },
  {
    id: "rz_porta_avioes_costa",
    title: "O SOS do Porta-Aviões na Barra",
    description:
      "Os operadores de rádio captam um sinal em código Morse emitido em loop contínuo vindo de alto-mar: 'AQUI É O NAVIO-AERÓDROMO MINAS GERAIS MODIFICADO. CINQUENTA SOBREVIVENTES ISOLADOS. TEMOS COMBUSTÍVEL DIESEL PURO, GERADORES DE FUSÃO E MEDICAMENTOS DE UTI. PRECISAMOS DE ÁGUA E SUPRIMENTOS FRESCOS. FREQUÊNCIA 142.8.' Zé do Porto alerta: 'A traineira aguenta o mar grosso da barra até lá. Mas pode ser uma armadilha de piratas da baía.'",
    characterId: "ze_do_porto",
    tags: ["radio", "mar", "tecnologia"],
    weight: 13,
    choices: [
      {
        id: "expedicao_naval_navio",
        label: "Despachar a traineira armada de Zé do Porto para fazer contato e negociar combustível",
        intentDescription: "Acesso a combustível diesel e geradores hospitalares cruciais.",
        actions: [
          {
            type: "START_SITUATION",
            title: "Contato com o Porta-Aviões",
            situationType: "expedicao",
            durationTurns: 2,
            description: "Traineira armada rumando à costa externa da Baía em busca de combustível e médicos.",
            personnel: "Zé do Porto & Sentinelas Navais",
          },
          { type: "ADD_FOOD", amount: -40 },
          { type: "MODIFY_STABILITY", amount: 10 },
        ],
      },
      {
        id: "ignorar_sinal",
        label: "Manter silêncio de rádio — não podemos arriscar nossos barcos em mar aberto",
        intentDescription: "Prioriza a segurança das embarcações de pesca costeira.",
        actions: [
          { type: "MODIFY_STABILITY", amount: -5 },
        ],
      },
    ],
  },
];

export const rioZombieStoryline: StorylineDefinition = {
  id: "rio_zombie",
  name: "Zona Morta — Rio dos Condenados",
  subtitle: "Sobrevivência Pós-Viral nas Sombras da Guanabara (Estilo TLOU / TWD)",
  description:
    "Dez anos após a mutação do Fungo Cordyceps-X dizimar a costa brasileira, o Rio de Janeiro é uma selva de concreto em ruínas dominada por hordas de Estaladores e milícias sanguinárias. Você lidera o Reduto da Urca e do Pão de Açúcar com 4.500 sobreviventes, defendendo os portões na Praia Vermelha entre o mar e a montanha. Cada cartucho é contado; cada dia é uma guerra pela vida.",
  era: "Ano 10 Pós-Colapso (Era dos Estaladores & Favelas Fortificadas)",
  difficulty: "Brutal",
  tags: ["Zumbi Clássico", "TLOU", "TWD", "Rio de Janeiro", "Sobrevivência", "Pós-Apocalíptico"],
  bannerEmoji: "🧟‍♂️",

  resourceLabels: {
    gold: {
      name: "Munição & Sucata",
      icon: "🪙",
      description: "Cartuchos de fuzil e peças metálicas reaproveitáveis que servem de moeda no Rio.",
      unit: "cartuchos",
    },
    food: {
      name: "Peixes & Ração Seca",
      icon: "🐟",
      description: "Pescados diários da Baía de Guanabara e conservas racionadas no refeitório.",
      unit: "rações",
    },
    population: {
      name: "Vidas Não-Infectadas",
      icon: "👥",
      description: "Sobreviventes livres de esporos e mordidas protegidos pelos rochedos da Urca.",
      unit: "almas",
    },
    stability: {
      name: "Sanidade & Esperança",
      icon: "🧠",
      description: "Resistência psicológica ao horror dos estaladores e à claustrofobia da quarentena.",
      unit: "%",
    },
    military: {
      name: "Sentinelas & Fuzis",
      icon: "🛡️",
      description: "Atiradores nos postos altos do Pão de Açúcar e batedores com armas de fogo.",
      unit: "%",
    },
  },

  worldLorePrompt: `
Universo: Rio de Janeiro pós-apocalíptico no Ano 10 Pós-Colapso (Estilo The Last of Us e The Walking Dead).
Cenário: O Reduto da Urca é uma cidadela encravada entre o Pão de Açúcar, o Morro da Babilônia e a Praia Vermelha. 4.500 sobreviventes protegidos por muralhas de containers enferrujados, arame farpado e o mar da Guanabara.
Infectados: Mutantes por esporos fúngicos divididos em estágios: Corredores (rápidos e raivosos), Estaladores (cegos, guiam-se por ecolocalização, mordida letal instantânea) e Baiacus/Alfas (monstros blindados com fungo denso que arremessam sacos de esporos).
Cultura e Sobrevivência: Racionamento brutal de peixe e água das nascentes. A munição 7.62 e 9mm substitui o dinheiro. Máscaras de gás e filtros são tesouros inestimáveis contra os ninhos de esporos da Floresta da Tijuca.
Ameaças Externas:
1. A Milícia da Linha Vermelha: Senhores da guerra com caminhões blindados e armamento pesado que cobram pedágio e escravizam comunidades.
2. A Comunidade de Paquetá: Pescadores livres da ilha que mantêm o único entreposto neutro de trocas pacíficas.
3. O Culto dos Filhos da Espora: Fanáticos do Corcovado que adoram a mutação como providência divina.
4. O Forte de Copacabana: Guarnição militar ultra-reclusa com artilharia pesada que não aceita refugiados.
Estilo Narrativo: Crudíssimo, seco, atmosférico, dramático, cinematográfico. Linguagem direta de sobreviventes cariocas endurecidos pela morte diária. NUNCA use termos medievais como "majestade", "vossa graça", "nobres", "escribas", "arautos". Trate a liderança por "Comandante", "Líder" ou pelo nome.
`,

  initialState: {
    year: 10,
    month: 5,
    gold: 280,         // Cartuchos e sucata
    food: 420,         // Rações e peixes
    population: 4500,  // Sobreviventes na Urca
    stability: 60,     // Sanidade e esperança
    military: 65,      // Força de sentinelas
    factions: {
      nobles: 15,      // Conselho Técnico da Urca (médicos, veteranos da Marinha)
      merchants: 20,   // Contrabandistas e barqueiros da baía
      clergy: 10,      // Pesquisadores da Fiocruz
      peasants: 0,     // Pescadores e trabalhadores dos galpões
      military: 35,    // Sentinelas dos portões e batedores
    },
    relations: {
      milicia_linha_vermelha: -75,
      comunidade_paqueta: 35,
      culto_estaladores_tijuca: -40,
      guarnicao_forte_copacabana: 10,
    },
    laws: [
      "Quarentena compulsória de 14 dias para recém-chegados",
      "Proibição absoluta de disparos não-autorizados na baía",
      "Racionamento de 2 litros de água e 400g de peixe por adulto",
    ],
    flags: {
      zombieClassic: true,
      hasNavalAccess: true,
      sporeThreatHigh: true,
    },
    activeWars: [],
  },

  characters: {
    capitao_bras: {
      id: "capitao_bras",
      name: "Capitão Brás",
      role: "Chefe de Segurança e Defesa",
      title: "Comandante da Barricada da Urca",
      loyalty: 75,
      influence: 80,
      alive: true,
      faction: "military",
      traits: ["Brutal", "Pragmático", "Leal"],
      avatar: "🪖",
      appearance:
        "Ex-oficial de operações especiais de meia-idade com cicatriz de queimadura no pescoço e colete balístico riscado por marcas de garras. Empunha um fuzil FAL 7.62 gasto e fita o líder com a frieza de quem já executou infectados sem vacilar.",
    },
    dr_camargo: {
      id: "dr_camargo",
      name: "Dr. Marcelo Camargo",
      role: "Diretor Científico e Médico",
      title: "Virologista Veterano da Fiocruz",
      loyalty: 65,
      influence: 70,
      alive: true,
      faction: "clergy",
      traits: ["Obsessivo", "Brilhante", "Exausto"],
      avatar: "🔬",
      appearance:
        "Médico veterano de cabelos brancos desgrenhados e jaleco escurecido por reagentes sobre roupas táticas. Carrega um microscópio de campo protegido em caixa metálica e fala com o fervor científico de quem busca a cura há dez anos.",
    },
    taina_tracker: {
      id: "taina_tracker",
      name: "Tainá da Tijuca",
      role: "Líder dos Batedores da Mata",
      title: "Rastreadora Silenciosa do Maciço",
      loyalty: 80,
      influence: 55,
      alive: true,
      faction: "peasants",
      traits: ["Silenciosa", "Letal", "Protetora"],
      avatar: "🏹",
      appearance:
        "Jovem esguia de pele morena vestindo capa de camuflagem artesanal de folhagens e máscara de gás pendurada ao peito. Traz arco composto no ombro, facão de caça e ferimentos de espinhos nas mãos, conhecendo cada trilha do Corcovado.",
    },
    ze_do_porto: {
      id: "ze_do_porto",
      name: "Zé do Porto",
      role: "Comandante da Flotilha e Logística",
      title: "Mestre dos Pescadores da Guanabara",
      loyalty: 60,
      influence: 65,
      alive: true,
      faction: "merchants",
      traits: ["Astuto", "Comerciante", "Veterano"],
      avatar: "⚓",
      appearance:
        "Barqueiro grisalho de pele curtida pelo sol e salitre com dente de ouro gasto. Fuma palha com calma calculista, traz bússola de latão no peito e comanda as únicas traineiras que navegam sem encalhar nos cascos submersos da baía.",
    },
    padre_bento: {
      id: "padre_bento",
      name: "Padre Bento",
      role: "Patriarca Religioso do Corcovado",
      title: "Voz dos Eremitas do Redentor",
      loyalty: 40,
      influence: 50,
      alive: true,
      faction: "clergy",
      traits: ["Fanático", "Carismático", "Perigoso"],
      avatar: "✝️",
      appearance:
        "Homem esguio vestindo batina puída amarrada por corda de cânhamo, com pés descalços calejados pelas pedras do morro. Segura um crucifixo de ferro batido e prega com olhos febris que os infectados são instrumentos divinos.",
    },
  },

  realms: {
    milicia_linha_vermelha: {
      id: "milicia_linha_vermelha",
      name: "Milícia da Linha Vermelha",
      population: 3200,
      military: 85,
      wealth: 60,
      relation: -75,
      flags: { hostile: true, warlords: true },
    },
    comunidade_paqueta: {
      id: "comunidade_paqueta",
      name: "Pescadores Livres de Paquetá",
      population: 1800,
      military: 30,
      wealth: 50,
      relation: 35,
      flags: { neutral: true, trading_post: true },
    },
    culto_estaladores_tijuca: {
      id: "culto_estaladores_tijuca",
      name: "Filhos da Espora do Corcovado",
      population: 900,
      military: 45,
      wealth: 15,
      relation: -40,
      flags: { fanatical: true },
    },
    guarnicao_forte_copacabana: {
      id: "guarnicao_forte_copacabana",
      name: "Guarnição do Forte de Copacabana",
      population: 1200,
      military: 90,
      wealth: 70,
      relation: 10,
      flags: { heavy_artillery: true, isolated: true },
    },
  },

  events: [...rioZombieEvents],
};
