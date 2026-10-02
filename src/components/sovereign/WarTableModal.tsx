"use client";

import React, { useState } from "react";
import { RealmProvince } from "@/types/sovereign";
import { KingdomState } from "@/types/game";
import { reinforceProvince, pacifyProvince } from "@/lib/game/war-theater";
import { X, Shield, Users, Flame, Compass, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { gameAudio } from "@/lib/audio/game-audio";

interface WarTableModalProps {
  state: KingdomState;
  isOpen: boolean;
  onClose: () => void;
  onStateUpdate: (newState: KingdomState) => void;
}

export function WarTableModal({
  state,
  isOpen,
  onClose,
  onStateUpdate,
}: WarTableModalProps) {
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const provinces = state.provinces || [];

  const handleReinforce = (provId: string) => {
    gameAudio.playClick();
    const res = reinforceProvince(state, provId, 25);
    if (res.success) {
      onStateUpdate(res.state);
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg(`Erro: ${res.message}`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handlePacify = (provId: string) => {
    gameAudio.playClick();
    const res = pacifyProvince(state, provId);
    if (res.success) {
      onStateUpdate(res.state);
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg(`Erro: ${res.message}`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in-slide">
      <div className="w-full max-w-4xl bg-[#090b10] border border-amber-500/30 rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-sans">
        {/* Cabeçalho da Mesa de Guerra */}
        <div className="p-4 sm:p-5 border-b border-amber-950/40 bg-[#0d1017] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-950/40 border border-red-500/40 text-red-400 rounded">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                TEATRO ESTRATÉGICO &amp; DEFESA DO DOMÍNIO
              </span>
              <h2 className="font-royal text-xl font-bold text-white">
                Mesa de Guerra das Seis Províncias
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

        {/* Notificação de Despacho Tático */}
        {feedbackMsg && (
          <div className="p-3 bg-amber-950/70 border-b border-amber-500/40 text-xs text-amber-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Barra de Recursos Militares e Ouro Disponíveis */}
        <div className="p-3 bg-black/50 border-b border-zinc-800 flex items-center justify-between text-xs font-mono px-6">
          <div className="flex items-center gap-4">
            <span>
              Poder Militar Disponível: <strong className="text-amber-300">{state.military}</strong>
            </span>
            <span>
              Tesouro da Coroa: <strong className="text-amber-300">{state.gold} moedas</strong>
            </span>
          </div>
          <span className="text-zinc-500 text-[10px]">
            {state.activeWars.length > 0 ? `⚔ Frentes de Guerra: ${state.activeWars.join(", ")}` : "Em Tempo de Paz Relativa"}
          </span>
        </div>

        {/* Grade de Províncias */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {provinces.map((prov) => {
            const isHighThreat = prov.threatLevel === "cerco_iminente" || prov.threatLevel === "incursao";
            const isHighUnrest = prov.unrest > 40;

            return (
              <div
                key={prov.id}
                className={`p-4 rounded-md border flex flex-col justify-between transition-all ${
                  isHighThreat
                    ? "border-red-500/50 bg-red-950/20"
                    : isHighUnrest
                    ? "border-amber-500/50 bg-amber-950/15"
                    : "border-zinc-800 bg-zinc-900/40"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-royal text-sm font-bold text-white">{prov.name}</h3>
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        Controle: Facção {prov.controllingFaction.toUpperCase()}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                        isHighThreat
                          ? "border-red-500/60 bg-red-950 text-red-200"
                          : "border-zinc-700 bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {prov.threatLevel}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                    {prov.specialTrait}
                  </p>

                  {/* Barras de Guarnição e Distúrbio */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-sky-400" /> Guarnição
                      </span>
                      <span className="text-sky-300 font-bold">{prov.garrison}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500" style={{ width: `${prov.garrison}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400" /> Distúrbios Civis
                      </span>
                      <span className={`font-bold ${isHighUnrest ? "text-red-400" : "text-zinc-300"}`}>
                        {prov.unrest}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isHighUnrest ? "bg-red-500" : "bg-amber-500"}`}
                        style={{ width: `${prov.unrest}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Botões de Ação Tática */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                  <button
                    onClick={() => handleReinforce(prov.id)}
                    className="flex-1 py-1.5 text-[10px] font-mono font-bold bg-sky-950/40 hover:bg-sky-900/60 border border-sky-600/40 text-sky-300 rounded cursor-pointer transition-colors"
                    title="Destacar tropas imperiais para esta guarnição (Custo: 5 Militar)"
                  >
                    + Reforçar Defesa
                  </button>

                  <button
                    onClick={() => handlePacify(prov.id)}
                    className="flex-1 py-1.5 text-[10px] font-mono font-bold bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 text-amber-300 rounded cursor-pointer transition-colors"
                    title="Enviar magistrados e provisões para conter distúrbios (Custo: 40 Ouro)"
                  >
                    Pacificar Povo
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé da Mesa de Guerra */}
        <div className="p-3 bg-[#0d1017] border-t border-zinc-800 text-center text-[10px] text-zinc-400 font-mono">
          Guarnições fracas em províncias de fronteira convidam incursões e saques dos reinos vizinhos.
        </div>
      </div>
    </div>
  );
}
