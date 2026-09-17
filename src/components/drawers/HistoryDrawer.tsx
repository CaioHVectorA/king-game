"use client";

import React from "react";
import { GameHistoryEntry } from "@/types/game";
import { X, BookOpen, Clock, Crown, Sparkles } from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameHistoryEntry[];
}

export function HistoryDrawer({ isOpen, onClose, history }: HistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#0e1018] border-l border-amber-500/20 h-full flex flex-col shadow-2xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-royal text-lg font-bold text-amber-200">
              Crônica Real da Dinastia
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          O registro imutável dos acontecimentos, decretos e consequências gravados nos anais do reino.
        </p>

        {history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <BookOpen className="w-10 h-10 mb-2 opacity-30 text-amber-400" />
            <p className="text-sm">A crônica acaba de ser aberta.</p>
            <p className="text-xs text-slate-600 mt-1">Vossum primeiro decreto será imortalizado aqui.</p>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {/* Exibe as entradas mais recentes no topo */}
            {[...history].reverse().map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 relative pl-5 before:absolute before:left-2 before:top-4 before:bottom-4 before:w-[2px] before:bg-amber-500/30"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1 text-amber-300/90 font-semibold font-royal">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Ano {entry.year}, Mês {entry.month} (Turno {entry.turn})
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Crown className="w-3 h-3" />
                    {entry.rulerName}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-100 mb-1">
                  {entry.eventTitle}
                </h4>

                <div className="text-xs italic text-amber-200/90 bg-black/40 p-2 rounded border border-slate-800/80 mb-2">
                  "{entry.playerDecision}"
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {entry.narrative}
                </p>

                {entry.effectsSummary && entry.effectsSummary.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.effectsSummary.map((effect, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50"
                      >
                        {effect}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
