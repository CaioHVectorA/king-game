import { StorylineDefinition } from "./types";
import { GameEvent } from "@/types/game";

// ─── EVENTOS EXCLUSIVOS DO CENÁRIO ────────────────────────────────────────────

const zombieEvents: GameEvent[] = [
  {
    id: "z_horde_breach",
    title: "Brecha na Barreira Leste",
    description:
      "O Comandante Drak entra com urgência no centro de comando. Câmeras mostram centenas de infectados pressionando a grade leste do Setor-4. A solda está cedendo. 'Governador, em 20 minutos elas entram. Peço autorização para acionar os lança-chamas dos postos de guarda.'",
    characterId: "commander_drak",
    tags: ["militar", "defesa", "crise", "zumbi"],
    weight: 25,
    choices: [
      {
        id: "flamethrowers_full",
        label: "Autorizar uso total dos lança-chamas e incendiar o bloco externo",
        intentDescription: "Elimina a ameaça mas queima recursos de combustível e alerta outras hordas.",
        actions: [
          { type: "MODIFY_MILITARY", amount: -10 },
          { type: "MODIFY_STABILITY", amount: 12 },
          { type: "ADD_FOOD", amount: -30 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -10 },
          { type: "MODIFY_FACTION", faction: "military", amount: 20 },
        ],
      },
      {
        id: "seal_sector",
        label: "Selar o Setor-4 com concreto e sacrificar os moradores que não saíram a tempo",
        intentDescription: "Garante a segurança sem gastar recursos, mas com custo humano e moral.",
        actions: [
          { type: "MODIFY_POPULATION", amount: -800 },
          { type: "MODIFY_STABILITY", amount: -20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -35 },
          { type: "MODIFY_FACTION", faction: "military", amount: 5 },
        ],
      },
      {
        id: "reinforcements_divert",
        label: "Desviar guarnição do portão norte para defender o leste",
        intentDescription: "Cobre o setor mas expõe outra área.",
        actions: [
          { type: "MODIFY_MILITARY", amount: -15 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
    ],
  },
  {
    id: "z_cure_rumor",
    title: "Rumor de Cura — Laboratório Abandondo",
    description:
      "Dra. Elise Moreau aparece com olheiras profundas e uma pasta de dados. 'Governador, sinais de rádio codificados de São Paulo indicam um laboratório com amostras virais intactas — possivelmente a chave para a cura. Precisamos de uma equipe armada e combustível para uma expedição.'",
    characterId: "dr_moreau",
    tags: ["ciência", "cura", "exploração"],
    weight: 15,
    choices: [
      {
        id: "fund_expedition",
        label: "Financiar expedição com 5 soldados e 2 veículos blindados",
        intentDescription: "Alto custo e risco, mas chance de avanço histórico.",
        actions: [
          { type: "ADD_GOLD", amount: -150 },
          { type: "MODIFY_MILITARY", amount: -12 },
          { type: "MODIFY_STABILITY", amount: 15 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: 25 },
        ],
      },
      {
        id: "deny_expedition",
        label: "Negar a expedição — recursos são escassos demais para apostas",
        intentDescription: "Conserva recursos mas deixa esperança de cura morrer.",
        actions: [
          { type: "MODIFY_STABILITY", amount: -12 },
          { type: "MODIFY_FACTION", faction: "clergy", amount: -20 },
        ],
      },
    ],
  },
  {
    id: "z_food_rot",
    title: "Contaminação nos Silos de Grãos",
    description:
      "O coordenador de suprimentos chega com uma amostra de grão enegrecido. 'As reservas do Silo B foram contaminadas por mofo tóxico — provavelmente sabotagem dos dissidentes do Bloco-9. Perdemos 40% da nossa reserva alimentar se não agirmos. Podemos queimar o silo ou tentar salvar parte do grão com filtragem cara.'",
    characterId: "supply_chief",
    tags: ["comida", "sabotagem", "crise"],
    weight: 20,
    choices: [
      {
        id: "burn_silo",
        label: "Queimar o silo por completo para evitar contágio total",
        intentDescription: "Seguro mas provoca fome imediata.",
        actions: [
          { type: "ADD_FOOD", amount: -220 },
          { type: "MODIFY_STABILITY", amount: -15 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -20 },
        ],
      },
      {
        id: "filter_grain",
        label: "Gastar créditos para contratar técnicos de filtragem e salvar parte do grão",
        intentDescription: "Caro mas preserva mais alimento.",
        actions: [
          { type: "ADD_GOLD", amount: -120 },
          { type: "ADD_FOOD", amount: -80 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
      {
        id: "hunt_saboteur",
        label: "Prender os dissidentes do Bloco-9 e usar trabalho forçado deles na filtragem",
        intentDescription: "Política dura que preserva recursos mas divide o assentamento.",
        actions: [
          { type: "ADD_FOOD", amount: -100 },
          { type: "ADD_GOLD", amount: -30 },
          { type: "MODIFY_STABILITY", amount: -25 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -30 },
          { type: "MODIFY_FACTION", faction: "military", amount: 15 },
        ],
      },
    ],
  },
  {
    id: "z_refugee_wave",
    title: "Onda de Refugiados no Portão Principal",
    description:
      "Câmeras externas mostram quase 300 sobreviventes acampados no portão norte, incluindo crianças e feridos. O Comandante Drak cruza os braços: 'Governador, precisamos de uma decisão. Se os deixarmos entrar, não temos comida para uma semana. Se os tirarmos a força, a cidade inteira vai ver pela tela.'",
    characterId: "commander_drak",
    tags: ["diplomacia", "humanidade", "comida"],
    weight: 18,
    choices: [
      {
        id: "accept_refugees",
        label: "Aceitar os refugiados e integrar os aptos ao trabalho nas brigadas",
        intentDescription: "Aumenta mão de obra mas pressiona os recursos.",
        actions: [
          { type: "MODIFY_POPULATION", amount: 250 },
          { type: "ADD_FOOD", amount: -180 },
          { type: "MODIFY_STABILITY", amount: 10 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 20 },
          { type: "MODIFY_FACTION", faction: "military", amount: -10 },
        ],
      },
      {
        id: "quarantine_camp",
        label: "Criar campo de quarentena externo e aceitar só os que passarem no teste viral",
        intentDescription: "Equilibrado — salva quem puder com custo limitado.",
        actions: [
          { type: "MODIFY_POPULATION", amount: 120 },
          { type: "ADD_GOLD", amount: -60 },
          { type: "ADD_FOOD", amount: -80 },
          { type: "MODIFY_STABILITY", amount: 5 },
        ],
      },
      {
        id: "deny_all",
        label: "Fechar os portões e acionar sirenes para dispersar a multidão",
        intentDescription: "Preserva recursos mas cria dissidência interna.",
        actions: [
          { type: "MODIFY_STABILITY", amount: -20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -30 },
          { type: "MODIFY_FACTION", faction: "military", amount: 10 },
        ],
      },
    ],
  },
  {
    id: "z_militia_coup",
    title: "Tentativa de Golpe da Milícia Armada",
    description:
      "Às 3h da manhã, seu conselheiro acorda você com tremor na voz: 'Governador, a Milícia do Bloco-7 está margeando o centro de controle com 40 homens armados. Dizem que vossa gestão está matando mais pessoas do que os zumbis. Exigem eleições imediatas ou tomam o poder às 6h.'",
    characterId: "councilor_vera",
    tags: ["golpe", "política", "militar", "crise"],
    weight: 12,
    choices: [
      {
        id: "negotiate",
        label: "Negociar — convocar assembleia e prometer eleições em 30 dias",
        intentDescription: "Evita derramamento de sangue mas cede poder político.",
        actions: [
          { type: "MODIFY_STABILITY", amount: -10 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: 15 },
          { type: "MODIFY_FACTION", faction: "military", amount: -15 },
        ],
      },
      {
        id: "arrest_leaders",
        label: "Prender os líderes da milícia antes do amanhecer com esquadrão de elite",
        intentDescription: "Esmaga o golpe mas cria mártires e ressentimento.",
        actions: [
          { type: "ADD_GOLD", amount: -40 },
          { type: "MODIFY_STABILITY", amount: -25 },
          { type: "MODIFY_FACTION", faction: "military", amount: 20 },
          { type: "MODIFY_FACTION", faction: "peasants", amount: -35 },
        ],
      },
      {
        id: "join_faction",
        label: "Incorporar a milícia às forças regulares com promessa de cargo de comando",
        intentDescription: "Transforma inimigos em aliados militares.",
        actions: [
          { type: "MODIFY_MILITARY", amount: 20 },
          { type: "MODIFY_STABILITY", amount: 5 },
          { type: "MODIFY_FACTION", faction: "military", amount: 25 },
          { type: "MODIFY_FACTION", faction: "nobles", amount: -15 },
        ],
      },
    ],
  },
];

export const zombieApocalypseStoryline: StorylineDefinition = {
  id: "zombie_apocalypse",
  name: "Protocolo ZERO — Última Fortaleza",
  subtitle: "Gestão de Crise em Apocalipse Zumbi Pós-Viral",
  description:
    "O vírus Z-17 matou 94% da população mundial em 18 meses. Você governa o Assentamento Ferrão, a última cidade murada do Brasil — 12.000 sobreviventes, muros de concreto e fio farpado, e hordas de infectados nas sombras de uma São Paulo em ruínas. Cada decisão é uma questão de vida ou morte.",
  era: "Apocalipse Pós-Viral (Ano 3 P.Z. — Pós-Zero)",
  difficulty: "Brutal",
  tags: ["Sci-Fi", "Zumbi", "Apocalipse", "Sobrevivência", "Pós-Viral"],
  bannerEmoji: "🧟",

  worldLorePrompt: `
Universo: Assentamento Ferrão, antiga base industrial em São Paulo, agora fortaleza-cidade murada com 12.000 sobreviventes no Ano 3 Pós-Zero.
Cultura: Sociedade militarizada de sobrevivência. Democracia de crise onde a autoridade do Governador depende de manter o povo vivo. Raças, classes e credos foram nivelados — o que importa é competência e comida.
Autoridade: O Governador possui poder de decreto sustentado pelo Conselho de Crise (3 líderes setoriais) e pela confiança popular. Pode ser deposto se a estabilidade social colapsar.
Recursos: Ouro = Créditos Ferrão (moeda interna baseada em horas de trabalho); Comida = Rações Diárias e Estoques dos Silos; População = Sobreviventes Ativos com capacidade de trabalho; Ordem = Moral e Coesão Social; Exército = Forças de Guarda e Milícia Armada.
Ameaças Externas: A Horda Leste (milhares de infectados), a Facção Escarlate (sobreviventes hostis armados), os Bandoleiros das Autopistas (saqueadores), e os Bunkers Cooperados (possíveis aliados isolacionistas).
Estilo Narrativo: Tenso, seco, cinematográfico, urgente. Personagens falam de forma direta, sem adornos medievais. Tom de drama pós-apocalíptico realista.
Terminologia: "Governador" em vez de "Majestade"; "setor" em vez de "província"; "rações" em vez de "celeiros"; "créditos" em vez de "moedas"; "guarda" em vez de "exército"; "estabilidade" em vez de "nobreza"; "conselho de crise" em vez de "corte".
`,

  initialState: {
    year: 3,
    month: 7,
    gold: 320,         // Créditos Ferrão
    food: 480,         // Rações (dias × pessoas)
    population: 12000, // Sobreviventes ativos
    stability: 55,     // Moral e coesão social
    military: 60,      // Força de guarda e defesa
    factions: {
      nobles: 10,      // Conselho Técnico e Lideranças
      merchants: 15,   // Comerciantes internos e trocadores
      clergy: 20,      // Cientistas e médicos (o "clero" desta era)
      peasants: -5,    // Trabalhadores dos setores e brigadas
      military: 30,    // Guarda e milícia
    },
    relations: {
      horda_leste: -90,
      faccao_escarlate: -45,
      bunkers_cooperados: 20,
      bandoleiros: -60,
    },
    laws: [
      "Toque de Recolher após as 22h",
      "Racionamento Nível 2 — 1800kcal/dia",
      "Quarentena Obrigatória de 72h para novos entrantes",
    ],
    flags: {
      muros_intactos: true,
      gerador_ativo: true,
      virus_mutando: false,
    },
    activeWars: [],
  },

  characters: {
    commander_drak: {
      id: "commander_drak",
      name: "Comandante Drak",
      role: "Chefe das Forças de Defesa",
      title: "Comandante Geral",
      loyalty: 70,
      influence: 75,
      alive: true,
      faction: "military",
      traits: ["Severo", "Pragmático", "Incansável"],
      avatar: "🪖",
    },
    dr_moreau: {
      id: "dr_moreau",
      name: "Dra. Elise Moreau",
      role: "Diretora Médica e Virologista",
      title: "Dra. Chefe do Laboratório",
      loyalty: 60,
      influence: 65,
      alive: true,
      faction: "clergy",
      traits: ["Brilhante", "Ética", "Exausta"],
      avatar: "🧬",
    },
    councilor_vera: {
      id: "councilor_vera",
      name: "Vera Salles",
      role: "Conselheira Política e Porta-voz",
      title: "Coordenadora do Conselho",
      loyalty: 55,
      influence: 60,
      alive: true,
      faction: "nobles",
      traits: ["Calculista", "Diplomata", "Ambiciosa"],
      avatar: "📋",
    },
    supply_chief: {
      id: "supply_chief",
      name: "Ronan Queiroz",
      role: "Coordenador de Suprimentos",
      title: "Chefe dos Silos e Logística",
      loyalty: 65,
      influence: 50,
      alive: true,
      faction: "merchants",
      traits: ["Metódico", "Honesto", "Sobrecarregado"],
      avatar: "📦",
    },
    scout_mira: {
      id: "scout_mira",
      name: "Mira Costa",
      role: "Líder dos Exploradores",
      title: "Batedor Chefe das Zonas Externas",
      loyalty: 75,
      influence: 45,
      alive: true,
      faction: "military",
      traits: ["Corajosa", "Leal", "Ferida"],
      avatar: "🏹",
    },
  },

  realms: {
    horda_leste: {
      id: "horda_leste",
      name: "Horda Leste",
      population: 50000,
      military: 90,
      wealth: 0,
      relation: -90,
      flags: { atWar: false, undead: true },
    },
    faccao_escarlate: {
      id: "faccao_escarlate",
      name: "Facção Escarlate",
      population: 3000,
      military: 55,
      wealth: 40,
      relation: -45,
      flags: { hostile: true },
    },
    bunkers_cooperados: {
      id: "bunkers_cooperados",
      name: "Bunkers Cooperados",
      population: 5500,
      military: 30,
      wealth: 55,
      relation: 20,
      flags: { allied: false },
    },
    bandoleiros: {
      id: "bandoleiros",
      name: "Bandoleiros das Autopistas",
      population: 800,
      military: 35,
      wealth: 25,
      relation: -60,
      flags: { hostile: true },
    },
  },

  events: [...zombieEvents],
};
