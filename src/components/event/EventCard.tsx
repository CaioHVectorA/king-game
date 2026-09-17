"use client";

import React from "react";
import { GameEvent, Character } from "@/types/game";
import { Shield, Sparkles, Tag } from "lucide-react";

interface EventCardProps {
  event: GameEvent;
  character?: Character;
}

export function EventCard({ event, character }: EventCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-5 animate-slide-up">
      <div className="bg-gradient-to-b from-[#131622] to-[#0c0d15] border border-amber-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden royal-border">
        {/* Glow decorativo dourado */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Emissário / Personagem da Corte */}
        {character && (
          <div className="flex items-center gap-3 mb-4 pb-3.5 border-b border-amber-500/15">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600/30 to-amber-950/60 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
              {character.avatar || "👤"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-amber-200">
                  {character.name}
                </span>
                {character.faction && (
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {character.faction}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {character.title || character.role}
              </p>
            </div>
          </div>
        )}

        {/* Título do Evento */}
        <h2 className="font-royal text-xl sm:text-2xl font-bold text-amber-100 mb-3 tracking-wide flex items-center gap-2">
          {event.title}
        </h2>

        {/* Descrição Narrativa do Evento */}
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans mb-5 font-normal">
          {event.description}
        </p>

        {/* Tags do Evento */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80">
            <Tag className="w-3 h-3 text-slate-500" />
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
