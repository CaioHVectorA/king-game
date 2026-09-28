"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STORYLINES } from "@/content/storylines";
import { StorylineDefinition } from "@/content/storylines/types";
import { GameSummary } from "@/lib/db/repository";
import { getSavedSessionsIndex } from "@/lib/storage/save-manager";
import { ArrowRight, Dices, Shield, Crown, Play, Sparkles } from "lucide-react";

const STORYLINE_DEFAULTS: Record<
  string,
  {
    rulerName: string;
    rulerTitle: string;
    realmName: string;
    archetype: string;
    origin: string;
    personalIntent: string;
  }
> = {
  valoria_classic: {
    rulerName: "Alden II",
    rulerTitle: "Sua Majestade Real",
    realmName: "Reino de Valoria",
    archetype: "Diplomata Cínico",
    origin: "Herdeiro de Direito",
    personalIntent: "Consolidar o tesouro da dinastia e conter as ambições da nobreza",
  },
  colony_exodus: {
    rulerName: "Sarah Vance",
    rulerTitle: "Diretora-Geral",
    realmName: "Estação Orbital Exodus-7",
    archetype: "Engenheira Visionária",
    origin: "Promovida pelo Conselho Operário",
    personalIntent: "Preservar os vinte mil colonos criogênicos a qualquer custo",
  },
  khar_invasion: {
    rulerName: "General Thorne",
    rulerTitle: "Comandante Supremo",
    realmName: "Bastião de Valoria",
    archetype: "General de Ferro",
    origin: "Ascensão por Lei Marcial",
    personalIntent: "Aniquilar a vanguarda nômade antes que cerquem a capital",
  },
  dark_plague: {
    rulerName: "Regente Corvus",
    rulerTitle: "Lorde Protetor",
    realmName: "Reino de Valoria",
    archetype: "Administrador Frio",
    origin: "Nomeado pela Sé Sagrada",
    personalIntent: "Impedir a extinção da dinastia e queimar o contágio",
  },
  zombie_apocalypse: {
    rulerName: "Alex Mercer",
    rulerTitle: "Comandante do Bastião",
    realmName: "Bastião 7 — Zona Murada",
    archetype: "Sobrevivente Tático",
    origin: "Eleito pelo Comitê de Sobreviventes",
    personalIntent: "Manter as muralhas de pé e sintetizar o soro antes do colapso total",
  },
  rio_zombie: {
    rulerName: "Rodrigo 'Marreta' Silva",
    rulerTitle: "Comandante da Barricada",
    realmName: "Reduto Fortificado da Urca",
    archetype: "Veterano Tático do BOPE",
    origin: "Eleito pelos Sobreviventes após a Queda dos Portões",
    personalIntent: "Defender os 4.500 sobreviventes da Urca, conter os Estaladores e não ceder um milímetro à Milícia da Linha Vermelha",
  },
};

export default function HomePage() {
  const router = useRouter();
  const [selectedStoryline, setSelectedStoryline] = useState<StorylineDefinition>(STORYLINES[0]);
  const [rulerName, setRulerName] = useState("Alden II");
  const [rulerTitle, setRulerTitle] = useState("Sua Majestade Real");
  const [realmName, setRealmName] = useState("Reino de Valoria");
  const [archetype, setArchetype] = useState("Diplomata Cínico");
  const [origin, setOrigin] = useState("Herdeiro de Direito");
  const [personalIntent, setPersonalIntent] = useState(
    "Consolidar o tesouro da dinastia e conter as ambições da nobreza"
  );
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 900000) + 100000);
  const [savedGames, setSavedGames] = useState<GameSummary[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/game")
      .then((res) => res.json())
      .then((serverData) => {
        const serverList: GameSummary[] = Array.isArray(serverData) ? serverData : [];
        const localList = getSavedSessionsIndex();
        const existingIds = new Set(serverList.map((s) => s.id));

        const formattedLocal: GameSummary[] = localList
          .filter((l) => !existingIds.has(l.id))
          .map((l) => ({
            id: l.id,
            name: `${l.name} (Local)`,
            rulerName: l.rulerName,
            rulerTitle: l.rulerTitle,
            storylineId: l.storylineId,
            storylineTitle: l.storylineTitle,
            turn: l.turn,
            year: l.year,
            month: l.month || 1,
            createdAt: l.savedAt,
            updatedAt: l.savedAt,
            isGameOver: false,
          }));

        setSavedGames([...serverList, ...formattedLocal]);
      })
      .catch((err) => {
        console.warn("Servidor inacessível, carregando sessões locais:", err);
        const localList = getSavedSessionsIndex();
        setSavedGames(
          localList.map((l) => ({
            id: l.id,
            name: `${l.name} (Local)`,
            rulerName: l.rulerName,
            rulerTitle: l.rulerTitle,
            storylineId: l.storylineId,
            storylineTitle: l.storylineTitle,
            turn: l.turn,
            year: l.year,
            month: l.month || 1,
            createdAt: l.savedAt,
            updatedAt: l.savedAt,
            isGameOver: false,
          }))
        );
      });
  }, []);

  const handleSelectStoryline = (s: StorylineDefinition) => {
    setSelectedStoryline(s);
    const defs = STORYLINE_DEFAULTS[s.id] || STORYLINE_DEFAULTS["valoria_classic"];
    setRulerName(defs.rulerName);
    setRulerTitle(defs.rulerTitle);
    setRealmName(defs.realmName);
    setArchetype(defs.archetype);
    setOrigin(defs.origin);
    setPersonalIntent(defs.personalIntent);
  };

  const handleRollSeed = () => {
    setSeed(Math.floor(Math.random() * 900000) + 100000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      setErrorMsg(null);

      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: realmName.trim() || "Reino Soberano",
          rulerName: rulerName.trim() || "Soberano",
          rulerTitle: rulerTitle.trim() || "Sua Majestade",
          archetype: archetype.trim() || "Estrategista",
          origin: origin.trim() || "Herdeiro",
          personalIntent: personalIntent.trim(),
          storylineId: selectedStoryline.id,
          seed,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Falha ao criar dinastia");
      router.push(`/intro/${data.id}`);
    } catch (err: any) {
      console.error("Erro ao criar:", err);
      setErrorMsg("Ocorreu um erro ao consagrar a nova dinastia.");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-[#f4f4f5] font-mono flex flex-col select-none">
      {/* TOPO: BARRA DE GAME LAUNCHER */}
      <header className="game-hud-panel border-b border-amber-500/30 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-amber-500/40 bg-amber-950/30 text-amber-400 font-bold">
            <Crown className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-amber-400/80 font-bold block">
              GAME ENGINE SIMULATOR v2.5
            </span>
            <h1 className="font-royal text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
              COROA &amp; PALAVRA — KINGDOM SIMULATOR
            </h1>
          </div>
        </div>
        {savedGames.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 border border-amber-500/30 bg-amber-950/20 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-amber-200 font-bold">{savedGames.length}</span>
            <span className="text-amber-400/70 uppercase text-[10px]">Partidas Salvas</span>
          </div>
        )}
      </header>

      {/* CORPO PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR DE CAMPAÑAS E SELEÇÃO DE RPG */}
        <aside className="w-64 sm:w-72 shrink-0 border-r border-[#272a38] overflow-y-auto bg-[#090b10] p-3 space-y-3">
          <div className="pb-2 border-b border-[#272a38] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
              1. Selecionar Campanha
            </span>
            <span className="text-[10px] text-[#71717a]">({STORYLINES.length} Cenários)</span>
          </div>

          <nav className="space-y-2">
            {STORYLINES.map((s) => {
              const isSelected = selectedStoryline.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectStoryline(s)}
                  className={`w-full text-left p-3 text-xs transition-all cursor-pointer rounded-sm ${
                    isSelected ? "game-card-active" : "game-card"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-[#71717a] uppercase mb-1">
                    <span>{s.era}</span>
                    <span className="px-1.5 py-0.5 border border-amber-500/30 text-amber-300 bg-amber-950/20 font-bold">
                      {s.difficulty}
                    </span>
                  </div>
                  <div className={`font-royal font-bold text-sm ${isSelected ? "text-amber-200" : "text-[#e2e8f0]"}`}>
                    {s.name}
                  </div>
                  <p className="text-[11px] text-[#94a3b8] mt-1 line-clamp-2 font-sans">
                    {s.subtitle}
                  </p>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ÁREA PRINCIPAL: DETALHES DO JOGO & PERSONAGEM */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#08090d]">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/60 text-xs text-red-200 animate-pulse">
              [ ERRO: {errorMsg} ]
            </div>
          )}

          {/* DETALHES DO CENÁRIO EM GAME CARD */}
          <section className="game-card p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{selectedStoryline.era}</span>
                </div>
                <h2 className="font-royal text-2xl font-bold text-amber-100">
                  {selectedStoryline.name}
                </h2>
                <p className="text-xs text-[#94a3b8] mt-1 font-sans">{selectedStoryline.subtitle}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-[10px] uppercase">
                {selectedStoryline.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 border border-[#333952] bg-[#11131c] text-amber-300 font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#0a0b10] border border-[#272a38] text-xs text-[#cbd5e1] font-sans leading-relaxed whitespace-pre-line">
              {selectedStoryline.worldLorePrompt.trim()}
            </div>
          </section>

          {/* PAINEL DE CRIAÇÃO DO LÍDER */}
          <form onSubmit={handleCreate} className="game-card p-5 space-y-5 border-amber-500/30">
            <div className="border-b border-[#272a38] pb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>2. Atributos &amp; Perfil do Regente</span>
              </span>
              <span className="text-[10px] text-[#71717a]">Customização Livre</span>
            </div>

            {/* Nome, Título, Domínio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-[#94a3b8] uppercase block mb-1 font-bold">
                  Nome do Governante
                </label>
                <input
                  type="text"
                  value={rulerName}
                  onChange={(e) => setRulerName(e.target.value)}
                  required
                  className="w-full bg-[#0a0b10] border border-[#333952] focus:border-amber-400 px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#94a3b8] uppercase block mb-1 font-bold">
                  Cargo / Título
                </label>
                <input
                  type="text"
                  value={rulerTitle}
                  onChange={(e) => setRulerTitle(e.target.value)}
                  required
                  className="w-full bg-[#0a0b10] border border-[#333952] focus:border-amber-400 px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#94a3b8] uppercase block mb-1 font-bold">
                  Nome do Domínio
                </label>
                <input
                  type="text"
                  value={realmName}
                  onChange={(e) => setRealmName(e.target.value)}
                  required
                  className="w-full bg-[#0a0b10] border border-[#333952] focus:border-amber-400 px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none"
                />
              </div>
            </div>

            {/* Arquétipo, Origem, Seed */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-[#94a3b8] uppercase block mb-1 font-bold">
                  Arquétipo de Liderança
                </label>
                <input
                  type="text"
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  placeholder="Ex: Diplomata Cínico, General de Ferro..."
                  className="w-full bg-[#0a0b10] border border-[#333952] focus:border-amber-400 px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#94a3b8] uppercase block mb-1 font-bold">
                  Origem da Ascensão
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Ex: Herdeiro, Golpe, Eleito..."
                  className="w-full bg-[#0a0b10] border border-[#333952] focus:border-amber-400 px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#94a3b8] uppercase block mb-1 font-bold flex items-center justify-between">
                  <span>Seed Determinística</span>
                  <button
                    type="button"
                    onClick={handleRollSeed}
                    className="text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                  >
                    <Dices className="w-3 h-3" />
                    <span>Sortear</span>
                  </button>
                </label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value) || 12345)}
                  required
                  className="w-full bg-[#0a0b10] border border-[#333952] focus:border-amber-400 px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none"
                />
              </div>
            </div>

            {/* Motivação secreta */}
            <div>
              <label className="text-[10px] text-[#94a3b8] uppercase block mb-1 font-bold">
                Juramento Secreto / Diretriz Central
              </label>
              <input
                type="text"
                value={personalIntent}
                onChange={(e) => setPersonalIntent(e.target.value)}
                placeholder="Ex: Consolidar o tesouro e guiar o povo à vitória..."
                className="w-full bg-[#0a0b10] border border-[#333952] focus:border-amber-400 px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-4 game-btn-primary cursor-pointer uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
            >
              {isCreating ? (
                <span>GERANDO MUNDO &amp; NARRATIVA...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>[ CONSAGRAR E INICIAR REINADO: {selectedStoryline.name.toUpperCase()} ]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* SLOTS DE CARREGAR PARTIDA */}
          {savedGames.length > 0 && (
            <section className="space-y-3 pt-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block">
                Slots de Partida em Andamento
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {savedGames.map((game) => (
                  <div
                    key={game.id}
                    className="game-card p-3.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#f4f4f5] flex items-center gap-2">
                        <span>{game.name}</span>
                        <span className="text-[#94a3b8] font-normal">({game.rulerName})</span>
                      </div>
                      <div className="text-[10px] text-[#71717a] mt-1">
                        Turno {game.turn} • Ano {game.year} • {game.storylineTitle || "Valoria"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => router.push(`/play/${game.id}`)}
                        className="px-3 py-1.5 game-btn-primary cursor-pointer text-[10px] flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-black" />
                        <span>Jogar →</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
