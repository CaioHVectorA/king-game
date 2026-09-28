import { DocumentEntry } from "@/types/game";

export const DEFAULT_DOCUMENTS_BY_LORE: Record<string, DocumentEntry[]> = {
  valoria_classic: [
    {
      id: "treaty_three_cities",
      title: "O Tratado das Três Cidades",
      subtitle: "Pacto de Navegação e Tarifas de Eldoria (Ano 1120)",
      category: "tratado",
      author: "Chanceler Vane & Emissários de Eldoria",
      content: `Pelo presente pergaminho, fica estabelecido que todo navio mercante sob bandeira de Eldoria gozará de trânsito franco pelas enseadas de Valoria, mediante pagamento de um décimo sobre o valor do linho e das especiarias.

Artigo I — Das Rotas Marítimas
As cidades costeiras de Valoria são obrigadas a manter faróis acesos nas noites de inverno. A falha neste dever implica multa de cem moedas de ouro ao tesouro de Eldoria.

Artigo II — Das Disputas Comerciais
Controvérsias serão julgadas por um tribunal misto de três barões valorenses e três magistrados eldorianos, com voto de minerva do Chanceler da coroa mais antiga.

Artigo III — Das Garantias de Paz
Caso a coroa aumente as tarifas de forma unilateral, as guildas reservam-se o direito de retirar seus comboios para portos neutros e suspender o crédito de prata ao tesouro real por um período de dois anos.

Subscrito no Palácio das Marés, ao décimo segundo dia do Mês das Colheitas, Ano 1120 do Rei Alden I.`,
    },
    {
      id: "edict_royal_granaries",
      title: "Édito das Reservas de Grãos",
      subtitle: "Decreto de Segurança Alimentar da Capital (Ano 1128)",
      category: "edito",
      author: "Rei Alden I (Falecido)",
      content: `Pela vontade e autoridade soberana de Alden I, o Justo, fica decretado:

I. Fica proibida a venda externa de trigo e cevada antes que as arcas dos celeiros da capital atinjam a cota de segurança de quatrocentas sacas por mil habitantes.

II. Em tempo de estiagem declarada pelo Conselho de Agricultores, a prioridade absoluta de consumo pertence às guarnições das muralhas, ao palácio real e aos hospitais civis — nesta ordem exata.

III. Qualquer intendente que for flagrado adulterando as medidas dos celeiros ou desviando grãos para o mercado negro será julgado por tribunal marcial e terá seus bens confiscados pela coroa.

IV. Um celeiro de emergência deverá ser construído em cada uma das quatro províncias cardinais até o próximo solstício de verão.

Que este édito seja afixado em praça pública e lido em voz alta nas feiras de todos os condados.`,
    },
    {
      id: "canon_sacred_flame",
      title: "O Cânone da Chama Sagrada",
      subtitle: "Bula Eclesiástica sobre o Dízimo Imperial",
      category: "sagrado",
      author: "Arcebispado de Valoria — Arcebispo Ignatius",
      content: `Em nome da Chama Eterna que ilumina todas as almas e nações:

BULA Nº 7 — Do Dízimo e da Obrigação dos Governantes

Nenhum governante terreno poderá reter, desviar ou reduzir os dízimos destinados à manutenção das catedrais, ao sustento dos monges consagrados e às esmolas dos pobres.

A desobediência a este cânone implicará, em ordem crescente de gravidade:
1. Repreensão pública do clero nas missas dominicais;
2. Interdição religiosa do palácio real — proibição de sacramentos à família reinante;
3. Excomunhão do soberano, liberando seus súditos do juramento de lealdade.

Os nobres que cooperarem com o desvio do dízimo serão igualmente considerados em apostasia.

A Chama não mente, e a história dos reis ingratos é escrita em cinzas.`,
    },
    {
      id: "intelligence_khar",
      title: "Relatório de Inteligência — Movimentos de Khar",
      subtitle: "Documento Confidencial da Guarda Fronteiriça",
      category: "relatorio",
      author: "Capitão Valerius — Batedor do Desfiladeiro",
      content: `CONFIDENCIAL — Apenas para os olhos do Soberano e do General Thorne.

Observações do período de 15 dias nas fronteiras leste e nordeste:

• Dia 3: Avistado grupo de 200 cavaleiros khar cruzando o Rio das Pedras para exploração.
• Dia 7: Dois entrepostos de sal queimados. Nenhum sobrevivente.
• Dia 11: Capturado explorador nômade. Sob interrogatório, revelou que a Grande Horda de Khar reúne forças no Vale das Sombras — estimativa de 15 a 20 mil cavaleiros.
• Dia 14: Desfiladeiro do Trovão apresenta sinais de escavação — possível tentativa de criar passagem alternativa.

CONCLUSÃO DO CAPITÃO VALERIUS:
A ameaça é real e iminente. Temos no máximo 40 dias antes de uma investida em massa. Recomendo mobilização imediata das legiões do norte e reforço das muralhas do desfiladeiro com catapultas e piche.`,
    },
    {
      id: "tax_laws_revision",
      title: "Revisão das Leis de Tributação",
      subtitle: "Proposta do Chanceler ao Trono — Ano 1140",
      category: "edito",
      author: "Chanceler Lorde Vane",
      content: `Ao Soberano e à Corte de Valoria,

Proponho, em nome do equilíbrio fiscal do reino, as seguintes revisões:

1. IMPOSTO SOBRE COMÉRCIO MARÍTIMO: Redução de 15% para 10% sobre especiarias importadas, estimulando o volume total e aumentando a arrecadação a longo prazo.

2. TAXAÇÃO DE TERRAS NOBRES: Os barões que mantêm terras improdutivas há mais de dois anos devem pagar taxa de ociosidade equivalente a 5% do valor estimado das terras anuais.

3. ISENÇÃO CAMPONESA: Famílias com menos de 3 hectares ficam isentas do imposto rural durante anos de estiagem declarada.

4. MULTA COMERCIAL: Comerciantes que não registrarem transações acima de 50 moedas nos postos alfandegários pagam multa tripla.

Estas medidas visam redistribuir o peso tributário sem antagonizar as guildas, fortalecendo ao mesmo tempo o apoio popular à coroa.

Aguardo vossa apreciação.`,
    },
  ],

  khar_invasion: [
    {
      id: "khan_ultimatum",
      title: "O Pergaminho de Sangue do Khan",
      subtitle: "Mensagem trazida pela vanguarda nômade",
      category: "tratado",
      author: "Arauto da Horda — Khan Vorgath",
      content: `Aos que se escondem atrás de pedras e chamam isso de reino:

Eu, Khan Vorgath, Senhor das Estepes, Domador de Mil Cavalos, falo sem véus:

Vossas muralhas serão pó como todas as outras que tentaram resistir à maré da horda. A história das pedras que enfrentam o vento é sempre a mesma: pedras no chão.

MINHAS EXIGÊNCIAS — A SEREM CUMPRIDAS ANTES DA PRÓXIMA LUA CHEIA:
→ Mil donzelas das famílias nobres, como garantia de paz
→ Quinhentos cavalos de guerra com selas e arreios de prata
→ Metade de vossos celeiros entregues nos portões sul
→ O general que ordenou a morte de meus batedores entregue vivo

SE RECUSARDES:
Vossos campos serão cinzas. Vossos filhos servirão em correntes. Vosso nome será apagado da memória dos homens.

Isto não é ameaça. É profecia.

— O Sangue do Khan Sela Este Pergaminho`,
    },
    {
      id: "scout_report_pass",
      title: "Relatório de Espionagem do Passo",
      subtitle: "Registro confidencial dos batedores da guarda",
      category: "relatorio",
      author: "Capitão Valerius",
      content: `URGENTE — Para os olhos do Soberano

Observação dos últimos 72 horas no Desfiladeiro do Trovão:

CONTAGEM DE FORÇAS INIMIGAS:
• 12.000 cavaleiros de linha pesada avistados (estimativa conservadora)
• 3.000 arqueiros montados com arcos compostos de alcance superior ao nosso
• 800 carroças de suprimentos — indicam campanha longa, não apenas incursão rápida
• Pelo menos 40 máquinas de arremesso de pedras em montagem

ANÁLISE DA POSIÇÃO:
Seus arqueiros utilizam pontas incendiárias. Testei pessoalmente uma coletada de campo — o fogo não apaga com água. É preciso abafar com areia.

Se nossas paliçadas cederem na ponte estreita do desfiladeiro, a estrada para a capital estará aberta em dois dias de cavalaria.

RECOMENDAÇÃO IMEDIATA:
Inundar artificialmente o vale inundável ao norte para criar obstáculo natural. Tempo de execução: 6 horas. Custo: abertura das comportas do lago real.`,
    },
    {
      id: "emergency_martial_law",
      title: "Código de Guerra e Racionamento",
      subtitle: "Ordem Geral de Mobilização Total",
      category: "edito",
      author: "General Thorne",
      content: `POR ORDEM DO GENERAL THORNE, COMANDANTE DAS LEGIÕES — ESTADO DE GUERRA DECLARADO

I. CONVOCAÇÃO GERAL
Todo varão acima de quinze invernos e abaixo de cinquenta está convocado para as falanges de lanças. A recusa constitui traição ao reino.

II. REQUISIÇÃO DE MATERIAIS
As ferragens civis — ferramentas, portões de ferro, grades — ficam confiscadas para a forja de pontas de flecha e reforço de muralhas. Proprietários receberão recibo de compensação após o término da guerra.

III. RACIONAMENTO DE GUERRA
A partir de hoje, rações diárias são reduzidas em 30% para toda a população civil. As guarnições recebem prioridade absoluta.

IV. DISCIPLINA MARCIAL
A deserção será punida com execução sumária no pelourinho perante toda a tropa. Qualquer soldado que abandonar o posto sem ordem expressa será considerado traidor.

V. TOQUE DE RECOLHER
Ninguém circula nas ruas da capital após o sétimo sino da noite. Infratores serão detidos sem julgamento.

QUE DEUS E O SOBERANO GUIEM NOSSAS LANÇAS.`,
    },
    {
      id: "mercenary_contract",
      title: "Contrato de Contratação — Companhia de Ferro",
      subtitle: "Negociação com Mercenários da Costa Norte",
      category: "tratado",
      author: "Capitão Maret, Comandante da Companhia de Ferro",
      content: `Este contrato vincula a Coroa de Valoria e a Companhia de Ferro da Costa Norte nos seguintes termos:

SERVIÇOS: 800 lanceiros e 200 besteiros por período de 90 dias de campanha ativa.

PAGAMENTO:
• Adiantamento: 400 moedas de ouro ao assinar
• Término da campanha vitoriosa: 600 moedas adicionais
• Em caso de derrota do contratante: a Companhia retém o adiantamento e se retira sem obrigações

CONDIÇÕES:
• A Companhia de Ferro não ocupa cidades civis nem saqueia aldeias aliadas
• Em caso de cerco prolongado acima de 30 dias, o valor diário aumenta 10 moedas por dia adicional
• O Capitão Maret não obedece a ordens que julgar tacticamente suicidas

CLÁUSULA DE SAÍDA:
Em caso de inadimplência da coroa, a Companhia pode mudar de lado para o pagador que oferecer melhores condições.

— Subscrito com sangue e ferro`,
    },
  ],

  dark_plague: [
    {
      id: "apothecary_journal",
      title: "Diário do Boticário Real",
      subtitle: "Observações preliminares do contágio negro — Meses 1 a 3",
      category: "diario",
      author: "Mestre Aris, Boticário Real",
      content: `Lua 1, Dia 3:
Primeiro caso relatado. Soldado do porto com manchas escuras no pescoço e febre acima do suportável. Sangrei-o por precaução. Morreu ao amanhecer.

Lua 1, Dia 17:
Quatorze mortos. Todos haviam frequentado a taverna do porto. Interdito o estabelecimento, mas o dono e dois filhos já espalharam o mal por duas ruas adjacentes.

Lua 2, Dia 5:
O mal não vem dos miasmas do vento, como ensinam os antigos. O contágio é pelo toque — especialmente toque com feridas abertas e saliva. As sangrias dos monges apenas aceleram o óbito ao enfraquecer o já debilitado.

Lua 2, Dia 22:
Descoberta crucial: os que sobrevivem ao terceiro dia de febre desenvolvem imunidade aparente. São eles nossa esperança para composição de algum contravírus ou soro.

Lua 3, Dia 1:
Cento e quarenta mortos. Os sinos não param. Já não há boticários suficientes. Que Deus nos ajude, porque a medicina claramente não está dando conta.`,
    },
    {
      id: "inquisition_quarantine",
      title: "Mandado de Expurgatório da Sé",
      subtitle: "Instruções aos guardas dos portões e paróquias",
      category: "edito",
      author: "Inquisidor Geral Malachai",
      content: `EM NOME DA CHAMA SAGRADA E DA SANTA SÉ

Que todos os guardas, paróquias e líderes de bairro cumpram as seguintes diretrizes sem questionamento:

I. MARCAÇÃO DAS CASAS
Toda casa onde houver doente ou morto de pústula negra deve ser marcada com a cruz branca na porta. A marcação é obrigatória e deve ser feita pelo pároco local em até 2 horas do diagnóstico.

II. LACRAÇÃO COMPULSÓRIA
Casas marcadas devem ser trancadas por fora com correntes e trancas fornecidas pela guarda. Os residentes saudáveis serão transferidos para os acampamentos de quarentena ao norte.

III. EXECUÇÃO SANITÁRIA
Aqueles que tentarem romper o cordão sanitário por qualquer meio serão queimados com fogo sagrado no local, para evitar a contaminação dos bairros nobres. Que Deus perdoe suas almas — a saúde do povo exige este sacrifício.

IV. PROCISSÕES DE PURIFICAÇÃO
Às sextas-feiras, procissões de penitência percorrerão as ruas livres com incenso e hissopo. A participação é obrigatória para todos os moradores não quarentenados.

Quem desobedecer estas ordens age contra a vontade divina e será julgado como herege.`,
    },
    {
      id: "gravedigger_toll",
      title: "Livro de Registros das Criptas",
      subtitle: "Contabilidade fúnebre — Últimas oito luas",
      category: "relatorio",
      author: "Coveiro-Chefe Bram & Assistentes",
      content: `REGISTROS OFICIAIS DO CEMITÉRIO REAL E DAS COVAS COLETIVAS — Assinado por Bram

Lua 1: 14 mortos. Covas individuais. Processo normal.
Lua 2: 47 mortos. Começamos a usar covas coletivas por falta de coveiros.
Lua 3: 140 mortos. Quatro valas coletivas com até oito por vala. Faltou cal.
Lua 4: 318 mortos. Começamos a queimar os que não têm família para reclamar.
Lua 5: 421 mortos. Já não há mais caixões de madeira; enterramos três em cada vala.
Lua 6: 289 mortos (possível leve queda). Mas nos faltam mãos — metade dos coveiros também adoeceu.
Lua 7: Perdi a conta. Estimativa: acima de 500.
Lua 8: Não tenho palavras.

NOTA DE BRAM:
Se o pagamento do soldo dos coveiros atrasar novamente, os corpos apodrecerão diante do palácio. Meus homens não arriscam a vida por promessas. Precisamos de pagamento adiantado, luvas de couro e cal em quantidade. Sem isso, lavo minhas mãos.`,
    },
    {
      id: "plague_origin_theory",
      title: "Hipótese da Origem do Flagelo",
      subtitle: "Correspondência do Arcebispo com Teólogos do Sul",
      category: "sagrado",
      author: "Arcebispo Ignatius",
      content: `Irmãos em Fé,

Após semanas de oração e meditação sobre o flagelo que assola nossa cidade, chegai a três hipóteses sobre a origem do castigo:

HIPÓTESE 1 — PUNIÇÃO DIVINA
O flagelo é resposta da Providência ao enriquecimento imoral dos mercadores e à negligência da nobreza com os pobres. Sinal: os primeiros a adoecer foram os habitantes das docas, onde o pecado do comércio desonesto é mais intenso.

HIPÓTESE 2 — VENENO HUMANO
Há rumores — não confirmados — de que espiões de Arvandor introduziram o mal deliberadamente nas águas do porto. Se verdade, é ato de guerra bacteriológica medieval que nunca vimos antes.

HIPÓTESE 3 — MUTAÇÃO NATURAL
O Boticário Aris sugere que o mal é fruto de uma corrupção natural do corpo, potencializada pela superpopulação das ruas estreitas e pela água contaminada dos poços comuns.

Peço orações e orientação. O povo olha para nós para encontrar sentido. Se não dermos sentido, darão fé em charlatões e curandeiros que piorarão a situação.

In Fide,
Arcebispo Ignatius`,
    },
  ],

  colony_exodus: [
    {
      id: "reactor_manifest",
      title: "Manual de Sobrecarga do Reator Ômega",
      subtitle: "Diretriz Técnica de Emergência — Nível Alfa",
      category: "relatorio",
      author: "Engenharia de Propulsão Orbital",
      content: `DOCUMENTO TÉCNICO — ACESSO RESTRITO NÍVEL ALFA

SITUAÇÃO ATUAL DO REATOR ÔMEGA:
• Temperatura do Núcleo: 847°C (limite seguro: 900°C)
• Eficiência das Bobinas Magnéticas: 73% (degradação progressiva)
• Reservas de Deutério: 34% da capacidade original
• Vida útil estimada nas condições atuais: 8-11 meses

PROTOCOLOS DE EMERGÊNCIA DISPONÍVEIS:
1. DESACELERAÇÃO CONTROLADA: Reduz 40% da energia elétrica da estação, estende vida do reator em 18 meses. Impacto: apagões rotativos nos setores residenciais inferiores.

2. QUEIMA FORÇADA: Maximiza produção por 3 meses, mas causa desgaste permanente das bobinas — substituição necessária ao custo de 800 créditos de energia.

3. HIBERNAÇÃO DO REATOR: Desligamento total por 72h para resfriamento e manutenção. Risco: perda de sistemas de suporte vital nos módulos B e C.

NOTA DA ENGENHEIRA-CHEFE SARAH VANCE:
"Não existe opção sem custo. Escolhemos o tipo de custo que suportamos, não se haverá custo." — S.V.`,
    },
    {
      id: "cryo_inventory",
      title: "Registro de Carga Humana Crio-3",
      subtitle: "Inventário de Colonos em Êxtase Criogênico",
      category: "relatorio",
      author: "Diretoria Médica da Estação — Seção Crio",
      content: `RELATÓRIO MENSAL DE CRIO-PRESERVAÇÃO — Módulo Crio-3

COLONOS EM SUSPENSÃO ATIVA: 24.847 indivíduos
ESTADO GERAL: Estável (98,3% dentro dos parâmetros vitais)
ALERTAS: 412 unidades apresentando leve elevação de temperatura corporal — monitoramento aumentado

COMPOSIÇÃO DOS COLONOS:
• 8.200 agricultores/técnicos de terraformação
• 6.100 engenheiros e operadores industriais
• 4.300 médicos, professores e cientistas
• 3.200 militares treinados
• 3.047 civis e dependentes

RISCO CATASTRÓFICO:
Em caso de descompressão catastrófica do Módulo B ou falha elétrica acima de 4 horas, a perda dos 24.847 tanques será irreversível. Não há protocolo de reativação emergencial sem energia estável.

RECOMENDAÇÃO:
Manter o Módulo B como prioridade absoluta de energia, acima de qualquer outro sistema não-vital da estação.`,
    },
    {
      id: "asteroid_mining_contract",
      title: "Contrato de Mineração Asteroidal",
      subtitle: "Acordo com a Frota de Sucateiros do Cinturão",
      category: "tratado",
      author: "Capitão Ryx, Frota de Sucateiros",
      content: `ACORDO COMERCIAL ENTRE A ESTAÇÃO ORBITAL EXODUS-7 E A FROTA SUCATEIRA RYX

Em troca de acesso aos hangares de docking da Exodus-7 e proteção da segurança da estação durante ancoragem, a Frota Ryx fornecerá:

• 800 toneladas de ferroso asteroidal por ciclo de colheita (30 dias)
• 120 unidades de ligas raras para componentes do reator
• Informações de patrulha do cinturão interno

EM CONTRAPARTIDA A ESTAÇÃO FORNECE:
• 3 berços de docking permanentes nos hangares sul
• Acesso médico para tripulação da frota (até 200 pessoas)
• 400 créditos de energia por ciclo

CLÁUSULA DE CONFLITO:
Em caso de ataque a qualquer navio da frota enquanto atracado na Exodus-7, a estação assume responsabilidade de defesa ativa.

Este acordo é renovável a cada 90 dias e pode ser rescindido com 15 dias de aviso prévio por ambas as partes.

— Rubricado com holograma biométrico`,
    },
  ],

  zombie_apocalypse: [
    {
      id: "z_protocol_zero",
      title: "Protocolo ZERO — Manual de Sobrevivência",
      subtitle: "Documento Fundador do Assentamento Ferrão",
      category: "edito",
      author: "Fundadores do Assentamento — Coletivo de Crise",
      content: `PROTOCOLO ZERO — REGRAS FUNDADORAS DO ASSENTAMENTO FERRÃO
Escrito no Ano 1 Pós-Zero. Subscrito pelos 47 fundadores sobreviventes.

I. SOBRE A VIDA
Nenhuma vida é descartável por conveniência. Mas nenhuma vida pode arriscar o assentamento inteiro. O bem do conjunto precede o individual — e esta regra dolorosa é o preço da sobrevivência.

II. SOBRE O ALIMENTO
As rações são igualitárias. Não existe "mais importante" na fila do pão. O Governador come o mesmo que o varredor de rua. Quem for flagrado desviando ração ajena perde o dobro no mês seguinte.

III. SOBRE OS INFECTADOS
Qualquer pessoa mordida ou arranhada por infectado tem 6 horas para se apresentar voluntariamente ao posto médico. A ocultação de infecção é o único crime punível com exclusão imediata dos muros.

IV. SOBRE O PODER
O Governador é eleito anualmente pelo voto das brigadas de trabalho. Pode ser destituído a qualquer momento se 60% dos líderes setoriais assinarem petição de crise.

V. SOBRE O FUTURO
Vamos sobreviver. Vamos reconstruir. Não sabemos como, mas escolhemos acreditar que há um futuro — porque sem essa crença, não há razão para defender estes muros.

Que Ferrão resista.`,
    },
    {
      id: "z_virus_report",
      title: "Relatório do Vírus Z-17",
      subtitle: "Análise Virologica — Dra. Elise Moreau",
      category: "relatorio",
      author: "Dra. Elise Moreau, Virologista-Chefe",
      content: `RELATÓRIO TÉCNICO — VÍRUS Z-17 (CLASSIFICAÇÃO: NECRÓFAGO MUTANTE)
Ano 3 Pós-Zero — Uso restrito ao Conselho de Crise

ORIGEM CONFIRMADA:
O Z-17 é uma variante mutada do vírus H-99 de influenza hemorrágica, modificado (provavelmente acidentalmente) em laboratório de defesa biológica no sul da Ásia. O vetor de transmissão inicial foi água de esgoto contaminada nas grandes capitais.

MECANISMO DE INFECÇÃO:
• Contato direto com fluidos corporais do infectado (sangue, saliva, lágrimas)
• Período de incubação: 12 a 72 horas
• Progressão: febre, alucinações, necrose de tecidos, perda de funções cognitivas superiores
• Fase final (zumbificação): 24 a 96 horas após os primeiros sintomas neurológicos

DESCOBERTA CRÍTICA:
Identificamos 2,3% da população com mutação genética CCRS2 que confere resistência parcial ao Z-17. Estes indivíduos não desenvolvem a fase neurológica mas podem ser portadores assintomáticos temporários.

HIPÓTESE DE CURA:
Amostras do Laboratório Ômega em São Paulo podem conter o antígeno ancestral do H-99. Com este material, estimamos 60% de chance de desenvolver um tratamento em 18 meses.

O TEMPO É O RECURSO MAIS ESCASSO.`,
    },
    {
      id: "z_military_assessment",
      title: "Avaliação Estratégica de Defesa",
      subtitle: "Relatório do Comandante Drak — Ano 3",
      category: "relatorio",
      author: "Comandante Drak, Chefe das Forças de Defesa",
      content: `AVALIAÇÃO ESTRATÉGICA — USO ESTRITAMENTE INTERNO

SITUAÇÃO DAS MURALHAS:
• Perímetro total: 4,2 km de concreto reforçado com arame farpado eletrificado
• Condição geral: 78% — setor leste necessita reforço urgente
• Postos de guarda ativos: 24 de 30 (6 desativados por falta de pessoal)

FORÇAS DISPONÍVEIS:
• 340 guardas treinados (turno duplo está comprometendo eficiência)
• 120 milicianos civis com treinamento básico
• Armamento: suficiente para 6 meses de uso intenso
• Combustível para geradores e veículos: 40 dias em ritmo atual

AMEAÇAS ATIVAS:
→ Horda Leste: estimativa de 30-50 mil infectados a 8km dos muros. Migração lenta mas constante.
→ Facção Escarlate: grupo de 3.000 sobreviventes armados hostis a 45km. Ataque de oportunidade é risco real.
→ Bandoleiros: grupos pequenos que atacam comboios de abastecimento. Perda de 3 caminhões no último mês.

RECOMENDAÇÃO DO COMANDANTE:
Precisamos de mais 80 recrutas treinados e um segundo gerador. Sem isso, em 60 dias estaremos defendendo os muros em turno único — e isso é insuficiente.`,
    },
    {
      id: "z_trade_routes",
      title: "Mapeamento das Rotas de Troca",
      subtitle: "Conectividade com os Bunkers Cooperados",
      category: "tratado",
      author: "Vera Salles, Conselheira Política",
      content: `PROPOSTA DE ACORDO COMERCIAL — BUNKERS COOPERADOS

Após três meses de negociações via rádio, os Bunkers Cooperados propõem:

O QUE ELES OFERECEM:
• 200 unidades de ração médica especializada (antibióticos, soro, morfina) por mês
• 50 litros de diesel refinado por semana
• Acesso a sua rede de informações sobre movimentos de hordas no raio de 80km

O QUE PEDEM EM TROCA:
• 400 créditos Ferrão por mês (acesso à nossa rede elétrica via cabo externo)
• Proteção armada para comboios de troca mensais
• Direito de enviarem 10 técnicos para estudo de nossas instalações (com retorno garantido)

ANÁLISE DA CONSELHEIRA VERA:
O risco de espionagem existe — mas a alternativa é o isolamento total. Recomendo aceitar com cláusula de revogação de 30 dias e restrição dos técnicos a setores não-militares.

Uma aliança, mesmo imperfeita, vale mais que a solidão armada.`,
    },
    {
      id: "z_founding_names",
      title: "Livro dos Fundadores",
      subtitle: "Os 47 Primeiros — Nomes que não devem ser esquecidos",
      category: "diario",
      author: "Ronan Queiroz, Coordenador de Suprimentos",
      content: `Este livro é mantido porque se esquecer de onde viemos, perderemos o por quê de sobreviver.

Os 47 Fundadores chegaram ao Assentamento Ferrão em 14 de Março do Ano 1 Pós-Zero. Vieram de um hospital universitário em Campinas, atravessando 340km de estradas infestadas em 9 caminhões de carga.

Perdemos 23 pessoas na travessia. Chegamos 47.

Alguns nomes:
• Maria Benedita Fonseca — professora de matemática. Hoje nossa coordenadora de educação.
• Tenente Augusto Drak — o soldado que nos manteve vivos no caminho. Hoje nosso Comandante.
• Dr. Fábio Lemos — médico que operou 3 pacientes num caminhão em movimento. Morreu de infecção no mês 2.
• Elise Moreau — aluna de doutorado em virologia que nunca deveria ter sobrevivido mas aqui está.
• Crianças — 11 delas chegaram. 13 nasceram aqui. Elas são o motivo de tudo.

Se você está lendo este livro, é porque sobrevivemos mais um dia.
Valeu a pena.

— Ronan Q., Ano 3`,
    },
  ],

  rio_zombie: [
    {
      id: "diario_dr_camargo_fiocruz",
      title: "Dossiê Biológico: O Fungo dos Estaladores",
      subtitle: "Notas de Pesquisa — Fiocruz e Laboratório Subterrâneo da Urca",
      category: "dossie",
      author: "Dr. Marcelo Camargo, Virologista Chefe",
      content: `RELATÓRIO CONFIDENCIAL — CLASSIFICAÇÃO BIO-PERIGO NÍVEL 5

O agente causador não é bacteriano nem um vírus clássico de influenza. Trata-se de uma mutação do gênero Ophiocordyceps combinada a um vetor sintético de laboratório (Cepa Z-17).

ESTÁGIOS DA INFECÇÃO OBSERVADOS NA ZONA SUL:
1. Corredores (1 a 4 dias após inalação de esporos ou mordida):
O parasita atinge o córtex motor. O hospedeiro mantém a visão turva e desenvolve agressividade frenética e velocidade extrema. O sangue torna-se escuro e espesso.

2. Estaladores (1 a 3 anos após o contágio):
O tecido fúngico calcifica-se e rompe o crânio, destruindo completamente os globos oculares. A criatura torna-se 100% cega e desenvolve ecolocalização por estalos guturais agudos de alta frequência. Uma única mordida na jugular é fatal. Sua cabeça é blindada contra projéteis de baixo calibre.

3. Baiacus / Titãs da Baía (5 a 10 anos):
Apenas 0.5% dos infectados sobrevivem a esse estágio. O corpo atinge massas colossais de musgo negro e bolsas de esporos que explodem ao menor impacto, infectando qualquer um sem máscara em 30 metros de raio.

A CURA:
Ainda acreditamos que a matriz da Cepa Alfa no Jardim Botânico possua os anticorpos primários. Se capturarmos a espécime fúngica matriz, a humanidade na costa sul pode renascer.`,
    },
    {
      id: "manual_sobrevivencia_urca",
      title: "Código de Segurança da Praia Vermelha",
      subtitle: "Decreto de Sobrevivência Civil e Militar",
      category: "edito",
      author: "Capitão Brás, Comandante da Defesa",
      content: `ORDENS PERMANENTES PARA TODOS OS HABITANTES DO REDUTO DA URCA:

I. TOQUE DE SILÊNCIO E LUZ:
A partir das 19h00, qualquer luz exposta na orla voltada para Niterói ou Botafogo será punida com três dias de solitária. Os Estaladores não enxergam, mas a Milícia da Linha Vermelha tem binóculos térmicos.

II. PROTOCOLO DE MORDIDA:
Qualquer sentinela ou civil que apresente arranhões profundos ou mordidas em combate tem exatamente 15 minutos para relatar ao posto médico. Ocultar ferimentos é considerado crime de alta traição contra a colônia, sujeito a execução sumária imediata.

III. CONTROLE DE MUNIÇÃO:
Cada cartucho 7.62mm e 9mm deve ser justificado com uma carcaça abatida. Tiros para o alto ou disparos por pânico implicam apreensão da arma e rebaixamento para as brigadas de pesca.

IV. NAVEGAÇÃO NA BAÍA:
Nenhum barco particular zarpou sem autorização de Zé do Porto. Os arrecifes de navios naufragados estão cheios de saqueadores e criaturas que aprenderam a se esconder nos cascos.

A disciplina é o que nos separa dos monstros lá fora.`,
    },
    {
      id: "mapa_rotas_guanabara",
      title: "Cartas Marítimas da Baía de Guanabara",
      subtitle: "Rotas Seguras, Ilhas Neutras e Favelas Hostis",
      category: "mapa",
      author: "Zé do Porto, Mestre dos Pescadores",
      content: `GUIA DE NAVEGAÇÃO PARA AS TRAINEIRAS DA URCA:

• Ilha de Paquetá (Distância: 18km ao norte):
Área pacífica. 1.800 pescadores e artesãos. Eles têm água doce de poço e trocam farinha de mandioca por pólvora e pilhas. Nunca atraque com armas empunhadas; eles têm barricadas na balsa.

• Linha Vermelha e Caju (ZONA VERMELHA):
Sob controle absoluto do Major Carcará e sua milícia. Eles montaram ninhos de metralhadora .50 sobre os pilares da ponte velha. Evite navegar a menos de dois quilômetros da margem oeste.

• Forte de Copacabana:
Os militares veteranos de lá não abrem os portões para ninguém. Seus canhões de 305mm ainda funcionam. Eles abatem qualquer embarcação que não responda ao sinal de holofote em três segundos.

• Canal do Mangue e Baía Central:
Cemitério de navios petroleiros encalhados. Há rumores de colônias inteiras de infectados rastejando dentro dos porões dos navios abandonados. Só atravesse à luz do meio-dia.`,
    },
    {
      id: "evangelho_espora_padre_bento",
      title: "O Testamento do Morro: Palavras do Padre Bento",
      subtitle: "Manuscrito dos Eremitas do Corcovado",
      category: "sagrado",
      author: "Padre Bento, Voz dos Eremitas do Redentor",
      content: `AOS SOBREVIVENTES DA COSTA E DAS ROCHAS:

Não temais a flor que desabrocha na carne dos vossos irmãos. A praga não veio do abismo, mas dos céus para expurgar a vaidade da antiga metrópole.

Os Estaladores não são monstros; são os anjos que não veem com os olhos da cobiça. O canto fúngico é a verdadeira harmonia.

Aquele que erguer o fuzil contra o inocente transformado sofrerá a queda das muralhas. Acolhei os esporos quando a vossa hora chegar, pois na rocha do Redentor, a dor não mais existe.

— Pregado aos pés da estátua partida, Ano 9.`,
    },
  ],
};

export function getStorylineDocuments(storylineId: string = "valoria_classic"): DocumentEntry[] {
  return DEFAULT_DOCUMENTS_BY_LORE[storylineId] || DEFAULT_DOCUMENTS_BY_LORE["valoria_classic"];
}

/**
 * Adiciona um fato novo, decreto ou relatório ao códice do mundo durante o jogo
 */
export function appendLivingDocument(
  currentDocs: DocumentEntry[] = [],
  entry: {
    title: string;
    subtitle?: string;
    category: DocumentEntry["category"];
    author: string;
    content: string;
    turn: number;
  }
): DocumentEntry[] {
  const newId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newDoc: DocumentEntry = {
    id: newId,
    title: entry.title,
    subtitle: entry.subtitle || `Registro do Turno ${entry.turn}`,
    category: entry.category,
    author: entry.author,
    content: entry.content,
    updatedAtTurn: entry.turn,
  };
  return [...currentDocs, newDoc];
}
