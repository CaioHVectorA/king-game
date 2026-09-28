import { KingdomState } from "@/types/game";
import { getStoryline } from "@/content/storylines";

export type MetricFeeling = {
  label: string;
  icon?: string;
  feeling: string;
  description: string;
  exactValue: number | string;
  percentage: number;
  level: "good" | "neutral" | "warning" | "danger";
};

export function getKingdomFeelings(state: KingdomState): {
  treasury: MetricFeeling;
  food: MetricFeeling;
  population: MetricFeeling;
  stability: MetricFeeling;
  military: MetricFeeling;
} {
  const storyline = getStoryline(state.storylineId);
  const labels = storyline.resourceLabels;
  const isRioZombie = state.storylineId === "rio_zombie";
  const isZombieSp = state.storylineId === "zombie_apocalypse";
  const isSciFi = state.storylineId === "colony_exodus";

  // 1. RECURSO PRIMÁRIO (Ouro / Munição / Créditos)
  const goldPct = Math.max(0, Math.min(100, Math.round((state.gold / 600) * 100)));
  const goldName = labels?.gold.name || (isRioZombie ? "Munição & Sucata" : isZombieSp ? "Créditos Ferrão" : isSciFi ? "Créditos & Energia" : "Tesouro");
  const goldIcon = labels?.gold.icon || (isRioZombie ? "🪙" : isZombieSp ? "🔋" : isSciFi ? "⚡" : "💰");
  const goldUnit = labels?.gold.unit || (isRioZombie ? "cartuchos" : isZombieSp ? "créditos" : "moedas");

  let treasuryFeeling: MetricFeeling;
  if (state.gold >= 450) {
    treasuryFeeling = {
      label: goldName,
      icon: goldIcon,
      feeling: isRioZombie ? "Arsenal Farto" : isZombieSp ? "Reservas Cheias" : isSciFi ? "Energia Estável" : "Cofres Fartos",
      description: isRioZombie
        ? "Caixas de cartuchos 7.62mm e peças mecânicas sobram nos depósitos da praia."
        : isZombieSp
        ? "Baterias carregadas e créditos abundantes para financiar expedições e obras."
        : "O tesouro da corte transborda com arcas cheias de tributos recolhidos.",
      exactValue: `${state.gold} ${goldUnit}`,
      percentage: goldPct,
      level: "good",
    };
  } else if (state.gold >= 180) {
    treasuryFeeling = {
      label: goldName,
      icon: goldIcon,
      feeling: isRioZombie ? "Munição Estável" : isZombieSp ? "Fluxo Regular" : isSciFi ? "Energia Operacional" : "Cofres Estáveis",
      description: isRioZombie
        ? "Reserva suficiente para sustentar semanas de defesa e trocas com Paquetá."
        : isZombieSp
        ? "A circulação de créditos cobre a manutenção dos portões e equipamentos."
        : "A arrecadação cobre as despesas do reino com regularidade.",
      exactValue: `${state.gold} ${goldUnit}`,
      percentage: goldPct,
      level: "neutral",
    };
  } else if (state.gold >= 60) {
    treasuryFeeling = {
      label: goldName,
      icon: goldIcon,
      feeling: isRioZombie ? "Cartuchos Racionados" : isZombieSp ? "Energia Crítica" : isSciFi ? "Baterias Baixas" : "Tesouro Escasso",
      description: isRioZombie
        ? "Cada disparo deve ser justificado aos sargentos; cartuchos contados um a um."
        : isZombieSp
        ? "Quedas de luz nos setores externos forçam racionamento nos laboratórios."
        : "A moeda circula com dificuldade e os cofres começam a esvaziar.",
      exactValue: `${state.gold} ${goldUnit}`,
      percentage: goldPct,
      level: "warning",
    };
  } else {
    treasuryFeeling = {
      label: goldName,
      icon: goldIcon,
      feeling: isRioZombie ? "Sem Pólvora / Desarmado" : isZombieSp ? "Apagão de Recursos" : isSciFi ? "Falha Energética" : "Cofres Falidos",
      description: isRioZombie
        ? "Munição quase zerada; sentinelas apelam para facas e paus contra infectados."
        : isZombieSp
        ? "Sem créditos ou energia; geradores parados e sistemas em colapso iminente."
        : "O reino está insolvente e sem ouro para pagar ministros e guarnições.",
      exactValue: `${state.gold} ${goldUnit}`,
      percentage: goldPct,
      level: "danger",
    };
  }

  // 2. ALIMENTAÇÃO / RAÇÕES (Comida / Peixes / Oxigênio)
  const foodPct = Math.max(0, Math.min(100, Math.round((state.food / 600) * 100)));
  const foodName = labels?.food.name || (isRioZombie ? "Peixes & Ração" : isZombieSp ? "Rações dos Silos" : isSciFi ? "Oxigênio & Ração" : "Celeiros");
  const foodIcon = labels?.food.icon || (isRioZombie ? "🐟" : isZombieSp ? "🍞" : isSciFi ? "🌱" : "🌾");
  const foodUnit = labels?.food.unit || (isRioZombie ? "rações" : isZombieSp ? "rações" : "sacas");

  let foodFeeling: MetricFeeling;
  if (state.food >= 450) {
    foodFeeling = {
      label: foodName,
      icon: foodIcon,
      feeling: isRioZombie ? "Refeitório Farto" : isZombieSp ? "Silos Plenos" : isSciFi ? "Síntese Abundante" : "Celeiros Cheios",
      description: isRioZombie
        ? "Redes puxadas da baía trouxeram peixes gordos e conservas para meses."
        : isZombieSp
        ? "Os silos estocam grãos desidratados suficientes para o inverno da colônia."
        : "As colheitas foram generosas e os celeiros reais estão abastecidos.",
      exactValue: `${state.food} ${foodUnit}`,
      percentage: foodPct,
      level: "good",
    };
  } else if (state.food >= 180) {
    foodFeeling = {
      label: foodName,
      icon: foodIcon,
      feeling: isRioZombie ? "Rações Diárias" : isZombieSp ? "Rações Suficientes" : isSciFi ? "Níveis Normais" : "Provisões Suficientes",
      description: isRioZombie
        ? "Refeições regulares no refeitório da Urca garantem a força dos trabalhadores."
        : isZombieSp
        ? "Racionamento padrão de 1.800 kcal atendido sem cortes imediatos."
        : "O pão está assegurado para a população sem sobressaltos.",
      exactValue: `${state.food} ${foodUnit}`,
      percentage: foodPct,
      level: "neutral",
    };
  } else if (state.food >= 60) {
    foodFeeling = {
      label: foodName,
      icon: foodIcon,
      feeling: isRioZombie ? "Fome nos Galpões" : isZombieSp ? "Escassez Severa" : isSciFi ? "Filtros com Defeito" : "Alerta de Fome",
      description: isRioZombie
        ? "Meia ração por sobrevivente; crianças e idosos enfraquecem nos dormitórios."
        : isZombieSp
        ? "Prateleiras dos depósitos vazias; trabalhadores protestam por mais comida."
        : "A escassez ronda os vilarejos e os preços do trigo disparam.",
      exactValue: `${state.food} ${foodUnit}`,
      percentage: foodPct,
      level: "warning",
    };
  } else {
    foodFeeling = {
      label: foodName,
      icon: foodIcon,
      feeling: isRioZombie ? "Inanição Mortal" : isZombieSp ? "Fome Generalizada" : isSciFi ? "Asfixia & Inanição" : "Fome Mortífera",
      description: isRioZombie
        ? "Desespero total; sobreviventes comem mariscos podres e caçam pombos nas ruínas."
        : isZombieSp
        ? "População morrendo de fome nos corredores; risco de canibalismo ou fuga cega."
        : "A fome devora vilarejos inteiros e os campos estão desérticos.",
      exactValue: `${state.food} ${foodUnit}`,
      percentage: foodPct,
      level: "danger",
    };
  }

  // 3. POPULAÇÃO (Vidas / Sobreviventes / Colonos)
  const popName = labels?.population.name || (isRioZombie ? "Vidas Não-Infectadas" : isZombieSp ? "Sobreviventes" : isSciFi ? "Tripulação Ativa" : "Povo");
  const popIcon = labels?.population.icon || (isRioZombie ? "👥" : isZombieSp ? "🛡️" : isSciFi ? "🧑‍🚀" : "👑");
  const popUnit = labels?.population.unit || "almas";

  let populationFeeling: MetricFeeling;
  if (state.population >= 6000) {
    populationFeeling = {
      label: popName,
      icon: popIcon,
      feeling: isRioZombie ? "Comunidade Lotada" : isZombieSp ? "Colônia Povoada" : "População Próspera",
      description: isRioZombie
        ? "Os barracos e tendas da Praia Vermelha estão cheios de braços para a lida."
        : "O contingente de cidadãos é robusto e capaz de sustentar grandes obras.",
      exactValue: `${state.population.toLocaleString("pt-BR")} ${popUnit}`,
      percentage: Math.min(100, Math.round((state.population / 15000) * 100)),
      level: "good",
    };
  } else if (state.population >= 2000) {
    populationFeeling = {
      label: popName,
      icon: popIcon,
      feeling: isRioZombie ? "Reduto Resistente" : isZombieSp ? "Comunidade Estável" : "População Estável",
      description: isRioZombie
        ? "Famílias abrigadas na base do Pão de Açúcar mantêm a rotina sob sentinela."
        : "O número de habitantes se mantém equilibrado.",
      exactValue: `${state.population.toLocaleString("pt-BR")} ${popUnit}`,
      percentage: Math.min(100, Math.round((state.population / 15000) * 100)),
      level: "neutral",
    };
  } else {
    populationFeeling = {
      label: popName,
      icon: popIcon,
      feeling: isRioZombie ? "Poucos Sobreviventes" : "Declínio Crítico",
      description: isRioZombie
        ? "Mortes e desaparecimentos nas ruínas reduziram a colônia a um punhado de vivos."
        : "A população foi dizimada por conflitos, pragas ou escassez.",
      exactValue: `${state.population.toLocaleString("pt-BR")} ${popUnit}`,
      percentage: Math.max(5, Math.min(100, Math.round((state.population / 15000) * 100))),
      level: "danger",
    };
  }

  // 4. ESTABILIDADE (Sanidade / Coesão / Ordem)
  const stabPct = Math.max(0, Math.min(100, state.stability));
  const stabName = labels?.stability.name || (isRioZombie ? "Sanidade & Esperança" : isZombieSp ? "Moral & Coesão" : isSciFi ? "Ordem da Estação" : "Ordem");
  const stabIcon = labels?.stability.icon || (isRioZombie ? "🧠" : isZombieSp ? "⚖️" : isSciFi ? "🌐" : "⚖️");

  let stabilityFeeling: MetricFeeling;
  if (state.stability >= 75) {
    stabilityFeeling = {
      label: stabName,
      icon: stabIcon,
      feeling: isRioZombie ? "Esperança Inabalável" : isZombieSp ? "Coesão Firme" : "Ordem Firme",
      description: isRioZombie
        ? "Os sobreviventes confiam na liderança e acreditam na vitória sobre a praga."
        : "A autoridade prevalece e as leis são acatadas voluntariamente.",
      exactValue: `${state.stability}%`,
      percentage: stabPct,
      level: "good",
    };
  } else if (state.stability >= 45) {
    stabilityFeeling = {
      label: stabName,
      icon: stabIcon,
      feeling: isRioZombie ? "Tensão Contida" : isZombieSp ? "Equilíbrio Tenso" : "Paz Delicada",
      description: isRioZombie
        ? "O medo da noite existe, mas os protocolos de quarentena evitam histeria."
        : "O domínio funciona, mas há tensões latentes entre as facções.",
      exactValue: `${state.stability}%`,
      percentage: stabPct,
      level: "neutral",
    };
  } else if (state.stability >= 20) {
    stabilityFeeling = {
      label: stabName,
      icon: stabIcon,
      feeling: isRioZombie ? "Paranoia & Pânico" : isZombieSp ? "Inquietação Civil" : "Instabilidade",
      description: isRioZombie
        ? "Boatos de infecção geram brigas violentas; sentinelas desconfiam dos vizinhos."
        : "Murmúrios e conspirações ameaçam a autoridade da liderança.",
      exactValue: `${state.stability}%`,
      percentage: stabPct,
      level: "warning",
    };
  } else {
    stabilityFeeling = {
      label: stabName,
      icon: stabIcon,
      feeling: isRioZombie ? "Histeria / Insurreição" : isZombieSp ? "Anarquia Total" : "Caos Total",
      description: isRioZombie
        ? "Sobreviventes armam motim nos portões; colapso social completo da colônia."
        : "O domínio está à beira da revolta aberta e da desintegração.",
      exactValue: `${state.stability}%`,
      percentage: stabPct,
      level: "danger",
    };
  }

  // 5. PODER MILITAR (Sentinelas / Fuzis / Defesa)
  const milPct = Math.max(0, Math.min(100, state.military));
  const milName = labels?.military.name || (isRioZombie ? "Sentinelas & Fuzis" : isZombieSp ? "Guarda & Milícia" : isSciFi ? "Drones de Defesa" : "Guarda");
  const milIcon = labels?.military.icon || (isRioZombie ? "🛡️" : isZombieSp ? "⚔️" : isSciFi ? "🛸" : "🛡️");

  let militaryFeeling: MetricFeeling;
  if (state.military >= 75) {
    militaryFeeling = {
      label: milName,
      icon: milIcon,
      feeling: isRioZombie ? "Fortaleza Inexpugnável" : isZombieSp ? "Perímetro Blindado" : "Exército Temível",
      description: isRioZombie
        ? "Atiradores nos pontos altos do Pão de Açúcar e metralhadoras prontas na praia."
        : "Forças armadas disciplinadas e prontas para repelir qualquer invasão.",
      exactValue: `${state.military}%`,
      percentage: milPct,
      level: "good",
    };
  } else if (state.military >= 45) {
    militaryFeeling = {
      label: milName,
      icon: milIcon,
      feeling: isRioZombie ? "Vigilância Atenta" : isZombieSp ? "Sentinela Operacional" : "Guarda Alerta",
      description: isRioZombie
        ? "Patrulhas constantes nos arames farpados mantêm os estaladores afastados."
        : "Muralhas guarnecidas e sentinelas ativas nas fronteiras.",
      exactValue: `${state.military}%`,
      percentage: milPct,
      level: "neutral",
    };
  } else if (state.military >= 20) {
    militaryFeeling = {
      label: milName,
      icon: milIcon,
      feeling: isRioZombie ? "Sentinelas Esgotados" : isZombieSp ? "Brechas no Perímetro" : "Defesas Frágeis",
      description: isRioZombie
        ? "Poucos atiradores para cobrir a orla e o morro; brechas fatais nas barricadas."
        : "Tropas cansadas, com escassez de equipamentos e moral baixa.",
      exactValue: `${state.military}%`,
      percentage: milPct,
      level: "warning",
    };
  } else {
    militaryFeeling = {
      label: milName,
      icon: milIcon,
      feeling: isRioZombie ? "Portões Desprotegidos" : isZombieSp ? "Muralhas Caídas" : "Guarda Desfeita",
      description: isRioZombie
        ? "Sem homens para guardar o túnel; qualquer horda entrará direto no refeitório."
        : "As defesas tombaram e a liderança está desprotegida contra ataques.",
      exactValue: `${state.military}%`,
      percentage: milPct,
      level: "danger",
    };
  }

  return {
    treasury: treasuryFeeling,
    food: foodFeeling,
    population: populationFeeling,
    stability: stabilityFeeling,
    military: militaryFeeling,
  };
}
