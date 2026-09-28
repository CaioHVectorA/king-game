"use client";

import React, { useState } from "react";
import { STORYLINES } from "@/content/storylines";
import { StorylineDefinition } from "@/content/storylines/types";
import { ArrowRight, ChevronRight, Crown, Shield, Skull, Sparkles } from "lucide-react";

interface StartScreenProps {
  onStartCampaign: (params: {
    storylineId: string;
    rulerName: string;
    realmName: string;
  }) => void;
  onResumeCurrent?: () => void;
  hasActiveGame: boolean;
  activeRulerName?: string;
}

export function StartScreen({
  onStartCampaign,
  onResumeCurrent,
  hasActiveGame,
  activeRulerName,
}: StartScreenProps) {
  const [selectedStoryline, setSelectedStoryline] = useState<StorylineDefinition>(STORYLINES[0]);
  const [rulerName, setRulerName] = useState("Alden II");
  const [realmName, setRealmName] = useState("Reino de Valoria");

  const handleSelectStoryline = (s: StorylineDefinition) => {
    setSelectedStoryline(s);
    if (s.id === "khar_invasion") {
      setRulerName("General Thorne");
      setRealmName("Bastião de Valoria");
    } else if (s.id === "dark_plague") {
      setRulerName("Regente Corvus");
      setRealmName("Reino de Valoria");
    } else {
      setRulerName("Alden II");
      setRealmName("Reino de Valoria");
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    onStartCampaign({
      storylineId: selectedStoryline.id,
      rulerName: rulerName.trim() || "Soberano",
      realmName: realmName.trim() || "Reino Soberano",
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between p-4 sm:p-8 max-w-5xl mx-auto select-none font-sans">
      {/* 1. TOPO / LOGO STARK MONOCROMÁTICO */}
      <header className="border-b border-[#27272a] pb-6 pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#71717a] block mb-1">
            SIMULADOR DE REINADO • INTERMEDIADOR NARRATIVO POR IA
          </span>
          <h1 className="font-royal text-2xl sm:text-4xl font-bold tracking-tight text-[#f4f4f5]">
            COROA &amp; PALAVRA
          </h1>
        </div>

        {hasActiveGame && onResumeCurrent && (
          <button
            onClick={onResumeCurrent}
            className="self-start sm:self-auto px-4 py-2 text-xs font-mono uppercase tracking-wider bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] text-[#f4f4f5] transition-all cursor-pointer flex items-center gap-2 active:translate-y-0.5"
          >
            <span>Retomar Reinado ({activeRulerName || "Ativo"})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </header>

      {/* 2. CORPO PRINCIPAL: SELETOR DE LORE */}
      <main className="my-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa]">
              01. Selecione o Cenário de Lore
            </span>
          </div>
          <p className="text-xs text-[#71717a]">
            A lore define a atmosfera, as facções rivais e as diretrizes do árbitro de inteligência artificial.
          </p>
        </div>

        {/* CARDS DE LORE FLAT MONOCROMÁTICOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STORYLINES.map((storyline) => {
            const isSelected = selectedStoryline.id === storyline.id;
            return (
              <div
                key={storyline.id}
                onClick={() => handleSelectStoryline(storyline)}
                className={`p-4 border transition-all cursor-pointer flex flex-col justify-between text-left ${
                  isSelected
                    ? "bg-[#18181b] border-[#f4f4f5] ring-1 ring-[#f4f4f5]"
                    : "bg-[#111113] border-[#27272a] hover:border-[#52525b]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] uppercase text-[#71717a]">
                      {storyline.era}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${
                        isSelected
                          ? "border-[#f4f4f5] text-[#f4f4f5]"
                          : "border-[#3f3f46] text-[#71717a]"
                      }`}
                    >
                      {storyline.difficulty}
                    </span>
                  </div>

                  <h3 className="font-royal text-base font-bold text-[#f4f4f5] mb-1">
                    {storyline.name}
                  </h3>

                  <p className="text-xs text-[#a1a1aa] mb-4 line-clamp-3 leading-relaxed">
                    {storyline.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#27272a] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#71717a]">
                    {storyline.tags.slice(0, 2).join(" • ")}
                  </span>
                  <span className={isSelected ? "text-[#f4f4f5] font-bold" : "text-[#52525b]"}>
                    {isSelected ? "[ SELECIONADO ]" : "SELECIONAR"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* DETALHES DA LORE SELECIONADA */}
        <div className="p-4 sm:p-5 bg-[#111113] border border-[#27272a] space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
            <span className="font-mono text-xs text-[#a1a1aa] uppercase tracking-wider">
              Premissa Histórica &amp; Tensão Narrativa
            </span>
            <span className="font-royal text-sm font-bold text-[#f4f4f5]">
              {selectedStoryline.subtitle}
            </span>
          </div>

          <div className="text-xs text-[#d4d4d8] font-mono leading-relaxed whitespace-pre-line">
            {selectedStoryline.worldLorePrompt.trim()}
          </div>
        </div>

        {/* 3. PARÂMETROS DO SOBERANO */}
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-1">
              02. Identidade Dinástica
            </span>
            <p className="text-xs text-[#71717a]">
              O nome sob o qual vossas ordens serão proclamadas pelo árbitro perante os súditos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#71717a] uppercase block mb-1">
                Nome do Monarca
              </label>
              <input
                type="text"
                value={rulerName}
                onChange={(e) => setRulerName(e.target.value)}
                required
                className="w-full bg-[#111113] border border-[#27272a] focus:border-[#f4f4f5] px-3 py-2 text-sm text-[#f4f4f5] font-mono focus:outline-none transition-colors"
                placeholder="Ex: Alden II"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#71717a] uppercase block mb-1">
                Nome do Reino / Domínio
              </label>
              <input
                type="text"
                value={realmName}
                onChange={(e) => setRealmName(e.target.value)}
                required
                className="w-full bg-[#111113] border border-[#27272a] focus:border-[#f4f4f5] px-3 py-2 text-sm text-[#f4f4f5] font-mono focus:outline-none transition-colors"
                placeholder="Ex: Reino de Valoria"
              />
            </div>
          </div>

          {/* BOTÃO DE INÍCIO */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-[#09090b] font-mono font-bold text-sm uppercase tracking-widest transition-all cursor-pointer active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>[ INICIAR REINADO: {selectedStoryline.name.toUpperCase()} ]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>

      {/* 4. RODAPÉ */}
      <footer className="border-t border-[#27272a] pt-4 text-[10px] font-mono text-[#71717a] flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>MOTOR AUTORITATIVO &amp; INTERPRETAÇÃO GROQ</span>
        <span>ROLEPLAY PURO • COEFICIENTES OCULTOS • CONSEQÜÊNCIAS PERSISTENTES</span>
      </footer>
    </div>
  );
}
