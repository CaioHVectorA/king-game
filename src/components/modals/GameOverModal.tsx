"use client";

import React from "react";
import { KingdomState } from "@/types/game";
import { Skull, RotateCcw, Award } from "lucide-react";

interface GameOverModalProps {
  isOpen: boolean;
  state: KingdomState;
  onRestart: () => void;
}

export function GameOverModal({ isOpen, state, onRestart }: GameOverModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#180d0d] to-[#0a0606] border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Glow vermelho de tragédia */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-red-900/40 border border-red-400/40">
          <Skull className="w-8 h-8 text-red-200" />
        </div>

        <span className="text-xs uppercase font-semibold tracking-widest text-red-400 block mb-1">
          A Queda da Coroa
        </span>

        <h3 className="font-royal text-2xl sm:text-3xl font-bold text-red-100 mb-3">
          O Fim do {state.name}
        </h3>

        <div className="p-4 rounded-2xl bg-black/60 border border-red-500/30 text-left mb-6 space-y-2">
          <div className="text-xs text-red-400 font-semibold uppercase">
            Causa do Colapso:
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {state.gameOverReason || "O reino ruiu sob o peso de crises inconciliáveis e revoltas populares."}
          </p>
        </div>

        {/* Resumo da Dinastia */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Turnos</span>
            <span className="font-bold text-base text-slate-100 font-royal">
              {state.turn}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Ano Final</span>
            <span className="font-bold text-base text-amber-300 font-royal">
              {state.year}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Monarcas</span>
            <span className="font-bold text-base text-slate-100 font-royal">
              {state.rulersHistory.length + 1}
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-700 hover:from-red-600 hover:to-red-500 text-white font-bold font-royal text-base tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-900/30 cursor-pointer transition-all hover:scale-[1.01]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Fundar Nova Dinastia</span>
        </button>
      </div>
    </div>
  );
}
