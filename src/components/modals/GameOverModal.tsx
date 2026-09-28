"use client";

import React from "react";
import { KingdomState } from "@/types/game";
import { RotateCcw, Trophy, Skull } from "lucide-react";

interface GameOverModalProps {
  isOpen: boolean;
  state: KingdomState;
  onRestart: () => void;
}

export function GameOverModal({ isOpen, state, onRestart }: GameOverModalProps) {
  if (!isOpen) return null;

  const isVictory = Boolean(state.flags?.isVictory || state.flags?.victory);
  const isCustom =
    state.storylineId === "rio_zombie" ||
    state.storylineId === "zombie_apocalypse" ||
    state.storylineId === "colony_exodus";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none font-mono animate-fadeIn">
      <div
        className={`w-full max-w-lg border p-6 sm:p-8 text-center space-y-5 shadow-2xl ${
          isVictory
            ? "bg-[#0d1610] border-emerald-500/60 shadow-emerald-950/40"
            : "bg-[#140a0a] border-red-500/60 shadow-red-950/40"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {isVictory ? (
            <Trophy className="w-5 h-5 text-amber-400" />
          ) : (
            <Skull className="w-5 h-5 text-red-400" />
          )}
          <span
            className={`text-xs uppercase tracking-widest font-bold ${
              isVictory ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isVictory
              ? "🏆 VITÓRIA HISTÓRICA • TRIUNFO DO ENCLAVE"
              : isCustom
              ? "COLAPSO DO REDUTO • FIM DA CAMPANHA"
              : "A QUEDA DA COROA • FIM DA DINASTIA"}
          </span>
        </div>

        <h3 className="font-royal text-2xl sm:text-3xl font-bold text-[#f4f4f5]">
          {isVictory ? `O Triunfo de ${state.name}` : `O Fim de ${state.name}`}
        </h3>

        <div
          className={`p-4 border text-left space-y-2 text-xs ${
            isVictory
              ? "bg-[#0f1d14] border-emerald-500/30 text-emerald-200"
              : "bg-[#1c0f0f] border-red-500/30 text-red-200"
          }`}
        >
          <div className="text-[11px] text-[#a1a1aa] uppercase font-mono font-bold">
            {isVictory ? "Registro da Vitória:" : "Causa do Colapso:"}
          </div>
          <p className="text-[#f4f4f5] leading-relaxed font-sans text-sm">
            {state.gameOverReason ||
              (isVictory
                ? "Sua liderança guiou o povo à sobrevivência definitiva e triunfou sobre as ameaças do mundo."
                : "O reduto ruiu sob o peso de crises inconciliáveis e revoltas populares.")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-3 bg-[#111116] border border-[#27272a]">
            <span className="text-[10px] text-[#a1a1aa] block uppercase font-mono">Turnos</span>
            <span className="font-bold text-base text-[#f4f4f5] font-mono">{state.turn}</span>
          </div>

          <div className="p-3 bg-[#111116] border border-[#27272a]">
            <span className="text-[10px] text-[#a1a1aa] block uppercase font-mono">Ano Final</span>
            <span className="font-bold text-base text-[#f4f4f5] font-mono">{state.year}</span>
          </div>

          <div className="p-3 bg-[#111116] border border-[#27272a]">
            <span className="text-[10px] text-[#a1a1aa] block uppercase font-mono">
              {isCustom ? "Comandantes" : "Monarcas"}
            </span>
            <span className="font-bold text-base text-[#f4f4f5] font-mono">
              {state.rulersHistory.length + 1}
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className={`w-full py-4 px-6 font-mono font-bold text-xs uppercase tracking-widest cursor-pointer transition-all active:translate-y-0.5 flex items-center justify-center gap-2 shadow-lg ${
            isVictory
              ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
              : "bg-[#f4f4f5] hover:bg-white text-black shadow-white/10"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>[ INICIAR NOVA CAMPANHA ]</span>
        </button>
      </div>
    </div>
  );
}
