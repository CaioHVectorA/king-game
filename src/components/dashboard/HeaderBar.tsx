"use client";

import React from "react";
import { KingdomState } from "@/types/game";
import { Crown, BookOpen, Users, Compass, ShieldAlert, PlusCircle } from "lucide-react";

interface HeaderBarProps {
  state: KingdomState;
  onOpenHistory: () => void;
  onOpenCourt: () => void;
  onOpenFactions: () => void;
  onOpenDiplomacy: () => void;
  onNewGame: () => void;
}

export function HeaderBar({
  state,
  onOpenHistory,
  onOpenCourt,
  onOpenFactions,
  onOpenDiplomacy,
  onNewGame,
}: HeaderBarProps) {
  const getMonthName = (m: number) => {
    const months = [
      "Janeiro (Inverno)",
      "Fevereiro (Inverno)",
      "Março (Primavera)",
      "Abril (Primavera)",
      "Maio (Primavera)",
      "Junho (Verão)",
      "Julho (Verão)",
      "Agosto (Verão)",
      "Setembro (Outono)",
      "Outubro (Outono)",
      "Novembro (Outono)",
      "Dezembro (Inverno)",
    ];
    return months[(m - 1) % 12] || `Mês ${m}`;
  };

  return (
    <header className="w-full bg-[#0d0f17]/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3 sticky top-0 z-30 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Reino e Governante */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/30 to-amber-800/40 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-950/40">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-royal text-lg font-bold text-amber-200 tracking-wide flex items-center gap-2">
                  {state.name}
                </h1>
                {state.storylineTitle && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-500/30 text-amber-300 font-medium">
                    {state.storylineTitle}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>{state.currentRuler?.title || "Rei"} {state.currentRuler?.name}</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400/80">{state.currentRuler?.age} anos ({state.currentRuler?.reignYears}º de reinado)</span>
              </p>
            </div>
          </div>

          <div className="md:hidden text-right">
            <span className="text-xs font-semibold text-amber-300">Ano {state.year}</span>
            <span className="block text-[10px] text-slate-400">Turno {state.turn}</span>
          </div>
        </div>

        {/* Datação e Turno Desktop */}
        <div className="hidden md:flex items-center gap-4 bg-black/40 px-3.5 py-1.5 rounded-full border border-amber-500/15">
          <div className="text-xs text-slate-300">
            <span className="text-amber-400/90 font-medium">Ano {state.year}</span>, {getMonthName(state.month)}
          </div>
          <div className="h-3 w-[1px] bg-amber-500/20" />
          <div className="text-xs text-slate-400">
            Turno <span className="text-slate-200 font-semibold">{state.turn}</span>
          </div>
          {state.activeWars.length > 0 && (
            <>
              <div className="h-3 w-[1px] bg-amber-500/20" />
              <div className="flex items-center gap-1 text-[11px] text-red-400 font-medium animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Em Guerra ({state.activeWars.length})</span>
              </div>
            </>
          )}
        </div>

        {/* Painéis e Ações */}
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={onOpenCourt}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-amber-950/40 border border-slate-700/60 hover:border-amber-500/40 text-xs text-slate-300 hover:text-amber-200 transition-all cursor-pointer"
            title="Conselho e Personagens da Corte"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Conselho</span>
          </button>

          <button
            onClick={onOpenFactions}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-amber-950/40 border border-slate-700/60 hover:border-amber-500/40 text-xs text-slate-300 hover:text-amber-200 transition-all cursor-pointer"
            title="Aprovação das Facções"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Facções</span>
          </button>

          <button
            onClick={onOpenDiplomacy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-amber-950/40 border border-slate-700/60 hover:border-amber-500/40 text-xs text-slate-300 hover:text-amber-200 transition-all cursor-pointer"
            title="Relações e Guerras com Reinos Vizinhos"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Reinos</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-amber-950/40 border border-slate-700/60 hover:border-amber-500/40 text-xs text-slate-300 hover:text-amber-200 transition-all cursor-pointer"
            title="Crônica Histórica da Dinastia"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Crônica</span>
          </button>

          <button
            onClick={onNewGame}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-xs text-amber-300 hover:text-amber-100 transition-all cursor-pointer ml-1"
            title="Iniciar Nova Campanha"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nova</span>
          </button>
        </div>
      </div>
    </header>
  );
}
