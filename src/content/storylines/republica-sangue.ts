// ============================================================================
// CENÁRIO: A REPÚBLICA DA GUILHOTINA — O COMITÊ DE SALVAÇÃO PÚBLICA
// ============================================================================

import { StorylineDefinition } from "./types";

export const republicaDeSangueStoryline: StorylineDefinition = {
  id: "republica_sangue",
  name: "A República da Guilhotina",
  era: "Revolução Popular & Terror Político",
  difficulty: "Desafiador",
  subtitle: "O Rei caiu. A guilhotina não dorme. Mantenha a República viva em meio à paranoia e aos exércitos das monarquias aliadas.",
  description: "Governe a Convenção Nacional durante o Terror Revolucionário de 1793.",
  bannerEmoji: "⚖️",
  tags: ["Revolução", "Tribunais Populares", "Paranoia", "Guerra Civil"],

  initialState: {
    year: 1793,
    month: 7, // O Mês do Termidor
    gold: 420,
    food: 460,
    population: 3200,
    stability: 35,
    military: 55,

    factions: {
      nobles: -70, // Nobres expatriados conspiram além da fronteira
      merchants: -20,
      clergy: -40, // Igreja desapropriada e hostil
      peasants: 45, // Plebe armada e vigilante
      military: 30, // Exército revolucionário inexperiente mas fanático
    },

    relations: {
      arvandor: -80, // Império vizinho em guerra de restauração monárquica
      eldoria: -60,
      khar_clans: 0,
    },

    flags: {
      tribunal_revolucionario_ativo: true,
      bloqueio_continental: true,
      lei_dos_suspeitos: true,
    },

    activeWars: ["Coalizão das Monarquias Antigas"],
    laws: [
      "Lei dos Suspeitos & Vigilância Cívica",
      "Confisco dos Bens dos Aristocratas Emigrados",
      "Tabelamento Máximo do Pão da Nação",
    ],
  },

  worldLorePrompt: `
CENÁRIO HISTÓRICO-NARRATIVO: A REPÚBLICA DA GUILHOTINA (ANO DE 1793)

O último rei absolutista foi julgado pela Convenção e perdeu a cabeça no cadafalso sob o rugido da multidão.
Agora, você não é um monarca de sangue azul, mas o Presidente do Comitê de Salvação Pública.
A sua autoridade vem do povo, mas o povo tem fome, e a fome alimenta a lâmina da guilhotina.

AS TRÊS FORÇAS MORTAIS QUE CERCAM O SEU GOVERNO:
1. A Invasão Estrangeira: Sete coroas absolutistas vizinhas declararam guerra total para esmagar a República e enforcar seus líderes.
2. A Paranoia Interna: Todo deputado desconfia do outro. Agentes monarquistas, contrabandistas e especuladores de trigo operam nas vielas.
3. A Fúria dos Bairros Pobres: Os "Sem-Calças" (sans-culottes) exigem medidas extremas, execuções diárias e fim da propriedade privada.

DIRETRIZ DA IA:
- Trate o jogador como líder de um regime sob estado de sítio extremo.
- O tom deve ser eletrizante, eloqüente, inflamado e tenso.
- As decisões carregam peso de vida e morte: condenar um suspeito pode salvar a cidade ou transformar um herói em mártir contra a República.
`,

  characters: {
    maximilien_inquisitor: {
      id: "maximilien_inquisitor",
      name: "Maximilien Valmont",
      title: "Promotor do Tribunal Revolucionário",
      role: "Conselheiro de Justiça",
      faction: "peasants",
      loyalty: 75,
      influence: 85,
      alive: true,
      traits: ["Incorruptível", "Fanático da Virtude", "Implacável"],
      avatar: "⚖️",
      appearance: "Roupas austeras de linho escuro, olhar penetrante e uma lista interminável de nomes marcada com cera vermelha.",
    },
    general_hoche: {
      id: "general_hoche",
      name: "General Victor Moreau",
      title: "Comandante dos Voluntários Nacionais",
      role: "Militar",
      faction: "military",
      loyalty: 60,
      influence: 70,
      alive: true,
      traits: ["Combatente Audaz", "Patriota", "Cético dos Políticos"],
      avatar: "⚔️",
      appearance: "Uniforme azul gasto da guarda cívica com insígnia tricolor e quepe emplumado manchado de pólvora.",
    },
    elise_journal: {
      id: "elise_journal",
      name: "Elise Laurent",
      title: "Editora da Gazeta do Povo",
      role: "Voz Pública",
      faction: "peasants",
      loyalty: 50,
      influence: 80,
      alive: true,
      traits: ["Eloquente", "Radical", "Vigilante das Massas"],
      avatar: "📰",
      appearance: "Manchas de tinta de impressão nos dedos, lenço vermelho ao pescoço e voz estrondosa que move multidões.",
    },
    baron_fouche: {
      id: "baron_fouche",
      name: "Gabriel Fouché",
      title: "Ministro da Polícia Secreta",
      role: "Espião-Chefe",
      faction: "nobles",
      loyalty: 40,
      influence: 65,
      alive: true,
      traits: ["Oportunista", "Silencioso", "Sobrevivente Cínico"],
      avatar: "🕵️",
      appearance: "Capa cinzenta forrada de seda, sorriso calculista que oculta os segredos mais podres da República.",
    },
  },

  realms: {
    arvandor: {
      id: "arvandor",
      name: "Sacro Império de Arvandor",
      population: 45000,
      military: 90,
      wealth: 85,
      relation: -85,
      flags: { holy_empire: true },
    },
    eldoria: {
      id: "eldoria",
      name: "Reino Marítimo de Eldoria",
      population: 32000,
      military: 70,
      wealth: 95,
      relation: -60,
      flags: { naval_blockade: true },
    },
  },

  events: [
    {
      id: "repub_evt_conspiracao_trigo",
      title: "Os Açambarcadores de Trigo & A Multidão em Fúria",
      description: "Uma multidão de três mil cidadãos armados com foices e fuzis invadiu o pátio da Convenção. Descobriram que comerciantes estocavam três mil sacas de grãos enquanto os bairros periféricos passam fome. O promotor Maximilien exige confisco imediato e decapitação sumária dos mercadores.",
      characterId: "maximilien_inquisitor",
      tags: ["revolucao", "crise_alimentos", "justica", "urgente"],
      weight: 100,
      choices: [
        {
          id: "repub_opt_guilhotina_trigo",
          label: "Decretar confisco integral e enviar os mercadores ao Tribunal",
          actions: [
            { type: "ADD_FOOD", amount: 200, reason: "Grãos distribuídos aos bairros famintos" },
            { type: "MODIFY_STABILITY", amount: 10, reason: "A multidão celebra a justiça do povo" },
            { type: "MODIFY_FACTION", faction: "peasants", amount: 25, reason: "Sans-culottes leais à liderança" },
            { type: "MODIFY_FACTION", faction: "nobles", amount: -20, reason: "Burguesia apavorada com a violência" },
          ],
        },
        {
          id: "repub_opt_comprar_trigo",
          label: "Pagar indenização simbólica aos mercadores e tabelar as vendas futuras",
          actions: [
            { type: "ADD_GOLD", amount: -120, reason: "Indenização do tesouro público" },
            { type: "ADD_FOOD", amount: 150, reason: "Grãos adquiridos legalmente" },
            { type: "MODIFY_FACTION", faction: "peasants", amount: -15, reason: "Críticas de tibieza e moderação" },
          ],
        },
      ],
    },
  ],
};
