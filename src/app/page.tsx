"use client";

import React, { useState, useEffect } from "react";
import { KingdomState, Ruler, TurnResult } from "@/types/game";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { ResourceBar } from "@/components/dashboard/ResourceBar";
import { EventCard } from "@/components/event/EventCard";
import { DecisionBox } from "@/components/event/DecisionBox";
import { TurnFeedback } from "@/components/event/TurnFeedback";
import { HistoryDrawer } from "@/components/drawers/HistoryDrawer";
import { CourtDrawer } from "@/components/drawers/CourtDrawer";
import { FactionsDrawer } from "@/components/drawers/FactionsDrawer";
import { DiplomacyDrawer } from "@/components/drawers/DiplomacyDrawer";
import { SuccessionModal } from "@/components/modals/SuccessionModal";
import { GameOverModal } from "@/components/modals/GameOverModal";
import { NewGameModal } from "@/components/modals/NewGameModal";
import { Crown, Sparkles, AlertCircle } from "lucide-react";

export default function KingdomGamePage() {
  const [state, setState] = useState<KingdomState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Turn Feedback
  const [feedback, setFeedback] = useState<{
    narrative: string;
    effects: string[];
    aiUsed: boolean;
    playerDecision?: string;
  } | null>(null);

  // Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCourtOpen, setIsCourtOpen] = useState(false);
  const [isFactionsOpen, setIsFactionsOpen] = useState(false);
  const [isDiplomacyOpen, setIsDiplomacyOpen] = useState(false);

  // Modais
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isSuccessionOpen, setIsSuccessionOpen] = useState(false);
  const [successionInfo, setSuccessionInfo] = useState<{
    newRuler?: Ruler;
    cause?: string;
    deceasedName?: string;
  }>({});

  // Inicialização
  useEffect(() => {
    async function initGame() {
      try {
        setIsLoading(true);
        // Tenta listar jogos existentes
        const resList = await fetch("/api/game");
        const list = await resList.json();

        if (Array.isArray(list) && list.length > 0) {
          // Carrega o jogo mais recente
          const activeGame = list.find((g) => !g.isGameOver) || list[0];
          const resGame = await fetch(`/api/game?id=${activeGame.id}`);
          const gameData = await resGame.json();
          if (gameData && !gameData.error) {
            setState(gameData);
            setIsLoading(false);
            return;
          }
        }

        // Se não houver, cria um novo
        const resCreate = await fetch("/api/game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Reino de Valoria",
            rulerName: "Alden II",
          }),
        });
        const newGame = await resCreate.json();
        setState(newGame);
      } catch (err: any) {
        console.error("Erro ao inicializar jogo:", err);
        setErrorMsg("Não foi possível carregar a dinastia. Tente recarregar a página.");
      } finally {
        setIsLoading(false);
      }
    }

    initGame();
  }, []);

  // Execução de Turno
  const executeTurn = async (payload: { choiceId?: string; freeTextDecision?: string }) => {
    if (!state || isProcessingTurn) return;

    try {
      setIsProcessingTurn(true);
      setErrorMsg(null);

      const res = await fetch("/api/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: state.id,
          ...payload,
        }),
      });

      const data: TurnResult = await res.json();

      if (!res.ok || (data as any).error) {
        throw new Error((data as any).error || "Falha ao processar decreto real");
      }

      const prevRulerName = state.currentRuler?.name;
      setState(data.state);

      setFeedback({
        narrative: data.narrative,
        effects: data.effectsSummary,
        aiUsed: data.aiUsed,
        playerDecision:
          payload.freeTextDecision ||
          state.currentEvent?.choices.find((c) => c.id === payload.choiceId)?.label,
      });

      // Checa Sucessão
      if (data.successionOccurred && data.newRuler) {
        setSuccessionInfo({
          newRuler: data.newRuler,
          cause: "Morte ou golpe de estado",
          deceasedName: prevRulerName,
        });
        setIsSuccessionOpen(true);
      }
    } catch (err: any) {
      console.error("Erro no turno:", err);
      setErrorMsg(err?.message || "O Conselho Real encontrou um obstáculo ao executar a ordem.");
    } finally {
      setIsProcessingTurn(false);
    }
  };

  const handleSelectChoice = (choiceId: string) => {
    executeTurn({ choiceId });
  };

  const handleFreeTextDecision = (decision: string) => {
    executeTurn({ freeTextDecision: decision });
  };

  const handleCreateNewGame = async (params: {
    name: string;
    rulerName: string;
    seed?: number;
    storylineId?: string;
  }) => {
    try {
      setIsLoading(true);
      setFeedback(null);
      setErrorMsg(null);
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      setState(data);
    } catch (err: any) {
      console.error("Erro ao criar novo jogo:", err);
      setErrorMsg("Erro ao criar nova dinastia.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadGame = async (gameId: string) => {
    try {
      setIsLoading(true);
      setFeedback(null);
      setErrorMsg(null);
      const res = await fetch(`/api/game?id=${gameId}`);
      const data = await res.json();
      setState(data);
    } catch (err: any) {
      console.error("Erro ao carregar jogo:", err);
      setErrorMsg("Erro ao carregar dinastia.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de Carregamento
  if (isLoading || !state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090d] text-slate-200 p-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-4 shadow-xl shadow-amber-950/40 pulse-glow">
          👑
        </div>
        <h2 className="font-royal text-xl font-bold text-amber-200 mb-2 tracking-wide">
          Abrindo os Pergaminhos do Reino...
        </h2>
        <p className="text-xs text-slate-400">
          Preparando a corte e consultando os oráculos da dinastia.
        </p>
      </div>
    );
  }

  const currentCharacter =
    state.currentEvent?.characterId && state.characters[state.currentEvent.characterId]
      ? state.characters[state.currentEvent.characterId]
      : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 selection:bg-amber-600/30 selection:text-amber-200 relative pb-16">
      {/* 1. Header do Reino e Dinastia */}
      <HeaderBar
        state={state}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCourt={() => setIsCourtOpen(true)}
        onOpenFactions={() => setIsFactionsOpen(true)}
        onOpenDiplomacy={() => setIsDiplomacyOpen(true)}
        onNewGame={() => setIsNewGameOpen(true)}
      />

      {/* 2. Barra de Recursos Centrais */}
      <ResourceBar state={state} />

      {/* Alerta de Erro se houver */}
      {errorMsg && (
        <div className="max-w-2xl mx-auto px-4 mb-4 w-full">
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-red-200 font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 3. Área Central: Narrativa + Decisões */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-2">
        {/* Retorno do Turno Anterior */}
        {feedback && (
          <TurnFeedback
            narrative={feedback.narrative}
            effects={feedback.effects}
            aiUsed={feedback.aiUsed}
            playerDecision={feedback.playerDecision}
          />
        )}

        {/* Card do Evento Vigente */}
        {state.currentEvent && !state.isGameOver && (
          <>
            <EventCard
              event={state.currentEvent}
              character={currentCharacter}
            />

            {/* Caixa de Decisão (Opções Rápidas + Campo Livre de IA) */}
            <DecisionBox
              choices={state.currentEvent.choices}
              isLoading={isProcessingTurn}
              onSelectChoice={handleSelectChoice}
              onSubmitFreeText={handleFreeTextDecision}
            />
          </>
        )}
      </main>

      {/* 4. Rodapé Sutil */}
      <footer className="w-full text-center py-4 text-[11px] text-slate-500 border-t border-slate-900/60">
        AI Kingdom Simulator • Decisões Livres & Game Engine Autoritativo • 1 Chamada por Turno
      </footer>

      {/* 5. Gavetas Laterais (Drawers) */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={state.history}
      />

      <CourtDrawer
        isOpen={isCourtOpen}
        onClose={() => setIsCourtOpen(false)}
        characters={state.characters}
      />

      <FactionsDrawer
        isOpen={isFactionsOpen}
        onClose={() => setIsFactionsOpen(false)}
        factions={state.factions}
      />

      <DiplomacyDrawer
        isOpen={isDiplomacyOpen}
        onClose={() => setIsDiplomacyOpen(false)}
        realms={state.realms}
        activeWars={state.activeWars}
      />

      {/* 6. Modais de Sucessão, Queda e Nova Dinastia */}
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
        onRestart={() => setIsNewGameOpen(true)}
      />

      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onCreateNewGame={handleCreateNewGame}
        onLoadGame={handleLoadGame}
      />
    </div>
  );
}
