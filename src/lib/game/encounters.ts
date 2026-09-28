import { Character, FactionName, GameChoice, GameEvent, KingdomState } from "@/types/game";
import {
  INITIAL_CHARACTERS,
  getActiveOrSuccessorCharacter,
  generateProceduralCharacter,
} from "./characters";

export type Encounter = {
  eventId: string;
  eventTitle: string;
  character: {
    id: string;
    name: string;
    title: string;
    role: string;
    faction?: FactionName;
    avatar: string;
    appearance: string;
  };
  dialogue: string;
  situation: string;
  choices: Array<{
    id: string;
    label: string;
    speechReply: string;
    intentDescription?: string;
  }>;
};

// Diálogos específicos, falas diretas e descrições físicas detalhadas de cada peticionário
const ENCOUNTER_DIALOGUES: Record<
  string,
  {
    name?: string;
    title?: string;
    role?: string;
    faction?: FactionName;
    avatar?: string;
    appearance?: string;
    dialogue: string;
  }
> = {
  drought_south: {
    name: "Elenor dos Vales",
    title: "Voz dos Lavradores",
    role: "Camponesa",
    faction: "peasants",
    avatar: "🌾",
    appearance:
      "Mulher jovem de rosto curtido pelo sol dos trigais e vestes de linho cinzento remendado. Traz poeira das estradas nas botas e segura um rosário de madeira com dedos calejados, sustentando vosso olhar com desespero contido e firmeza moral.",
    dialogue:
      "Majestade, a estiagem já dura quatro luas. Os poços do sul viraram lama e nossos filhos comem raízes. Rogamos que abra os celeiros da coroa ou suspenda os dízimos antes que o desespero tome conta de nossas vilas!",
  },
  famine_shortage: {
    name: "Intendente Aldous",
    title: "Mestre dos Celeiros Reais",
    role: "Conselheiro",
    faction: "merchants",
    avatar: "🍞",
    appearance:
      "Senhor corpulento e pálido, com anéis de prata nos dedos trêmulos e vestes de lã pesada com cheiro de mofo de armazém. Limpa constantemente o suor frio da testa com um lenço de linho enquanto folheia o inventário dos silos.",
    dialogue:
      "Soberano, a geada congelou os moinhos e o pão disparou cinco vezes de preço na capital. Tumultos começam nas praças. Se não importarmos alimentos com urgência ou impormos racionamento militar estrito, a turba invadirá os palácios.",
  },
  merchant_tax_protest: {
    name: "Mestre Alistair",
    title: "Porta-voz da Liga Mercante",
    role: "Comerciante",
    faction: "merchants",
    avatar: "💰",
    appearance:
      "Mercador próspero de cerca de quarenta anos, vestindo seda escura debruada a pelica de arminho. Exibe um sorriso cortês e calculado, com olhos penetrantes que avaliam o custo de cada segundo perdido perante o trono.",
    dialogue:
      "Meu Rei, as tarifas alfandegárias que vossos oficiais cobram nas docas estão sufocando as guildas. Navios já desviam para portos vizinhos. Concedei-nos isenção temporária ou o comércio deste reino cessará até o próximo solstício.",
  },
  peasant_revolt: {
    name: "Elenor dos Vales",
    title: "Líder dos Desesperados",
    role: "Camponesa",
    faction: "peasants",
    avatar: "🔥",
    dialogue:
      "Vossa Majestade nos ignorou enquanto morríamos de fome! Agora milhares marcham com foices e tochas contra as mansões dos barões. Não queremos palavras vazias: queremos pão e terras, ou o reino queimará!",
  },
  war_threat_arvandor: {
    name: "General Thorne",
    title: "Comandante das Legiões",
    role: "General",
    faction: "military",
    avatar: "⚔️",
    dialogue:
      "Majestade, estandartes de Arvandor marcham ao longo da fronteira leste. Seus batedores cruzaram nossos vales. Devemos mobilizar as legiões imediatamente para a guerra ou tentar subornar seus emissários com ouro do tesouro?",
  },
  peasant_petition_grain: {
    name: "Elenor dos Vales",
    title: "Voz dos Lavradores",
    role: "Camponesa",
    faction: "peasants",
    avatar: "🌾",
    dialogue:
      "Soberano, pedimos vossa clemência. As terras dos barões nos cobram até pela lenha caída. Concedei-nos permissão para caçar nas florestas reais e colher frutos da coroa para que nossas famílias sobrevivam ao inverno.",
  },
  noble_feud: {
    name: "Lorde Vane",
    title: "Chanceler da Coroa",
    role: "Chanceler",
    faction: "nobles",
    avatar: "👑",
    dialogue:
      "Meu Soberano, duas das mais ilustres casas nobres colocaram cavaleiros em campo para disputar uma rica mina de ferro na fronteira. O derramamento de sangue mancha vossa autoridade. Como a coroa irá arbitrar esta disputa?",
  },
  treasury_corruption: {
    name: "Auditor Kaelen",
    title: "Inspetor da Fazenda Real",
    role: "Magistrado",
    faction: "nobles",
    avatar: "⚖️",
    dialogue:
      "Majestade, descobri que altos barões da corte têm desviado quase um terço dos impostos arrecadados nas províncias. Se punirmos os culpados agora, a nobreza se ressentirá; se abafarmos o caso, nosso tesouro continuará sangrando.",
  },
  assassination_attempt: {
    name: "Capitão Valerius",
    title: "Chefe da Guarda do Palácio",
    role: "Capitão",
    faction: "military",
    avatar: "🗡️",
    dialogue:
      "Meu Senhor! Uma adaga envenenada foi encontrada na alcova real esta madrugada. O assassino escapou pelas ameias, mas traz consigo o selo de conspiradores da capital. Decretamos lei marcial ou reforçamos a guarda pessoal em silêncio?",
  },
  treaty_eldoria: {
    name: "Embaixador Silas",
    title: "Plenipotenciário de Eldoria",
    role: "Diplomata",
    faction: "merchants",
    avatar: "📜",
    dialogue:
      "Saudações em nome dos Magistrados de Eldoria, Soberano. Propomos um pacto comercial exclusivo com vossa dinastia: rotas marítimas protegidas e empréstimos vantajosos, em troca da redução de vossos impostos portuários.",
  },
  royal_marriage_proposal: {
    name: "Lorde Vane",
    title: "Chanceler da Coroa",
    role: "Chanceler",
    faction: "nobles",
    avatar: "💍",
    dialogue:
      "Majestade, a corte imperial enviou proposta formal de núpcias reais com vossa linhagem. O dote oferecido é vultoso e asseguraria paz entre nossos povos, embora alguns barões desconfiem das intenções estrangeiras.",
  },
  foreign_merchant_caravan: {
    name: "Caravaneiro Darius",
    title: "Líder da Grande Caravana do Oriente",
    role: "Comerciante",
    faction: "merchants",
    avatar: "🐫",
    dialogue:
      "Paz aos vossos salões, Nobre Soberano. Minha comitiva traz especiarias raras, aço dobrado e armas requintadas. Desejais negociar arsenais para vossas tropas ou taxar nosso trânsito com mão de ferro?",
  },
  khar_raiders_border: {
    name: "General Thorne",
    title: "Comandante das Legiões",
    role: "General",
    faction: "military",
    avatar: "🐎",
    dialogue:
      "Alerta na fronteira das estepes! Bandos nômades de Khar queimaram dois entrepostos e degolaram nossos sentinelas. Exijo permissão para uma retaliação rápida com cavalaria pesada antes que ganhem terreno!",
  },
  garrison_desertion: {
    name: "General Thorne",
    title: "Comandante das Legiões",
    role: "General",
    faction: "military",
    avatar: "⚔️",
    dialogue:
      "Trago notícias indignas, Majestade. Com o atraso no soldo, cinquenta lanceiros abandonaram as fortificações do desfiladeiro. Devemos pagar os atrasados para manter a moral ou executar os desertores como exemplo?",
  },
  capital_epidemic: {
    name: "Arcebispo Ignatius",
    title: "Guardião da Chama Sagrada",
    role: "Sacerdote",
    faction: "clergy",
    avatar: "🕊️",
    dialogue:
      "A ira divina caiu sobre a cidade baixa, Soberano! Pústulas negras cobrem os corpos e os sinos fúnebres não cessam de dobrar. Devemos isolar os portões da capital com tropas ou convocar procissões de oração pública?",
  },
  clerical_blessing: {
    name: "Arcebispo Ignatius",
    title: "Guardião da Chama Sagrada",
    role: "Sacerdote",
    faction: "clergy",
    avatar: "⛪",
    dialogue:
      "A Santa Sé prepara a consagração anual de vossa dinastia perante os fiéis. Esperamos que a coroa contribua com o dízimo extraordinário para o restauro das catedrais, garantindo a bênção dos céus sobre vosso reinado.",
  },
  noble_retaliation: {
    name: "Lorde Vane",
    title: "Chanceler da Coroa",
    role: "Chanceler",
    faction: "nobles",
    avatar: "👑",
    dialogue:
      "Os barões das províncias estão furiosos por terem sido forçados a pagar obras camponesas. Recusam-se a comparecer à corte enquanto vossa generosidade lhes custar ouro de suas próprias arcas.",
  },
  smuggler_den: {
    name: "Mestre Alistair",
    title: "Porta-voz da Liga Mercante",
    role: "Comerciante",
    faction: "merchants",
    avatar: "⚓",
    dialogue:
      "Contrabandistas tomaram as enseadas ao norte das docas. Vendem grãos e tecidos sem registrar imposto algum. Oferecemos anistia para legalizar o comércio ou enviamos a guarda para pendurá-los nos mastros?",
  },
  valoria_coronation_jubilee: {
    name: "Lorde Vane",
    title: "Chanceler da Coroa",
    role: "Chanceler",
    faction: "nobles",
    avatar: "👑",
    dialogue:
      "Majestade, os embaixadores das províncias lotam os salões de mármore para celebrar vosso jubileu. Como vosso reinado irá marcar esta data perante o povo e os barões?",
  },
  khar_siege_gate: {
    name: "General Thorne",
    title: "Comandante das Legiões",
    role: "General",
    faction: "military",
    avatar: "🛡️",
    dialogue:
      "As trombetas dos nômades ecoam no Desfiladeiro do Trovão! A horda cercou nossas muralhas com máquinas de arremesso e fogo. Pede-se vossa ordem: lideramos uma surtida sangrenta, contratamos lanceiros mercenários ou compramos a paz?",
  },
  scorched_earth_farms: {
    name: "General Thorne",
    title: "Comandante das Legiões",
    role: "General",
    faction: "military",
    avatar: "🔥",
    dialogue:
      "A vanguarda inimiga avança como gafanhotos pelas campinas. Se não queimarmos nossas próprias lavouras agora, eles se alimentarão de nossos grãos por meses. Autorizais a ordem de terra arrasada?",
  },
  plague_outbreak_dock: {
    name: "Mestre Aris",
    title: "Boticário Real",
    role: "Médico",
    faction: "clergy",
    avatar: "⚗️",
    dialogue:
      "Um galeão aportou com marinheiros delirantes e manchas roxas na pele! O contágio já saltou para as tavernas do cais. Se não queimarmos as docas ou erguermos um lazareto isolado, a peste devorará metade de Valoria em semanas!",
  },

  // Audiências Privadas Dedicadas com o Conselheiro Real (Mestre Morris)
  counselor_audience_state: {
    dialogue:
      "Vossa Majestade, pedi esta audiência a portas fechadas para apresentar o relatório estratégico do reino. Nossos cofres, celeiros e o humor das facções exigem vossa atenção direta antes que os descontentes conspirem nos corredores.",
    appearance:
      "Mestre Morris, conselheiro pessoal e confidencial da coroa, senta-se na mesa reservada de carvalho polido com documentos sigilosos do reino, fitando o soberano com lealdade serena e discernimento prudente.",
  },
  counselor_audience_crisis: {
    dialogue:
      "Majestade, fechei as portas da câmara do conselho em absoluto sigilo: nossos índices vitais atingiram um patamar crítico! Uma rebelião ou colapso é iminente se não agirdes com firmeza e sabedoria neste exato momento.",
    appearance:
      "Mestre Morris traz olheiras de vigília noturna e desdobra pergaminhos com mapas de contingência militar e financeira sobre a mesa real.",
  },
  counselor_audience_strategy: {
    dialogue:
      "Meu Soberano, é hora de definirdes a grande diretriz da dinastia para os próximos anos. Devemos priorizar a consolidação de leis e justiça, a expansão comercial ou a supremacia das legiões militares?",
    appearance:
      "O conselheiro real sustenta o selo de cera imperial e convida o soberano a uma reflexão profunda sobre o legado do trono perante a história.",
  },
};

const EVENT_DEFAULT_CHAR_ID: Record<string, string> = {
  drought_south: "elenor_peasant",
  famine_shortage: "guildmaster_kaelen",
  merchant_tax_protest: "merchant_alistair",
  peasant_revolt: "elenor_peasant",
  war_threat_arvandor: "general_thorne",
  peasant_petition_grain: "elenor_peasant",
  noble_feud: "chancellor_vane",
  treasury_corruption: "baron_lucian",
  assassination_attempt: "captain_valeria",
  treaty_eldoria: "merchant_alistair",
  royal_marriage_proposal: "chancellor_vane",
  foreign_merchant_caravan: "merchant_alistair",
  khar_raiders_border: "general_thorne",
  garrison_desertion: "general_thorne",
  capital_epidemic: "archbishop_ignatius",
  clerical_blessing: "archbishop_ignatius",
  noble_retaliation: "chancellor_vane",
  smuggler_den: "smuggler_bruno",
  valoria_coronation_jubilee: "chancellor_vane",
  khar_siege_gate: "general_thorne",
  scorched_earth_farms: "general_thorne",
  plague_outbreak_dock: "boticaria_miriam",
  counselor_audience_state: "counselor_morris",
  counselor_audience_crisis: "counselor_morris",
  counselor_audience_strategy: "counselor_morris",
};

/**
 * Converte um rótulo de ação em fala direta do rei em resposta ao peticionário
 */
function toRoyalSpeech(label: string): string {
  let speech = label.trim();
  // Se começar com verbo no infinitivo, transforma em comando soberano
  const replacements: Array<[RegExp, string]> = [
    [/^Abrir\b/i, "Abram"],
    [/^Enviar\b/i, "Enviem"],
    [/^Comprar\b/i, "Comprem"],
    [/^Obrigar\b/i, "Obriguem"],
    [/^Ignorar\b/i, "Ignorem"],
    [/^Conceder\b/i, "Concedam"],
    [/^Prender\b/i, "Prendam"],
    [/^Negociar\b/i, "Negociem"],
    [/^Esmagar\b/i, "Esmaguem"],
    [/^Perdoar\b/i, "Perdoem"],
    [/^Mobilizar\b/i, "Mobilizem"],
    [/^Subornar\b/i, "Subornem"],
    [/^Rejeitar\b/i, "Rejeitem"],
    [/^Confiscar\b/i, "Confisquem"],
    [/^Favorecer\b/i, "Favoreçam"],
    [/^Expurgar\b/i, "Expurguem"],
    [/^Abafar\b/i, "Abafe-se"],
    [/^Decretar\b/i, "Decreto"],
    [/^Reforçar\b/i, "Reforcem"],
    [/^Assinar\b/i, "Assinem"],
    [/^Aceitar\b/i, "Aceito"],
    [/^Recusar\b/i, "Recuso"],
    [/^Taxar\b/i, "Taxem"],
    [/^Contra-atacar\b/i, "Contra-ataquem"],
    [/^Construir\b/i, "Construam"],
    [/^Pagar\b/i, "Paguem"],
    [/^Dizimar\b/i, "Dizimem"],
    [/^Isolar\b/i, "Isolem"],
    [/^Orar\b/i, "Orem"],
    [/^Entregar\b/i, "Entreguem"],
    [/^Promover\b/i, "Promovam"],
    [/^Celebrar\b/i, "Celebrem"],
    [/^Liderar\b/i, "Liderem"],
    [/^Incendiar\b/i, "Incendeiem"],
    [/^Enforcar\b/i, "Enforquem"],
  ];

  for (const [regex, replacement] of replacements) {
    if (regex.test(speech)) {
      speech = speech.replace(regex, replacement);
      break;
    }
  }

  // Adiciona pontuação final se não houver
  if (!/[.!?]$/.test(speech)) {
    speech += ".";
  }

  return speech;
}

/**
 * Resolve qualquer evento do jogo em um Encontro Pessoal vivo com diálogo e peticionário
 */
export function resolveEncounter(event: GameEvent, state: KingdomState): Encounter {
  const custom = ENCOUNTER_DIALOGUES[event.id];

  // 1. Identifica o personagem do encontro garantindo que personagens mortos nunca ressurjam
  const targetCharId = event.characterId || EVENT_DEFAULT_CHAR_ID[event.id];
  let activeChar: Character | null = null;

  if (targetCharId) {
    // getActiveOrSuccessorCharacter garante que se o personagem foi morto/executado,
    // o seu sucessor (ex: Thomas dos Vales ou Capitã Valéria) assuma o seu lugar
    activeChar = getActiveOrSuccessorCharacter(targetCharId, state);
  }

  // Se não houver personagem associado, gera um procedural ou obtém um vivo correspondente
  if (!activeChar) {
    const tags = event.tags || [];
    let faction: FactionName = "nobles";
    let baseRole = "Peticionário Nobre";
    if (tags.includes("militar") || tags.includes("guerra")) {
      faction = "military";
      baseRole = "Oficial das Legiões";
    } else if (tags.includes("camponeses") || tags.includes("comida")) {
      faction = "peasants";
      baseRole = "Representante Lavrador";
    } else if (tags.includes("comerciantes") || tags.includes("economia") || tags.includes("ouro")) {
      faction = "merchants";
      baseRole = "Delegado Mercantil";
    } else if (tags.includes("clero") || tags.includes("religião") || tags.includes("peste")) {
      faction = "clergy";
      baseRole = "Sacerdote";
    }
    activeChar = generateProceduralCharacter(faction, baseRole, state);
  }

  const charId = activeChar.id;
  const charName = activeChar.name;
  const charTitle = activeChar.title || activeChar.role;
  const charRole = activeChar.role;
  const charFaction = activeChar.faction;
  const charAvatar = activeChar.avatar || "👤";

  const isSuccessor = targetCharId && activeChar.id !== targetCharId;
  const isCounselor = activeChar.role === "Conselheiro Real" || activeChar.id === "counselor_morris";

  // 2. Descrição física detalhada do peticionário
  const isZombie = state.storylineId === "zombie_apocalypse";
  const isSciFi = state.storylineId === "colony_exodus";

  let appearance = custom?.appearance;
  if (isCounselor && !isZombie && !isSciFi) {
    appearance =
      "Mestre Morris, conselheiro de vossa inteira confiança, senta-se na mesa reservada de carvalho polido com documentos sigilosos do reino e vos fita com prudência serena.";
  } else if (isSuccessor) {
    appearance = `Assumiu a liderança após a queda trágica de seu antecessor. Seus traços revelam: ${activeChar.traits.join(", ")}. Olha nos olhos do líder com cautela afiada e respeito solene.`;
  } else if (!appearance) {
    if (isZombie) {
      if (charRole.includes("Defesa") || charRole.includes("Militar") || charFaction === "military") {
        appearance =
          "Oficial tático em colete balístico camuflado, rádio comunicador no ombro e coldre de prontidão. Seus olhos atentos e postura vigilante refletem anos de sobrevivência contra as hordas.";
      } else if (charRole.includes("Médic") || charRole.includes("Virolog") || charFaction === "clergy") {
        appearance =
          "Cientista em jaleco de laboratório reforçado sobre roupas de campo, trazendo pasta com laudos biológicos e estojos herméticos para amostras virais.";
      } else if (charRole.includes("Suprimentos") || charFaction === "merchants") {
        appearance =
          "Coordenador de logística com prancheta de controle de rações e combustível, calculando meticulosamente a contagem de cada lote do assentamento.";
      } else if (charRole.includes("Batedor") || charRole.includes("Explorador")) {
        appearance =
          "Batedor em roupas de couro resistentes a mordidas e botas de trilha, com mapas das zonas de exclusão e olhar afiado de quem conhece as ruas em ruínas.";
      } else {
        appearance =
          "Sobrevivente do assentamento com marcas de esforço e poeira urbana nas roupas, encarando o posto de comando com determinação e apreensão pela colônia.";
      }
    } else if (isSciFi) {
      if (charRole.includes("Militar") || charFaction === "military") {
        appearance =
          "Oficial de segurança em traje tático pressurizado com insígnias corporativas e visor HUD holográfico indicando prontidão armada.";
      } else {
        appearance =
          "Engenheiro da estação com macacão operacional e terminais de dados acoplados ao antebraço, monitorando alertas de pressão e fluxo de energia.";
      }
    } else {
      // Medieval Clássico
      if (charRole === "General" || charFaction === "military") {
        appearance =
          "Guerreiro de compleição robusta vestindo cota de malha polida sob manto escuro da guarda. Traz a mão pousada no pomo de uma espada pesada e uma cicatriz de flecha no supercílio, fitando o soberano com disciplina rígida e urgência militar.";
      } else if (charRole === "Camponesa" || charFaction === "peasants") {
        appearance =
          "Mulher de semblante cansado e túnica de linho cru com remendos nos cotovelos. Aperta as mãos calejadas pelo trabalho no campo contra o peito, demonstrando respeito reverente misturado à aflição por sua gente.";
      } else if (charRole === "Comerciante" || charFaction === "merchants") {
        appearance =
          "Mercador de feições finas vestindo lã bordada e anéis de prata nas mãos cuidadas. Segura um rolo de contratos alfandegários selados com cera e mede cada segundo com cálculo silencioso perante o trono.";
      } else if (charRole === "Sacerdote" || charFaction === "clergy") {
        appearance =
          "Religioso de batina escura pesada com cheiro de mirra e incenso. Traz um relicário no peito e mantém as mãos postas com austeridade, encarando a sala com a autoridade moral de quem fala em nome dos céus.";
      } else {
        appearance =
          "Cortesão de meia-idade com postura impecável e manto nobre com fecho de brasão. Seus olhos analisam a sala do trono com perspicácia política e elegância calculada.";
      }
    }
  }

  // 3. Diálogo do peticionário direcionado ao líder
  const cleanDesc = event.description.replace(/^"|"$/g, "");
  let dialogue = custom?.dialogue;
  if (!dialogue) {
    if (isZombie) {
      dialogue = cleanDesc.startsWith("Governador") || cleanDesc.startsWith("'Governador")
        ? cleanDesc
        : `"Governador: ${cleanDesc}"`;
    } else if (isSciFi) {
      dialogue = cleanDesc.startsWith("Diretor")
        ? cleanDesc
        : `"Diretor: ${cleanDesc}"`;
    } else {
      dialogue = `"Majestade: ${cleanDesc} Esperamos vossa palavra para agir."`;
    }
  }

  if (isSuccessor) {
    dialogue = `"[Após o fim de meu antecessor, assumo a palavra diante do trono]: ${dialogue.replace(/Elenor|Thorne|Vane|Alistair|Ignatius/gi, charName)}"`;
  }

  // 4. Opções convertidas em respostas diretas do monarca
  const choices = event.choices.map((choice) => ({
    id: choice.id,
    label: choice.label,
    speechReply: toRoyalSpeech(choice.label),
    intentDescription: choice.intentDescription,
  }));

  return {
    eventId: event.id,
    eventTitle: event.title,
    character: {
      id: charId,
      name: charName,
      title: charTitle,
      role: charRole,
      faction: charFaction,
      avatar: charAvatar,
      appearance,
    },
    dialogue,
    situation: event.description,
    choices,
  };
}
