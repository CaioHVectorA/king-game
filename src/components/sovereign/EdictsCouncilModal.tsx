"use client";

import React, { useState } from "react";
import { EdictCategory, EdictDefinition } from "@/types/sovereign";
import { KingdomState } from "@/types/game";
import { enactEdict, revokeEdict } from "@/lib/game/edicts";
import { X, BookMarked, Scroll, Check, AlertCircle, Coins, Scale } from "lucide-react";
import { gameAudio } from "@/lib/audio/game-audio";

interface EdictsCouncilModalProps {
  state: KingdomState;
  isOpen: boolean;
  onClose: () => void;
  onStateUpdate: (newState: KingdomState) => void;
}

export function EdictsCouncilModal({
  state,
  isOpen,
  onClose,
  onStateUpdate,
}: EdictsCouncilModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<EdictCategory | "todos">("todos");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const edicts = state.edicts || [];
  const filteredEdicts =
    selectedCategory === "todos"
      ? edicts
      : edicts.filter((e) => e.category === selectedCategory);

  const handleEnact = (edictId: string) => {
    gameAudio.playDecree();
    const res = enactEdict(state, edictId);
    if (res.success) {
      onStateUpdate(res.state);
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } else {
      setFeedbackMsg(`Impossível promulgar: ${res.message}`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleRevoke = (edictId: string) => {
    gameAudio.playClick();
    const res = revokeEdict(state, edictId);
    if (res.success) {
      onStateUpdate(res.state);
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in-slide">
      <div className="w-full max-w-4xl bg-[#090a0f] border border-amber-500/30 rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-sans">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-amber-950/40 bg-[#0d0e16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 text-amber-300 rounded">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                CÂMARA DE REFORMAS &amp; CONSTITUIÇÃO DO ESTADO
              </span>
              <h2 className="font-royal text-xl font-bold text-white">
                O Grande Códice de Éditos e Leis
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

        {/* Notificação de Promulgação */}
        {feedbackMsg && (
          <div className="p-3 bg-amber-950/80 border-b border-amber-500/40 text-xs text-amber-200 flex items-center gap-2">
            <Scroll className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Categorias de Éditos */}
        <div className="p-3 bg-black/40 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto px-6">
          {(["todos", "economia", "militar", "justica", "religiao"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                gameAudio.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 text-xs font-mono uppercase rounded cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                  : "bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {cat === "todos" ? "Todos os Éditos" : cat}
            </button>
          ))}
          <span className="text-[10px] font-mono text-zinc-500 ml-auto hidden sm:inline">
            Leis em vigor: <strong className="text-amber-300">{edicts.filter((e) => e.isEnacted).length}</strong>
          </span>
        </div>

        {/* Lista de Éditos */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredEdicts.map((edict) => {
            const canAfford =
              state.gold >= (edict.proclamationCost.gold || 0) &&
              state.stability >= (edict.proclamationCost.stability || 0);

            return (
              <div
                key={edict.id}
                className={`p-4 rounded-md border flex flex-col justify-between transition-all ${
                  edict.isEnacted
                    ? "border-amber-500/60 bg-amber-950/20 shadow-md shadow-amber-500/5"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-royal text-sm font-bold text-white">{edict.title}</h3>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border shrink-0 ${
                        edict.isEnacted
                          ? "border-amber-500/50 bg-amber-950 text-amber-200 font-bold"
                          : "border-zinc-700 bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {edict.isEnacted ? "✓ Em Vigor" : edict.category}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {edict.summary}
                  </p>

                  <div className="p-2 rounded bg-black/40 border border-zinc-850 text-[11px] text-zinc-400 font-serif italic">
                    "{edict.loreQuote}"
                  </div>

                  {/* Custos e Manutenção */}
                  <div className="pt-1 flex flex-wrap items-center gap-3 text-[10px] font-mono text-zinc-400">
                    {edict.proclamationCost.gold && (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Coins className="w-3 h-3" /> Promulgação: {edict.proclamationCost.gold} ouro
                      </span>
                    )}
                    {edict.monthlyMaintenance.gold && (
                      <span>
                        Manutenção: {edict.monthlyMaintenance.gold > 0 ? `-${edict.monthlyMaintenance.gold}` : `+${Math.abs(edict.monthlyMaintenance.gold)}`} ouro/mês
                      </span>
                    )}
                  </div>
                </div>

                {/* Botão de Promulgar ou Revogar */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  {edict.isEnacted ? (
                    <button
                      onClick={() => handleRevoke(edict.id)}
                      className="w-full py-2 text-xs font-mono font-bold bg-red-950/40 hover:bg-red-900/60 border border-red-600/40 text-red-300 rounded cursor-pointer transition-colors"
                    >
                      Revogar Édito Real
                    </button>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => handleEnact(edict.id)}
                      className="w-full py-2 game-btn-gold rounded text-xs font-bold font-mono tracking-wider disabled:opacity-40 cursor-pointer"
                    >
                      {canAfford ? "Promulgar com Selo Real" : "Recursos Insuficientes"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="p-3 bg-[#0d0e16] border-t border-zinc-800 text-center text-[10px] text-zinc-400 font-mono">
          Éditos e leis afetam a lealdade das facções a cada virada de mês.
        </div>
      </div>
    </div>
  );
}
