"use client";

import React from "react";
import { MASTER_ENDINGS_CATALOG } from "@/lib/game/endings-codex";
import { X, Trophy, Crown, Skull, Award, Sparkles, BookOpen } from "lucide-react";
import { gameAudio } from "@/lib/audio/game-audio";

interface EndingsGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EndingsGalleryModal({ isOpen, onClose }: EndingsGalleryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in-slide font-sans">
      <div className="w-full max-w-4xl bg-[#090b12] border border-amber-500/30 rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-amber-950/40 bg-[#0d101a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-950/40 border border-amber-500/40 text-amber-300 rounded">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                GALERIA DE DESTINOS DINÁSTICOS &amp; REJOGABILIDADE
              </span>
              <h2 className="font-royal text-xl font-bold text-white">
                Códice de Finais Históricos
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

        {/* Lista dos Finais Catalogados */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {MASTER_ENDINGS_CATALOG.map((ending) => {
            const isTragic = ending.type === "colapso_anarquico" || ending.type === "tirania_de_ferro";

            return (
              <div
                key={ending.id}
                className="p-4 rounded-md border border-zinc-800 bg-zinc-900/50 space-y-2.5 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {isTragic ? "💀" : "👑"}
                      </span>
                      <div>
                        <h3 className="font-royal text-sm font-bold text-white">
                          {ending.title}
                        </h3>
                        <span className="text-[10px] text-amber-300 font-mono block">
                          {ending.subtitle}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                        isTragic
                          ? "border-red-500/40 bg-red-950/40 text-red-300"
                          : "border-amber-500/40 bg-amber-950/40 text-amber-300"
                      }`}
                    >
                      {ending.type.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {ending.descriptionTemplate}
                  </p>
                </div>

                <div className="p-2 rounded bg-black/40 border border-zinc-850 text-[11px] text-zinc-400 font-serif italic">
                  "{ending.epitaph}"
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="p-3 bg-[#0d101a] border-t border-zinc-800 text-center text-[10px] text-zinc-400 font-mono">
          Cada decisão política, edito promulgado e aliança forjada guiará o destino da sua dinastia a um desses desfechos.
        </div>
      </div>
    </div>
  );
}
