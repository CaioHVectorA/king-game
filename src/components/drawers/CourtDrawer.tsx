"use client";

import React from "react";
import { Character } from "@/types/game";
import { X, Users, Heart, Award } from "lucide-react";

interface CourtDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Record<string, Character>;
}

export function CourtDrawer({ isOpen, onClose, characters }: CourtDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0e1018] border-l border-amber-500/20 h-full flex flex-col shadow-2xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-royal text-lg font-bold text-amber-200">
              Conselho e Personagens da Corte
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
          Grandes figuras que aconselham ou desafiam a autoridade do trono. Suas lealdades moldam conspirações e apoio político.
        </p>

        <div className="space-y-3.5 flex-1">
          {Object.values(characters).map((char) => (
            <div
              key={char.id}
              className={`p-4 rounded-xl border transition-all ${
                char.alive
                  ? "bg-slate-900/70 border-slate-800 hover:border-amber-500/30"
                  : "bg-red-950/10 border-red-900/30 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
                  {char.avatar || "👤"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-200">
                      {char.name}
                    </span>
                    {!char.alive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/60 text-red-300 font-semibold">
                        Falecido(a)
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-amber-400/80 font-medium">
                    {char.title || char.role}
                  </span>
                </div>
              </div>

              {/* Medidores de Lealdade e Influência */}
              <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                <div className="p-2 rounded bg-black/40 border border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" />
                      Lealdade
                    </span>
                    <span className={char.loyalty >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                      {char.loyalty > 0 ? `+${char.loyalty}` : char.loyalty}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${char.loyalty >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(100, Math.max(10, Math.abs(char.loyalty)))}%` }}
                    />
                  </div>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" />
                      Influência
                    </span>
                    <span className="text-amber-300 font-semibold">
                      {char.influence}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${char.influence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Traços */}
              {char.traits && char.traits.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {char.traits.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
