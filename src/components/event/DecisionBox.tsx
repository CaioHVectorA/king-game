"use client";

import React, { useState } from "react";
import { GameChoice } from "@/types/game";
import { Crown, Sparkles, Send, Lightbulb, ArrowRight } from "lucide-react";

interface DecisionBoxProps {
  choices: GameChoice[];
  isLoading: boolean;
  onSelectChoice: (choiceId: string) => void;
  onSubmitFreeText: (decision: string) => void;
}

export function DecisionBox({
  choices,
  isLoading,
  onSelectChoice,
  onSubmitFreeText,
}: DecisionBoxProps) {
  const [freeText, setFreeText] = useState("");

  const handleFreeTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeText.trim() || isLoading) return;
    onSubmitFreeText(freeText.trim());
    setFreeText("");
  };

  const inspirationPills = [
    "Enviar comida das reservas aos necessitados",
    "Prender os agitadores e confiscar suas riquezas",
    "Obrigar a nobreza a arcar com os custos",
    "Propor tratado de amizade e paz duradoura",
    "Declarar estado de alerta militar nas fronteiras",
    "Conceder anistia geral em troca de fidelidade",
  ];

  const handlePillClick = (text: string) => {
    setFreeText(text);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 animate-slide-up">
      {/* 1. Escolhas Rápidas */}
      <div className="space-y-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
          Decretos Oficiais Pré-estabelecidos:
        </span>
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onSelectChoice(choice.id)}
            disabled={isLoading}
            className="w-full group text-left p-3.5 sm:p-4 rounded-xl bg-[#11131d]/90 hover:bg-gradient-to-r hover:from-amber-950/40 hover:to-slate-900 border border-slate-700/60 hover:border-amber-500/50 transition-all duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-3"
          >
            <div className="space-y-1 pr-2">
              <div className="text-sm sm:text-base font-semibold text-slate-200 group-hover:text-amber-200 transition-colors">
                {choice.label}
              </div>
              {choice.intentDescription && (
                <div className="text-xs text-slate-400 group-hover:text-slate-300">
                  {choice.intentDescription}
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 group-hover:bg-amber-600/30 flex items-center justify-center text-slate-400 group-hover:text-amber-300 transition-all flex-shrink-0">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      {/* 2. Divisor Nobre */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-amber-500/20"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-widest text-amber-400/80 flex items-center gap-1.5 font-royal">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Ou dite vossa própria vontade soberana
        </span>
        <div className="flex-grow border-t border-amber-500/20"></div>
      </div>

      {/* 3. Campo de Decisão Livre (IA) */}
      <form
        onSubmit={handleFreeTextSubmit}
        className="bg-gradient-to-b from-[#131622] to-[#0d0e17] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl royal-border"
      >
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-300">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Escreva qualquer resolução como Soberano:</span>
        </div>

        <div className="relative mb-3">
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            disabled={isLoading}
            rows={3}
            placeholder="Ex: Vou negociar pessoalmente com os líderes, enviando metade dos grãos mas cobrando imposto extraordinário dos barões..."
            className="w-full bg-[#08090d]/80 border border-slate-700/80 focus:border-amber-500/70 rounded-xl p-3 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleFreeTextSubmit(e);
              }
            }}
          />
        </div>

        {/* Pílulas de Inspiração */}
        <div className="mb-4">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Sugestões da corte:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {inspirationPills.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePillClick(pill)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-amber-950/40 border border-slate-700/60 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 transition-all cursor-pointer text-left"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={!freeText.trim() || isLoading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold font-royal text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>O Conselho interpreta vossa ordem...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Promulgar Decreto Real</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
