"use client";

import React from "react";
import { DynasticEndingResult } from "@/types/sovereign";
import { KingdomState } from "@/types/game";
import { Crown, Trophy, Sparkles, RotateCcw, Award, Skull, Scroll } from "lucide-react";
import { gameAudio } from "@/lib/audio/game-audio";

interface DynasticEndingScreenProps {
  ending: DynasticEndingResult;
  state: KingdomState;
  onReturnToMenu: () => void;
}

export function DynasticEndingScreen({
  ending,
  state,
  onReturnToMenu,
}: DynasticEndingScreenProps) {
  const isTragic = ending.type === "colapso_anarquico" || ending.type === "tirania_de_ferro";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#040508]/95 backdrop-blur-xl animate-fade-in-slide select-none font-sans overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#090b12] border border-amber-500/40 rounded-lg shadow-2xl p-6 sm:p-8 space-y-6 text-center relative overflow-hidden">
        {/* Ornatos dos Cantos */}
        <div className="game-corner-tl" />
        <div className="game-corner-tr" />
        <div className="game-corner-bl" />
        <div className="game-corner-br" />

        {/* Insígnia do Desfecho */}
        <div className="flex justify-center">
          <div
            className={`p-4 rounded-full border shadow-xl ${
              isTragic
                ? "bg-red-950/60 border-red-500/50 text-red-400"
                : "bg-amber-950/60 border-amber-400/60 text-amber-300 animate-gold-pulse"
            }`}
          >
            {isTragic ? <Skull className="w-12 h-12" /> : <Crown className="w-12 h-12" />}
          </div>
        </div>

        {/* Título & Subtítulo */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 block font-bold">
            EPÍLOGO HISTÓRICO DA DINASTIA
          </span>
          <h1 className="font-royal text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500">
            {ending.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            {ending.subtitle}
          </p>
        </div>

        {/* Epitáfio em Pedra Mística */}
        <div className="p-4 rounded-md bg-black/60 border border-amber-950/60 shadow-inner max-w-xl mx-auto">
          <p className="font-serif italic text-sm text-amber-200/90 leading-relaxed">
            "{ending.epitaph}"
          </p>
        </div>

        {/* Crônica de Encerramento */}
        <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed max-w-2xl mx-auto text-left bg-zinc-950/50 p-4 rounded border border-zinc-850">
          {ending.finalNarrative}
        </p>

        {/* Estatísticas e Pontuação Dinástica */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
          <div className="p-3 bg-black/40 border border-zinc-800 rounded">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase">Tempo Governado</span>
            <span className="font-royal text-lg font-bold text-white">{ending.survivedTurns} Turnos</span>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase">Ano Alcançado</span>
            <span className="font-royal text-lg font-bold text-white">Ano {ending.survivedYears}</span>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase">Leis Promulgadas</span>
            <span className="font-royal text-lg font-bold text-amber-300">{state.laws.length}</span>
          </div>
          <div className="p-3 bg-black/40 border border-amber-500/40 rounded">
            <span className="text-[10px] font-mono text-amber-400 block uppercase">Pontuação Final</span>
            <span className="font-royal text-lg font-bold text-amber-300">{ending.dynasticScore} pts</span>
          </div>
        </div>

        {/* Conquistas Desbloqueadas */}
        {ending.achievementsUnlocked.length > 0 && (
          <div className="max-w-xl mx-auto space-y-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">
              Conquistas Desbloqueadas:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {ending.achievementsUnlocked.map((ach, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{ach}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Botão de Retorno */}
        <div className="pt-4">
          <button
            onClick={() => {
              gameAudio.playClick();
              onReturnToMenu();
            }}
            onMouseEnter={() => gameAudio.playHover()}
            className="game-btn-gold px-8 py-3.5 rounded text-sm font-bold tracking-widest uppercase cursor-pointer shadow-xl flex items-center justify-center gap-2 mx-auto active:translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retornar ao Menu Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
