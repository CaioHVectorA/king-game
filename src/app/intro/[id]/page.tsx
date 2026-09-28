"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { KingdomState } from "@/types/game";
import { getKingdomFeelings } from "@/lib/game/feelings";
import { KingdomMap } from "@/components/map/KingdomMap";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { ArrowLeft, ArrowRight, MessageSquare, Send, Shield, Compass, Sparkles } from "lucide-react";

export default function IntroPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [state, setState] = useState<KingdomState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Consulta confidencial ao conselheiro da corte
  const [counselorQuestion, setCounselorQuestion] = useState("");
  const [counselorAnswer, setCounselorAnswer] = useState<string | null>(null);
  const [isAskingCounselor, setIsAskingCounselor] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    async function loadGame() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/game?id=${gameId}`);
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Campanha não encontrada");
        }
        setState(data);
      } catch (err: any) {
        console.error("Erro ao carregar introdução:", err);
        setErrorMsg("Não foi possível carregar a crônica deste reinado.");
      } finally {
        setIsLoading(false);
      }
    }

    loadGame();
  }, [gameId]);

  const handleAskCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !counselorQuestion.trim() || isAskingCounselor) return;

    try {
      setIsAskingCounselor(true);
      const res = await fetch("/api/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: state.id,
          question: counselorQuestion.trim(),
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setCounselorAnswer(data.answer);
      } else {
        setCounselorAnswer("Meu soberano, os barões mantêm silêncio cauteloso enquanto vossa primeira ordem não é proferida.");
      }
    } catch (err) {
      console.error("Erro ao consultar conselheiro:", err);
      setCounselorAnswer("O conselheiro vos pede cautela ao lidar com as despesas imediatas.");
    } finally {
      setIsAskingCounselor(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col items-center justify-center p-4 font-mono select-none">
        <span className="text-xs uppercase tracking-widest text-[#71717a] mb-2">
          RECUPERANDO REGISTROS DA COROAÇÃO...
        </span>
        <div className="w-6 h-6 border-2 border-[#71717a] border-t-[#f4f4f5] animate-spin" />
      </div>
    );
  }

  if (errorMsg || !state) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col items-center justify-center p-4 font-mono">
        <div className="max-w-md w-full p-6 bg-[#111113] border border-[#27272a] text-center space-y-4">
          <span className="text-xs text-red-400 block">[ ERRO NA CRÔNICA ]</span>
          <p className="text-sm text-[#a1a1aa]">{errorMsg || "Campanha inexistente."}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-2.5 bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] text-[#f4f4f5] text-xs uppercase tracking-wider cursor-pointer"
          >
            [ VOLTAR À TELA INICIAL ]
          </button>
        </div>
      </div>
    );
  }

  const prologue = state.prologue;
  const feelings = getKingdomFeelings(state);
  const ruler = state.currentRuler;
  const sid = state.storylineId || "valoria_classic";

  // ── Labels adaptadas por cenário ─────────────────────────────────────────
  const isZombie = sid === "zombie_apocalypse" || sid === "rio_zombie";
  const isSciFi = sid === "colony_exodus";

  const labels = isZombie
    ? {
        prologueHeader: "BRIEFING INICIAL & SITUAÇÃO DA BASE",
        section01: "01. Quem você é no Comando",
        vitality: "RESISTÊNCIA FÍSICA",
        vitalityAge: (age: number) => age < 30 ? "Jovem e Impulsivo" : age < 55 ? "Combatente Experiente" : "Veterano de Guerra",
        prestige: "AUTORIDADE NO REDUTO",
        prestigeStatus: "Reconhecido pelos Sobreviventes",
        intent: "Missão Pessoal / Juramento:",
        dynasty: `Grupo: ${ruler.dynasty || "Independente"}`,
        section02: "02. O Líder Anterior & A Transição",
        section02title: prologue?.predecessorName || "O Comandante Anterior",
        section02fallback: "Assumiu o posto por necessidade após a perda do líder anterior.",
        section03: "03. Inteligência & Rumores no Reduto",
        section03title: "Informante Confidencial",
        section03fallback: "Os sobreviventes mais antigos testam sua autoridade em cada decisão.",
        section04: "04. Mapa Tático do Território (Projeção de Zona Controlada)",
        section04desc: "Analise os setores, pontos de defesa e rotas de suprimento antes de assumir o comando:",
        section05: "05. Consulta ao seu Conselheiro / Oficial de Inteligência",
        counselorDesc: "Pergunte sobre o estado dos suprimentos, moral dos grupos ou ameaças externas antes de iniciar as operações:",
        counselorLoyalty: "CONFIANÇA DO CONSELHEIRO",
        counselorLoyaltyStatus: (l: number) => l > 20 ? "Confiável" : "Calculista",
        counselorInfluence: "INFLUÊNCIA NO GRUPO",
        counselorInfluenceStatus: "Respeitado",
        counselorPlaceholder: "Pergunte sobre suprimentos, ameaças ou moral dos grupos...",
        begin: "INICIAR OPERAÇÃO",
        beginSub: "Confirmar comando e entrar na situação",
      }
    : isSciFi
    ? {
        prologueHeader: "PRÓLOGO & HISTÓRICO DA MISSÃO",
        section01: "01. Quem você é no Comando (Identidade Operacional)",
        vitality: "CAPACIDADE OPERACIONAL",
        vitalityAge: (age: number) => age < 30 ? "Jovem Otimista" : age < 55 ? "Maturidade Técnica" : "Especialista Sênior",
        prestige: "AUTORIDADE NA ESTAÇÃO",
        prestigeStatus: "Mandato Consagrado pelo Conselho",
        intent: "Diretriz Pessoal / Objetivo Primário:",
        dynasty: `Divisão: ${ruler.dynasty || "Central"}`,
        section02: "02. O Diretor Anterior & A Transição",
        section02title: prologue?.predecessorName || "O Diretor Anterior",
        section02fallback: "Destituído ou morreu em serviço, transferindo o comando para você.",
        section03: "03. Informação Interna & Rumores dos Decks",
        section03title: "Transmissão Interna Interceptada",
        section03fallback: "Técnicos e operários observam cada decisão do novo Diretor.",
        section04: "04. Mapa da Estação e Setores de Controle",
        section04desc: "Analise módulos, reatores e zonas de risco antes de assumir o posto:",
        section05: "05. Consulta ao Sistema de I.A. ou Conselheiro Técnico",
        counselorDesc: "Questione sobre o estado dos reatores, moral da tripulação ou ameaças de bordo:",
        counselorLoyalty: "CALIBRAÇÃO DE CONFIANÇA",
        counselorLoyaltyStatus: (l: number) => l > 20 ? "Alinhado" : "Neutro",
        counselorInfluence: "ACESSO AO SISTEMA",
        counselorInfluenceStatus: "Autorizado",
        counselorPlaceholder: "Consulte reatores, módulos críticos ou moral da tripulação...",
        begin: "INICIAR TURNO DE COMANDO",
        beginSub: "Confirmar e assumir o posto de direção",
      }
    : {
        prologueHeader: "PRÓLOGO & ANTECEDENTES DA COROAÇÃO",
        section01: "01. Quem Você É no Trono (Identidade Soberana)",
        vitality: "VITALIDADE SOBERANA",
        vitalityAge: (age: number) => age < 30 ? "Juventude Impetuosa" : age < 55 ? "Maturidade de Governo" : "Sabedoria Anciã",
        prestige: "PRESTÍGIO DA COROA",
        prestigeStatus: "Legitimidade Consagrada",
        intent: "Juramento Pessoal / Motivação Oculta:",
        dynasty: `Linhagem da ${ruler.dynasty}`,
        section02: "02. O Rei Anterior & A Transição",
        section02title: prologue?.predecessorName || "O Monarca Anterior",
        section02fallback: "Faleceu pacificamente, deixando a coroa para vossa linhagem.",
        section03: "03. Rumor nos Corredores da Corte",
        section03title: "O Boato dos Barões",
        section03fallback: "Os barões testarão vossa autoridade na primeira audiência.",
        section04: "04. Topografia e Territórios do Reino (Projeção do Domínio)",
        section04desc: "Passe o cursor sobre os setores para analisar centros de poder, defesas e rotas comerciais:",
        section05: "05. Despacho Prévio com vosso Conselheiro Oficial",
        counselorDesc: "Pergunte confidencialmente sobre o estado dos cofres, a lealdade dos barões ou ameaças das fronteiras:",
        counselorLoyalty: "LEALDADE DO CONSELHEIRO",
        counselorLoyaltyStatus: (l: number) => l > 20 ? "Devotado" : "Pragmático",
        counselorInfluence: "INFLUÊNCIA NA CORTE",
        counselorInfluenceStatus: "Proeminente",
        counselorPlaceholder: "Pergunte sobre o estado do reino, ameaças ou facções antes das audiências...",
        begin: "ASSUMIR O TRONO",
        beginSub: "Iniciar o reinado e abrir as primeiras audiências",
      };

  // Localiza o mesmo conselheiro oficial da corte para consulta
  const charList = Object.values(state.characters || {});
  const mainCounselor =
    charList.find((c) =>
      c.role.toLowerCase().includes("chanceler") ||
      c.role.toLowerCase().includes("conselh") ||
      c.role.toLowerCase().includes("sintétic") ||
      c.role.toLowerCase().includes("i.a.")
    ) ||
    charList[0] || {
      name: "Lorde Vane",
      title: "Chanceler da Coroa",
      role: "Conselheiro",
      avatar: "👑",
    };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-4 sm:p-8 font-sans select-none flex flex-col justify-between max-w-4xl mx-auto">
      {/* 1. CABEÇALHO DA INTRODUÇÃO */}
      <header className="border-b border-[#27272a] pb-4 flex items-center justify-between font-mono">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#71717a] block">
            {labels.prologueHeader}
          </span>
          <h1 className="font-royal text-xl sm:text-2xl font-bold text-[#f4f4f5] tracking-tight">
            {state.name} • {state.storylineTitle}
          </h1>
        </div>

        <button
          onClick={() => router.push("/")}
          className="text-xs text-[#71717a] hover:text-[#f4f4f5] flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>[ INÍCIO ]</span>
        </button>
      </header>

      {/* 2. CONTEÚDO NARRATIVO: QUEM É VOCÊ, QUEM ERA O REI ANTERIOR, MAPA E CONSELHO */}
      <main className="my-8 space-y-6">
        {/* SEÇÃO 1: QUEM É VOCÊ NO TRONO (CUSTOMIZAÇÃO DETALHADA) */}
        <div className="bg-[#111113] border border-[#27272a] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2 font-mono">
            <span className="text-[11px] uppercase tracking-widest text-[#a1a1aa]">
              {labels.section01}
            </span>
            <span className="text-[10px] text-[#71717a]">
              SEED: {state.seed}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{ruler.avatar || "👑"}</span>
                <h2 className="font-royal text-xl sm:text-2xl font-bold text-[#f4f4f5]">
                  {ruler.title} {ruler.name}
                </h2>
              </div>
              <p className="text-xs font-mono text-[#a1a1aa] mt-1">
                {labels.dynasty}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ruler.archetype && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#18181b] border border-[#f4f4f5] text-[#f4f4f5]">
                  {ruler.archetype}
                </span>
              )}
              {ruler.origin && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#18181b] border border-[#52525b] text-[#d4d4d8]">
                  {ruler.origin}
                </span>
              )}
              {ruler.traits.map((trait) => (
                <span
                  key={trait}
                  className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#141418] border border-[#27272a] text-[#a1a1aa]"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* VITALIDADE E PRESTÍGIO DA LINHAGEM COM BARRAS DE PROGRESSO ANIMADAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 bg-[#18181b] border border-[#27272a] space-y-1">
              <AnimatedProgressBar
                value={Math.min(100, Math.max(25, 95 - (ruler.age || 30)))}
                min={0}
                max={100}
                label={labels.vitality}
                statusText={labels.vitalityAge(ruler.age || 30)}
                subText={`${ruler.age || 30} Anos de Vida`}
                height="xs"
                showGlowHead={true}
                showShimmer={true}
              />
            </div>

            <div className="p-2.5 bg-[#18181b] border border-[#27272a] space-y-1">
              <AnimatedProgressBar
                value={82}
                min={0}
                max={100}
                label={labels.prestige}
                statusText={labels.prestigeStatus}
                height="xs"
                showTicks
                showGlowHead={true}
                showShimmer={true}
              />
            </div>
          </div>

          {ruler.personalIntent && (
            <div className="p-3 bg-[#18181b] border-l-2 border-[#f4f4f5] text-xs font-mono text-[#f4f4f5]">
              <span className="text-[9px] uppercase tracking-widest text-[#71717a] block mb-0.5">
                {labels.intent}
              </span>
              "{ruler.personalIntent}"
            </div>
          )}

          <p className="text-xs sm:text-sm text-[#d4d4d8] leading-relaxed font-serif italic pt-1">
            "{prologue?.reputation || "Um líder nascido da necessidade."}"  
          </p>
        </div>

        {/* SEÇÃO 2: A SUCESSÃO E O REI ANTERIOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111113] border border-[#27272a] p-4 sm:p-5 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#71717a] block">
              {labels.section02}
            </span>
            <h3 className="font-royal text-base font-bold text-[#f4f4f5]">
              {labels.section02title} ({prologue?.predecessorRelation || "Antecessor"})
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed font-sans">
              {prologue?.ascensionCircumstance || labels.section02fallback}
            </p>
          </div>

          <div className="bg-[#111113] border border-[#27272a] p-4 sm:p-5 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#71717a] block">
              {labels.section03}
            </span>
            <h3 className="font-royal text-base font-bold text-[#f4f4f5]">
              {labels.section03title}
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed font-serif italic">
              "{prologue?.courtWhisper || labels.section03fallback}"
            </p>
          </div>
        </div>

        {/* SEÇÃO 3: MAPA DETERMINÍSTICO DO DOMÍNIO */}
        <div className="bg-[#111113] border border-[#27272a] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2 font-mono">
            <span className="text-[11px] uppercase tracking-widest text-[#a1a1aa] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              {labels.section04}
            </span>
            <span className="text-[10px] text-[#71717a]">
              INSPEÇÃO DISPONÍVEL
            </span>
          </div>

          <p className="text-xs text-[#71717a] font-mono">
            {labels.section04desc}
          </p>

          <KingdomMap seed={state.seed} storylineId={state.storylineId} />
        </div>

        {/* SEÇÃO 4: CONSULTA CONFIDENCIAL AO CONSELHEIRO (IA EM TEMPO REAL) */}
        <div className="bg-[#111113] border border-[#27272a] p-5 sm:p-6 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
            <span className="text-[11px] uppercase tracking-widest text-[#a1a1aa] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              {labels.section05}
            </span>
            <span className="text-[10px] text-[#71717a]">
              CONSELHO EM TEMPO REAL (IA)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-[#27272a] pb-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl p-2 bg-[#18181b] border border-[#27272a]">
                {(mainCounselor as any).avatar || "👤"}
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#f4f4f5]">
                  {mainCounselor.name}
                </h3>
                <p className="text-[11px] text-[#a1a1aa]">
                  {mainCounselor.title || mainCounselor.role} • O mesmo conselheiro que vos guiará no jogo
                </p>
              </div>
            </div>

            {/* BARRAS DO CONSELHEIRO */}
            <div className="flex flex-col gap-1.5 w-full sm:w-56 shrink-0">
              <AnimatedProgressBar
                value={mainCounselor.loyalty ?? 40}
                min={-100}
                max={100}
                bipolar
                label={labels.counselorLoyalty}
                statusText={labels.counselorLoyaltyStatus(mainCounselor.loyalty ?? 40)}
                height="xs"
                showGlowHead={true}
              />
              <AnimatedProgressBar
                value={mainCounselor.influence ?? 60}
                min={0}
                max={100}
                label={labels.counselorInfluence}
                statusText={labels.counselorInfluenceStatus}
                height="xs"
                showGlowHead={true}
              />
            </div>
          </div>

          <p className="text-xs text-[#71717a] leading-relaxed">
            {labels.counselorDesc}
          </p>

          <form onSubmit={handleAskCounselor} className="flex gap-2 pt-1">
            <input
              type="text"
              value={counselorQuestion}
              onChange={(e) => setCounselorQuestion(e.target.value)}
              placeholder={labels.counselorPlaceholder}
              disabled={isAskingCounselor}
              className="flex-1 bg-[#09090b] border border-[#27272a] focus:border-[#f4f4f5] px-3.5 py-2 text-xs text-[#f4f4f5] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!counselorQuestion.trim() || isAskingCounselor}
              className="px-4 py-2 bg-[#18181b] hover:bg-[#27272a] disabled:opacity-40 border border-[#3f3f46] text-[#f4f4f5] text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>{isAskingCounselor ? "Consultando..." : "Perguntar"}</span>
              <Send className="w-3 h-3" />
            </button>
          </form>

          {counselorAnswer && (
            <div className="p-3 bg-[#18181b] border-l-2 border-[#f4f4f5] text-xs font-serif text-[#d4d4d8] leading-relaxed mt-2 animate-mono-in">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#71717a] block mb-1">
                Resposta de {mainCounselor.name}:
              </span>
              "{counselorAnswer}"
            </div>
          )}
        </div>

        {/* SEÇÃO 6: O SENTIMENTO DO REINO (BARRAS DE PROGRESSO ANIMADAS) */}
        <div className="bg-[#111113] border border-[#27272a] p-4 sm:p-5 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#71717a] block">
              06. O Pulso Inicial do Reino (Como você encontra o governo)
            </span>
            <span className="text-[10px] text-[#71717a]">
              MÉTRICAS VITAIS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="p-2.5 bg-[#18181b] border border-[#27272a] space-y-1.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="uppercase text-[#71717a]">Tesouro</span>
                <span className="font-bold text-[#f4f4f5] truncate max-w-[60px]">{feelings.treasury.feeling}</span>
              </div>
              <AnimatedProgressBar
                value={feelings.treasury.percentage}
                min={0}
                max={100}
                level={feelings.treasury.level}
                height="xs"
                showGlowHead={true}
                showShimmer={true}
              />
            </div>

            <div className="p-2.5 bg-[#18181b] border border-[#27272a] space-y-1.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="uppercase text-[#71717a]">Celeiros</span>
                <span className="font-bold text-[#f4f4f5] truncate max-w-[60px]">{feelings.food.feeling}</span>
              </div>
              <AnimatedProgressBar
                value={feelings.food.percentage}
                min={0}
                max={100}
                level={feelings.food.level}
                height="xs"
                showGlowHead={true}
                showShimmer={true}
              />
            </div>

            <div className="p-2.5 bg-[#18181b] border border-[#27272a] space-y-1.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="uppercase text-[#71717a]">População</span>
                <span className="font-bold text-[#f4f4f5] truncate max-w-[60px]">{feelings.population.feeling}</span>
              </div>
              <AnimatedProgressBar
                value={feelings.population.percentage}
                min={0}
                max={100}
                level={feelings.population.level}
                height="xs"
                showGlowHead={true}
                showShimmer={true}
              />
            </div>

            <div className="p-2.5 bg-[#18181b] border border-[#27272a] space-y-1.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="uppercase text-[#71717a]">Ordem</span>
                <span className="font-bold text-[#f4f4f5] truncate max-w-[60px]">{feelings.stability.feeling}</span>
              </div>
              <AnimatedProgressBar
                value={feelings.stability.percentage}
                min={0}
                max={100}
                level={feelings.stability.level}
                height="xs"
                showGlowHead={true}
                showShimmer={true}
              />
            </div>

            <div className="p-2.5 bg-[#18181b] border border-[#27272a] space-y-1.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="uppercase text-[#71717a]">Exército</span>
                <span className="font-bold text-[#f4f4f5] truncate max-w-[60px]">{feelings.military.feeling}</span>
              </div>
              <AnimatedProgressBar
                value={feelings.military.percentage}
                min={0}
                max={100}
                level={feelings.military.level}
                height="xs"
                showGlowHead={true}
                showShimmer={true}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 3. BOTÃO DE AVANÇO PARA A SALA DO TRONO */}
      <footer className="border-t border-[#27272a] pt-6 font-mono flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-[10px] text-[#71717a] text-center sm:text-left">
          {labels.beginSub}
        </span>

        <button
          onClick={() => router.push(`/play/${state.id}`)}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-[#09090b] font-bold text-xs uppercase tracking-widest cursor-pointer transition-all active:translate-y-0.5 flex items-center justify-center gap-2"
        >
          <span>[ {labels.begin} ]</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
