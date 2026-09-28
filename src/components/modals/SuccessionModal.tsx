"use client";

import React from "react";
import { Ruler } from "@/types/game";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none font-mono">
      <div className="w-full max-w-lg bg-[#111113] border border-[#3f3f46] p-6 sm:p-8 text-center space-y-5">
        <span className="text-[10px] uppercase tracking-widest text-[#71717a] block">
          A COROA NÃO PERMANECE VAZIA • SUCESSÃO DINÁSTICA
        </span>

        <h3 className="font-royal text-2xl font-bold text-[#f4f4f5]">
          Ascensão ao Trono
        </h3>

        {deceasedName && (
          <p className="text-xs text-[#71717a] italic">
            O soberano {deceasedName} pereceu ({causeOfDeath || "morte natural"}).
          </p>
        )}

        <div className="p-4 bg-[#18181b] border border-[#27272a] text-left space-y-1.5 text-xs">
          <div className="text-[10px] text-[#71717a] uppercase">
            Novo(a) Monarca da Casa Reinante:
          </div>
          <div className="text-base font-bold text-[#f4f4f5] font-royal">
            {newRuler.title} {newRuler.name}
          </div>
          <div className="text-[11px] text-[#a1a1aa]">
            {newRuler.age} anos • {newRuler.dynasty}
          </div>

          {newRuler.traits && newRuler.traits.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2 border-t border-[#27272a]">
              {newRuler.traits.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 bg-[#111113] border border-[#27272a] text-[#d4d4d8]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-[#71717a] leading-relaxed">
          Os sinos dobram na capital. A corte presta juramento perante o novo governante.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-[#09090b] font-mono font-bold text-xs uppercase tracking-widest cursor-pointer transition-all active:translate-y-0.5"
        >
          [ LONGA VIDA AO SOBERANO ]
        </button>
      </div>
    </div>
  );
}
