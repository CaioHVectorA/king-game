import { KingdomPrologue, Ruler } from "@/types/game";
import { PRNG } from "./rng";

interface GeneratePrologueParams {
  storylineId: string;
  ruler: Ruler;
  kingdomName: string;
  seed: number;
}

export function generateSeededPrologue({
  storylineId,
  ruler,
  kingdomName,
  seed,
}: GeneratePrologueParams): KingdomPrologue {
  const prng = new PRNG(seed);

  const customOrigin = ruler.origin ? `Ascensão como ${ruler.origin}. ` : "";
  const customArchetype = ruler.archetype ? `Perfil governante: ${ruler.archetype}. ` : "";
  const customIntent = ruler.personalIntent ? `Juramento íntimo: "${ruler.personalIntent}". ` : "";
  const customContext = `${customOrigin}${customArchetype}${customIntent}`.trim();

  if (storylineId === "colony_exodus") {
    const predecessors = [
      { name: "Diretor Chen Zhao", relation: "O antigo Comandante de Bordo", cause: "Pereceu durante a descompressão catastrófica do Hangar Beta no setor de atracação." },
      { name: "Superintendente Marcus Vance", relation: "Vosso predecessor técnico", cause: "Foi destituído por motim civil após tentar desligar os filtros dos decks inferiores." },
      { name: "Dra. Helena Cross", relation: "A Fundadora da Estação", cause: "Morreu de envenenamento por radiação cósmica durante o conserto da cúpula estelar." },
    ];
    const pred = prng.pickOne(predecessors);

    const variations = [
      "Uma tempestade de micro-meteoritos abriu fissuras nos coletores solares externos, forçando uso contínuo de baterias.",
      "A frota de sucateiros do cinturão interceptou uma transmissão cifrada entre nossos decks inferiores e piratas cósmicos.",
      "A câmara criogênica 07 apresentou anomalia térmica, exigindo racionamento emergencial de glicose sintética.",
    ];
    const variation = prng.pickOne(variations);

    const whispers = [
      "Operários do nível inferior murmuram sobre uma greve geral de oxigênio se a ração diária cair mais uma vez.",
      "Dizem que o Conselho Corporativo escondeu três cápsulas de escape exclusivas para a elite científica.",
      "A I.A. central registrou picos não autorizados de consumo nos condensadores de plasma durante o último ciclo.",
    ];
    const whisper = prng.pickOne(whispers);

    const baseRep = customContext || "Líder técnico selecionado pelo conselho para preservar a última centelha da civilização humana.";

    return {
      rulerTitle: ruler.title,
      rulerName: ruler.name,
      dynasty: ruler.dynasty,
      age: ruler.age,
      traits: ruler.traits,
      reputation: baseRep,
      predecessorName: pred.name,
      predecessorRelation: pred.relation,
      ascensionCircumstance: pred.cause,
      recentEvents: [
        "A Terra perdeu os últimos sinais de comunicação de rádio de longo alcance.",
        "O Reator Primário completou quinhentos ciclos de queima contínua sem manutenção pesada.",
        "A comitiva dos sindicatos operários exige audiência imediata na ponte de comando.",
      ],
      initialCrisis: "Sarah Vance relata que as bobinas magnéticas do Reator de Plasma entraram em oscilação crítica.",
      courtWhisper: whisper,
      proceduralVariation: variation,
    };
  }

  if (storylineId === "zombie_apocalypse") {
    const predecessors = [
      { name: "Coronel Marcus Webb", relation: "O comandante anterior do Bastião", cause: "Pereceu soterrado no colapso da muralha norte durante a Grande Investida do Mês Três." },
      { name: "Dra. Elaine Frost", relation: "A liderança civil eleita", cause: "Foi devorada durante a evacuação do Setor D quando o cordão de segurança cedeu." },
      { name: "Sargento Hicks", relation: "Seu predecessor na linha de frente", cause: "Morreu de infecção por mordida enquanto carregava civis feridos para o hospital de campanha." },
    ];
    const pred = prng.pickOne(predecessors);

    const variations = [
      "Os geradores do Bastião só têm combustível para mais três semanas de operação contínua.",
      "Uma manada de infectados concentrou-se na periferia leste, bloqueando a rota de abastecimento do armazém externo.",
      "O rádio captou uma transmissão fraca alegando que um laboratório ao sul possui amostras do antídoto.",
    ];
    const variation = prng.pickOne(variations);

    const whispers = [
      "Os civis do setor C começam a questionar se as rações estão sendo distribuídas de forma justa entre militares e famílias.",
      "Rumores afirmam que um grupo de sobreviventes no perímetro externo está prestes a atacar os portões para entrar à força.",
      "Os médicos do campo avisam em voz baixa que os suprimentos de antibióticos durarão no máximo dois meses.",
    ];
    const whisper = prng.pickOne(whispers);

    const baseRep = customContext || "Sobrevivente endurecido que emergiu do caos como a única liderança capaz de manter os portões fechados.";

    return {
      rulerTitle: ruler.title,
      rulerName: ruler.name,
      dynasty: ruler.dynasty,
      age: ruler.age,
      traits: ruler.traits,
      reputation: baseRep,
      predecessorName: pred.name,
      predecessorRelation: pred.relation,
      ascensionCircumstance: pred.cause,
      recentEvents: [
        "Um comboio de suprimentos médicos foi interceptado por saqueadores a quinze quilômetros do Bastião.",
        "A população interna ultrapassou a capacidade projetada em trinta por cento após o êxodo do Setor F.",
        "O laboratório de análise detectou uma nova mutação nos infectados: agilidade aumentada em ambientes fechados.",
      ],
      initialCrisis: "A equipe de guarda reporta uma concentração de mais de trezentos infectados convergindo para o portão sul.",
      courtWhisper: whisper,
      proceduralVariation: variation,
    };
  }

  if (storylineId === "rio_zombie") {
    const predecessors = [
      { name: "Capitão Hélio Duarte", relation: "O primeiro líder da Urca", cause: "Morreu na barricada da Praia Vermelha durante a primeira noite da Queda dos Portões, sacrificando-se para salvar setenta civis." },
      { name: "Vereadora Cláudia Mendes", relation: "A liderança civil eleita antes do colapso", cause: "Sumiu durante a evacuação do Aterro do Flamengo. O rádio nunca mais a encontrou." },
      { name: "Tenente Rocha", relation: "Seu antecessor direto no comando", cause: "Infectado por um Estalador Alfa durante a Operação Purga no Leme. Teve de ser executado pelos próprios soldados." },
    ];
    const pred = prng.pickOne(predecessors);

    const variations = [
      "Uma chuva torrencial inundou o túnel de acesso à Zona Sul, bloqueando a rota de abastecimento do depósito de São Conrado.",
      "O rádio AM captou uma transmissão criptografada da base naval de Niterói: parecem ter combustível e médicos, mas ninguém respondeu ao chamado.",
      "Os Estaladores estão mudando de padrão — aparecem cada vez mais de madrugada, em grupos menores e mais coordenados.",
    ];
    const variation = prng.pickOne(variations);

    const whispers = [
      "As famílias das favelas da Babilônia dizem que a Milícia da Linha Vermelha está recrutando crianças para usar como batedores nos bloqueios.",
      "Zé do Porto ouviu no rádio pirata que há um depósito intacto de suprimentos hospitalares enterrado sob o estádio do Flamengo.",
      "Os pescadores da Urca juram que viram luzes se movendo pelas ruínas do Rio de Nuit — pode ser um grupo sobrevivente ou pode ser armadilha.",
    ];
    const whisper = prng.pickOne(whispers);

    const baseRep = customContext || "Ex-operador do BOPE que emergiu da ruína como o único capaz de manter vivos os quatro mil e quinhentos sobreviventes da Urca.";

    return {
      rulerTitle: ruler.title,
      rulerName: ruler.name,
      dynasty: ruler.dynasty,
      age: ruler.age,
      traits: ruler.traits,
      reputation: baseRep,
      predecessorName: pred.name,
      predecessorRelation: pred.relation,
      ascensionCircumstance: pred.cause,
      recentEvents: [
        "A patrulha da Barricada Norte encontrou marcas de garras nas vigas de aço do portão — os Estaladores estão aprendendo a escalar.",
        "O depósito de munição 7.62 está em quarenta por cento da capacidade. Os fuzis guardam o silêncio do racionamento.",
        "Tainá da Tijuca chegou com trinta e dois novos sobreviventes do morro — famílias, crianças, dois médicos. O portão está superlotado.",
      ],
      initialCrisis: "Capitão Brás entra no posto de comando vermelho de fuligem: 'Comandante, a horda do Aterro dobrou de tamanho essa madrugada e está empurrando para a nossa barricada da praia.'",
      courtWhisper: whisper,
      proceduralVariation: variation,
    };
  }

  if (storylineId === "khar_invasion") {
    const predecessors = [
      { name: "Rei Alden I", relation: "O antigo Rei", cause: "Pereceu quando a fortaleza do norte ruiu no primeiro ataque da Horda." },
      { name: "Grão-Marechal Kaelen", relation: "Vosso predecessor militar", cause: "Foi emboscado pela cavalaria inimiga no desfiladeiro cinzento." },
      { name: "Lorde Regente Brandon", relation: "O Regente da Fronteira", cause: "Faleceu de exaustão organizando o êxodo de dez mil camponeses." },
    ];
    const pred = prng.pickOne(predecessors);

    const variations = [
      "O inverno foi seco e o grande rio congelou, permitindo que a cavalaria de Khar cruzasse sem resistência.",
      "Espiões capturados nas estepes revelaram que o Grande Khan jurou erguer uma montanha com os crânios dos nobres de Valoria.",
      "As minas de ferro do oeste sofreram um colapso, limitando a forja de novas couraças para a infantaria.",
    ];
    const variation = prng.pickOne(variations);

    const whispers = [
      "Dizem que há barões da corte negociando secretamente a rendição de seus feudos com emissários da Horda.",
      "Os soldados veteranos confiam em vossa mão de ferro, mas os recrutas temem o som dos tambores nômades à noite.",
      "Há quem afirme que a Horda só avança porque sabe que nossos celeiros estão combalidos.",
    ];
    const whisper = prng.pickOne(whispers);

    const baseRep = customContext || "Veterano implacável que subiu ao comando pelo respeito cego das legiões.";

    return {
      rulerTitle: ruler.title,
      rulerName: ruler.name,
      dynasty: ruler.dynasty,
      age: ruler.age,
      traits: ruler.traits,
      reputation: baseRep,
      predecessorName: pred.name,
      predecessorRelation: pred.relation,
      ascensionCircumstance: pred.cause,
      recentEvents: [
        "A vanguarda de cem mil cavaleiros de Khar rompeu as paliçadas externas.",
        "Refugiados do norte lotam as praças da capital clamando por proteção ou armas.",
        "As rotas comerciais com Eldoria foram cortadas por incursores a cavalo.",
      ],
      initialCrisis: "As sentinelas relatam que as trombetas da Horda cercaram o Desfiladeiro do Trovão.",
      courtWhisper: whisper,
      proceduralVariation: variation,
    };
  }

  if (storylineId === "dark_plague") {
    const predecessors = [
      { name: "Rei Valerius III", relation: "Vosso antecessor", cause: "Sucumbiu às primeiras manchas negras da peste em seu leito de veludo." },
      { name: "Príncipe Herdeiro Dorian", relation: "O jovem herdeiro", cause: "Faleceu antes da coroação; a Sé sagrada vos proclamou Regente Protetor." },
      { name: "Rainha Beatrice", relation: "Vossa tia reinante", cause: "Enlouqueceu após ver a corte morrer ao seu redor e trancou-se na cripta real." },
    ];
    const pred = prng.pickOne(predecessors);

    const variations = [
      "A peste começou após a chegada de um navio mercante sem bandeira à baía sul.",
      "A Inquisição queimou os primeiros boticários da capital sob acusação de feitiçaria e envenenamento dos poços.",
      "Uma chuva contínua de outono apodreceu as colheitas nos campos e multiplicou as ratazanas nas vielas.",
    ];
    const variation = prng.pickOne(variations);

    const whispers = [
      "Os coveiros ameaçam parar de recolher os cadáveres se não receberem o dobro do ouro.",
      "O Arcebispo afirma que a peste é castigo pelo luxo dos nobres e exige o fechamento dos teatros e feiras.",
      "Médicos estrangeiros dizem ter descoberto um filtro de ervas, mas os sacerdotes o proíbem como heresia.",
    ];
    const whisper = prng.pickOne(whispers);

    const baseRep = customContext || "Governante austero cuja tarefa não é expandir o império, mas impedir que ele seja extinto.";

    return {
      rulerTitle: ruler.title,
      rulerName: ruler.name,
      dynasty: ruler.dynasty,
      age: ruler.age,
      traits: ruler.traits,
      reputation: baseRep,
      predecessorName: pred.name,
      predecessorRelation: pred.relation,
      ascensionCircumstance: pred.cause,
      recentEvents: [
        "Metade da guarnição do porto deserdou após os primeiros infectados cuspirem sangue.",
        "A fumaça das piras funerárias cobre o céu da capital dia e noite.",
        "Famílias nobres abandonaram seus palacetes rumo a feudos isolados nas montanhas.",
      ],
      initialCrisis: "Um galeão infectado quebrou a quarentena e aportou no cais principal da cidade.",
      courtWhisper: whisper,
      proceduralVariation: variation,
    };
  }

  // Padrão: Valoria Clássico
  const predecessors = [
    { name: "Rei Alden I", relation: "Vosso pai", cause: "Faleceu pacificamente durante o sono aos 62 anos, deixando uma dinastia respeitada." },
    { name: "Rei Cedric, o Severo", relation: "Vosso tio", cause: "Morreu de febre repentina após caçar nos pântanos do oeste; a sucessão foi disputada." },
    { name: "Rei Edmund II", relation: "Vosso predecessor", cause: "Caiu do corcel real durante um torneio cerimonial, gerando comoção em toda a corte." },
  ];
  const pred = prng.pickOne(predecessors);

  const variations = [
    "A colheita de cevada nas províncias do sul sofreu com uma estiagem precoce no início da estação.",
    "A Liga Mercante de Eldoria enviou uma delegação suntuosa exigindo a renegociação das taxas alfandegárias.",
    "Dois barões de linhagem antiga rivalizam pelo controle da rica mina de ferro de Oakhaven.",
  ];
  const variation = prng.pickOne(variations);

  const whispers = [
    "Dizem que Lorde Vane, o Chanceler, financiou secretamente a eleição do novo Arcebispo.",
    "Os lavradores acreditam que um novo rei trará justiça contra as cobranças abusivas dos senhores de terras.",
    "Os cofres reais têm reservas suficientes para a paz, mas não suportariam um cerco de seis luas.",
  ];
  const whisper = prng.pickOne(whispers);

  const baseRep = customContext || "Educado desde a infância nos salões de mármore para equilibrar o orgulho nobre e a ambição das guildas.";

  return {
    rulerTitle: ruler.title,
    rulerName: ruler.name,
    dynasty: ruler.dynasty,
    age: ruler.age,
    traits: ruler.traits,
    reputation: baseRep,
    predecessorName: pred.name,
    predecessorRelation: pred.relation,
    ascensionCircumstance: pred.cause,
    recentEvents: [
      "A cerimônia solene de coroação na Sé Sagrada reuniu barões de todas as províncias.",
      "As guildas artesãs ofereceram presentes de seda e prata em troca de proteção comercial.",
      "O conselho da coroa jurou lealdade perante a espada ancestral da dinastia.",
    ],
    initialCrisis: "Emissários do povo e das guildas aguardam ansiosos na antecâmara para a primeira audiência do novo reinado.",
    courtWhisper: whisper,
    proceduralVariation: variation,
  };
}
