"use client";

import React, { useState } from "react";
import { KingdomState } from "@/types/game";
import { getKingdomFeelings, MetricFeeling } from "@/lib/game/feelings";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";

interface GameHeaderProps {
  state: KingdomState;
  onOpenCodex: () => void;
  onOpenDocuments: () => void;
  onOpenMap: () => void;
  onOpenStartScreen: () => void;
}

export function GameHeader({
  state,
  onOpenCodex,
  onOpenDocuments,
  onOpenMap,
  onOpenStartScreen,
}: GameHeaderProps) {
  const feelings = getKingdomFeelings(state);
  const [inspectMetric, setInspectMetric] = useState<MetricFeeling | null>(null);

  const getMonthName = (m: number) => {
    const seasons = [
      "Inverno",
      "Inverno",
      "Primavera",
      "Primavera",
      "Primavera",
      "Verão",
      "Verão",
      "Verão",
      "Outono",
      "Outono",
      "Outono",
      "Inverno",
    ];
    return seasons[(m - 1) % 12] || `Mês ${m}`;
  };

  const metricList = [
    feelings.treasury,
    feelings.food,
    feelings.population,
    feelings.stability,
    feelings.military,
  ];

  return (
    <header className="w-full bg-[#09090b] border-b border-[#27272a] px-3 sm:px-6 py-2.5 select-none sticky top-0 z-40 font-mono">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Lado Esquerdo: Soberano, Dinastia e Lore */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <span className="font-royal text-sm sm:text-base font-bold text-[#f4f4f5] tracking-tight">
              {state.currentRuler.name}
            </span>
            <span className="text-[10px] text-[#71717a] border border-[#27272a] px-1.5 py-0.5">
              Ano {state.year} • {getMonthName(state.month)}
            </span>
            {state.storylineTitle && (
              <span className="text-[10px] text-[#a1a1aa] hidden sm:inline-block">
                [{state.storylineTitle}]
              </span>
            )}
          </div>

          {/* Botões Mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onOpenDocuments}
              className="px-1.5 py-1 text-[10px] bg-[#18181b] border border-[#27272a] text-[#f4f4f5] active:translate-y-0.5 cursor-pointer"
            >
              [ LIVROS ]
            </button>
            <button
              onClick={onOpenMap}
              className="px-1.5 py-1 text-[10px] bg-[#18181b] border border-[#27272a] text-[#f4f4f5] active:translate-y-0.5 cursor-pointer"
            >
              [ MAPA ]
            </button>
            <button
              onClick={onOpenCodex}
              className="px-1.5 py-1 text-[10px] bg-[#18181b] border border-[#27272a] text-[#71717a] active:translate-y-0.5 cursor-pointer"
            >
              [ CRÔNICA ]
            </button>
          </div>
        </div>

        {/* Centro: O FEELING DO REINO COM BARRAS DE PROGRESSO ANIMADAS */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 justify-center">
          {metricList.map((m) => {
            const isDanger = m.level === "danger";
            const isWarning = m.level === "warning";

            return (
              <div
                key={m.label}
                onClick={() => setInspectMetric(inspectMetric?.label === m.label ? null : m)}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 border text-[11px] cursor-pointer transition-all shrink-0 flex flex-col gap-1.5 w-28 sm:w-32 ${
                  isDanger
                    ? "bg-[#18181b] border-red-500/70 text-[#f4f4f5] shadow-[0_0_10px_rgba(248,113,113,0.2)]"
                    : isWarning
                    ? "bg-[#111113] border-amber-500/50 text-[#d4d4d8]"
                    : "bg-[#111113] border-[#27272a] text-[#a1a1aa] hover:border-[#52525b] hover:text-[#f4f4f5]"
                }`}
                title={`${m.label}: ${m.description} (Toque para inspecionar)`}
              >
                <div className="flex items-center justify-between text-[9px] w-full gap-1">
                  <span className="text-[#71717a] uppercase font-mono shrink-0">{m.label}</span>
                  <span className="font-bold text-[#f4f4f5] truncate max-w-[68px] font-mono text-right">{m.feeling}</span>
                </div>
                <AnimatedProgressBar
                  value={m.percentage}
                  min={0}
                  max={100}
                  level={m.level}
                  height="xs"
                  showGlowHead={true}
                  showShimmer={true}
                />
              </div>
            );
          })}
        </div>

        {/* Lado Direito: Ações de Apoio Desktop */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenDocuments}
            className="px-2.5 py-1 text-xs bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-[#3f3f46] text-[#f4f4f5] transition-all cursor-pointer active:translate-y-0.5"
            title="Consultar Documentos e Éditos do Reino"
          >
            [ MINI-LIVROS ]
          </button>

          <button
            onClick={onOpenMap}
            className="px-2.5 py-1 text-xs bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-[#3f3f46] text-[#f4f4f5] transition-all cursor-pointer active:translate-y-0.5"
            title="Inspecionar Mapa Topográfico do Reino"
          >
            [ MAPA ]
          </button>

          <button
            onClick={onOpenCodex}
            className="px-2.5 py-1 text-xs bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] hover:text-[#f4f4f5] transition-all cursor-pointer active:translate-y-0.5"
            title="Abrir Crônica e Histórico Dinástico"
          >
            [ CRÔNICA ]
          </button>

          <button
            onClick={onOpenStartScreen}
            className="px-2.5 py-1 text-xs bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-[#3f3f46] text-[#71717a] hover:text-[#f4f4f5] transition-all cursor-pointer active:translate-y-0.5"
            title="Voltar à Tela Inicial / Selecionar Lore"
          >
            [ INÍCIO ]
          </button>
        </div>
      </div>

      {/* INSPEÇÃO VISUAL COM BARRA DE PROCESSO EXPANDIDA SE O JOGADOR CLICAR */}
      {inspectMetric && (
        <div className="max-w-5xl mx-auto mt-2 pt-2 border-t border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#a1a1aa] animate-mono-in">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#f4f4f5] uppercase">{inspectMetric.label}</span>
              <span className="text-[10px] text-[#71717a]">› {inspectMetric.feeling}</span>
            </div>
            <p className="text-[11px] text-[#a1a1aa] leading-relaxed font-sans">
              {inspectMetric.description}
            </p>
            <div className="max-w-md pt-1 space-y-1.5">
              <AnimatedProgressBar
                value={inspectMetric.percentage}
                min={0}
                max={100}
                level={inspectMetric.level}
                height="md"
                showTicks
                showGlowHead={true}
                showShimmer={true}
              />
              <div className="flex items-center justify-between text-[9px] text-[#71717a] font-mono">
                <span>[ MÍNIMO / COLAPSO ]</span>
                <span className="text-[#f4f4f5] uppercase">ESTADO ATUAL: {inspectMetric.feeling}</span>
                <span>[ PLENITUDE / MÁXIMO ]</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setInspectMetric(null)}
              className="text-[10px] text-[#71717a] hover:text-[#f4f4f5] px-2 py-1 border border-[#27272a] cursor-pointer uppercase"
            >
              [ FECHAR ]
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
