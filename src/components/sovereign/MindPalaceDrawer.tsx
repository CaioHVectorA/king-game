"use client";

import React from "react";
import { LeaderPsychology, MindVoiceId } from "@/types/sovereign";
import { X, Brain, ShieldAlert, Award, Skull } from "lucide-react";
import { gameAudio } from "@/lib/audio/game-audio";

interface MindPalaceDrawerProps {
  psychology: LeaderPsychology;
  isOpen: boolean;
  onClose: () => void;
  rulerName: string;
}

export function MindPalaceDrawer({
  psychology,
  isOpen,
  onClose,
  rulerName,
}: MindPalaceDrawerProps) {
  if (!isOpen) return null;

  const voicesList = Object.values(psychology.voices);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in-slide">
      <div className="w-full max-w-md bg-[#0a0c13] border-l border-amber-500/30 flex flex-col h-full shadow-2xl overflow-hidden font-sans">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-amber-950/40 bg-[#0d101a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-950/40 border border-purple-500/40 text-purple-300 rounded">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 block">
                MONÓLOGO INTERIOR DO SOBERANO
              </span>
              <h2 className="font-royal text-base font-bold text-white">
                O Palácio da Mente de {rulerName}
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

        {/* Medidores Psicológicos Centrais */}
        <div className="p-4 border-b border-zinc-850 bg-black/30 grid grid-cols-2 gap-3">
          <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Tensão Mental
              </span>
              <span className={`font-bold font-mono ${psychology.tension > 60 ? "text-red-400 animate-pulse" : "text-amber-300"}`}>
                {psychology.tension}%
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${psychology.tension > 60 ? "bg-red-500" : "bg-amber-500"}`}
                style={{ width: `${psychology.tension}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono flex items-center gap-1">
                <Skull className="w-3.5 h-3.5 text-purple-400" />
                Corrupção / Tirania
              </span>
              <span className="font-bold font-mono text-purple-300">
                {psychology.corruption}%
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${psychology.corruption}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono">Perspicácia Política</span>
              <span className="font-bold font-mono text-sky-400">{psychology.acumen}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 transition-all" style={{ width: `${psychology.acumen}%` }} />
            </div>
          </div>

          <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Honra &amp; Juramento
              </span>
              <span className="font-bold font-mono text-emerald-300">{psychology.honor}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${psychology.honor}%` }} />
            </div>
          </div>
        </div>

        {/* Traços Ativos */}
        {psychology.activeTraits.length > 0 && (
          <div className="px-4 py-2 bg-[#0c0e16] border-b border-zinc-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] text-zinc-400 uppercase font-mono shrink-0">Traços:</span>
            {psychology.activeTraits.map((trait) => (
              <span
                key={trait}
                className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 shrink-0 font-mono"
              >
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* As Quatro Vozes Interiores */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono font-bold">
            Deliberação das Quatro Vozes da Psique
          </div>

          {voicesList.map((voice) => (
            <div
              key={voice.id}
              className="p-3.5 rounded-md border border-zinc-800 bg-zinc-900/40 space-y-2 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{voice.avatar}</span>
                  <div>
                    <h3 className="text-xs font-bold font-royal text-white">{voice.name}</h3>
                    <span className="text-[10px] text-zinc-400 font-mono">{voice.title}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 block">Afinidade</span>
                  <span className="text-xs font-bold font-mono" style={{ color: voice.color }}>
                    {voice.affinity}%
                  </span>
                </div>
              </div>

              {/* Sussurro do momento */}
              <div
                className="p-3 rounded text-xs leading-relaxed italic bg-black/40 border-l-2 shadow-inner"
                style={{ borderColor: voice.color, color: "#e4e4e7" }}
              >
                "{voice.whisper}"
              </div>

              <p className="text-[10px] text-zinc-400 font-sans">
                <strong>Doutrina:</strong> {voice.dominantPhilosophy}
              </p>
            </div>
          ))}
        </div>

        {/* Rodapé da gaveta */}
        <div className="p-3 border-t border-zinc-800 bg-[#08090d] text-center">
          <span className="text-[9px] text-zinc-400 font-mono">
            Suas decisões em cada audiência moldam a afinidade e a sanidade de vosso reinado.
          </span>
        </div>
      </div>
    </div>
  );
}
