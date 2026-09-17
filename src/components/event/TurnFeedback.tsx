"use client";

import React from "react";
import { Sparkles, ScrollText, CheckCircle2, ChevronRight } from "lucide-react";

interface TurnFeedbackProps {
  narrative: string;
  effects: string[];
  aiUsed: boolean;
  playerDecision?: string;
  onDismiss?: () => void;
}

export function TurnFeedback({
  narrative,
  effects,
  aiUsed,
  playerDecision,
  onDismiss,
}: TurnFeedbackProps) {
  if (!narrative && (!effects || effects.length === 0)) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-4 animate-slide-up">
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Topo do Feedback */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-500/15">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
              Desfecho do vosso decreto
            </span>
          </div>

          {aiUsed ? (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 font-medium">
              <Sparkles className="w-3 h-3 text-purple-400" />
              IA Interpretativa
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Decisão Tradicional
            </span>
          )}
        </div>

        {/* Citação da Decisão do Jogador se fornecida */}
        {playerDecision && (
          <div className="text-xs italic text-slate-400 mb-2.5 pl-3 border-l-2 border-amber-500/40">
            "{playerDecision}"
          </div>
        )}

        {/* Narrativa Curta */}
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans mb-3">
          {narrative}
        </p>

        {/* Badges de Efeitos */}
        {effects && effects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {effects.map((effect, idx) => {
              const isPositive =
                effect.startsWith("+") ||
                effect.includes("estabelecida") ||
                effect.includes("coroado") ||
                effect.includes("recuperado");
              const isNegative =
                effect.startsWith("-") ||
                effect.includes("Guerra") ||
                effect.includes("pereceram") ||
                effect.includes("endividada") ||
                effect.includes("faleceu");

              return (
                <span
                  key={idx}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                    isPositive
                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                      : isNegative
                      ? "bg-red-950/40 text-red-300 border-red-500/30"
                      : "bg-slate-800/70 text-slate-300 border-slate-700/60"
                  }`}
                >
                  {effect}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
