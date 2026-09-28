"use client";

import React from "react";

interface AnimatedProgressBarProps {
  value: number; // Valor numérico
  min?: number;
  max?: number;
  label?: string;
  statusText?: string;
  subText?: string;
  level?: "normal" | "good" | "neutral" | "warning" | "danger" | "emerald";
  height?: "xs" | "sm" | "md" | "lg";
  bipolar?: boolean; // Para valores que vão de -100 a +100 centrados em 0
  showTicks?: boolean;
  showGlowHead?: boolean;
  showShimmer?: boolean;
  segmented?: boolean;
  segmentsCount?: number;
  className?: string;
}

export function AnimatedProgressBar({
  value,
  min = 0,
  max = 100,
  label,
  statusText,
  subText,
  level = "normal",
  height = "sm",
  bipolar = false,
  showTicks = false,
  showGlowHead = true,
  showShimmer = true,
  segmented = false,
  segmentsCount = 10,
  className = "",
}: AnimatedProgressBarProps) {
  // Cálculo percentual normalizado
  let percentage = 0;
  if (bipolar) {
    // -100 a +100 mapeado para 0 a 100%
    const clamped = Math.max(-100, Math.min(100, value));
    percentage = ((clamped + 100) / 200) * 100;
  } else {
    const range = max - min;
    const clamped = Math.max(min, Math.min(max, value));
    percentage = range > 0 ? ((clamped - min) / range) * 100 : 0;
  }

  const heightClasses = {
    xs: "h-1.5",
    sm: "h-2.5",
    md: "h-3.5",
    lg: "h-5",
  };

  const isDanger = level === "danger";
  const isWarning = level === "warning";
  const isGood = level === "good" || level === "emerald";

  const barColor = isDanger
    ? "bg-red-400"
    : isWarning
    ? "bg-amber-300"
    : isGood
    ? "bg-emerald-400"
    : "bg-[#f4f4f5]";

  const glowHeadColor = isDanger
    ? "bg-red-200 shadow-[0_0_8px_#f87171]"
    : isWarning
    ? "bg-amber-100 shadow-[0_0_8px_#fcd34d]"
    : isGood
    ? "bg-emerald-100 shadow-[0_0_8px_#34d399]"
    : "bg-white shadow-[0_0_8px_#ffffff]";

  // Modo Segmentado (Blocos Discretos de Energia/Poder)
  if (segmented) {
    const activeSegments = Math.round((percentage / 100) * segmentsCount);

    return (
      <div className={`w-full font-mono select-none space-y-1 ${className}`}>
        {(label || statusText || subText) && (
          <div className="flex items-center justify-between text-[10px] text-[#71717a]">
            {label && <span className="uppercase tracking-wider text-[#a1a1aa]">{label}</span>}
            <div className="flex items-center gap-1.5">
              {statusText && <span className="font-bold text-[#f4f4f5]">{statusText}</span>}
              {subText && <span className="text-[9px] text-[#71717a]">({subText})</span>}
            </div>
          </div>
        )}

        <div className={`flex gap-1 w-full ${heightClasses[height]}`}>
          {Array.from({ length: segmentsCount }).map((_, i) => {
            const isActive = i < activeSegments;
            return (
              <div
                key={i}
                className={`flex-1 h-full border border-[#27272a] transition-all duration-500 relative overflow-hidden ${
                  isActive
                    ? `${barColor} ${isDanger ? "animate-danger-pulse" : "animate-scanline"}`
                    : "bg-[#141418]"
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full font-mono select-none space-y-1 ${className}`}>
      {/* Rótulo superior com status qualitativo ao invés de números secos */}
      {(label || statusText || subText) && (
        <div className="flex items-center justify-between text-[10px] text-[#71717a]">
          {label && <span className="uppercase tracking-wider text-[#a1a1aa]">{label}</span>}
          <div className="flex items-center gap-1.5">
            {statusText && <span className="font-bold text-[#f4f4f5]">{statusText}</span>}
            {subText && <span className="text-[9px] text-[#71717a]">({subText})</span>}
          </div>
        </div>
      )}

      {/* Trilho da Barra de Progresso com Profundidade e Borda */}
      <div
        className={`relative w-full ${heightClasses[height]} bg-[#111113] border border-[#27272a] overflow-hidden ${
          isDanger ? "border-red-900/40" : ""
        }`}
      >
        {/* Marcador central para barras bipolares (-100 a +100) */}
        {bipolar && (
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#3f3f46] z-20 pointer-events-none" />
        )}

        {/* Linhas de graduação / marcas visuais discretas */}
        {showTicks && (
          <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-20 opacity-25">
            <div className="w-[1px] h-full bg-[#71717a]" />
            <div className="w-[1px] h-full bg-[#71717a]" />
            <div className="w-[1px] h-full bg-[#71717a]" />
            <div className="w-[1px] h-full bg-[#71717a]" />
          </div>
        )}

        {/* Preenchimento Dinâmico com Animação Fluida e Efeito Scanline */}
        <div
          className={`h-full ${barColor} animate-scanline transition-all duration-700 ease-out relative ${
            isDanger ? "animate-danger-pulse" : ""
          }`}
          style={{ width: `${Math.max(2, Math.min(100, percentage))}%` }}
        >
          {/* Shimmer sweep de luz contínuo que corre sobre o preenchimento */}
          {showShimmer && (
            <div className="absolute inset-0 w-24 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-sweep pointer-events-none" />
          )}

          {/* Cabeça Brilhante / Leading Edge Glow Pip */}
          {showGlowHead && percentage > 3 && (
            <div
              className={`absolute top-0 bottom-0 right-0 w-[2px] ${glowHeadColor} animate-beam-spark z-10`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

