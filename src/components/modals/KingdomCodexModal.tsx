"use client";

import React, { useState } from "react";
import { KingdomState } from "@/types/game";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { X } from "lucide-react";

interface KingdomCodexModalProps {
  isOpen: boolean;
  state: KingdomState;
  onClose: () => void;
}

export function KingdomCodexModal({
  isOpen,
  state,
  onClose,
}: KingdomCodexModalProps) {
  const [activeTab, setActiveTab] = useState<"history" | "court" | "factions" | "diplomacy">(
    "history"
  );

  if (!isOpen) return null;

  const characters = Object.values(state.characters || {});
  const realms = Object.values(state.realms || {});

  const factionList = [
    { key: "nobles", name: "Alta Nobreza", role: "Barões e senhores de terras" },
    { key: "merchants", name: "Guilda Mercante", role: "Comércio marítimo e caravanas" },
    { key: "clergy", name: "Santo Clero", role: "Ordem sacerdotal e templos" },
    { key: "peasants", name: "Povo Camponês", role: "Lavradores, aldeias e artesãos" },
    { key: "military", name: "Legiões e Guarda", role: "Guarnições, cavaleiros e sentinelas" },
  ];

  const getFactionFeeling = (val: number) => {
    if (val >= 40) return "Lealdade Fervorosa";
    if (val >= 15) return "Apoiador Fiel";
    if (val >= -15) return "Neutro / Expectante";
    if (val >= -40) return "Inquieto e Crítico";
    return "Hostilidade Declarada";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs select-none font-mono">
      <div className="bg-[#111113] border border-[#27272a] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#27272a] bg-[#18181b]">
          <div className="flex items-center gap-2">
            <span className="font-royal text-sm sm:text-base font-bold text-[#f4f4f5] tracking-tight">
              ARQUIVO REAL DO REINO
            </span>
            <span className="text-[10px] text-[#71717a] border border-[#3f3f46] px-1.5 py-0.5">
              {state.name}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-[#71717a] hover:text-[#f4f4f5] px-2 py-1 border border-[#27272a] hover:border-[#52525b] cursor-pointer"
          >
            [ ESC / FECHAR ]
          </button>
        </div>

        {/* ABAS FLAT MONOCROMÁTICAS */}
        <div className="flex border-b border-[#27272a] bg-[#111113] px-4 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-3 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "history"
                ? "border-[#f4f4f5] text-[#f4f4f5] font-bold"
                : "border-transparent text-[#71717a] hover:text-[#d4d4d8]"
            }`}
          >
            [ CRÔNICA: {state.history.length} ]
          </button>

          <button
            onClick={() => setActiveTab("court")}
            className={`py-2 px-3 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "court"
                ? "border-[#f4f4f5] text-[#f4f4f5] font-bold"
                : "border-transparent text-[#71717a] hover:text-[#d4d4d8]"
            }`}
          >
            [ CONSELHO: {characters.length} ]
          </button>

          <button
            onClick={() => setActiveTab("factions")}
            className={`py-2 px-3 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "factions"
                ? "border-[#f4f4f5] text-[#f4f4f5] font-bold"
                : "border-transparent text-[#71717a] hover:text-[#d4d4d8]"
            }`}
          >
            [ FACÇÕES: 5 ]
          </button>

          <button
            onClick={() => setActiveTab("diplomacy")}
            className={`py-2 px-3 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "diplomacy"
                ? "border-[#f4f4f5] text-[#f4f4f5] font-bold"
                : "border-transparent text-[#71717a] hover:text-[#d4d4d8]"
            }`}
          >
            [ DIPLOMACIA: {realms.length} ]
          </button>
        </div>

        {/* CONTEÚDO SCROLLÁVEL */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {/* CRÔNICA */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {state.history.length === 0 ? (
                <p className="text-xs text-[#71717a] text-center py-8">
                  Nenhum registro histórico registrado. A dinastia acabou de subir ao trono.
                </p>
              ) : (
                [...state.history].reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 bg-[#18181b] border border-[#27272a] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#71717a] border-b border-[#27272a] pb-1">
                      <span>
                        TURNO {entry.turn} • ANO {entry.year}
                      </span>
                      <span>MONARCA: {entry.rulerName}</span>
                    </div>

                    <div className="font-bold text-[#f4f4f5]">
                      {entry.eventTitle}
                    </div>

                    <div className="text-[#a1a1aa] italic font-serif">
                      Veredito: "{entry.playerDecision}"
                    </div>

                    <p className="text-[#d4d4d8] leading-relaxed font-sans">
                      {entry.narrative}
                    </p>

                    {entry.effectsSummary && entry.effectsSummary.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {entry.effectsSummary.map((eff, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 bg-[#111113] border border-[#27272a] text-[#71717a]"
                          >
                            {eff}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* CONSELHO */}
          {activeTab === "court" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="p-3 bg-[#18181b] border border-[#27272a] flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#111113] border border-[#3f3f46] flex items-center justify-center text-lg shrink-0">
                      {char.avatar || "👤"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#f4f4f5] truncate">
                          {char.name}
                        </span>
                        {!char.alive && (
                          <span className="text-[9px] px-1 bg-[#27272a] text-[#71717a] uppercase">
                            FALECIDO
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#71717a]">
                        {char.title || char.role}
                      </div>
                    </div>
                  </div>

                  {/* BARRAS DE LEALDADE E INFLUÊNCIA */}
                  <div className="space-y-2 border-t border-[#27272a] pt-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-[9px] text-[#71717a]">
                        <span>LEALDADE</span>
                        <span className="text-[#f4f4f5] font-bold">
                          {char.loyalty >= 35 ? "Devotado" : char.loyalty >= 0 ? "Leal" : "Suspeito"}
                        </span>
                      </div>
                      <AnimatedProgressBar
                        value={char.loyalty}
                        min={-100}
                        max={100}
                        bipolar
                        height="xs"
                        level={char.loyalty < -20 ? "danger" : "normal"}
                        showGlowHead={true}
                        showShimmer={true}
                      />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-[9px] text-[#71717a]">
                        <span>INFLUÊNCIA NA CORTE</span>
                        <span className="text-[#f4f4f5] font-bold">
                          {char.influence >= 70 ? "Poderoso" : char.influence >= 40 ? "Moderada" : "Discreta"}
                        </span>
                      </div>
                      <AnimatedProgressBar
                        value={char.influence}
                        min={0}
                        max={100}
                        height="xs"
                        showGlowHead={true}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FACÇÕES COM BARRAS DE PROCESSO ANIMADAS */}
          {activeTab === "factions" && (
            <div className="space-y-3">
              {factionList.map((fac) => {
                const value = (state.factions as any)[fac.key] ?? 0;
                const feeling = getFactionFeeling(value);
                const powerWeight =
                  fac.key === "military"
                    ? 90
                    : fac.key === "nobles"
                    ? 85
                    : fac.key === "merchants"
                    ? 75
                    : fac.key === "peasants"
                    ? 80
                    : 65;

                return (
                  <div
                    key={fac.key}
                    className="p-3.5 bg-[#18181b] border border-[#27272a] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-[#f4f4f5]">
                          {fac.name}
                        </div>
                        <div className="text-[10px] text-[#71717a]">{fac.role}</div>
                      </div>

                      <span className="text-xs text-[#f4f4f5] font-bold shrink-0">
                        {feeling}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#27272a]">
                      <div className="space-y-1">
                        <AnimatedProgressBar
                          value={value}
                          min={-100}
                          max={100}
                          bipolar
                          label="APROVAÇÃO POPULAR"
                          statusText={feeling}
                          height="xs"
                          level={value < -25 ? "danger" : value < 0 ? "warning" : "normal"}
                          showGlowHead={true}
                          showShimmer={true}
                        />
                      </div>

                      <div className="space-y-1">
                        <AnimatedProgressBar
                          value={powerWeight}
                          min={0}
                          max={100}
                          label="PESO POLÍTICO / MOBILIZAÇÃO"
                          statusText={powerWeight > 80 ? "Capacidade Crítica" : "Influência Estável"}
                          height="xs"
                          showTicks
                          showGlowHead={true}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DIPLOMACIA COM BARRAS DE RELAÇÃO E FORÇA */}
          {activeTab === "diplomacy" && (
            <div className="space-y-3">
              {realms.map((realm) => {
                const isWar = state.activeWars.includes(realm.id);
                const militaryThreat = isWar ? 92 : realm.relation < -20 ? 75 : 45;

                return (
                  <div
                    key={realm.id}
                    className="p-3.5 bg-[#18181b] border border-[#27272a] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#f4f4f5]">
                          {realm.name}
                        </span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 border ${
                            isWar
                              ? "border-red-500 text-red-300 font-bold"
                              : "border-[#3f3f46] text-[#71717a]"
                          }`}
                        >
                          {isWar ? "EM GUERRA ABERTA" : "TRATADO DE PAZ"}
                        </span>
                      </div>

                      <span className="text-xs text-[#f4f4f5] font-bold shrink-0">
                        {realm.relation > 20
                          ? "Aliado Juramentado"
                          : realm.relation < -20
                          ? "Fronteira Hostil"
                          : "Neutralidade Cautelosa"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#27272a]">
                      <div className="space-y-1">
                        <AnimatedProgressBar
                          value={realm.relation}
                          min={-100}
                          max={100}
                          bipolar
                          label="RELAÇÃO DIPLOMÁTICA"
                          statusText={realm.relation > 20 ? "Aliança Firme" : realm.relation < -20 ? "Inimizade" : "Comércio Mútuo"}
                          height="xs"
                          level={realm.relation < -25 ? "danger" : "normal"}
                          showGlowHead={true}
                          showShimmer={true}
                        />
                      </div>

                      <div className="space-y-1">
                        <AnimatedProgressBar
                          value={militaryThreat}
                          min={0}
                          max={100}
                          label="PRONTIDÃO BÉLICA FRONTEIRIÇA"
                          statusText={isWar ? "Mobilização Total" : militaryThreat > 60 ? "Tropas Concentradas" : "Guarnição Padrão"}
                          level={isWar ? "danger" : militaryThreat > 60 ? "warning" : "normal"}
                          height="xs"
                          showTicks
                          showGlowHead={true}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
