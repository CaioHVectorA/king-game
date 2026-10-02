"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { KingdomState, Ruler, TurnResult } from "@/types/game";
import { ConversationStage } from "@/components/encounter/ConversationStage";
import { KingdomCodexModal } from "@/components/modals/KingdomCodexModal";
import { SuccessionModal } from "@/components/modals/SuccessionModal";
import { GameOverModal } from "@/components/modals/GameOverModal";
import { DocumentsViewer } from "@/components/documents/DocumentsViewer";
import { KingdomMap } from "@/components/map/KingdomMap";
import { resolveEncounter, Encounter } from "@/lib/game/encounters";
import { getStorylineDocuments } from "@/lib/game/documents";
import { getKingdomFeelings } from "@/lib/game/feelings";
import { evaluateDomainCrises, DomainCrisis } from "@/lib/game/crises";
import {
  saveSessionToLocalStorage,
  loadSessionFromLocalStorage,
  getAutoSaveMode,
  setAutoSaveMode,
  shouldAutoSaveAtTurn,
  AutoSaveMode,
} from "@/lib/storage/save-manager";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { OngoingSituationsSidebar } from "@/components/situations/OngoingSituationsSidebar";
import { gameAudio } from "@/lib/audio/game-audio";
import { MindPalaceDrawer } from "@/components/sovereign/MindPalaceDrawer";
import { WarTableModal } from "@/components/sovereign/WarTableModal";
import { EdictsCouncilModal } from "@/components/sovereign/EdictsCouncilModal";
import { LivingFactionsDrawer } from "@/components/sovereign/LivingFactionsDrawer";
import { EchoesTimelineModal } from "@/components/sovereign/EchoesTimelineModal";
import { DynasticEndingScreen } from "@/components/sovereign/DynasticEndingScreen";
import { buildChoiceDilemma } from "@/lib/game/dilemmas";
import { evaluateDynasticEnding } from "@/lib/game/endings-codex";
import { initializeLeaderPsychology } from "@/lib/game/mind-palace";
import { initializeLivingFactions } from "@/lib/game/factions-matrix";
import { DynasticEndingResult } from "@/types/sovereign";
import { Brain, Compass, Scroll, Users, History, Sparkles } from "lucide-react";

type SidebarTab = "metricas" | "mapa" | "documentos" | "cronica";

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [state, setState] = useState<KingdomState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sistema de Salvamento & LocalStorage
  const [autoSaveMode, setAutoSaveModeState] = useState<AutoSaveMode>("interval_5");
  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);
  const [isAutoSaveConfigOpen, setIsAutoSaveConfigOpen] = useState(false);

  // Leitor de Livros / Documentos
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);

  const [feedback, setFeedback] = useState<{
    narrative: string;
    effects: string[];
    aiUsed: boolean;
    playerDecision?: string;
  } | null>(null);
  const [resolvedEncounter, setResolvedEncounter] = useState<Encounter | null>(null);

  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isSuccessionOpen, setIsSuccessionOpen] = useState(false);
  const [successionInfo, setSuccessionInfo] = useState<{
    newRuler?: Ruler;
    cause?: string;
    deceasedName?: string;
  }>({});

  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("metricas");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Estados dos novos módulos de Soberania
  const [isMindPalaceOpen, setIsMindPalaceOpen] = useState(false);
  const [isWarTableOpen, setIsWarTableOpen] = useState(false);
  const [isEdictsModalOpen, setIsEdictsModalOpen] = useState(false);
  const [isFactionsDrawerOpen, setIsFactionsDrawerOpen] = useState(false);
  const [isEchoesModalOpen, setIsEchoesModalOpen] = useState(false);
  const [endingResult, setEndingResult] = useState<DynasticEndingResult | null>(null);

  // Carrega o jogo (servidor com fallback resiliente para LocalStorage)
  useEffect(() => {
    if (!gameId) return;
    async function loadGame() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/game?id=${gameId}`);
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Campanha não encontrada no servidor");
        }
        setState(data);
        // Salva backup local silenciosamente
        saveSessionToLocalStorage(data, "autosave");
      } catch (err: any) {
        // Fallback resiliente: tenta recuperar do LocalStorage
        const localSave = loadSessionFromLocalStorage(gameId);
        if (localSave) {
          setState(localSave);
          setSaveStatusMsg("Sessão recuperada com sucesso do LocalStorage!");
          setTimeout(() => setSaveStatusMsg(null), 4000);
        } else {
          setErrorMsg("Não foi possível carregar a sessão deste reinado.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadGame();
    setAutoSaveModeState(getAutoSaveMode());
  }, [gameId]);

  // Ação de Salvar Manualmente no LocalStorage
  const handleManualSave = () => {
    if (!state) return;
    gameAudio.playDecree();
    const ok = saveSessionToLocalStorage(state, "manual");
    if (ok) {
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setSaveStatusMsg(`✓ Salvo em LocalStorage às ${now}`);
      setTimeout(() => setSaveStatusMsg(null), 3500);
    }
  };

  // Alterna modo de auto-save
  const handleToggleAutoSave = (mode: AutoSaveMode) => {
    gameAudio.playClick();
    setAutoSaveMode(mode);
    setAutoSaveModeState(mode);
    setIsAutoSaveConfigOpen(false);
    const label =
      mode === "every_turn"
        ? "Auto-save a cada turno ATIVADO"
        : mode === "interval_5"
        ? "Auto-save a cada 5 turnos ATIVADO"
        : "Auto-save DESATIVADO (somente manual)";
    setSaveStatusMsg(label);
    setTimeout(() => setSaveStatusMsg(null), 3000);
  };

  const executeTurn = useCallback(
    async (payload: { freeTextDecision: string }) => {
      if (!state || isProcessingTurn || !state.currentEvent) return;
      const currentEncounter = resolveEncounter(state.currentEvent, state);
      setResolvedEncounter(currentEncounter);

      try {
        setIsProcessingTurn(true);
        setErrorMsg(null);

        const res = await fetch("/api/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: state.id, freeTextDecision: payload.freeTextDecision }),
        });

        const data: TurnResult = await res.json();
        if (!res.ok || (data as any).error) {
          throw new Error((data as any).error || "Falha ao processar turno no servidor");
        }

        const prevRulerName = state.currentRuler?.name;
        const newState = data.state;
        setState(newState);

        // Auto-save no LocalStorage de acordo com a configuração
        if (shouldAutoSaveAtTurn(newState.turn, autoSaveMode)) {
          saveSessionToLocalStorage(newState, "autosave");
          setSaveStatusMsg(`✓ Auto-salvo no LocalStorage (Turno ${newState.turn})`);
          setTimeout(() => setSaveStatusMsg(null), 2500);
        }

        setFeedback({
          narrative: data.narrative,
          effects: data.effectsSummary,
          aiUsed: data.aiUsed,
          playerDecision: payload.freeTextDecision,
        });

        if (data.successionOccurred && data.newRuler) {
          setSuccessionInfo({
            newRuler: data.newRuler,
            cause: "Morte ou golpe de estado",
            deceasedName: prevRulerName,
          });
          setIsSuccessionOpen(true);
        }

        // Checagem de Final Dinástico
        if (data.gameOver || newState.isGameOver) {
          const ending = evaluateDynasticEnding(newState);
          if (ending) {
            setEndingResult(ending);
          }
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "O Conselho Real encontrou um obstáculo.");
        setResolvedEncounter(null);
      } finally {
        setIsProcessingTurn(false);
      }
    },
    [state, isProcessingTurn, autoSaveMode]
  );

  const handleConcludeAudience = (decree: string) => executeTurn({ freeTextDecision: decree });
  const handleNextAudience = () => {
    setFeedback(null);
    setResolvedEncounter(null);
  };

  if (isLoading || !state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-[#f4f4f5] font-mono">
        <span className="text-xs uppercase tracking-widest text-[#71717a] mb-3">
          ABRINDO A SALA DO TRONO...
        </span>
        <div className="w-5 h-5 border-2 border-[#27272a] border-t-[#f4f4f5] animate-spin" />
      </div>
    );
  }

  const activeEncounter =
    resolvedEncounter ||
    (state.currentEvent ? { ...resolveEncounter(state.currentEvent, state), gameId: state.id } : null);

  const activeDilemma = state.currentEvent ? buildChoiceDilemma(state.currentEvent, state) : null;

  const availableDocs =
    state.documents && state.documents.length > 0
      ? state.documents
      : getStorylineDocuments(state.storylineId);

  // Avaliação das crises do domínio
  const activeCrises = evaluateDomainCrises(state);

  // Sentimentos das métricas (dados numéricos ocultados para imersão)
  const feelings = getKingdomFeelings(state);
  const feelingsList = [
    feelings.treasury,
    feelings.food,
    feelings.population,
    feelings.stability,
    feelings.military,
  ];

  const getMonthName = (m: number) => {
    const s = [
      "Inverno",
      "Inverno",
      "Primavera",
      "Primavera",
      "Primavera",
      "Verão",
      "Verão",
      "Verão",
      "Outono",
      "Outono",
      "Outono",
      "Inverno",
    ];
    return s[(m - 1) % 12] || `Mês ${m}`;
  };

  const SIDEBAR_TABS: { key: SidebarTab; label: string }[] = [
    { key: "metricas", label: "MÉTRICAS" },
    { key: "mapa", label: "MAPA" },
    { key: "documentos", label: "LIVROS" },
    { key: "cronica", label: "CRÔNICA" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-mono select-none">
      {/* TOPO: BARRA DE STATUS DO REINO E SALVAMENTO */}
      <header className="shrink-0 border-b border-amber-950/40 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 bg-[#08090d]/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              gameAudio.playClick();
              setSidebarOpen((v) => !v);
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className="px-2.5 py-1 text-xs border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded cursor-pointer transition-colors"
            title="Alternar painel lateral"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="font-royal text-sm font-bold text-amber-100">
              {state.currentRuler.name}
            </span>
            <span className="text-[10px] text-amber-400/80 border border-amber-500/30 bg-amber-950/30 px-2 py-0.5 rounded font-mono">
              Ano {state.year} • {getMonthName(state.month)} • Turno {state.turn}
            </span>
          </div>
          {state.storylineTitle && (
            <span className="text-[10px] text-zinc-400 hidden md:inline font-mono">
              [{state.storylineTitle}]
            </span>
          )}
        </div>

        {/* CONTROLES DE SALVAMENTO LOCAL & NAVEGAÇÃO */}
        <div className="flex items-center gap-2 relative">
          {/* Notificação efêmera de salvamento */}
          {saveStatusMsg && (
            <span className="text-[9px] px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-sans animate-fade-in-slide rounded">
              {saveStatusMsg}
            </span>
          )}

          {/* Botão de Salvar Manual */}
          <button
            onClick={handleManualSave}
            onMouseEnter={() => gameAudio.playHover()}
            className="px-2.5 py-1 text-[11px] border border-emerald-600/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400 cursor-pointer flex items-center gap-1 rounded transition-colors"
            title="Salvar progresso no LocalStorage do navegador"
          >
            💾 Salvar
          </button>

          {/* Configuração de Auto-Save */}
          <button
            onClick={() => {
              gameAudio.playClick();
              setIsAutoSaveConfigOpen((prev) => !prev);
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className="px-2 py-1 text-[10px] border border-zinc-700 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 rounded cursor-pointer transition-colors"
            title="Configurar frequência de salvamento automático"
          >
            ⚙ Auto: {autoSaveMode === "interval_5" ? "5T" : autoSaveMode === "every_turn" ? "1T" : "Off"}
          </button>

          {/* Menu Dropdown de Configuração de Auto-Save */}
          {isAutoSaveConfigOpen && (
            <div className="absolute right-24 top-9 z-50 bg-[#0d0e14] border border-zinc-700 shadow-2xl p-2 w-52 space-y-1 text-[10px] rounded animate-fade-in-slide">
              <div className="text-zinc-400 uppercase text-[9px] pb-1 border-b border-zinc-800 font-mono">
                Frequência de Auto-Save:
              </div>
              <button
                onClick={() => handleToggleAutoSave("interval_5")}
                className={`w-full text-left p-1.5 rounded cursor-pointer ${
                  autoSaveMode === "interval_5" ? "bg-amber-950/40 text-amber-300 font-bold" : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                ● A cada 5 turnos (Padrão)
              </button>
              <button
                onClick={() => handleToggleAutoSave("every_turn")}
                className={`w-full text-left p-1.5 rounded cursor-pointer ${
                  autoSaveMode === "every_turn" ? "bg-amber-950/40 text-amber-300 font-bold" : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                ● A cada turno (Contínuo)
              </button>
              <button
                onClick={() => handleToggleAutoSave("manual_only")}
                className={`w-full text-left p-1.5 rounded cursor-pointer ${
                  autoSaveMode === "manual_only" ? "bg-amber-950/40 text-amber-300 font-bold" : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                ● Somente manual (Desativado)
              </button>
            </div>
          )}

          {/* Botão de abrir Mind Palace (As 4 Vozes da Mente) */}
          <button
            onClick={() => {
              gameAudio.playClick();
              setIsMindPalaceOpen(true);
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className="px-2.5 py-1 text-xs border border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/50 text-purple-200 rounded cursor-pointer font-medium transition-colors flex items-center gap-1.5"
            title="Abrir o Palácio da Mente e as Quatro Vozes do Monólogo Interior"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Mente</span>
          </button>

          {/* Botão da Mesa de Guerra & Províncias */}
          <button
            onClick={() => {
              gameAudio.playClick();
              setIsWarTableOpen(true);
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className="px-2.5 py-1 text-xs border border-red-500/40 bg-red-950/30 hover:bg-red-900/50 text-red-200 rounded cursor-pointer font-medium transition-colors flex items-center gap-1.5"
            title="Abrir a Mesa Tática de Guerra e Guarnições Provinciais"
          >
            <Compass className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Guerra</span>
          </button>

          {/* Botão do Códice de Éditos & Leis */}
          <button
            onClick={() => {
              gameAudio.playClick();
              setIsEdictsModalOpen(true);
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className="px-2.5 py-1 text-xs border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/50 text-amber-200 rounded cursor-pointer font-medium transition-colors flex items-center gap-1.5"
            title="Abrir o Grande Códice de Éditos e Reformas do Estado"
          >
            <Scroll className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Éditos</span>
          </button>

          {/* Botão das Cinco Facções Vivas */}
          <button
            onClick={() => {
              gameAudio.playClick();
              setIsFactionsDrawerOpen(true);
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className="px-2.5 py-1 text-xs border border-sky-500/40 bg-sky-950/30 hover:bg-sky-900/50 text-sky-200 rounded cursor-pointer font-medium transition-colors flex items-center gap-1.5"
            title="Abrir dossiês e lealdade das Cinco Facções do Reino"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Facções</span>
          </button>

          {/* Botão da Linha do Tempo de Ecos Kármicos */}
          <button
            onClick={() => {
              gameAudio.playClick();
              setIsEchoesModalOpen(true);
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className="px-2.5 py-1 text-xs border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-200 rounded cursor-pointer font-medium transition-colors flex items-center gap-1.5"
            title="Abrir a Linha do Tempo dos Ecos Narrativos Kármicos"
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Ecos</span>
          </button>

          {/* Botão de abrir Biblioteca / Códice */}
          <button
            onClick={() => {
              gameAudio.playClick();
              setSelectedDocId(undefined);
              setIsDocViewerOpen(true);
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className="px-2.5 py-1 text-xs border border-zinc-700 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded cursor-pointer font-medium transition-colors"
            title="Abrir códice de documentos e livros do reino"
          >
            📖 Livros
          </button>

          {/* Botão de alternar Mapa */}
          <button
            onClick={() => {
              gameAudio.playClick();
              setSidebarOpen(true);
              setSidebarTab("mapa");
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className={`px-2.5 py-1 text-xs border rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
              sidebarOpen && sidebarTab === "mapa"
                ? "border-blue-500/50 bg-blue-950/40 text-blue-200 font-bold"
                : "border-zinc-700 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300"
            }`}
            title="Abrir cartografia e planta urbana"
          >
            🗺️ Mapa
          </button>

          {/* Botão de alternar Situações Atuais */}
          <button
            onClick={() => {
              gameAudio.playClick();
              setRightSidebarOpen((v) => !v);
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className={`px-2.5 py-1 text-xs border rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
              rightSidebarOpen
                ? "border-amber-500/50 bg-amber-950/40 text-amber-200 font-bold"
                : "border-zinc-700 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300"
            }`}
            title="Alternar menu lateral à direita de Situações Atuais (expedições, guerras, discursos)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>
              🧭 Situações ({(state.ongoingSituations?.filter((s) => s.status === "ativa").length || 0) + (state.activeWars?.length || 0)})
            </span>
          </button>

          <button
            onClick={() => {
              gameAudio.playClick();
              router.push(`/intro/${state.id}`);
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className="px-2.5 py-1 text-xs border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded cursor-pointer transition-colors font-mono"
          >
            Prólogo
          </button>
          <button
            onClick={() => {
              gameAudio.playClick();
              router.push("/");
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className="px-2.5 py-1 text-xs border border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50 rounded cursor-pointer transition-colors font-mono font-bold"
          >
            Menu
          </button>
        </div>
      </header>

      {/* BANNER DINÂMICO DE CRISE DO REINO (SE RECURSOS CHEGAREM PERTO DE ZERO) */}
      {activeCrises.length > 0 && (
        <div className="bg-[#240808] border-b border-red-500/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-red-200 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white font-bold text-xs px-2 py-0.5 uppercase tracking-wider font-mono">
              ⚠ ESTADO DE CRISE ATIVA
            </span>
            <span className="font-bold text-red-100">{activeCrises[0].title}:</span>
            <span className="text-red-300 font-sans text-xs">{activeCrises[0].alertText}</span>
          </div>
          <span className="text-xs text-amber-300 font-sans hidden lg:inline">
            Recomendação: {activeCrises[0].recommendation}
          </span>
        </div>
      )}

      {/* CORPO PRINCIPAL: SIDEBAR + ÁREA DE CONVERSA */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR LATERAL COM LARGURA AMPLIADA E FONTES LEGÍVEIS */}
        {sidebarOpen && (
          <aside className="w-72 sm:w-80 shrink-0 border-r border-[#27272a] flex flex-col overflow-hidden bg-[#09090b]">
            {/* Tabs da sidebar */}
            <div className="flex border-b border-[#27272a] bg-[#0c0c10]">
              {SIDEBAR_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSidebarTab(t.key)}
                  className={`flex-1 py-2.5 text-[11px] uppercase tracking-wider cursor-pointer transition-colors font-mono ${
                    sidebarTab === t.key
                      ? "text-[#f4f4f5] bg-[#14141a] border-b-2 border-[#f4f4f5] font-bold"
                      : "text-[#71717a] hover:text-[#d4d4d8]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Conteúdo da sidebar */}
            <div className="flex-1 overflow-y-auto">
              {/* ABA: MÉTRICAS (NUMEROS OCULTOS / VISUAL & QUALITATIVO) */}
              {sidebarTab === "metricas" && (
                <div className="p-3.5 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#1c1c1e]">
                    <span className="text-xs uppercase tracking-widest text-[#a1a1aa] font-mono font-bold">
                      Estado do Domínio
                    </span>
                    {activeCrises.length > 0 && (
                      <span className="text-xs text-red-400 font-bold uppercase animate-pulse font-mono">
                        ● Em Crise
                      </span>
                    )}
                  </div>

                  {feelingsList.map((f) => (
                    <div
                      key={f.label}
                      className={`p-3 border space-y-2 transition-colors ${
                        f.level === "danger"
                          ? "border-red-500/50 bg-[#160a0a]"
                          : f.level === "warning"
                          ? "border-amber-500/40 bg-[#140e08]"
                          : "border-[#1c1c1e] bg-[#0d0d10]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#a1a1aa] uppercase font-bold tracking-wider font-mono">
                          {f.label}
                        </span>
                        <span
                          className={`font-bold truncate max-w-[150px] text-right font-mono ${
                            f.level === "danger"
                              ? "text-red-400"
                              : f.level === "warning"
                              ? "text-amber-400"
                              : "text-[#f4f4f5]"
                          }`}
                        >
                          {f.feeling}
                        </span>
                      </div>

                      {/* Barra de Progresso com Shimmer e Brilho sem expor o número cru */}
                      <AnimatedProgressBar
                        value={f.percentage}
                        min={0}
                        max={100}
                        level={f.level}
                        height="xs"
                        showGlowHead
                        showShimmer
                      />

                      <p className="text-xs text-[#a1a1aa] font-sans leading-relaxed">
                        {f.description}
                      </p>
                    </div>
                  ))}

                  {/* Guerras Ativas */}
                  {state.activeWars.length > 0 && (
                    <div className="mt-2.5 p-3 border border-red-500/40 bg-[#140a0a] space-y-1.5">
                      <div className="text-xs uppercase text-red-400 font-bold font-mono">⚔ Frentes de Guerra</div>
                      {state.activeWars.map((w) => (
                        <div key={w} className="text-xs text-[#f4f4f5] font-sans">
                          {w}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Éditos e Leis Ativas */}
                  {state.laws.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="text-xs uppercase text-[#a1a1aa] font-mono font-bold">Éditos &amp; Leis em Vigor</div>
                      {state.laws.slice(0, 5).map((law, i) => (
                        <div
                          key={i}
                          className="text-xs text-[#d4d4d8] font-sans border-l-2 border-[#3f3f46] pl-2.5 py-0.5"
                        >
                          {law}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: MAPA RICO (CIDADE / MUNDI) */}
              {sidebarTab === "mapa" && (
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-[#27272a]">
                    <span className="text-xs uppercase tracking-widest text-[#a1a1aa] font-mono font-bold">
                      Cartografia Operacional
                    </span>
                    <span className="text-[11px] text-[#71717a] font-mono">
                      (Use AMPLIAR no mapa)
                    </span>
                  </div>
                  <KingdomMap
                    seed={state.seed}
                    storylineId={state.storylineId}
                    activeWars={state.activeWars}
                    relations={state.relations}
                    className="w-full"
                  />
                </div>
              )}

              {/* ABA: MINI-LIVROS & ÉDITOS (TOTALMENTE LER E ACESSAR) */}
              {sidebarTab === "documentos" && (
                <div className="p-3 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#1c1c1e]">
                    <span className="text-xs uppercase tracking-widest text-[#a1a1aa] font-mono font-bold">
                      Arquivos do Reino ({availableDocs.length})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDocId(undefined);
                        setIsDocViewerOpen(true);
                      }}
                      className="text-xs text-[#93c5fd] hover:underline cursor-pointer font-mono font-bold"
                    >
                      Ler Todos →
                    </button>
                  </div>

                  {availableDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        setIsDocViewerOpen(true);
                      }}
                      className="w-full text-left p-3 bg-[#0d0d10] border border-[#27272a] hover:border-[#52525b] cursor-pointer group transition-colors block shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#f4f4f5] font-bold group-hover:text-blue-300 truncate">
                          {doc.title}
                        </span>
                        <span className="text-[10px] text-[#71717a] uppercase ml-1 font-mono font-bold">
                          [{doc.category}]
                        </span>
                      </div>
                      {doc.subtitle && (
                        <div className="text-[11px] text-[#a1a1aa] truncate mt-1 font-sans">
                          {doc.subtitle}
                        </div>
                      )}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setSelectedDocId(undefined);
                      setIsDocViewerOpen(true);
                    }}
                    className="w-full py-2.5 text-xs uppercase border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#52525b] cursor-pointer mt-2 font-mono font-bold transition-all"
                  >
                    📖 Abrir Leitor do Códice →
                  </button>
                </div>
              )}

              {/* ABA: CRÔNICA DINÁSTICA */}
              {sidebarTab === "cronica" && (
                <div className="p-3 space-y-2">
                  <div className="text-xs uppercase tracking-widest text-[#a1a1aa] pb-1 border-b border-[#1c1c1e] font-mono font-bold">
                    Histórico do Reinado
                  </div>
                  {state.history
                    .slice(-8)
                    .reverse()
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2.5 bg-[#0d0d10] border border-[#27272a] space-y-1 shadow-sm"
                      >
                        <div className="text-[11px] text-[#71717a] font-mono">
                          Turno {entry.turn} • Ano {entry.year}
                        </div>
                        <div className="text-xs text-[#f4f4f5] font-sans font-medium leading-snug">
                          {entry.eventTitle}
                        </div>
                        <div className="text-xs text-[#a1a1aa] font-sans italic">
                          "{entry.playerDecision.slice(0, 70)}…"
                        </div>
                      </div>
                    ))}
                  <button
                    onClick={() => setIsCodexOpen(true)}
                    className="w-full py-2.5 text-xs uppercase border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer mt-2 font-mono font-bold transition-all"
                  >
                    Abrir Crônica Completa →
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ÁREA PRINCIPAL: AUDIÊNCIA E CONVERSA COM O TRONO */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {errorMsg && (
            <div className="mx-4 mt-3 p-3 bg-[#18181b] border border-red-500/40 text-xs text-red-300 flex justify-between items-center">
              <span>[ {errorMsg} ]</span>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-[#71717a] hover:text-[#f4f4f5] cursor-pointer px-1"
              >
                ✕
              </button>
            </div>
          )}

          {activeEncounter && !state.isGameOver ? (
            <ConversationStage
              encounter={activeEncounter}
              rulerTitle={state.currentRuler.title}
              rulerName={state.currentRuler.name}
              isLoadingTurn={isProcessingTurn}
              feedback={feedback}
              onConcludeAudience={handleConcludeAudience}
              onNextAudience={handleNextAudience}
              dilemma={activeDilemma}
            />
          ) : !state.isGameOver ? (
            <div className="flex-1 flex items-center justify-center text-[#52525b] text-xs font-mono">
              Nenhuma audiência pendente perante o trono.
            </div>
          ) : null}
        </main>

        {/* MENU LATERAL À DIREITA: SITUAÇÕES ATUAIS */}
        <OngoingSituationsSidebar
          situations={state.ongoingSituations || []}
          activeWars={state.activeWars || []}
          isOpen={rightSidebarOpen}
          onClose={() => setRightSidebarOpen(false)}
        />
      </div>

      {/* MODAIS DO SISTEMA */}
      <DocumentsViewer
        documents={availableDocs}
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        initialDocumentId={selectedDocId}
      />
      <KingdomCodexModal
        isOpen={isCodexOpen}
        state={state}
        onClose={() => setIsCodexOpen(false)}
      />
      <SuccessionModal
        isOpen={isSuccessionOpen}
        onClose={() => setIsSuccessionOpen(false)}
        newRuler={successionInfo.newRuler}
        causeOfDeath={successionInfo.cause}
        deceasedName={successionInfo.deceasedName}
      />
      <GameOverModal
        isOpen={state.isGameOver && !endingResult}
        state={state}
        onRestart={() => router.push("/")}
      />

      {/* ─── SUBSISTEMAS DA NOVA ERA DE SOBERANIA ─── */}
      <MindPalaceDrawer
        psychology={state.psychology || initializeLeaderPsychology(state.currentRuler.archetype)}
        isOpen={isMindPalaceOpen}
        onClose={() => setIsMindPalaceOpen(false)}
        rulerName={state.currentRuler.name}
      />

      <WarTableModal
        state={state}
        isOpen={isWarTableOpen}
        onClose={() => setIsWarTableOpen(false)}
        onStateUpdate={(ns) => setState(ns)}
      />

      <EdictsCouncilModal
        state={state}
        isOpen={isEdictsModalOpen}
        onClose={() => setIsEdictsModalOpen(false)}
        onStateUpdate={(ns) => setState(ns)}
      />

      <LivingFactionsDrawer
        factions={state.livingFactions || initializeLivingFactions()}
        isOpen={isFactionsDrawerOpen}
        onClose={() => setIsFactionsDrawerOpen(false)}
      />

      <EchoesTimelineModal
        echoes={state.echoes || []}
        currentTurn={state.turn}
        isOpen={isEchoesModalOpen}
        onClose={() => setIsEchoesModalOpen(false)}
      />

      {/* TELA CINEMATOGRÁFICA DE FINAL DINÁSTICO */}
      {endingResult && (
        <DynasticEndingScreen
          ending={endingResult}
          state={state}
          onReturnToMenu={() => router.push("/")}
        />
      )}
    </div>
  );
}
