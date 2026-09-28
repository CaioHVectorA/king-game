"use client";

import React, { useState } from "react";
import { Encounter } from "@/lib/game/encounters";
import { ArrowRight, CornerDownLeft, MessageSquare, Send } from "lucide-react";

interface EncounterStageProps {
  encounter: Encounter;
  isLoading: boolean;
  feedback: {
    narrative: string;
    effects: string[];
    aiUsed: boolean;
    playerDecision?: string;
  } | null;
  onSelectChoice: (choiceId: string) => void;
  onSubmitFreeText: (decision: string) => void;
  onNextAudience: () => void;
}

export function EncounterStage({
  encounter,
  isLoading,
  feedback,
  onSelectChoice,
  onSubmitFreeText,
  onNextAudience,
}: EncounterStageProps) {
  const [freeText, setFreeText] = useState("");

  const handleFreeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeText.trim() || isLoading) return;
    onSubmitFreeText(freeText.trim());
    setFreeText("");
  };

  const roleplayPrompts = [
    "Conceder o pedido e doar mantimentos",
    "Recusar terminantemente e proteger os cofres",
    "Obrigar a nobreza local a arcar com os custos",
    "Prender o peticionário por insubordinação",
    "Negociar uma trégua em troca de concessões",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6 animate-mono-in select-none font-sans">
      {/* CARD DA AUDIÊNCIA MONOCROMÁTICA */}
      <div className="bg-[#111113] border border-[#27272a] p-5 sm:p-7 space-y-6">
        {/* 1. PETICIONÁRIO EM AUDIÊNCIA */}
        <div className="flex items-start justify-between border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-3.5">
            {/* Caixa de Retrato / Glifo em Monocromia */}
            <div className="w-12 h-12 bg-[#18181b] border border-[#3f3f46] flex items-center justify-center text-2xl shrink-0 font-mono">
              {encounter.character.avatar}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-royal text-base sm:text-lg font-bold text-[#f4f4f5] tracking-tight">
                  {encounter.character.name}
                </h2>
                {encounter.character.faction && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
                    {encounter.character.faction}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-[#71717a] mt-0.5">
                {encounter.character.title} • {encounter.character.role}
              </p>
            </div>
          </div>

          <span className="font-mono text-[10px] text-[#71717a] uppercase tracking-widest hidden sm:inline-block">
            SALA DO TRONO
          </span>
        </div>

        {/* FEEDBACK DO TURNO (O PETICIONÁRIO REAGE AO DECRETO) */}
        {feedback ? (
          <div className="space-y-5 animate-mono-in">
            {/* O Que o Jogador Disse / Ordenou */}
            {feedback.playerDecision && (
              <div className="bg-[#18181b] border border-[#27272a] p-3 text-xs text-[#a1a1aa] font-mono">
                <span className="text-[10px] text-[#71717a] uppercase block mb-1">
                  Vosso Decreto Arbitrário:
                </span>
                "{feedback.playerDecision}"
              </div>
            )}

            {/* Narrativa da Resolução */}
            <div className="bg-[#18181b] border-l-2 border-[#f4f4f5] p-4 sm:p-5">
              <span className="text-[10px] font-mono uppercase text-[#71717a] block mb-1">
                Desfecho Perante a Corte &amp; Conseqüências
              </span>
              <p className="text-sm sm:text-base text-[#f4f4f5] leading-relaxed font-serif italic">
                {feedback.narrative}
              </p>
            </div>

            {/* Impactos no Reino */}
            {feedback.effects && feedback.effects.length > 0 && (
              <div className="space-y-1.5 font-mono">
                <span className="text-[10px] uppercase text-[#71717a] block">
                  Repercussão nos Coeficientes do Reino:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {feedback.effects.map((eff, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-[#18181b] border border-[#27272a] text-[#d4d4d8]"
                    >
                      {eff}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botão de Avanço do Turno */}
            <button
              onClick={onNextAudience}
              className="w-full py-3.5 px-4 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-[#09090b] font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-0.5"
            >
              <span>[ RECEBER PRÓXIMO PETICIONÁRIO ]</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* AUDIÊNCIA EM ANDAMENTO */
          <div className="space-y-5">
            {/* 2. PETIÇÃO DIRETA EM 1ª PESSOA */}
            <div className="bg-[#18181b] border border-[#27272a] p-4 sm:p-5 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a] block">
                Petição Perante o Trono:
              </span>
              <blockquote className="text-sm sm:text-base text-[#f4f4f5] leading-relaxed font-serif italic">
                "{encounter.dialogue.replace(/^"|"$/g, "")}"
              </blockquote>
            </div>

            {/* 3. RESPOSTAS PREDEFINIDAS */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a] block">
                Decretos Régios Formulados:
              </span>

              {encounter.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => onSelectChoice(choice.id)}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-[#52525b] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group flex items-start justify-between gap-3 active:translate-y-0.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-mono text-[#f4f4f5] group-hover:text-white">
                      "{choice.speechReply}"
                    </div>
                    {choice.intentDescription && (
                      <div className="text-[11px] text-[#71717a] mt-0.5 font-mono">
                        {choice.intentDescription}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#52525b] group-hover:text-[#f4f4f5] shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>

            {/* 4. RESPOSTA LIVRE / ARBITRÁRIA (ROLEPLAY LIVRE) */}
            <form
              onSubmit={handleFreeSubmit}
              className="bg-[#18181b] border border-[#27272a] p-4 space-y-3 font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#a1a1aa] uppercase tracking-wider">
                  Dite Vossa Decisão Arbitrária:
                </span>
                <span className="text-[10px] text-[#71717a]">
                  Roleplay Livre • Árbitro IA
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  disabled={isLoading}
                  placeholder={`Ex: Fale diretamente com ${encounter.character.name} ou decrete qualquer ordem...`}
                  className="flex-1 bg-[#111113] border border-[#27272a] focus:border-[#f4f4f5] px-3 py-2 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none transition-colors"
                />

                <button
                  type="submit"
                  disabled={!freeText.trim() || isLoading}
                  className="px-3.5 py-2 bg-[#f4f4f5] hover:bg-[#e4e4e7] disabled:opacity-30 disabled:cursor-not-allowed text-[#09090b] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all active:translate-y-0.5 shrink-0 flex items-center gap-1.5"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Interpretando...</span>
                  ) : (
                    <>
                      <span>Decretar</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>

              {/* Tokens Rápidos de Inspiração */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {roleplayPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFreeText(prompt)}
                    disabled={isLoading}
                    className="text-[10px] px-2 py-0.5 bg-[#111113] hover:bg-[#27272a] border border-[#27272a] text-[#71717a] hover:text-[#d4d4d8] cursor-pointer transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
