"use client";

import React from "react";
import { Coins, Wheat, Users, Scale, Swords } from "lucide-react";
import { KingdomState } from "@/types/game";

interface ResourceBarProps {
  state: KingdomState;
}

export function ResourceBar({ state }: ResourceBarProps) {
  // Formatador de números grandes (ex: 26500 -> 26.5k)
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getStabilityColor = (val: number) => {
    if (val <= 20) return "text-red-400 bg-red-950/40 border-red-500/30";
    if (val <= 45) return "text-amber-400 bg-amber-950/40 border-amber-500/30";
    return "text-emerald-400 bg-emerald-950/30 border-emerald-500/30";
  };

  const getStabilityBar = (val: number) => {
    if (val <= 20) return "bg-gradient-to-r from-red-600 to-red-500";
    if (val <= 45) return "bg-gradient-to-r from-amber-600 to-amber-500";
    return "bg-gradient-to-r from-emerald-600 to-emerald-400";
  };

  const getMilitaryBar = (val: number) => {
    if (val <= 25) return "bg-gradient-to-r from-slate-600 to-slate-400";
    if (val <= 60) return "bg-gradient-to-r from-blue-600 to-cyan-500";
    return "bg-gradient-to-r from-indigo-500 to-purple-400";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {/* OURO */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          state.gold < 0
            ? "bg-red-950/20 border-red-500/30 shadow-red-900/10 shadow-lg"
            : "bg-slate-900/60 border-amber-500/20 hover:border-amber-500/40"
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Ouro
            </span>
            {state.gold < 0 && (
              <span className="text-[9px] px-1 rounded bg-red-900/50 text-red-300 font-semibold uppercase">
                Dívida
              </span>
            )}
          </div>
          <div className={`text-lg font-bold font-royal tracking-wide ${
            state.gold < 0 ? "text-red-400" : "text-amber-300"
          }`}>
            {formatNumber(state.gold)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Tesouro Real
          </div>
        </div>

        {/* COMIDA */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          state.food <= 100
            ? "bg-red-950/20 border-red-500/30 shadow-red-900/10 shadow-lg"
            : "bg-slate-900/60 border-amber-500/20 hover:border-amber-500/40"
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wheat className="w-3.5 h-3.5 text-yellow-500" />
              Comida
            </span>
            {state.food <= 100 && (
              <span className="text-[9px] px-1 rounded bg-red-900/50 text-red-300 font-semibold uppercase animate-pulse">
                Escassez
              </span>
            )}
          </div>
          <div className={`text-lg font-bold font-royal tracking-wide ${
            state.food <= 100 ? "text-red-400" : "text-yellow-200"
          }`}>
            {formatNumber(state.food)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Silos e Celeiros
          </div>
        </div>

        {/* POPULAÇÃO */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              População
            </span>
          </div>
          <div className="text-lg font-bold font-royal tracking-wide text-sky-200">
            {formatNumber(state.population)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Súditos e Cidadãos
          </div>
        </div>

        {/* ESTABILIDADE */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              Estabilidade
            </span>
            <span className={`text-[10px] font-bold ${getStabilityColor(state.stability).split(" ")[0]}`}>
              {state.stability}%
            </span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getStabilityBar(state.stability)}`}
              style={{ width: `${Math.min(100, Math.max(0, state.stability))}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {state.stability <= 25 ? "Crise Social Grave" : state.stability <= 60 ? "Ordem Moderada" : "Paz e Harmonia"}
          </div>
        </div>

        {/* MILITAR */}
        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-indigo-400" />
              Militar
            </span>
            <span className="text-[10px] font-bold text-indigo-300">
              {state.military}%
            </span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getMilitaryBar(state.military)}`}
              style={{ width: `${Math.min(100, Math.max(0, state.military))}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {state.military <= 30 ? "Exército Debilitado" : state.military <= 70 ? "Legiões Prontas" : "Poder Bélico Supremo"}
          </div>
        </div>
      </div>
    </div>
  );
}
