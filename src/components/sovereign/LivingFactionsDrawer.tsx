"use client";

import React from "react";
import { LivingFaction, FactionId } from "@/types/sovereign";
import { X, Users, AlertTriangle, Key, Shield, TrendingUp } from "lucide-react";
import { gameAudio } from "@/lib/audio/game-audio";

interface LivingFactionsDrawerProps {
  factions: Record<FactionId, LivingFaction>;
  isOpen: boolean;
  onClose: () => void;
}

export function LivingFactionsDrawer({
  factions,
  isOpen,
  onClose,
}: LivingFactionsDrawerProps) {
  if (!isOpen) return null;

  const list = Object.values(factions);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in-slide">
      <div className="w-full max-w-md bg-[#0a0c13] border-l border-amber-500/30 flex flex-col h-full shadow-2xl overflow-hidden font-sans">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-amber-950/40 bg-[#0d101a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-950/40 border border-amber-500/40 text-amber-300 rounded">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                CORPO SOCIAL &amp; PRESSÃO POLÍTICA
              </span>
              <h2 className="font-royal text-base font-bold text-white">
                As Cinco Facções do Reino
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="p-1.5 text-zinc-400 hover:text-white rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Facções Vivas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {list.map((fac) => {
            const isDanger = fac.approval < -25 || fac.radicalsPercentage > 40;
            const isFavorable = fac.approval > 25;

            return (
              <div
                key={fac.id}
                className={`p-4 rounded-md border space-y-3 transition-all ${
                  isDanger
                    ? "border-red-500/50 bg-red-950/20"
                    : isFavorable
                    ? "border-emerald-500/40 bg-emerald-950/15"
                    : "border-zinc-800 bg-zinc-900/40"
                }`}
              >
                {/* Cabeçalho da Facção */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 rounded bg-black/40 border border-zinc-800">
                      {fac.avatar}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold font-royal text-white">{fac.name}</h3>
                      <span className="text-xs text-amber-300 font-mono block">
                        {fac.leaderName} ({fac.leaderTitle})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-zinc-400 block">Lealdade</span>
                    <span
                      className={`text-xs font-bold font-mono ${
                        fac.approval > 0 ? "text-emerald-400" : fac.approval < 0 ? "text-red-400" : "text-zinc-300"
                      }`}
                    >
                      {fac.approval > 0 ? `+${fac.approval}` : fac.approval}%
                    </span>
                  </div>
                </div>

                {/* Barras de Poder Político e Nível de Radicais */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-sky-400" /> Poder no Estado: {fac.power}%
                    </span>
                    <span className="flex items-center gap-1 text-red-400">
                      <AlertTriangle className="w-3 h-3" /> Radicais Armados: {fac.radicalsPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-sky-500" style={{ width: `${fac.power}%` }} />
                  </div>
                </div>

                {/* Demandas Ativas */}
                {fac.demands.length > 0 && (
                  <div className="p-2.5 rounded bg-black/40 border border-zinc-850 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                      Demandas perante o Trono:
                    </span>
                    <ul className="text-xs text-zinc-300 font-sans space-y-1 pl-3 list-disc">
                      {fac.demands.map((dem, idx) => (
                        <li key={idx}>{dem}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Última Movimentação Política */}
                <p className="text-[11px] text-zinc-400 font-sans italic border-l-2 border-zinc-700 pl-2.5">
                  "{fac.lastActionSummary}"
                </p>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="p-3 border-t border-zinc-800 bg-[#08090d] text-center">
          <span className="text-[9px] text-zinc-400 font-mono">
            Facções com radicais acima de 50% podem desencadear golpes de estado ou guerra civil.
          </span>
        </div>
      </div>
    </div>
  );
}
