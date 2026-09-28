"use client";

import React from "react";
import { OngoingSituation } from "@/types/game";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { Compass, Swords, AlertTriangle, Wrench, Megaphone, Search, CheckCircle2, X } from "lucide-react";

interface OngoingSituationsSidebarProps {
  situations: OngoingSituation[];
  activeWars?: string[];
  isOpen: boolean;
  onClose: () => void;
}

function getSituationIcon(type: OngoingSituation["type"]) {
  switch (type) {
    case "expedicao":
      return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
    case "guerra":
      return <Swords className="w-3.5 h-3.5 text-red-400" />;
    case "crise":
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    case "projeto":
      return <Wrench className="w-3.5 h-3.5 text-blue-400" />;
    case "discurso":
      return <Megaphone className="w-3.5 h-3.5 text-purple-400" />;
    case "investigacao":
      return <Search className="w-3.5 h-3.5 text-yellow-400" />;
    default:
      return <Compass className="w-3.5 h-3.5 text-[#71717a]" />;
  }
}

function getSituationTypeLabel(type: OngoingSituation["type"]): string {
  switch (type) {
    case "expedicao":
      return "Expedição";
    case "guerra":
      return "Campanha de Guerra";
    case "crise":
      return "Crise Sob Resolução";
    case "projeto":
      return "Projeto de Estado";
    case "discurso":
      return "Discurso & Proclamação";
    case "investigacao":
      return "Investigação";
    default:
      return "Operação";
  }
}

export function OngoingSituationsSidebar({
  situations = [],
  activeWars = [],
  isOpen,
  onClose,
}: OngoingSituationsSidebarProps) {
  if (!isOpen) return null;

  const activeSituations = situations.filter((s) => s.status === "ativa");
  const completedSituations = situations.filter((s) => s.status === "concluida");
  const totalActive = activeSituations.length + activeWars.length;

  return (
    <aside className="w-80 shrink-0 border-l border-[#27272a] bg-[#0c0c0e] flex flex-col h-full z-30 transition-all select-none">
      {/* Cabeçalho */}
      <div className="shrink-0 p-3.5 border-b border-[#27272a] bg-[#0f0f13] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-royal text-xs font-bold uppercase tracking-wider text-[#f4f4f5]">
            Situações Atuais
          </h3>
          <span className="text-[9px] px-1.5 py-0.5 border border-[#27272a] bg-[#18181b] text-[#a1a1aa] font-mono">
            {totalActive}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[#71717a] hover:text-[#f4f4f5] text-xs p-1 cursor-pointer transition-colors"
          title="Fechar painel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-2 border-b border-[#1c1c1e] bg-[#09090b]/60 text-[8px] text-[#71717a] font-sans px-3">
        Operações em campo, expedições, frentes de combate e iniciativas iniciadas por vossas decisões.
      </div>

      {/* Conteúdo rolável */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Guerras Ativas */}
        {activeWars.length > 0 && (
          <div className="space-y-2">
            <div className="text-[8px] uppercase tracking-widest text-red-400 font-bold flex items-center gap-1.5">
              <Swords className="w-3 h-3" /> Frentes de Guerra ({activeWars.length})
            </div>
            {activeWars.map((war) => (
              <div
                key={war}
                className="p-3 border border-red-500/30 bg-[#160a0a] space-y-1.5 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-200">{war}</span>
                  <span className="text-[8px] px-1.5 py-0.5 border border-red-500/40 text-red-400 uppercase font-mono">
                    Hostil
                  </span>
                </div>
                <p className="text-[9px] text-[#d4d4d8] font-sans leading-relaxed">
                  Conflito militar aberto em andamento. Consome reservas de ouro e desgasta o exército mensalmente até a assinatura da paz.
                </p>
                <div className="pt-1">
                  <AnimatedProgressBar value={85} min={0} max={100} level="danger" height="xs" showGlowHead showShimmer />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Situações Ativas */}
        {activeSituations.length > 0 && (
          <div className="space-y-2.5">
            <div className="text-[8px] uppercase tracking-widest text-[#a1a1aa] font-bold">
              Operações em Curso ({activeSituations.length})
            </div>
            {activeSituations.map((sit) => {
              const completedTurns = Math.max(0, sit.totalTurns - sit.turnsRemaining);
              const progressPct = sit.totalTurns > 0 ? Math.round((completedTurns / sit.totalTurns) * 100) : 50;

              return (
                <div
                  key={sit.id}
                  className="p-3 border border-[#27272a] bg-[#111114] space-y-2 hover:border-[#3f3f46] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {getSituationIcon(sit.type)}
                      <span className="text-xs font-bold text-[#f4f4f5] truncate font-sans">
                        {sit.title}
                      </span>
                    </div>
                    <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 border border-[#3f3f46] text-[#71717a] shrink-0 font-mono">
                      {getSituationTypeLabel(sit.type)}
                    </span>
                  </div>

                  <p className="text-[9px] text-[#a1a1aa] font-sans leading-relaxed">
                    {sit.description}
                  </p>

                  {sit.assignedPersonnel && (
                    <div className="text-[8px] text-[#71717a] font-mono flex items-center gap-1">
                      <span className="text-[#52525b]">Envolvidos:</span>
                      <span className="text-[#d4d4d8] truncate">{sit.assignedPersonnel}</span>
                    </div>
                  )}

                  {/* Barra de Progresso */}
                  <div className="space-y-1 pt-0.5">
                    <div className="flex items-center justify-between text-[8px] font-mono text-[#71717a]">
                      <span>Progresso da Operação</span>
                      <span className="text-[#f4f4f5]">
                        {sit.turnsRemaining} {sit.turnsRemaining === 1 ? "turno restante" : "turnos restantes"}
                      </span>
                    </div>
                    <AnimatedProgressBar
                      value={progressPct}
                      min={0}
                      max={100}
                      level={sit.type === "guerra" ? "danger" : sit.type === "expedicao" ? "emerald" : "normal"}
                      height="xs"
                      showGlowHead
                      showShimmer
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nenhuma situação ativa */}
        {totalActive === 0 && (
          <div className="py-8 px-3 text-center border border-dashed border-[#1c1c1e] bg-[#09090b]/40 space-y-2">
            <Compass className="w-6 h-6 mx-auto text-[#3f3f46]" />
            <div className="text-[9px] uppercase tracking-wider text-[#71717a] font-bold">
              Nenhuma Operação Ativa
            </div>
            <p className="text-[8px] text-[#52525b] font-sans leading-relaxed">
              Ordene expedições externas (ex: comboios de caminhões, batedores), discursos públicos, investigações ou guerras durante as audiências para vê-las progredir turno a turno aqui.
            </p>
          </div>
        )}

        {/* Concluídas Recentemente */}
        {completedSituations.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#1c1c1e]">
            <div className="text-[8px] uppercase tracking-widest text-[#52525b] font-bold">
              Concluídas Recentemente ({completedSituations.length})
            </div>
            {completedSituations.slice(-3).reverse().map((sit) => (
              <div
                key={sit.id}
                className="p-2.5 border border-[#1c1c1e] bg-[#0a0a0c] space-y-1 opacity-80"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#a1a1aa] flex items-center gap-1 font-sans">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    {sit.title}
                  </span>
                  <span className="text-[7px] text-[#52525b] uppercase font-mono">
                    Concluído
                  </span>
                </div>
                {sit.consequencesSummary && (
                  <p className="text-[8px] text-[#71717a] font-sans italic leading-relaxed">
                    "{sit.consequencesSummary}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
