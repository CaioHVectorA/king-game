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
import { evaluateDomainCrises } from "@/lib/game/crises";
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
import { Shield, Coins, Utensils, Users, Award, Map, BookOpen, Compass, Save, Settings, Home, Crown, AlertTriangle } from "lucide-react";

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

  // Carrega o jogo
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
        saveSessionToLocalStorage(data, "autosave");
      } catch (err: any) {
        const localSave = loadSessionFromLocalStorage(gameId);
        if (localSave) {
          setState(localSave);
          setSaveStatusMsg("Sessão recuperada com sucesso!");
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

  const handleManualSave = () => {
    if (!state) return;
    const ok = saveSessionToLocalStorage(state, "manual");
    if (ok) {
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setSaveStatusMsg(`✓ Salvo em LocalStorage às ${now}`);
      setTimeout(() => setSaveStatusMsg(null), 3500);
    }
  };

  const handleToggleAutoSave = (mode: AutoSaveMode) => {
    setAutoSaveMode(mode);
    setAutoSaveModeState(mode);
    setIsAutoSaveConfigOpen(false);
    const label =
      mode === "every_turn"
        ? "Auto-save a cada turno ATIVADO"
        : mode === "interval_5"
        ? "Auto-save a cada 5 turnos ATIVADO"
        : "Auto-save DESATIVADO";
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#06070a] text-[#f4f4f5] font-mono">
        <span className="text-xs uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
          <Crown className="w-5 h-5 animate-bounce" />
          <span>ABRINDO A SALA DO TRONO...</span>
        </span>
        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  const activeEncounter =
    resolvedEncounter ||
    (state.currentEvent ? { ...resolveEncounter(state.currentEvent, state), gameId: state.id } : null);

  const availableDocs =
    state.documents && state.documents.length > 0
      ? state.documents
      : getStorylineDocuments(state.storylineId);

  const activeCrises = evaluateDomainCrises(state);
  const feelings = getKingdomFeelings(state);
  const feelingsList = [
    { ...feelings.treasury, icon: Coins },
    { ...feelings.food, icon: Utensils },
    { ...feelings.population, icon: Users },
    { ...feelings.stability, icon: Award },
    { ...feelings.military, icon: Shield },
  ];

  const getMonthName = (m: number) => {
    const s = [
      "Inverno", "Inverno", "Primavera", "Primavera", "Primavera",
      "Verão", "Verão", "Verão", "Outono", "Outono", "Outono", "Inverno"
    ];
    return s[(m - 1) % 12] || `Mês ${m}`;
  };

  const SIDEBAR_TABS: { key: SidebarTab; label: string }[] = [
    { key: "metricas", label: "DOMÍNIO" },
    { key: "mapa", label: "MAPA" },
    { key: "documentos", label: "LIVROS" },
    { key: "cronica", label: "CRÔNICA" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#06070a] text-[#f4f4f5] font-mono select-none">
      {/* TOPO: GAME HUD SUPERIOR (BARRA DE STATUS DE JOGO) */}
      <header className="shrink-0 game-hud-panel border-b border-amber-500/30 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 border border-[#333952] bg-[#11131c] text-amber-400 hover:border-amber-400 cursor-pointer"
            title="Alternar painel do domínio"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base">👑</span>
            <div>
              <span className="font-royal text-sm font-bold text-amber-200">
                {state.currentRuler.name}
              </span>
              <span className="text-[10px] text-amber-400/80 ml-2 border border-amber-500/30 bg-amber-950/20 px-2 py-0.5 font-mono">
                Ano {state.year} • {getMonthName(state.month)} • Turno {state.turn}
              </span>
            </div>
          </div>
        </div>

        {/* RECURSOS VITAIS VISUAIS NO GAME HUD */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 border border-[#333952] bg-[#0c0d14]">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-200 font-bold">{feelings.treasury.feeling}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 border border-[#333952] bg-[#0c0d14]">
            <Utensils className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-200 font-bold">{feelings.food.feeling}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 border border-[#333952] bg-[#0c0d14]">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-200 font-bold">{feelings.military.feeling}</span>
          </div>
        </div>

        {/* CONTROLES E OPÇÕES DE GAME */}
        <div className="flex items-center gap-2 relative">
          {saveStatusMsg && (
            <span className="text-[10px] px-2 py-0.5 bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-sans">
              {saveStatusMsg}
            </span>
          )}

          <button
            onClick={handleManualSave}
            className="px-2.5 py-1 text-xs border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50 cursor-pointer flex items-center gap-1 font-bold"
            title="Salvar progresso"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar</span>
          </button>

          <button
            onClick={() => setIsAutoSaveConfigOpen((prev) => !prev)}
            className="p-1.5 border border-[#333952] text-[#94a3b8] hover:text-white cursor-pointer"
            title="Configurações de Save"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {isAutoSaveConfigOpen && (
            <div className="absolute right-20 top-10 z-50 game-hud-panel p-2 w-52 space-y-1 text-[10px]">
              <div className="text-amber-400 uppercase text-[9px] pb-1 border-b border-[#333952] font-bold">
                Auto-Save:
              </div>
              <button
                onClick={() => handleToggleAutoSave("interval_5")}
                className={`w-full text-left p-1.5 cursor-pointer ${
                  autoSaveMode === "interval_5" ? "bg-amber-950 text-amber-300 font-bold" : "text-[#94a3b8] hover:bg-[#171a26]"
                }`}
              >
                ● A cada 5 turnos
              </button>
              <button
                onClick={() => handleToggleAutoSave("every_turn")}
                className={`w-full text-left p-1.5 cursor-pointer ${
                  autoSaveMode === "every_turn" ? "bg-amber-950 text-amber-300 font-bold" : "text-[#94a3b8] hover:bg-[#171a26]"
                }`}
              >
                ● A cada turno
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setSelectedDocId(undefined);
              setIsDocViewerOpen(true);
            }}
            className="px-2.5 py-1 text-xs border border-[#333952] bg-[#11131c] text-[#cbd5e1] hover:border-amber-400 cursor-pointer flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Livros</span>
          </button>

          <button
            onClick={() => {
              setSidebarOpen(true);
              setSidebarTab("mapa");
            }}
            className={`px-2.5 py-1 text-xs border flex items-center gap-1 cursor-pointer transition-colors ${
              sidebarOpen && sidebarTab === "mapa"
                ? "border-blue-500 bg-blue-950/40 text-blue-300 font-bold"
                : "border-[#333952] bg-[#11131c] text-[#cbd5e1] hover:border-blue-400"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Mapa</span>
          </button>

          <button
            onClick={() => setRightSidebarOpen((v) => !v)}
            className={`px-2.5 py-1 text-xs border flex items-center gap-1 cursor-pointer transition-colors ${
              rightSidebarOpen
                ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold"
                : "border-[#333952] bg-[#11131c] text-[#cbd5e1] hover:border-emerald-400"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quests ({(state.ongoingSituations?.filter((s) => s.status === "ativa").length || 0) + (state.activeWars?.length || 0)})</span>
          </button>

          <button
            onClick={() => router.push("/")}
            className="p-1.5 border border-[#333952] bg-[#11131c] text-[#94a3b8] hover:text-white cursor-pointer"
            title="Menu Principal"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* BANNER DE CRISE */}
      {activeCrises.length > 0 && (
        <div className="bg-red-950 border-b border-red-500/70 px-4 py-2 flex items-center justify-between gap-2 text-xs text-red-200 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="font-bold">{activeCrises[0].title}:</span>
            <span className="text-red-300 font-sans">{activeCrises[0].alertText}</span>
          </div>
        </div>
      )}

      {/* CORPO PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR DE STATUS E DOMÍNIO */}
        {sidebarOpen && (
          <aside className="w-72 sm:w-80 shrink-0 border-r border-[#272a38] flex flex-col overflow-hidden bg-[#090b10]">
            <div className="flex border-b border-[#272a38] bg-[#0c0e16]">
              {SIDEBAR_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSidebarTab(t.key)}
                  className={`flex-1 py-2.5 text-[11px] uppercase tracking-wider cursor-pointer font-bold ${
                    sidebarTab === t.key
                      ? "text-amber-300 bg-[#161924] border-b-2 border-amber-400"
                      : "text-[#71717a] hover:text-[#e2e8f0]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {sidebarTab === "metricas" && (
                <>
                  {/* METAS DINÁSTICAS */}
                  {state.dynasticGoals && state.dynasticGoals.length > 0 && (
                    <div className="p-3 game-card border-amber-500/40 space-y-2">
                      <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold flex items-center justify-between">
                        <span>🏆 Objetivos de Reinado</span>
                        <span className="text-[#94a3b8]">
                          {state.dynasticGoals.filter((g) => g.completed).length}/{state.dynasticGoals.length}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {state.dynasticGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className={`p-2 border text-xs font-sans ${
                              goal.completed
                                ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
                                : "border-[#272a38] bg-[#0c0d14] text-[#94a3b8]"
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono font-bold">
                              <span>{goal.completed ? "✓ " : "○ "}{goal.title}</span>
                            </div>
                            <p className="text-[11px] mt-0.5 leading-snug">{goal.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feelingsList.map((f) => {
                    const IconComp = f.icon;
                    return (
                      <div
                        key={f.label}
                        className={`p-3 game-card space-y-2 ${
                          f.level === "danger"
                            ? "border-red-500/50 bg-red-950/20"
                            : f.level === "warning"
                            ? "border-amber-500/40 bg-amber-950/20"
                            : "border-[#272a38]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-amber-300 uppercase font-bold flex items-center gap-1.5">
                            <IconComp className="w-3.5 h-3.5 text-amber-400" />
                            <span>{f.label}</span>
                          </span>
                          <span className="font-bold text-white">{f.feeling}</span>
                        </div>

                        <AnimatedProgressBar
                          value={f.percentage}
                          min={0}
                          max={100}
                          level={f.level}
                          height="xs"
                          showGlowHead
                          showShimmer
                        />

                        <p className="text-xs text-[#94a3b8] font-sans leading-relaxed">
                          {f.description}
                        </p>
                      </div>
                    );
                  })}
                </>
              )}

              {sidebarTab === "mapa" && (
                <div className="space-y-2">
                  <KingdomMap
                    seed={state.seed}
                    storylineId={state.storylineId}
                    activeWars={state.activeWars}
                    relations={state.relations}
                    className="w-full"
                  />
                </div>
              )}

              {sidebarTab === "documentos" && (
                <div className="space-y-2">
                  {availableDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        setIsDocViewerOpen(true);
                      }}
                      className="w-full text-left p-3 game-card block"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-200 truncate">{doc.title}</span>
                        <span className="text-[10px] text-amber-400 font-bold uppercase">[{doc.category}]</span>
                      </div>
                      {doc.subtitle && (
                        <p className="text-[11px] text-[#94a3b8] mt-1 font-sans truncate">{doc.subtitle}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {sidebarTab === "cronica" && (
                <div className="space-y-2">
                  {state.history.slice(-8).reverse().map((entry) => (
                    <div key={entry.id} className="p-2.5 game-card space-y-1">
                      <div className="text-[10px] text-amber-400">Turno {entry.turn} • Ano {entry.year}</div>
                      <div className="text-xs font-bold text-white font-sans">{entry.eventTitle}</div>
                      <div className="text-xs text-[#94a3b8] font-sans italic">"{entry.playerDecision}"</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ÁREA PRINCIPAL DA SALA DO TRONO */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-[#06070a]">
          {errorMsg && (
            <div className="mx-4 mt-3 p-3 bg-red-950 border border-red-500 text-xs text-red-200 flex justify-between items-center">
              <span>[ {errorMsg} ]</span>
              <button onClick={() => setErrorMsg(null)}>✕</button>
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
            />
          ) : null}
        </main>

        <OngoingSituationsSidebar
          situations={state.ongoingSituations || []}
          activeWars={state.activeWars || []}
          isOpen={rightSidebarOpen}
          onClose={() => setRightSidebarOpen(false)}
        />
      </div>

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
        isOpen={state.isGameOver}
        state={state}
        onRestart={() => router.push("/")}
      />
    </div>
  );
}
