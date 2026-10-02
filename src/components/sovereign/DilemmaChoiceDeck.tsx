"use client";

import React from "react";
import { ChoiceDilemma, ChoiceDilemmaOption, MindVoiceId } from "@/types/sovereign";
import { Zap, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { gameAudio } from "@/lib/audio/game-audio";

interface DilemmaChoiceDeckProps {
  dilemma: ChoiceDilemma;
  onSelectOption: (option: ChoiceDilemmaOption) => void;
  disabled: boolean;
}

const VOICE_BADGES: Record<MindVoiceId, { name: string; avatar: string; color: string }> = {
  cold_reason: { name: "A Razão Gélida", avatar: "⚖️", color: "#38bdf8" },
  noble_heart: { name: "O Coração Nobre", avatar: "🕊️", color: "#4ade80" },
  iron_crown: { name: "A Coroa de Ferro", avatar: "👑", color: "#f59e0b" },
  primal_instinct: { name: "O Instinto Oculto", avatar: "👁️", color: "#c084fc" },
};

export function DilemmaChoiceDeck({
  dilemma,
  onSelectOption,
  disabled,
}: DilemmaChoiceDeckProps) {
  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block font-bold">
          DELIBERAÇÕES RECOMENDADAS PELO CONSELHO
        </span>
        {dilemma.urgentNotice && (
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-red-950 text-red-300 border border-red-500/50 rounded animate-pulse">
            {dilemma.urgentNotice}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {dilemma.options.map((option) => {
          const voice = option.voiceAdvocate ? VOICE_BADGES[option.voiceAdvocate] : null;

          return (
            <button
              key={option.id}
              disabled={disabled}
              onClick={() => {
                gameAudio.playClick();
                onSelectOption(option);
              }}
              onMouseEnter={() => gameAudio.playHover()}
              className="p-3.5 rounded-md border border-zinc-800 bg-zinc-900/60 hover:border-amber-500/60 hover:bg-zinc-850/80 text-left transition-all flex flex-col justify-between group cursor-pointer disabled:opacity-40 active:translate-y-0.5 shadow-md"
            >
              <div className="space-y-2">
                {voice && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: voice.color }}>
                    <span>{voice.avatar}</span>
                    <span>Recomendado por {voice.name}</span>
                  </div>
                )}

                <h4 className="text-xs font-bold text-white group-hover:text-amber-200 leading-snug">
                  {option.label}
                </h4>

                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                  {option.riskDescription}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span className="uppercase text-amber-400/90 font-bold">
                  [{option.intentTag}]
                </span>
                <span className="text-zinc-500 group-hover:text-amber-300 flex items-center gap-1">
                  <span>Assinar</span>
                  <Zap className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
