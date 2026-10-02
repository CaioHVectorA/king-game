// ============================================================================
// CENÁRIO: O TRONO DE OSSOS & DEUSES MORTOS — DARK FANTASY CÓSMICA
// ============================================================================

import { StorylineDefinition } from "./types";

export const arcaniaTronoStoryline: StorylineDefinition = {
  id: "arcania_trono",
  name: "O Trono dos Deuses Mortos",
  era: "Alta Fantasia Sombria & Noite Eterna",
  difficulty: "Brutal",
  subtitle: "O Deus-Sol foi assassinado. A noite sem fim caiu sobre Arcania. A coroa consome a alma de quem a usa para manter a última chama acesa.",
  description: "Governe a cidadela mágica de Arcania enquanto a Noite Eterna devora o mundo.",
  bannerEmoji: "🔮",
  tags: ["Dark Fantasy", "Magia Proibida", "Sobrenatural", "Cultos Arcanos"],

  initialState: {
    year: 840,
    month: 11, // A Longa Noite
    gold: 380,
    food: 320,
    population: 2800,
    stability: 40,
    military: 60,

    factions: {
      nobles: -15, // Casas arcanas disputam fragmentos de luz estelar
      merchants: 10,
      clergy: 35, // Inquisição da Chama Sagrada desesperada
      peasants: -20, // Povo aterrorizado pelas aberrações da névoa
      military: 40, // Cavaleiros da Ordem do Eclipse
    },

    relations: {
      arvandor: -50,
      eldoria: 10,
      khar_clans: -70,
    },

    flags: {
      chama_primordial_acesa: true,
      nevoa_abissal_ativa: true,
      sacrificio_de_sangue_permitido: false,
    },

    activeWars: ["A Horda das Sombras Rastejantes"],
    laws: [
      "Vigília Perpétua das Fogueiras Urbanas",
      "Confisco de Relíquias Arcanas Não Registradas",
      "Pena de Morte por Necromancia Não Autorizada",
    ],
  },

  worldLorePrompt: `
CENÁRIO HISTÓRICO-NARRATIVO: O TRONO DOS DEUSES MORTOS (ERA DO ECLIPSE FINAL)

O grande Deus-Sol caiu do firmamento há três anos. Seu cadáver petrificado repousa na cordilheira ocidental, e o mundo mergulhou em um crepúsculo congelante e eterno.
Apenas a Cidadela de Arcania ainda brilha: no coração da sala do trono queima a "Chama Primordial", alimentada pelas almas e pelo sangue da linhagem reinante.

AS AMEAÇAS QUE COBRAM O SEU PREÇO:
1. A Névoa das Sombras: Criaturas que não conhecem a morte rastejam além das paliçadas. Sem fogueiras e archotes de prata, bairros inteiros enlouquecem.
2. A Ordem dos Inquisidores da Chama: Fanáticos puristas que exigem queimar qualquer curandeiro ou feiticeiro que use magia não consagrada.
3. A Coroa Parasita: Cada decreto de poder drena a vitalidade do governante. Quanto mais autoritário você se torna, mais frio fica seu próprio pulso.

DIRETRIZ DA IA:
- Atmosfera gótica, opressiva, poética e mística (estilo Dark Souls / Sunless Sea / Elden Ring).
- O governante lida com dilemas cósmicos: queimar heréticos para alimentar a chama ou permitir rituais proibidos para que os celeiros não congelem?
`,

  characters: {
    inquisitor_arcania: {
      id: "inquisitor_arcania",
      name: "Grão-Inquisidor Malakor",
      title: "Custódio da Chama Sagrada",
      role: "Conselheiro Religioso",
      faction: "clergy",
      loyalty: 70,
      influence: 85,
      alive: true,
      traits: ["Fanático", "Olhar de Brasas", "Inflexível"],
      avatar: "🔥",
      appearance: "Armadura de prata enegrecida pelo fogo sagrado, olhos vendados com seda ungida e um cetro em brasa permanente.",
    },
    witch_morgath: {
      id: "witch_morgath",
      name: "Senhora Vespera",
      title: "Arquivista do Círculo das Brumas",
      role: "Alquimista & Feiticeira da Corte",
      faction: "nobles",
      loyalty: 45,
      influence: 65,
      alive: true,
      traits: ["Enigmática", "Erudita Proibida", "Voz Serena"],
      avatar: "🔮",
      appearance: "Vestes de veludo roxo bordadas com constelações mortas. Seus dedos emanam um fulgor azulado e frio.",
    },
    commander_valen: {
      id: "commander_valen",
      name: "Lorde Valen da Vigília Negra",
      title: "Cavaleiro do Eclipse",
      role: "Militar Supremo",
      faction: "military",
      loyalty: 80,
      influence: 75,
      alive: true,
      traits: ["Leal até a Morte", "Cicatrizes Arcanas", "Silencioso"],
      avatar: "🗡️",
      appearance: "Capa pesada de pele de lobo das neves, espada longa de ferro meteórico e cicatrizes que brilham quando aberrações se aproximam.",
    },
  },

  realms: {
    eldoria: {
      id: "eldoria",
      name: "Arquipélago das Lanternas Flutuantes",
      population: 18000,
      military: 65,
      wealth: 80,
      relation: 20,
      flags: { maritime_sanctuary: true },
    },
    khar_clans: {
      id: "khar_clans",
      name: "Os Despertados do Abismo",
      population: 25000,
      military: 95,
      wealth: 20,
      relation: -90,
      flags: { shadow_horde: true },
    },
  },

  events: [
    {
      id: "arcania_evt_alimentar_chama",
      title: "O Estalar da Chama Primordial: O Tributo da Vida",
      description: "A grande fornalha na sala do trono começa a tremeluzir em tons de cinza. A temperatura nos salões despencou para congelamento súbito. O Grão-Inquisidor Malakor traz cinquenta prisioneiros condenados e oferece sacrificá-los para reacender o fogo sagrado. Senhora Vespera propõe usar um cristal proibido do abismo, correndo o risco de corromper a água dos aquedutos.",
      characterId: "inquisitor_arcania",
      tags: ["magia", "sacrificio", "crise_existencial", "urgente"],
      weight: 100,
      choices: [
        {
          id: "arcania_opt_sacrificio_sangue",
          label: "Autorizar o sacrifício dos condenados às chamas pelo bem de Arcania",
          actions: [
            { type: "MODIFY_STABILITY", amount: 15, reason: "A chama voltou a arder e o calor salvou a cidadela" },
            { type: "MODIFY_POPULATION", amount: -50, reason: "Vida dos condenados ceifada pelo fogo primordial" },
            { type: "MODIFY_FACTION", faction: "clergy", amount: 30, reason: "O Inquisidor agradece o zelo sagrado" },
            { type: "MODIFY_FACTION", faction: "peasants", amount: -25, reason: "Terror diante da fogueira humana" },
          ],
        },
        {
          id: "arcania_opt_cristal_proibido",
          label: "Alimentar a chama com o cristal arcano de Vespera, poupando as vidas",
          actions: [
            { type: "ADD_GOLD", amount: -80, reason: "Reagentes alquímicos para selar a emanação tóxica" },
            { type: "MODIFY_FACTION", faction: "nobles", amount: 20, reason: "Os eruditos comemoram o triunfo da ciência arcana" },
            { type: "MODIFY_FACTION", faction: "clergy", amount: -35, reason: "O clero denuncia a blasfêmia do trono" },
          ],
        },
      ],
    },
  ],
};
