"use client";

import React from "react";
import { ConsequenceEcho } from "@/types/sovereign";
import { X, History, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { gameAudio } from "@/lib/audio/game-audio";

interface EchoesTimelineModalProps {
  echoes: ConsequenceEcho[];
  currentTurn: number;
  isOpen: boolean;
  onClose: () => void;
}

export function EchoesTimelineModal({
  echoes,
  currentTurn,
  isOpen,
  onClose,
}: EchoesTimelineModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in-slide">
      <div className="w-full max-w-3xl bg-[#090b10] border border-amber-500/30 rounded-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden font-sans">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-amber-950/40 bg-[#0d1017] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 text-amber-300 rounded">
              <History className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                TEIA DO DESTINO &amp; CONTRAPARTIDA KÁRMICA
              </span>
              <h2 className="font-royal text-xl font-bold text-white">
                Linha do Tempo dos Ecos do Passado
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

        {/* Lista de Ecos */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {echoes.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-40 text-amber-400" />
              <p className="text-sm">Nenhum eco kármico ativo no momento.</p>
              <p className="text-xs text-zinc-600">
                Decisões radicais (execuções, reformas sacras, misericórdia histórica) geram ecos que amadurecem ao longo dos turnos.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-amber-500/30 ml-4 pl-6 space-y-6">
              {echoes.map((echo) => {
                const turnsRemaining = echo.triggerTurn - currentTurn;
                const isDue = echo.resolved || turnsRemaining <= 0;

                return (
                  <div key={echo.id} className="relative group">
                    {/* Marcador na linha */}
                    <div
                      className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 ${
                        isDue
                          ? "bg-amber-400 border-amber-200 shadow-md shadow-amber-400/50"
                          : "bg-zinc-900 border-zinc-600"
                      }`}
                    />

                    <div className="p-4 rounded-md border border-zinc-800 bg-zinc-900/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-royal text-amber-200">
                          {echo.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                            isDue
                              ? "border-amber-500/40 bg-amber-950/40 text-amber-300 font-bold"
                              : "border-zinc-700 bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {isDue ? "✓ Manifestado no Domínio" : `Disparo em ${turnsRemaining} Turno(s)`}
                        </span>
                      </div>

                      <div className="p-2 rounded bg-black/40 border border-zinc-850 text-xs text-zinc-300 font-serif italic">
                        Decreto de Origem (Turno {echo.originTurn}): "{echo.causeDecision}"
                      </div>

                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {echo.manifestationDescription}
                      </p>

                      {echo.potentialConsequences.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                            Impactos em Campo:
                          </span>
                          <ul className="text-xs text-zinc-400 list-disc pl-4 space-y-0.5">
                            {echo.potentialConsequences.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-3 bg-[#0d1017] border-t border-zinc-800 text-center text-[10px] text-zinc-400 font-mono">
          "O que o soberano semeia na colina dos decretos colherá nos vales do amanhã."
        </div>
      </div>
    </div>
  );
}
