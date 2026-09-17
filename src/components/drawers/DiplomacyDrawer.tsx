"use client";

import React from "react";
import { Realm } from "@/types/game";
import { X, Compass, Swords, Shield, Coins, Users } from "lucide-react";

interface DiplomacyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  realms: Record<string, Realm>;
  activeWars: string[];
}

export function DiplomacyDrawer({
  isOpen,
  onClose,
  realms,
  activeWars,
}: DiplomacyDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0e1018] border-l border-amber-500/20 h-full flex flex-col shadow-2xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="font-royal text-lg font-bold text-amber-200">
              Reinos Vizinhos & Diplomacia
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
          Nações estrangeiras que compartilham fronteiras terrestres e marítimas com vosso domínio. Relações podem ser forjadas por acordos comerciais, tributos ou guerras de conquista.
        </p>

        <div className="space-y-3.5 flex-1">
          {Object.values(realms).map((realm) => {
            const isAtWar = activeWars.includes(realm.id);

            return (
              <div
                key={realm.id}
                className={`p-4 rounded-xl border transition-all ${
                  isAtWar
                    ? "bg-red-950/20 border-red-500/40 shadow-lg shadow-red-950/20"
                    : "bg-slate-900/70 border-slate-800 hover:border-amber-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-100 font-royal">
                    {realm.name}
                  </span>
                  {isAtWar ? (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-red-900/80 text-red-200 font-semibold flex items-center gap-1 animate-pulse">
                      <Swords className="w-3 h-3" />
                      Guerra Ativa
                    </span>
                  ) : (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        realm.relation >= 20
                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                          : realm.relation <= -20
                          ? "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      Relação: {realm.relation > 0 ? `+${realm.relation}` : realm.relation}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 my-2 text-[11px]">
                  <div className="p-2 rounded bg-black/40 border border-slate-800/60 flex flex-col items-center justify-center">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                      <Users className="w-3 h-3 text-sky-400" />
                      População
                    </span>
                    <span className="font-bold text-slate-200 mt-0.5">
                      {(realm.population / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <div className="p-2 rounded bg-black/40 border border-slate-800/60 flex flex-col items-center justify-center">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                      <Shield className="w-3 h-3 text-indigo-400" />
                      Militar
                    </span>
                    <span className="font-bold text-indigo-200 mt-0.5">
                      {realm.military}%
                    </span>
                  </div>

                  <div className="p-2 rounded bg-black/40 border border-slate-800/60 flex flex-col items-center justify-center">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                      <Coins className="w-3 h-3 text-amber-400" />
                      Riqueza
                    </span>
                    <span className="font-bold text-amber-300 mt-0.5">
                      {realm.wealth}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mt-2">
                  {realm.id === "arvandor" && "Império marcial com exércitos regulares disciplinados."}
                  {realm.id === "eldoria" && "Cidades marítimas mercantes abastadas e diplomáticas."}
                  {realm.id === "khar" && "Guerreiros nômades das estepes, temidos por invasões rápidas."}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
