"use client";

import React from "react";
import { Ruler } from "@/types/game";
import { Crown, Sparkles } from "lucide-react";

interface SuccessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  newRuler?: Ruler;
  causeOfDeath?: string;
  deceasedName?: string;
}

export function SuccessionModal({
  isOpen,
  onClose,
  newRuler,
  causeOfDeath,
  deceasedName,
}: SuccessionModalProps) {
  if (!isOpen || !newRuler) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#151724] to-[#0a0b10] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl royal-border text-center relative overflow-hidden">
        {/* Efeito de luz dourada */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-amber-600/30 border border-amber-300/40">
          👑
        </div>

        <span className="text-xs uppercase font-semibold tracking-widest text-amber-400 block mb-1">
          A Coroa Não Permanece Vazia
        </span>

        <h3 className="font-royal text-2xl sm:text-3xl font-bold text-amber-100 mb-2">
          Sucessão Dinástica
        </h3>

        {deceasedName && (
          <p className="text-xs text-slate-400 mb-4 italic">
            O soberano {deceasedName} descansou para a eternidade ({causeOfDeath || "morte natural"}).
          </p>
        )}

        <div className="my-6 p-4 rounded-2xl bg-black/50 border border-amber-500/30 text-left space-y-2">
          <div className="text-xs text-amber-400/80 uppercase font-semibold">
            Novo(a) Monarca da Casa Reinante:
          </div>
          <div className="text-xl font-bold text-slate-100 font-royal">
            {newRuler.title} {newRuler.name}
          </div>
          <div className="text-xs text-slate-300 flex items-center gap-2">
            <span>{newRuler.age} anos de idade</span>
            <span>•</span>
            <span className="text-amber-300">{newRuler.dynasty}</span>
          </div>

          {newRuler.traits && newRuler.traits.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
              {newRuler.traits.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2.5 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-200 font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Os sinos dobram em todas as vilas e catedrais. A corte se prostra para jurar lealdade ao novo sangue que empunha o cetro.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold font-royal text-base tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-600/30 cursor-pointer transition-all hover:scale-[1.01]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Longa Vida ao Soberano!</span>
        </button>
      </div>
    </div>
  );
}
