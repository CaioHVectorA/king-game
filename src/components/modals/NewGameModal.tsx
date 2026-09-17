"use client";

import React, { useState, useEffect } from "react";
import { Crown, Sparkles, X, Dices, FolderOpen, Plus, BookOpen, ShieldAlert } from "lucide-react";
import { GameSummary } from "@/lib/db/repository";
import { STORYLINES, DEFAULT_STORYLINE_ID } from "@/content/storylines";

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNewGame: (params: {
    name: string;
    rulerName: string;
    seed?: number;
    storylineId?: string;
  }) => void;
  onLoadGame: (gameId: string) => void;
}

export function NewGameModal({
  isOpen,
  onClose,
  onCreateNewGame,
  onLoadGame,
}: NewGameModalProps) {
  const [activeTab, setActiveTab] = useState<"new" | "load">("new");
  const [selectedStorylineId, setSelectedStorylineId] = useState(DEFAULT_STORYLINE_ID);
  const [kingdomName, setKingdomName] = useState("Reino de Valoria");
  const [rulerName, setRulerName] = useState("Alden II");
  const [savedGames, setSavedGames] = useState<GameSummary[]>([]);
  const [loadingSaves, setLoadingSaves] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingSaves(true);
      fetch("/api/game")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSavedGames(data);
          }
        })
        .catch((err) => console.error("Erro ao carregar jogos:", err))
        .finally(() => setLoadingSaves(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const kingdomPresets = [
    "Reino de Valoria",
    "Grão-Ducado de Sylveria",
    "Império de Solaria",
    "Principado das Brumas",
    "Coroa de Ferro de Aethelgard",
  ];

  const rulerPresets = [
    "Alden II",
    "Rainha Katherine",
    "Aurelius I",
    "Dona Beatriz de Avis",
    "Thorvald o Prudente",
  ];

  const handleRandomize = () => {
    const randomKingdom = kingdomPresets[Math.floor(Math.random() * kingdomPresets.length)];
    const randomRuler = rulerPresets[Math.floor(Math.random() * rulerPresets.length)];
    setKingdomName(randomKingdom);
    setRulerName(randomRuler);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateNewGame({
      name: kingdomName.trim() || "Reino de Valoria",
      rulerName: rulerName.trim() || "Alden II",
      seed: Math.floor(Math.random() * 1000000),
      storylineId: selectedStorylineId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#141624] to-[#0b0c13] border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl royal-border relative my-8">
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="font-royal text-lg font-bold text-amber-200">
              Gestão de Campanhas & Linhas de História
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-4 p-1 rounded-xl bg-black/40 border border-slate-800">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "new"
                ? "bg-amber-600/30 border border-amber-500/40 text-amber-200 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Fundar Nova Dinastia</span>
          </button>
          <button
            onClick={() => setActiveTab("load")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "load"
                ? "bg-amber-600/30 border border-amber-500/40 text-amber-200 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Carregar Campanha ({savedGames.length})</span>
          </button>
        </div>

        {activeTab === "new" ? (
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Seletor de Cenário / Linha de História */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-amber-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Escolha o Universo Narrativo (Lore & Cenário):
                </label>
                <span className="text-[11px] text-slate-400">
                  {STORYLINES.length} histórias disponíveis
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {STORYLINES.map((storyline) => {
                  const isSelected = selectedStorylineId === storyline.id;
                  const difficultyColor =
                    storyline.difficulty === "Fácil"
                      ? "text-emerald-300 bg-emerald-950/60 border-emerald-500/30"
                      : storyline.difficulty === "Equilibrado"
                      ? "text-sky-300 bg-sky-950/60 border-sky-500/30"
                      : storyline.difficulty === "Desafiador"
                      ? "text-amber-300 bg-amber-950/60 border-amber-500/30"
                      : "text-red-300 bg-red-950/60 border-red-500/30";

                  return (
                    <div
                      key={storyline.id}
                      onClick={() => setSelectedStorylineId(storyline.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500/70 shadow-lg shadow-amber-950/30 scale-[1.02]"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{storyline.bannerEmoji}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${difficultyColor}`}>
                          {storyline.difficulty}
                        </span>
                      </div>
                      <h4 className="font-royal text-xs font-bold text-slate-100 mb-0.5 line-clamp-1">
                        {storyline.name}
                      </h4>
                      <p className="text-[11px] text-amber-300/80 mb-1.5 line-clamp-1">
                        {storyline.subtitle}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed">
                        {storyline.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                  Nome do Reino:
                </label>
                <input
                  type="text"
                  value={kingdomName}
                  onChange={(e) => setKingdomName(e.target.value)}
                  className="w-full bg-[#090a10] border border-slate-700 focus:border-amber-500 rounded-xl p-2.5 text-sm text-slate-100 font-royal tracking-wide focus:outline-none"
                  placeholder="Ex: Reino de Valoria"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                  Nome do Monarca Inaugural:
                </label>
                <input
                  type="text"
                  value={rulerName}
                  onChange={(e) => setRulerName(e.target.value)}
                  className="w-full bg-[#090a10] border border-slate-700 focus:border-amber-500 rounded-xl p-2.5 text-sm text-slate-100 font-royal tracking-wide focus:outline-none"
                  placeholder="Ex: Alden II"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <button
                type="button"
                onClick={handleRandomize}
                className="flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Dices className="w-4 h-4" />
                <span>Sortear Nomes</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold font-royal text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-600/20 cursor-pointer transition-all mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Iniciar Campanha neste Cenário</span>
            </button>
          </form>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {loadingSaves ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Consultando pergaminhos de campanhas...
              </div>
            ) : savedGames.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Nenhum salvamento anterior encontrado.
              </div>
            ) : (
              savedGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    onLoadGame(game.id);
                    onClose();
                  }}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-900/80 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-200 font-royal">
                      {game.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Ano {game.year} • Turno {game.turn} • {game.rulerName}
                    </div>
                  </div>
                  {game.isGameOver ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/40">
                      Ruiu
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-900/40">
                      Ativo
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
