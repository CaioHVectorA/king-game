import { PRNG } from "./rng";
import { ExternalEntity, getEntitiesForStoryline } from "./realms";

export type MapTerritory = {
  id: string;
  name: string;
  type: "capital" | "plains" | "mountains" | "water" | "badlands" | "fortress";
  polygon: Array<[number, number]>;
  center: [number, number];
  owner: string;
  status?: string;
  importance: "alta" | "media" | "estrategica";
  description: string;
  // novos campos de gameplay
  resources?: string[];
  population?: number;
  garrisonLevel?: number; // 0-100
  taxRate?: number; // 0-100
  strategic?: string; // texto de importância estratégica
};

export type ExternalEntityMapNode = {
  entityId: string;
  name: string;
  center: [number, number];
  atWar: boolean;
  relation: number;
  type: ExternalEntity["type"];
  color: string;
  leader?: string;
  distance?: ExternalEntity["distance"];
};

export type DiplomaticLine = {
  fromCenter: [number, number];
  toCenter: [number, number];
  relation: number; // -100 to 100
  atWar: boolean;
  type: ExternalEntity["type"];
};

export type MapRoute = {
  fromId: string;
  toId: string;
  points: Array<[number, number]>;
  type: "estrada" | "rio" | "passagem";
};

export type KingdomMapData = {
  seed: number;
  storylineId: string;
  width: number;
  height: number;
  territories: MapTerritory[];
  routes: MapRoute[];
  landmarks: Array<{
    name: string;
    coord: [number, number];
    icon: string;
  }>;
  externalNodes: ExternalEntityMapNode[];
  diplomaticLines: DiplomaticLine[];
};

// Configurações regionais por Lore
const LORE_REGIONS: Record<
  string,
  Array<{
    name: string;
    type: MapTerritory["type"];
    owner: string;
    desc: string;
    resources?: string[];
    strategic?: string;
  }>
> = {
  khar_invasion: [
    {
      name: "Cidadela de Aço (QG)",
      type: "capital",
      owner: "Coroa",
      desc: "Último bastião fortificado da dinastia.",
      resources: ["ferro", "ouro", "provisões militares"],
      strategic: "Queda aqui = fim do jogo",
    },
    {
      name: "Desfiladeiro do Trovão",
      type: "fortress",
      owner: "Legiões",
      desc: "Portão de entrada murado nas gargantas rochosas.",
      resources: ["pedra", "catapultas"],
      strategic: "Única passagem praticável para a capital",
    },
    {
      name: "Terras Queimadas",
      type: "badlands",
      owner: "Disputado",
      desc: "Lavouras incendiadas pela tática de terra arrasada.",
      resources: [],
      strategic: "Zona tampão — dificulta avanço inimigo",
    },
    {
      name: "Campinas de Ferro",
      type: "plains",
      owner: "Camponeses",
      desc: "Pastos devastados e caravanas em fuga.",
      resources: ["alimentos", "gado"],
      strategic: "Celeiro alimentar — crítico para o exército",
    },
    {
      name: "Montes Cinzentos",
      type: "mountains",
      owner: "Eldoria",
      desc: "Cumes nevados onde batedores observam o cerco.",
      resources: ["minério", "ferro"],
      strategic: "Posição alta de observação e defesa lateral",
    },
    {
      name: "Estepes de Khar",
      type: "badlands",
      owner: "Horda de Khar",
      desc: "Mar de tendas nômades e cavalaria pesada.",
      resources: ["cavalos de guerra"],
      strategic: "Base de operações do invasor",
    },
    {
      name: "Oeste dos Refugiados",
      type: "plains",
      owner: "Povo",
      desc: "Acampamentos improvisados com milhares de famílias.",
      resources: ["mão de obra"],
      strategic: "Estabilidade política — revolta possível",
    },
    {
      name: "Forte do Rio Sangrento",
      type: "fortress",
      owner: "Guarda",
      desc: "Ponte fortificada com paliçadas de troncos afiados.",
      resources: ["provisões", "água"],
      strategic: "Controla o abastecimento do norte ao sul",
    },
  ],
  dark_plague: [
    {
      name: "Sé da Chama Sagrada",
      type: "capital",
      owner: "Alto Clero",
      desc: "Catedrais de mármore isoladas com incenso purificador.",
      resources: ["relíquias", "ouro sacro"],
      strategic: "Centro de autoridade — legitimidade do regente",
    },
    {
      name: "Porto das Pústulas",
      type: "water",
      owner: "Disputado",
      desc: "Docas lacradas com galeões ancorados e marujos mortos.",
      resources: ["comércio marítimo", "peixes"],
      strategic: "Vetorial de contágio — fechar aqui corta a epidemia",
    },
    {
      name: "O Lazareto das Ilhas",
      type: "fortress",
      owner: "Boticários",
      desc: "Ilhote isolado onde os enfermos são confinados.",
      resources: ["remédios", "conhecimento médico"],
      strategic: "Único local seguro de estudo da praga",
    },
    {
      name: "Distrito dos Ferreiros",
      type: "plains",
      owner: "Guildas",
      desc: "Oficinas desertas onde o fogo dos fornos apagou.",
      resources: ["ferramentas", "armas"],
      strategic: "Economia artesanal — produção de guerra parada",
    },
    {
      name: "Criptas de Pedra Negra",
      type: "mountains",
      owner: "Coveiros",
      desc: "Valas coletivas cavadas às pressas nas colinas.",
      resources: [],
      strategic: "Alto risco de disseminação — vento carrega os miasmas",
    },
    {
      name: "Cidade Baixa Murada",
      type: "badlands",
      owner: "Camponeses",
      desc: "Vielas sombrias sob quarentena forçada pela guarda.",
      resources: ["mão de obra"],
      strategic: "Alta densidade — epicentro de possíveis revoltas",
    },
    {
      name: "Portão dos Juramentos",
      type: "fortress",
      owner: "Inquisição",
      desc: "Barricadas com tochas permanentes inspecionando viandantes.",
      resources: ["controle de fluxo"],
      strategic: "Corredores de controle — poder real de quarentena",
    },
    {
      name: "Colinas dos Imunes",
      type: "plains",
      owner: "Nobreza",
      desc: "Mansões campestres onde aristocratas fingem que a peste não existe.",
      resources: ["ouro", "influência"],
      strategic: "Elite protegida — aliança ou traição iminente",
    },
  ],
  colony_exodus: [
    {
      name: "Ponte de Comando Ômega",
      type: "capital",
      owner: "Diretoria",
      desc: "Cúpula orbital com visão holográfica dos setores.",
      resources: ["IA de navegação", "comunicações"],
      strategic: "Centro de controle — perda = anarquia total",
    },
    {
      name: "Reator de Fusão Primário",
      type: "fortress",
      owner: "Engenheiros",
      desc: "Câmara de plasma que gera a energia vital da estação.",
      resources: ["energia", "hélio-3"],
      strategic: "Falha causa apagão de toda a estação em 4h",
    },
    {
      name: "Domos Hidropônicos A-3",
      type: "plains",
      owner: "Agricultores",
      desc: "Cultivo artificial de biomassa e filtros de oxigênio.",
      resources: ["alimentos", "oxigênio"],
      strategic: "Pulmão da estação — dano aqui é extinção lenta",
    },
    {
      name: "Setor Habitacional Inferior",
      type: "badlands",
      owner: "Operários",
      desc: "Andares superpovoados com racionamento de ar.",
      resources: ["mão de obra"],
      strategic: "Barril de pólvora social — motim é certo se ignorado",
    },
    {
      name: "Doca Espacial de Carga",
      type: "water",
      owner: "Sindicato",
      desc: "Hangares de naves de mineração de asteroides.",
      resources: ["minérios de asteroides", "combustível"],
      strategic: "Única saída — evacuação ou reforço dependem daqui",
    },
    {
      name: "Complexo de Criogenia",
      type: "mountains",
      owner: "Cientistas",
      desc: "Cápsulas com vinte mil colonos adormecidos.",
      resources: ["colonos congelados", "germoplasma"],
      strategic: "Missão principal — proteger a qualquer custo",
    },
    {
      name: "Vácuo dos Escombros",
      type: "badlands",
      owner: "Piratas",
      desc: "Módulos rompidos expostos à radiação cósmica.",
      resources: [],
      strategic: "Zona hostil — base de operações pirata",
    },
    {
      name: "Arsenal de Defesa Estelar",
      type: "fortress",
      owner: "Segurança",
      desc: "Baterias de canhões eletromagnéticos apontados ao vazio.",
      resources: ["drones de combate", "canhões de rails"],
      strategic: "Muralha espacial — sem ela, os piratas dominam",
    },
  ],
  valoria_classic: [
    {
      name: "Porto Real de Valoria",
      type: "capital",
      owner: "Coroa",
      desc: "Sede do palácio de mármore e dos salões do trono.",
      resources: ["ouro", "influência", "comércio"],
      strategic: "Coração da dinastia — queda implica colapso",
    },
    {
      name: "Vales Férteis do Sul",
      type: "plains",
      owner: "Camponeses",
      desc: "Celeiros de trigo e moinhos de cevada do reino.",
      resources: ["trigo", "cevada", "gado"],
      strategic: "Principal fonte alimentar do exército e povo",
    },
    {
      name: "Montes de Oakhaven",
      type: "mountains",
      owner: "Nobreza",
      desc: "Minas ancestrais de ferro disputadas pelos barões.",
      resources: ["ferro", "carvão", "pedra"],
      strategic: "Base da indústria bélica — quem controla, domina",
    },
    {
      name: "Costa das Mercadorias",
      type: "water",
      owner: "Liga Mercante",
      desc: "Armazéns movimentados com caravelas de Eldoria.",
      resources: ["especiarias", "tecidos", "ouro mercante"],
      strategic: "Maior arrecadação de impostos do reino",
    },
    {
      name: "Sé do Santo Arcebispo",
      type: "fortress",
      owner: "Clero",
      desc: "Monastérios de pedra dedicados à Chama Sagrada.",
      resources: ["relíquias", "donativos", "influência moral"],
      strategic: "Legitimidade divina — heresia perde tudo",
    },
    {
      name: "Passo da Fronteira Leste",
      type: "fortress",
      owner: "Legiões",
      desc: "Guarnições atentas vigiando o Império de Arvandor.",
      resources: ["tropas treinadas", "mantimentos de guerra"],
      strategic: "Muralha viva — única barreira contra Arvandor",
    },
    {
      name: "Floresta Real das Caçadas",
      type: "plains",
      owner: "Coroa",
      desc: "Bosques densos com caça farta e carvoarias.",
      resources: ["madeira", "caça", "ervas"],
      strategic: "Reserva de recursos e refúgio real",
    },
    {
      name: "Pântanos do Poente",
      type: "badlands",
      owner: "Contrabandistas",
      desc: "Canais escuros onde corsários trocam ouro sem impostos.",
      resources: ["mercadorias contrabandeadas"],
      strategic: "Economia paralela — aliança ou repressão total",
    },
  ],
  zombie_apocalypse: [
    {
      name: "Bastião Central (QG)",
      type: "capital",
      owner: "Comando de Defesa",
      desc: "Centro nervoso fortificado com geradores a diesel e rádio.",
      resources: ["combustível", "rádio de longo alcance", "baterias"],
      strategic: "Queda do bunker central significa colapso do enclave",
    },
    {
      name: "Muralha Leste (Portão Omega)",
      type: "fortress",
      owner: "Milícia",
      desc: "Três camadas de concreto armado com arame farpado e holofotes.",
      resources: ["munição pesada", "torres de vigilância"],
      strategic: "Barreira primária contra as hordas migratórias do Leste",
    },
    {
      name: "Complexo Hidropônico & Silos",
      type: "plains",
      owner: "Agrônomos",
      desc: "Estufas com filtros UV produzindo rações de soja e trigo.",
      resources: ["alimentos processados", "sementes puras"],
      strategic: "Sem este complexo, a colônia morre de inanição em semanas",
    },
    {
      name: "Usina Termelétrica Abandonada",
      type: "badlands",
      owner: "Disputado",
      desc: "Caldeiras antigas que alimentam as cercas eletrificadas.",
      resources: ["eletricidade", "fiação de cobre"],
      strategic: "Fonte única de alta voltagem para conter investidas noturnas",
    },
    {
      name: "Zona de Quarentena Sul",
      type: "fortress",
      owner: "Corpo Médico",
      desc: "Contêineres lacrados onde novos refugiados aguardam 72h de teste.",
      resources: ["soro viral", "leitos de isolamento"],
      strategic: "Primeira linha contra infecção oculta no interior dos muros",
    },
    {
      name: "Autopistas do Deserto Ocidental",
      type: "badlands",
      owner: "Bandoleiros",
      desc: "Estradas de asfalto rachado dominadas por veículos armados.",
      resources: ["sucata automotiva", "combustível bruto"],
      strategic: "Corta as rotas de comboio para os bunkers cooperados",
    },
    {
      name: "Galerias do Metrô Profundo",
      type: "mountains",
      owner: "Facção Escarlate",
      desc: "Túneis labirínticos escuros infestados de espreitadores.",
      resources: ["cabos de cobre", "abrigos subterrâneos"],
      strategic: "Vulnerabilidade sob os alicerces da cidade se não vigiado",
    },
    {
      name: "Represa e Estação de Tratamento",
      type: "water",
      owner: "Engenheiros",
      desc: "Turbinas e filtros de carvão ativado fornecendo água potável.",
      resources: ["água limpa", "peixes de criadouro"],
      strategic: "Contaminação da represa geraria pânico incontrolável",
    },
  ],
  rio_zombie: [
    {
      name: "Fortaleza de São João & Urca (QG)",
      type: "capital",
      owner: "Comando da Urca",
      desc: "Base naval fortificada de frente para a entrada da Baía com baterias costeiras.",
      resources: ["fuzis 7.62", "munição militar", "rádio de ondas curtas"],
      strategic: "Queda da península significa o fim dos sobreviventes",
    },
    {
      name: "Barricada da Praia de Botafogo",
      type: "fortress",
      owner: "Sentinelas da Urca",
      desc: "Muro de contêineres e arame farpado bloqueando o avanço dos infectados da Zona Sul.",
      resources: ["muralha de concreto", "holofotes de vigilância"],
      strategic: "Portão terrestre primário de contenção contra a horda",
    },
    {
      name: "Enseada de Traineiras & Trapiche",
      type: "water",
      owner: "Pescadores de Zé do Porto",
      desc: "Doca protegida de traineiras a diesel para pesca e transporte náutico.",
      resources: ["pescado fresco", "salga de peixe", "diesel marítimo"],
      strategic: "Principal fonte alimentar calórica de todo o reduto",
    },
    {
      name: "Floresta da Tijuca & Paineiras",
      type: "mountains",
      owner: "Caçadores de Tainá",
      desc: "Mata densa infestada de esporos onde caçadores emboscam monstros.",
      resources: ["ervas medicinais", "madeira de lei", "carne de caça"],
      strategic: "Alerta antecipado sobre deslocamentos de hordas das montanhas",
    },
    {
      name: "Castelo Mourisco da Fiocruz",
      type: "capital",
      owner: "Dr. Camargo",
      desc: "Laboratórios de biossegurança isolados ao norte com tecnologia médica pré-queda.",
      resources: ["amostras virais", "reagentes químicos", "estufa hermética"],
      strategic: "Única esperança real de isolar anticorpos funcionais",
    },
    {
      name: "Ponte Rio-Niterói (Ruínas)",
      type: "badlands",
      owner: "Disputado",
      desc: "Vigas de concreto sobre o mar onde batedores e infectados rastejam nos ferros.",
      resources: ["sucata de aço", "cabos de sustentação"],
      strategic: "Corredor bloqueado — qualquer travessia atrai tiros da milícia",
    },
    {
      name: "Viadutos da Linha Vermelha",
      type: "badlands",
      owner: "Milícia do Major Carcará",
      desc: "Bunkers sobre as pistas elevadas com ninhos de metralhadoras .50.",
      resources: ["blindados artesanais", "combustível extorquido"],
      strategic: "Território hostil que domina todo o acesso rodoviário ao norte",
    },
    {
      name: "Ilha de Paquetá",
      type: "plains",
      owner: "Pescadores Livres",
      desc: "Comunidade insular autônoma com poços de água doce e farinha de mandioca.",
      resources: ["mandioca", "água potável de poço"],
      strategic: "Parceiro comercial pacífico vital para suprimentos essenciais",
    },
  ],
};

// Posições das entidades externas na borda do mapa por storyline
const EXTERNAL_POSITIONS: Record<string, Array<[number, number]>> = {
  valoria_classic: [
    [580, 200], // Arvandor — leste
    [320, 390], // Eldoria — sul
    [60,  100], // Khar — norte
    [580, 350], // Igreja — sudeste
  ],
  khar_invasion: [
    [60,  80],  // Khar Vanguarda — norte invasor
    [160, 350], // Eldoria Exilada — sudoeste
    [600, 200], // Arvandor Neutro — leste distante
  ],
  dark_plague: [
    [580, 320], // Inquisição — leste
    [320, 390], // Boticários — sul (ilhas)
    [600, 100], // Arvandor Bloqueio — nordeste
  ],
  colony_exodus: [
    [600, 100], // Corp Hélios — distante
    [350, 390], // Federação — sul
    [80,  300], // Piratas — oeste próximo
  ],
  zombie_apocalypse: [
    [590, 170], // Horda Leste — leste invasor
    [330, 390], // Facção Escarlate — sul subterrâneo
    [100, 90],  // Bunkers Cooperados — noroeste
    [70,  320], // Bandoleiros — sudoeste
  ],
  rio_zombie: [
    [580, 160], // Milícia Linha Vermelha — norte rodoviário
    [110, 120], // Ninho Estaladores Tijuca — oeste montanhoso
    [560, 360], // Pescadores de Paquetá — nordeste da baía
    [100, 350], // Forte Copacabana — sul costeiro
  ],
};

/**
 * Gera um mapa matemático 100% determinístico baseado na seed
 */
export function generateKingdomMap(seed: number, storylineId: string = "valoria_classic"): KingdomMapData {
  const prng = new PRNG(seed);
  const width = 640;
  const height = 400;

  const regionConfigs = LORE_REGIONS[storylineId] || LORE_REGIONS["valoria_classic"];

  // Centros de células organizados de forma harmoniosa no plano
  const baseNodes: Array<[number, number]> = [
    [width * 0.5,  height * 0.45], // Capital centro
    [width * 0.35, height * 0.72], // Sul
    [width * 0.22, height * 0.35], // Oeste montanhoso
    [width * 0.78, height * 0.38], // Leste costeiro
    [width * 0.48, height * 0.18], // Norte sé
    [width * 0.82, height * 0.75], // Sudeste fronteira
    [width * 0.18, height * 0.68], // Sudoeste
    [width * 0.68, height * 0.20], // Nordeste
  ];

  const territories: MapTerritory[] = regionConfigs.slice(0, 8).map((config, idx) => {
    const baseNode = baseNodes[idx] || [width * 0.5, height * 0.5];
    const cx = Math.round(baseNode[0] + (prng.next() - 0.5) * 24);
    const cy = Math.round(baseNode[1] + (prng.next() - 0.5) * 20);

    const vertexCount = 7;
    const radius = 55 + Math.round(prng.next() * 20);
    const polygon: Array<[number, number]> = [];

    for (let i = 0; i < vertexCount; i++) {
      const angle = (i / vertexCount) * Math.PI * 2;
      const r = radius * (0.8 + prng.next() * 0.4);
      const px = Math.round(Math.max(10, Math.min(width - 10, cx + Math.cos(angle) * r)));
      const py = Math.round(Math.max(10, Math.min(height - 10, cy + Math.sin(angle) * r)));
      polygon.push([px, py]);
    }

    // Métricas simuladas determinísticas baseadas em seed + idx
    const garrisonSeed = prng.next();
    const taxSeed = prng.next();

    return {
      id: `terr_${idx + 1}`,
      name: config.name,
      type: config.type,
      polygon,
      center: [cx, cy],
      owner: config.owner,
      importance: idx === 0 ? "alta" : idx % 2 === 0 ? "estrategica" : "media",
      description: config.desc,
      resources: config.resources,
      strategic: config.strategic,
      garrisonLevel: idx === 0 ? 85 : Math.round(20 + garrisonSeed * 60),
      taxRate: Math.round(15 + taxSeed * 40),
      population: Math.round(2000 + prng.next() * 18000),
    };
  });

  const routes: MapRoute[] = [
    { fromId: "terr_1", toId: "terr_2", points: [territories[0].center, territories[1].center], type: "estrada" },
    { fromId: "terr_1", toId: "terr_3", points: [territories[0].center, territories[2].center], type: "estrada" },
    { fromId: "terr_1", toId: "terr_4", points: [territories[0].center, territories[3].center], type: "rio" },
    { fromId: "terr_1", toId: "terr_5", points: [territories[0].center, territories[4].center], type: "passagem" },
    { fromId: "terr_2", toId: "terr_6", points: [territories[1].center, territories[5].center], type: "estrada" },
    { fromId: "terr_3", toId: "terr_7", points: [territories[2].center, territories[6].center], type: "passagem" },
    { fromId: "terr_4", toId: "terr_8", points: [territories[3].center, territories[7].center], type: "rio" },
  ];

  const landmarks = territories.map((t) => ({
    name: t.name,
    coord: t.center,
    icon:
      t.type === "capital"
        ? "◈"
        : t.type === "fortress"
        ? "◬"
        : t.type === "mountains"
        ? "▲"
        : t.type === "water"
        ? "~"
        : t.type === "badlands"
        ? "✕"
        : "●",
  }));

  // Constrói nós de entidades externas
  const externalEntities = getEntitiesForStoryline(storylineId);
  const externalPositions = EXTERNAL_POSITIONS[storylineId] || EXTERNAL_POSITIONS["valoria_classic"];
  const capitalCenter = territories[0].center;

  const externalNodes: ExternalEntityMapNode[] = externalEntities.map((entity, idx) => ({
    entityId: entity.id,
    name: entity.name,
    center: (externalPositions[idx] || [width * 0.9, height * 0.5]) as [number, number],
    atWar: entity.atWar ?? false,
    relation: entity.relation,
    type: entity.type,
    color: entity.color ?? "#2a2a2a",
    leader: entity.leader,
    distance: entity.distance,
  }));

  const diplomaticLines: DiplomaticLine[] = externalNodes.map((node) => ({
    fromCenter: capitalCenter,
    toCenter: node.center,
    relation: node.relation,
    atWar: node.atWar,
    type: node.type,
  }));

  return {
    seed,
    storylineId,
    width,
    height,
    territories,
    routes,
    landmarks,
    externalNodes,
    diplomaticLines,
  };
}

export type CityDistrictCategory =
  | "citadel"
  | "granary"
  | "treasury"
  | "barracks"
  | "market"
  | "residential"
  | "temple"
  | "harbor"
  | "quarantine"
  | "infrastructure";

export type CityDistrict = {
  id: string;
  name: string;
  category: CityDistrictCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  areaKm2: number;
  garrison: number;
  status: string;
  operationalLevel: number; // 0-100
  importance: "crítica" | "alta" | "estratégica";
  description: string;
  strategicNote: string;
  icon: string;
  color: string;
};

export type CityMapData = {
  cityName: string;
  subtitle: string;
  scaleRatio: string;
  metricScaleText: string;
  totalAreaKm2: number;
  perimeterKm: number;
  population: number;
  totalGarrison: number;
  districts: CityDistrict[];
  walls: Array<{ x1: number; y1: number; x2: number; y2: number; type: "outer" | "inner" }>;
  gates: Array<{ name: string; x: number; y: number; facing: string }>;
  riverOrMoat?: { name: string; points: Array<[number, number]> };
};

/**
 * Gera a planta arquitetônica e urbana da Cidade/Capital com proporções reais de tamanho
 */
export function generateCityMap(storylineId: string = "valoria_classic", seed: number = 12345): CityMapData {
  const prng = new PRNG(seed + 999);

  if (storylineId === "zombie_apocalypse") {
    return {
      cityName: "Setor Metropolitano Fortificado — Bastião 7",
      subtitle: "Planta Arquitetônica da Zona de Exclusão Urbana Murada",
      scaleRatio: "1:4.000",
      metricScaleText: "200 metros",
      totalAreaKm2: 4.2,
      perimeterKm: 8.4,
      population: 11400,
      totalGarrison: 920,
      walls: [
        { x1: 60, y1: 50, x2: 540, y2: 50, type: "outer" },
        { x1: 540, y1: 50, x2: 540, y2: 340, type: "outer" },
        { x1: 540, y1: 340, x2: 60, y2: 340, type: "outer" },
        { x1: 60, y1: 340, x2: 60, y2: 50, type: "outer" },
        // Anel interno da cidadela
        { x1: 210, y1: 100, x2: 390, y2: 100, type: "inner" },
        { x1: 390, y1: 100, x2: 390, y2: 240, type: "inner" },
        { x1: 390, y1: 240, x2: 210, y2: 240, type: "inner" },
        { x1: 210, y1: 240, x2: 210, y2: 100, type: "inner" },
      ],
      gates: [
        { name: "Portão Alfa (Norte - Blindado)", x: 300, y: 50, facing: "Norte" },
        { name: "Portão Omega (Leste - Frente de Contenção)", x: 540, y: 195, facing: "Leste" },
        { name: "Portão Sul de Triagem", x: 300, y: 340, facing: "Sul" },
        { name: "Portão Oeste dos Convois", x: 60, y: 195, facing: "Oeste" },
      ],
      districts: [
        {
          id: "bunker_central",
          name: "Bunker Central de Comando & Sala de Guerra",
          category: "citadel",
          x: 230,
          y: 120,
          width: 140,
          height: 65,
          areaKm2: 0.5,
          garrison: 180,
          status: "Operação Contínua Sob Blindagem",
          operationalLevel: 95,
          importance: "crítica",
          description: "Estrutura subterrânea de três andares com comunicações via satélite e controle das defesas.",
          strategicNote: "Queda deste bunker desativa os geradores e o sistema de vigilância automatizada.",
          icon: "📡",
          color: "#2a2215",
        },
        {
          id: "silos_hidroponia",
          name: "Silos Blindados de Ração & Hidroponia UV",
          category: "granary",
          x: 90,
          y: 80,
          width: 100,
          height: 60,
          areaKm2: 0.6,
          garrison: 65,
          status: "Produção de Ração Estável",
          operationalLevel: 80,
          importance: "crítica",
          description: "Estufas com filtros atmosféricos e tanques de água esterilizada para sustento dos 11.000 civis.",
          strategicNote: "Risco de inanição total se o fornecimento elétrico aos filtros for interrompido.",
          icon: "🥫",
          color: "#1c2818",
        },
        {
          id: "usina_combustivel",
          name: "Depósito de Diesel & Casa dos Geradores",
          category: "treasury",
          x: 230,
          y: 195,
          width: 80,
          height: 38,
          areaKm2: 0.3,
          garrison: 50,
          status: "Cotas Rigorosas de Combustível",
          operationalLevel: 65,
          importance: "alta",
          description: "Turbinas e baterias de lítio que alimentam as cercas elétricas e os refletores das muralhas.",
          strategicNote: "Qualquer vazamento ou sabotagem extingue a eletricidade da Muralha Leste.",
          icon: "⚡",
          color: "#2a1e12",
        },
        {
          id: "arsenal_milicia",
          name: "Arsenal Central & Campo de Treinamento",
          category: "barracks",
          x: 410,
          y: 80,
          width: 110,
          height: 70,
          areaKm2: 0.7,
          garrison: 340,
          status: "Prontidão Operacional em Turnos",
          operationalLevel: 88,
          importance: "crítica",
          description: "Oficinas de recarga de munições, barricadas móveis e veículos blindados com metralhadoras.",
          strategicNote: "Base de apoio rápido para conter qualquer violação das barricadas de contenção.",
          icon: "🛡",
          color: "#281515",
        },
        {
          id: "bazar_trocas",
          name: "Bazar de Trocas dos Sobreviventes",
          category: "market",
          x: 220,
          y: 255,
          width: 110,
          height: 65,
          areaKm2: 0.6,
          garrison: 40,
          status: "Mercado Negro Sob Vigilância",
          operationalLevel: 70,
          importance: "estratégica",
          description: "Pátio a céu aberto onde moradores trocam pilhas, remédios, conservas e ferramentas.",
          strategicNote: "Mantém a moral da população; fechar o bazar pode causar motins por cigarros e café.",
          icon: "🔄",
          color: "#1f1f28",
        },
        {
          id: "hospital_virologia",
          name: "Hospital de Trauma & Centro de Virologia",
          category: "temple",
          x: 90,
          y: 155,
          width: 100,
          height: 65,
          areaKm2: 0.5,
          garrison: 45,
          status: "Sobrecarga de Feridos e Testes",
          operationalLevel: 60,
          importance: "alta",
          description: "Laboratório de pesquisa de soro neutralizante e leitos de tratamento para combatentes feridos.",
          strategicNote: "Desenvolve a única esperança de imunização duradoura contra as variantes da praga.",
          icon: "💉",
          color: "#1a2228",
        },
        {
          id: "setor_residencial",
          name: "Habitats Residenciais & Alojamentos",
          category: "residential",
          x: 90,
          y: 235,
          width: 110,
          height: 85,
          areaKm2: 1.0,
          garrison: 60,
          status: "Superlotação Moderada",
          operationalLevel: 75,
          importance: "estratégica",
          description: "Prédios comerciais convertidos em moradias coletivas com toque de recolher às 20h.",
          strategicNote: "População sob estresse psicológico contínuo devido aos uivos noturnos das hordas externas.",
          icon: "🏢",
          color: "#181820",
        },
        {
          id: "zona_quarentena",
          name: "Campo de Quarentena & Descontaminação",
          category: "quarantine",
          x: 410,
          y: 170,
          width: 110,
          height: 150,
          areaKm2: 1.1,
          garrison: 140,
          status: "Isolamento Estrito de Refugiados",
          operationalLevel: 55,
          importance: "crítica",
          description: "Fileiras de contêineres e cercas duplas de concertina com holofotes permanentes.",
          strategicNote: "Epicentro de risco. Se a quarentena romper, o vírus atinge o núcleo do Bastião em minutos.",
          icon: "☣",
          color: "#351515",
        },
      ],
    };
  }

  if (storylineId === "rio_zombie") {
    return {
      cityName: "Reduto Fortificado da Urca & Pão de Açúcar",
      subtitle: "Planta Arquitetônica da Península Militar e Baterias Defensivas",
      scaleRatio: "1:3.000",
      metricScaleText: "150 metros",
      totalAreaKm2: 3.1,
      perimeterKm: 6.8,
      population: 8200,
      totalGarrison: 650,
      walls: [
        { x1: 50, y1: 50, x2: 550, y2: 50, type: "outer" },
        { x1: 550, y1: 50, x2: 550, y2: 340, type: "outer" },
        { x1: 550, y1: 340, x2: 50, y2: 340, type: "outer" },
        { x1: 50, y1: 340, x2: 50, y2: 50, type: "outer" },
        // Perímetro do Forte de São João (Cidadela)
        { x1: 220, y1: 100, x2: 380, y2: 100, type: "inner" },
        { x1: 380, y1: 100, x2: 380, y2: 240, type: "inner" },
        { x1: 380, y1: 240, x2: 220, y2: 240, type: "inner" },
        { x1: 220, y1: 240, x2: 220, y2: 100, type: "inner" },
      ],
      gates: [
        { name: "Barricada do Morro da Urca (Terrestre)", x: 50, y: 195, facing: "Oeste" },
        { name: "Cais das Traineiras (Baía Norte)", x: 300, y: 50, facing: "Norte" },
        { name: "Bateria da Praia Vermelha (Sul)", x: 300, y: 340, facing: "Sul" },
        { name: "Posto do Canal da Guanabara (Leste)", x: 550, y: 195, facing: "Leste" },
      ],
      districts: [
        {
          id: "posto_comando_urca",
          name: "Posto de Comando da Fortaleza de São João",
          category: "citadel",
          x: 235,
          y: 115,
          width: 130,
          height: 65,
          areaKm2: 0.4,
          garrison: 160,
          status: "Operação Contínua de Rádio e Sentinelas",
          operationalLevel: 95,
          importance: "crítica",
          description: "Quartel de comando histórico sobre a rocha da enseada com antenas de rádio militar e controle de holofotes.",
          strategicNote: "Se o posto cair, todo o sistema de sentinelas costeiras e artilharia é perdido.",
          icon: "⚓",
          color: "#1c2538",
        },
        {
          id: "trapiche_pesca",
          name: "Trapiche das Traineiras & Docas de Zé do Porto",
          category: "granary",
          x: 80,
          y: 75,
          width: 115,
          height: 65,
          areaKm2: 0.5,
          garrison: 55,
          status: "Frota de Pesca Operacional",
          operationalLevel: 85,
          importance: "crítica",
          description: "Atracadouro de doze traineiras de pesca adaptadas com armadura de compensado e galões de diesel.",
          strategicNote: "Garante 70% das calorias diárias de peixe salgado para os 8.200 sobreviventes.",
          icon: "🐟",
          color: "#142828",
        },
        {
          id: "lab_fiocruz",
          name: "Laboratório de Campanha & Quarentena Fiocruz",
          category: "temple",
          x: 80,
          y: 160,
          width: 115,
          height: 70,
          areaKm2: 0.5,
          garrison: 50,
          status: "Pesquisa de Anticorpos em Andamento",
          operationalLevel: 75,
          importance: "alta",
          description: "Instalações de biossegurança do Dr. Camargo para estudo de fungos mutantes e espécimes de Estaladores.",
          strategicNote: "Risco biológico extremo. Protocolo de queima por lança-chamas caso haja fuga de amostras.",
          icon: "🔬",
          color: "#281e2e",
        },
        {
          id: "barricada_bondinho",
          name: "Muralha do Morro & Estação do Bondinho",
          category: "barracks",
          x: 395,
          y: 75,
          width: 125,
          height: 80,
          areaKm2: 0.7,
          garrison: 140,
          status: "Sentinelas com Fuzis 7.62 em Prontidão",
          operationalLevel: 90,
          importance: "crítica",
          description: "Ninho de metralhadoras e holofotes no cabo do bondinho com visão panorâmica de Botafogo e Copacabana.",
          strategicNote: "Primeira linha de defesa contra qualquer invasão terrestre de infectados ou milicianos.",
          icon: "🚠",
          color: "#2e2215",
        },
        {
          id: "alojamentos_civis",
          name: "Alojamentos da Praia Vermelha & Vila Militar",
          category: "residential",
          x: 80,
          y: 250,
          width: 125,
          height: 75,
          areaKm2: 0.6,
          garrison: 40,
          status: "Toque de Silêncio e Apagão Noturno",
          operationalLevel: 70,
          importance: "estratégica",
          description: "Prédios de oficiais e escolas ocupadas pelas famílias civis de pescadores e artesãos da Urca.",
          strategicNote: "A moral civil depende da provisão regular de pescado e da ausência de tiros noturnos.",
          icon: "🏘️",
          color: "#181820",
        },
        {
          id: "arsenal_praia",
          name: "Armazém Bélico & Oficinas de Sucata Naval",
          category: "treasury",
          x: 395,
          y: 175,
          width: 125,
          height: 70,
          areaKm2: 0.5,
          garrison: 60,
          status: "Recarga Manual de Cartuchos",
          operationalLevel: 75,
          importance: "alta",
          description: "Oficinas que recarregam estojos de bala usados e moldam arame de concertina para as barricadas.",
          strategicNote: "Sem pólvora e chumbo, as armas automáticas dos postos cessam fogo em 48 horas.",
          icon: "⚙️",
          color: "#221c16",
        },
        {
          id: "quarentena_orla",
          name: "Contêineres de Triagem da Orla",
          category: "quarantine",
          x: 235,
          y: 250,
          width: 130,
          height: 75,
          areaKm2: 0.4,
          garrison: 75,
          status: "Protocolo 72 Horas de Observação",
          operationalLevel: 65,
          importance: "crítica",
          description: "Área isolada onde sobreviventes resgatados na baía aguardam teste de febre e inspeção de mordidas.",
          strategicNote: "Qualquer sintoma de estalo ou agressividade é respondido com tiro na cabeça e descarte no mar.",
          icon: "☣",
          color: "#381515",
        },
      ],
    };
  }

  // Padrão: Cenário Valoria Clássico (e adaptável para Khar / Dark Plague)
  return {
    cityName: "Cidadela Real de Valoria",
    subtitle: "Planta Arquitetônica da Capital e Distritos Murados",
    scaleRatio: "1:5.000",
    metricScaleText: "250 metros",
    totalAreaKm2: 5.4,
    perimeterKm: 9.6,
    population: 14800,
    totalGarrison: 1200,
    walls: [
      { x1: 50, y1: 50, x2: 550, y2: 50, type: "outer" },
      { x1: 550, y1: 50, x2: 550, y2: 340, type: "outer" },
      { x1: 550, y1: 340, x2: 50, y2: 340, type: "outer" },
      { x1: 50, y1: 340, x2: 50, y2: 50, type: "outer" },
      // Muralha da Cidadela Alta
      { x1: 200, y1: 90, x2: 400, y2: 90, type: "inner" },
      { x1: 400, y1: 90, x2: 400, y2: 230, type: "inner" },
      { x1: 400, y1: 230, x2: 200, y2: 230, type: "inner" },
      { x1: 200, y1: 230, x2: 200, y2: 90, type: "inner" },
    ],
    gates: [
      { name: "Portão do Leão (Norte - Estrada Real)", x: 300, y: 50, facing: "Norte" },
      { name: "Portão de Ferro (Leste - Para os Montes)", x: 550, y: 195, facing: "Leste" },
      { name: "Portão das Marés (Sul - Para o Cais)", x: 300, y: 340, facing: "Sul" },
      { name: "Portão dos Mercadores (Oeste)", x: 50, y: 195, facing: "Oeste" },
    ],
    riverOrMoat: {
      name: "Rio das Marés & Fosso da Muralha",
      points: [
        [30, 40],
        [570, 40],
        [570, 360],
        [30, 360],
        [30, 40],
      ],
    },
    districts: [
      {
        id: "palacio_real",
        name: "Palácio Imperial & Sala do Trono",
        category: "citadel",
        x: 220,
        y: 110,
        width: 140,
        height: 65,
        areaKm2: 0.6,
        garrison: 240,
        status: "Soberania e Guarda Pessoal",
        operationalLevel: 95,
        importance: "crítica",
        description: "Salões colunados de mármore e torreão da coroa onde ocorrem as audiências e decisões régias.",
        strategicNote: "Centro do poder do reino. Sua queda provoca o colapso dinástico imediato.",
        icon: "👑",
        color: "#2e2515",
      },
      {
        id: "celeiros_imperiais",
        name: "Grandes Celeiros & Silos de Farinha",
        category: "granary",
        x: 80,
        y: 80,
        width: 100,
        height: 60,
        areaKm2: 0.6,
        garrison: 80,
        status: "Provisões de Segurança Alimentar",
        operationalLevel: 85,
        importance: "crítica",
        description: "Quatro armazéns de pedra com ventilação seca capazes de armazenar suprimentos para anos de seca.",
        strategicNote: "Alvo primário de rebeldes em tempos de escassez; proteger garante a lealdade da capital.",
        icon: "🌾",
        color: "#222c15",
      },
      {
        id: "casa_moeda",
        name: "Casa da Moeda & Cofres Reais",
        category: "treasury",
        x: 230,
        y: 185,
        width: 75,
        height: 40,
        areaKm2: 0.3,
        garrison: 75,
        status: "Câmaras Subterrâneas Fortificadas",
        operationalLevel: 90,
        importance: "alta",
        description: "Arcas de ferro lacradas com os tributos dos condados e matrizes de cunhagem de moedas.",
        strategicNote: "Sem estes cofres, o pagamento dos mercenários e magistrados é inviabilizado.",
        icon: "🪙",
        color: "#2a2210",
      },
      {
        id: "quartel_legioes",
        name: "Quartel-General das Legiões & Arsenal",
        category: "barracks",
        x: 420,
        y: 80,
        width: 110,
        height: 70,
        areaKm2: 0.8,
        garrison: 420,
        status: "Prontidão Bélica e Cavalaria",
        operationalLevel: 92,
        importance: "crítica",
        description: "Pátio de armas, ferrarias de lâminas e couraças, e estábulos da cavalaria pesada da guarda.",
        strategicNote: "Garante a capacidade de mobilização em caso de cerco ou incursões na capital.",
        icon: "⚔",
        color: "#2d1616",
      },
      {
        id: "mercado_guildas",
        name: "Grande Mercado Central das Guildas",
        category: "market",
        x: 220,
        y: 245,
        width: 110,
        height: 75,
        areaKm2: 0.8,
        garrison: 60,
        status: "Fluxo Comercial Intenso",
        operationalLevel: 80,
        importance: "estratégica",
        description: "Praça aberta onde mercadores de Eldoria, caravanas do leste e artesãos comercializam tecidos e especiarias.",
        strategicNote: "Principal fonte de impostos indiretos e termômetro do humor da burguesia mercantil.",
        icon: "⚖",
        color: "#1c242a",
      },
      {
        id: "catedral_sagrada",
        name: "Catedral da Chama Sagrada",
        category: "temple",
        x: 80,
        y: 155,
        width: 100,
        height: 70,
        areaKm2: 0.5,
        garrison: 50,
        status: "Cultos e Liturgias Diárias",
        operationalLevel: 88,
        importance: "alta",
        description: "Torres sineiras góticas de granito e cripta dos antigos reis guardada pela ordem monástica.",
        strategicNote: "Apoio eclesiástico confere legitimidade inatacável às ordens e decretos do soberano.",
        icon: "🕯",
        color: "#261a28",
      },
      {
        id: "bairro_nobre",
        name: "Distrito Nobre & Mansões dos Barões",
        category: "residential",
        x: 420,
        y: 165,
        width: 110,
        height: 70,
        areaKm2: 0.8,
        garrison: 90,
        status: "Residências da Aristocracia",
        operationalLevel: 85,
        importance: "estratégica",
        description: "Vilas muradas com jardins privados onde residem os conselheiros e embaixadores estrangeiros.",
        strategicNote: "Conspirações contra o trono quase invariavelmente nascem nos banquetes deste distrito.",
        icon: "🏛",
        color: "#201c26",
      },
      {
        id: "cidade_baixa",
        name: "Cidade Baixa & Distrito dos Trabalhadores",
        category: "residential",
        x: 80,
        y: 240,
        width: 120,
        height: 85,
        areaKm2: 1.2,
        garrison: 75,
        status: "Alta Densidade Populacional",
        operationalLevel: 70,
        importance: "estratégica",
        description: "Labirinto de sobrados de madeira, tabernas, tecelagens e moradias de 9.000 camponeses e artesãos.",
        strategicNote: "Vulnerável a incêndios e epidemias; qualquer revolta começa com barricadas nestas ruelas.",
        icon: "🏘",
        color: "#1a1a20",
      },
      {
        id: "porto_docas",
        name: "Docas Reais & Cais de Carga Fluvial",
        category: "harbor",
        x: 350,
        y: 245,
        width: 120,
        height: 75,
        areaKm2: 0.9,
        garrison: 95,
        status: "Desembarque Contínuo de Barcaças",
        operationalLevel: 85,
        importance: "alta",
        description: "Cais reforçado com guindastes de contrapeso onde atracam galeões com trigo e sal.",
        strategicNote: "Bloqueio do cais corta o fornecimento externo de comida em menos de duas semanas.",
        icon: "⚓",
        color: "#152428",
      },
    ],
  };
}

