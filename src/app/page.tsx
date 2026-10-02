"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STORYLINES } from "@/content/storylines";
import { StorylineDefinition } from "@/content/storylines/types";
import { GameSummary } from "@/lib/db/repository";
import {
  getSavedSessionsIndex,
  deleteSessionFromLocalStorage,
} from "@/lib/storage/save-manager";
import { gameAudio } from "@/lib/audio/game-audio";
import {
  Crown,
  Swords,
  Shield,
  Skull,
  Flame,
  Rocket,
  Play,
  RotateCcw,
  BookOpen,
  Settings,
  Volume2,
  VolumeX,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Dices,
  Trash2,
  Sparkles,
  HelpCircle,
  Crosshair,
  Compass,
  Award,
  Scale,
  Trophy,
} from "lucide-react";
import { EndingsGalleryModal } from "@/components/menu/EndingsGalleryModal";

type MenuView = "menu" | "new_game" | "load_game" | "scenarios" | "settings";

// Defaults canônicos por storyline
const STORYLINE_DEFAULTS: Record<
  string,
  {
    rulerName: string;
    rulerTitle: string;
    realmName: string;
    archetype: string;
    origin: string;
    personalIntent: string;
    icon: any;
    themeColor: string;
  }
> = {
  valoria_classic: {
    rulerName: "Alden II",
    rulerTitle: "Sua Majestade Real",
    realmName: "Reino de Valoria",
    archetype: "Diplomata Cínico",
    origin: "Herdeiro de Direito",
    personalIntent: "Consolidar o tesouro da dinastia e conter as intrigas da nobreza",
    icon: Crown,
    themeColor: "amber",
  },
  khar_invasion: {
    rulerName: "General Thorne",
    rulerTitle: "Comandante Supremo",
    realmName: "Bastião de Valoria",
    archetype: "General de Ferro",
    origin: "Ascensão por Lei Marcial",
    personalIntent: "Aniquilar a vanguarda dos invasores antes do cerco à cidadela",
    icon: Swords,
    themeColor: "red",
  },
  dark_plague: {
    rulerName: "Regente Corvus",
    rulerTitle: "Lorde Protetor",
    realmName: "Reino de Valoria",
    archetype: "Administrador Frio",
    origin: "Nomeado pela Sé Sagrada",
    personalIntent: "Impedir o colapso demográfico e expurgar os focos de contágio",
    icon: Skull,
    themeColor: "emerald",
  },
  rio_zombie: {
    rulerName: "Rodrigo 'Marreta' Silva",
    rulerTitle: "Comandante da Barricada",
    realmName: "Reduto Fortificado da Urca",
    archetype: "Veterano Tático do BOPE",
    origin: "Eleito pelos Sobreviventes",
    personalIntent: "Defender os sobreviventes, conter os Estaladores e resistir às facções armadas",
    icon: Flame,
    themeColor: "orange",
  },
  zombie_apocalypse: {
    rulerName: "Alex Mercer",
    rulerTitle: "Comandante do Bastião",
    realmName: "Bastião 7 — Zona Murada",
    archetype: "Sobrevivente Tático",
    origin: "Comitê de Salvação",
    personalIntent: "Manter as defesas ativas e sintetizar o soro antes do colapso da muralha",
    icon: Shield,
    themeColor: "cyan",
  },
  colony_exodus: {
    rulerName: "Sarah Vance",
    rulerTitle: "Diretora-Geral",
    realmName: "Estação Orbital Exodus-7",
    archetype: "Engenheira Visionária",
    origin: "Conselho de Engenharia",
    personalIntent: "Preservar os vinte mil colonos criogênicos até alcançar a nova colônia",
    icon: Rocket,
    themeColor: "blue",
  },
  republica_sangue: {
    rulerName: "Maximilien Valmont",
    rulerTitle: "Presidente do Comitê",
    realmName: "República da Nação Livre",
    archetype: "Incorruptível Jacobino",
    origin: "Eleito pela Convenção Revolucionária",
    personalIntent: "Esmagar as monarquias invasoras e purgar traidores sem pestanejar",
    icon: Scale,
    themeColor: "red",
  },
  arcania_trono: {
    rulerName: "Lorde Valen",
    rulerTitle: "Custódio da Última Chama",
    realmName: "Cidadela de Arcania",
    archetype: "Cavaleiro do Eclipse",
    origin: "Herdeiro do Pacto do Fogo",
    personalIntent: "Manter a Chama Primordial acesa e conter a Noite Eterna",
    icon: Sparkles,
    themeColor: "purple",
  },
};

export default function GameMainMenuPage() {
  const router = useRouter();

  const [currentView, setCurrentView] = useState<MenuView>("menu");
  const [selectedStoryline, setSelectedStoryline] = useState<StorylineDefinition>(STORYLINES[0]);
  const [isEndingsModalOpen, setIsEndingsModalOpen] = useState(false);

  // Formulário do governante
  const [rulerName, setRulerName] = useState("Alden II");
  const [rulerTitle, setRulerTitle] = useState("Sua Majestade Real");
  const [realmName, setRealmName] = useState("Reino de Valoria");
  const [archetype, setArchetype] = useState("Diplomata Cínico");
  const [origin, setOrigin] = useState("Herdeiro de Direito");
  const [personalIntent, setPersonalIntent] = useState(
    "Consolidar o tesouro da dinastia e conter as intrigas da nobreza"
  );
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 900000) + 100000);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Saves e status
  const [savedGames, setSavedGames] = useState<GameSummary[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sfxActive, setSfxActive] = useState<boolean>(true);

  // Carrega saves do servidor e local
  const refreshSaves = () => {
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
        console.warn("Carregando apenas do storage local:", err);
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
  };

  useEffect(() => {
    refreshSaves();
    setSfxActive(gameAudio.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const newState = gameAudio.toggle();
    setSfxActive(newState);
  };

  const handleSelectStoryline = (s: StorylineDefinition) => {
    gameAudio.playClick();
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
    gameAudio.playClick();
    setSeed(Math.floor(Math.random() * 900000) + 100000);
  };

  const handleStartCampaign = async () => {
    gameAudio.playStartGame();
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
      if (!res.ok || data.error) throw new Error(data.error || "Falha ao consagrar a nova dinastia");
      router.push(`/intro/${data.id}`);
    } catch (err: any) {
      console.error("Erro ao criar:", err);
      setErrorMsg("Ocorreu um erro ao consagrar o reinado no trono.");
      setIsCreating(false);
    }
  };

  const handleDeleteSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    gameAudio.playClick();
    if (confirm("Deseja realmente remover esta sessão do arquivo local?")) {
      deleteSessionFromLocalStorage(id);
      refreshSaves();
    }
  };

  const navigateToView = (view: MenuView) => {
    gameAudio.playClick();
    setCurrentView(view);
  };

  // Jogo mais recente para botão de "Continuar"
  const mostRecentSave = savedGames.length > 0 ? savedGames[0] : null;

  return (
    <div className="min-h-screen bg-[#06070a] text-[#f4f4f5] flex flex-col justify-between selection:bg-amber-600/30 selection:text-amber-200 relative overflow-hidden font-sans">
      {/* Vinheta e Atmosfera de Jogo */}
      <div className="absolute inset-0 game-vignette pointer-events-none z-0" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* BARRA SUPERIOR DO JOGO (HUD DISCRETO) */}
      <header className="relative z-10 px-4 sm:px-8 py-3.5 border-b border-amber-950/40 bg-[#08090d]/80 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-royal text-xs sm:text-sm font-bold tracking-wider text-amber-100/90">
            COROA &amp; PALAVRA
          </span>
          <span className="text-[10px] text-amber-500/60 font-mono hidden sm:inline">
            v1.4 • Simulador Dinástico
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Som */}
          <button
            onClick={handleToggleSound}
            onMouseEnter={() => gameAudio.playHover()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-amber-500/30 hover:border-amber-400/60 bg-amber-950/20 text-amber-200/80 hover:text-amber-100 transition-colors rounded-sm cursor-pointer"
            title={sfxActive ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros"}
          >
            {sfxActive ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
            <span className="text-[10px] font-mono uppercase">{sfxActive ? "Som: Ligado" : "Mudo"}</span>
          </button>

          {currentView !== "menu" && (
            <button
              onClick={() => navigateToView("menu")}
              onMouseEnter={() => gameAudio.playHover()}
              className="px-3 py-1 text-xs border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors rounded-sm cursor-pointer font-mono"
            >
              ◂ Menu
            </button>
          )}
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DE ACORDO COM A VIEW */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 text-xs text-red-200 rounded flex justify-between items-center animate-fade-in-slide">
            <span>[ AVISO: {errorMsg} ]</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-100 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VIEW 1: MENU PRINCIPAL DE JOGO (TITLE SCREEN)
            ───────────────────────────────────────────────────────────── */}
        {currentView === "menu" && (
          <div className="flex flex-col items-center justify-center my-auto py-8 animate-fade-in-slide">
            {/* Brasão Heroico do Jogo */}
            <div className="relative mb-4 flex items-center justify-center">
              <div className="absolute w-28 h-28 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
              <div className="relative p-4 rounded-full border border-amber-500/40 bg-gradient-to-b from-amber-950/60 via-zinc-900/90 to-black shadow-2xl animate-gold-pulse">
                <Crown className="w-12 h-12 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
              </div>
            </div>

            {/* Título do Jogo */}
            <div className="text-center mb-8 space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400/80 block">
                SIMULADOR DINÁSTICO &amp; ROLEPLAY NARRATIVO
              </span>
              <h1 className="font-royal text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 drop-shadow-md">
                COROA &amp; PALAVRA
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Cada decreto dita o destino de sua dinastia. A inteligência artificial narra; o motor decide sua glória ou ruína.
              </p>
            </div>

            {/* Botão de Destaque: Continuar Reinado Atual (se houver save) */}
            {mostRecentSave && (
              <div className="w-full max-w-md mb-5">
                <button
                  onClick={() => {
                    gameAudio.playStartGame();
                    router.push(`/play/${mostRecentSave.id}`);
                  }}
                  onMouseEnter={() => gameAudio.playHover()}
                  className="w-full game-btn-gold py-4 px-6 rounded-md flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-black/30 rounded border border-amber-300/40">
                      <Play className="w-5 h-5 text-amber-200 fill-amber-200" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-amber-200/90 block">
                        CONTINUAR REINADO ATUAL
                      </span>
                      <span className="text-base font-royal font-bold text-white block">
                        {mostRecentSave.rulerName}
                      </span>
                      <span className="text-[10px] font-mono text-amber-100/80">
                        {mostRecentSave.name} • Turno {mostRecentSave.turn} • Ano {mostRecentSave.year}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-200 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Menu Vertical de Opções */}
            <div className="w-full max-w-md space-y-2.5">
              <button
                onClick={() => navigateToView("new_game")}
                onMouseEnter={() => gameAudio.playHover()}
                className={`w-full ${
                  !mostRecentSave ? "game-btn-gold py-4 text-base" : "game-btn py-3.5 text-sm"
                } rounded-md flex items-center justify-between px-6 group cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <Swords className="w-4 h-4 text-amber-400" />
                  <span>NOVA CAMPANHA</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigateToView("load_game")}
                onMouseEnter={() => gameAudio.playHover()}
                className="w-full game-btn py-3.5 text-sm rounded-md flex items-center justify-between px-6 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>CARREGAR REINADO</span>
                </div>
                <div className="flex items-center gap-2">
                  {savedGames.length > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300">
                      {savedGames.length}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
                </div>
              </button>

              <button
                onClick={() => navigateToView("scenarios")}
                onMouseEnter={() => gameAudio.playHover()}
                className="w-full game-btn py-3.5 text-sm rounded-md flex items-center justify-between px-6 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>CENÁRIOS &amp; LORE</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigateToView("settings")}
                onMouseEnter={() => gameAudio.playHover()}
                className="w-full game-btn py-3.5 text-sm rounded-md flex items-center justify-between px-6 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>OPÇÕES &amp; GUIA</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => {
                  gameAudio.playClick();
                  setIsEndingsModalOpen(true);
                }}
                onMouseEnter={() => gameAudio.playHover()}
                className="w-full game-btn py-3.5 text-sm rounded-md flex items-center justify-between px-6 group cursor-pointer border-amber-500/30"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>CÓDICE DE FINAIS</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VIEW 2: SELEÇÃO DE CENÁRIO E NOVO JOGO
            ───────────────────────────────────────────────────────────── */}
        {currentView === "new_game" && (
          <div className="space-y-6 animate-fade-in-slide py-2">
            <div className="flex items-center justify-between border-b border-amber-950/40 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                  ETAPA 1 DE 1: ESCOLHA SEU DESTINO
                </span>
                <h2 className="font-royal text-2xl font-bold text-white">
                  Selecione o Cenário de Campanha
                </h2>
              </div>
              <button
                onClick={() => navigateToView("menu")}
                onMouseEnter={() => gameAudio.playHover()}
                className="px-3 py-1.5 text-xs game-btn-subtle rounded cursor-pointer font-mono"
              >
                ◂ Voltar
              </button>
            </div>

            {/* Grid dos Cenários Disponíveis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {STORYLINES.map((s) => {
                const isSelected = selectedStoryline.id === s.id;
                const defs = STORYLINE_DEFAULTS[s.id] || STORYLINE_DEFAULTS["valoria_classic"];
                const IconComponent = defs.icon;

                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectStoryline(s)}
                    onMouseEnter={() => gameAudio.playHover()}
                    className={`game-scenario-card p-4 rounded-md cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected ? "active ring-1 ring-amber-500" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded ${
                              isSelected
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-mono uppercase text-zinc-400">
                            {s.era}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                            isSelected
                              ? "border-amber-500/50 bg-amber-950/30 text-amber-300"
                              : "border-zinc-700 bg-zinc-900 text-zinc-400"
                          }`}
                        >
                          {s.difficulty}
                        </span>
                      </div>

                      <h3 className="font-royal text-base font-bold text-white mb-1">
                        {s.name}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {s.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Líder: {defs.rulerName}</span>
                      {isSelected && <span className="text-amber-400 font-bold">● SELECIONADO</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Painel do Cenário Escolhido & Ação Imediata */}
            <div className="game-panel p-5 sm:p-6 rounded-md relative space-y-4">
              <div className="game-corner-tl" />
              <div className="game-corner-tr" />
              <div className="game-corner-bl" />
              <div className="game-corner-br" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-0.5">
                    Visão Geral do Domínio
                  </span>
                  <h3 className="font-royal text-xl font-bold text-white">
                    {selectedStoryline.name} — {realmName}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">
                    Soberano Padrão: <strong className="text-amber-300">{rulerName}</strong> ({rulerTitle})
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line bg-black/40 p-3.5 rounded border border-zinc-800/80">
                {selectedStoryline.worldLorePrompt.trim()}
              </p>

              {/* Botão de Iniciar Rápido ou Customizar */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={handleStartCampaign}
                  onMouseEnter={() => gameAudio.playHover()}
                  className="w-full game-btn-gold py-4 px-6 rounded text-sm sm:text-base font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:translate-y-0.5"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      <span>CONSAGRANDO A DINASTIA E GERANDO MUNDO...</span>
                    </div>
                  ) : (
                    <>
                      <span>INICIAR REINADO COM {rulerName.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Alternar Personalização Opcional */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      gameAudio.playClick();
                      setIsCustomizing((v) => !v);
                    }}
                    onMouseEnter={() => gameAudio.playHover()}
                    className="text-xs text-amber-400 hover:text-amber-300 font-mono inline-flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <span>{isCustomizing ? "Recolher Opções de Personalização" : "Personalizar Governante & Domínio (Opcional)"}</span>
                    {isCustomizing ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Formulário de Customização Expansível */}
                {isCustomizing && (
                  <div className="p-4 bg-black/50 border border-zinc-800 rounded space-y-4 animate-fade-in-slide">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                          Nome do Soberano
                        </label>
                        <input
                          type="text"
                          value={rulerName}
                          onChange={(e) => setRulerName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white rounded focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                          Título Oficial
                        </label>
                        <input
                          type="text"
                          value={rulerTitle}
                          onChange={(e) => setRulerTitle(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white rounded focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                          Nome do Domínio
                        </label>
                        <input
                          type="text"
                          value={realmName}
                          onChange={(e) => setRealmName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white rounded focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                          Perfil de Liderança
                        </label>
                        <input
                          type="text"
                          value={archetype}
                          onChange={(e) => setArchetype(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white rounded focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                          Origem do Poder
                        </label>
                        <input
                          type="text"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white rounded focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1 flex items-center justify-between">
                          <span>Seed do Mapa</span>
                          <button
                            type="button"
                            onClick={handleRollSeed}
                            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Dices className="w-3 h-3" />
                            <span>Sortear</span>
                          </button>
                        </label>
                        <input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(parseInt(e.target.value) || 12345)}
                          className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white rounded focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">
                        Juramento Secreto / Diretriz Central
                      </label>
                      <input
                        type="text"
                        value={personalIntent}
                        onChange={(e) => setPersonalIntent(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white rounded focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VIEW 3: CARREGAR PARTIDA SALVA
            ───────────────────────────────────────────────────────────── */}
        {currentView === "load_game" && (
          <div className="space-y-6 animate-fade-in-slide py-2">
            <div className="flex items-center justify-between border-b border-amber-950/40 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                  SESSÕES REGISTRADAS
                </span>
                <h2 className="font-royal text-2xl font-bold text-white">
                  Arquivo de Campanhas Salvas
                </h2>
              </div>
              <button
                onClick={() => navigateToView("menu")}
                onMouseEnter={() => gameAudio.playHover()}
                className="px-3 py-1.5 text-xs game-btn-subtle rounded cursor-pointer font-mono"
              >
                ◂ Voltar
              </button>
            </div>

            {savedGames.length === 0 ? (
              <div className="game-panel p-8 rounded text-center space-y-4">
                <p className="text-zinc-400 text-sm">
                  Nenhum registro de reinado encontrado nesta máquina.
                </p>
                <button
                  onClick={() => navigateToView("new_game")}
                  onMouseEnter={() => gameAudio.playHover()}
                  className="game-btn-gold px-6 py-2.5 rounded text-xs cursor-pointer font-bold"
                >
                  INICIAR PRIMEIRO REINADO
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {savedGames.map((game) => (
                  <div
                    key={game.id}
                    className="game-panel p-4 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-royal text-base font-bold text-white">
                          {game.rulerName}
                        </span>
                        <span className="text-xs text-amber-300 font-mono">
                          — {game.name}
                        </span>
                        {game.isGameOver && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-red-950 border border-red-500/50 text-red-300 font-mono uppercase rounded">
                            Colapso Dinástico
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {game.storylineTitle || "Cenário"} • Turno {game.turn} • Ano {game.year}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          gameAudio.playClick();
                          router.push(`/intro/${game.id}`);
                        }}
                        onMouseEnter={() => gameAudio.playHover()}
                        className="px-3 py-1.5 text-xs game-btn-subtle rounded cursor-pointer font-mono"
                        title="Ver Crônica e Prólogo"
                      >
                        Prólogo
                      </button>
                      <button
                        onClick={() => {
                          gameAudio.playStartGame();
                          router.push(`/play/${game.id}`);
                        }}
                        onMouseEnter={() => gameAudio.playHover()}
                        className="px-4 py-1.5 text-xs game-btn-gold rounded cursor-pointer font-bold flex items-center gap-1.5"
                      >
                        <span>Retomar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      {game.id.startsWith("kingdom_") || game.name.includes("(Local)") ? (
                        <button
                          onClick={(e) => handleDeleteSave(e, game.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded cursor-pointer"
                          title="Remover sessão salva"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VIEW 4: CENÁRIOS & LORE
            ───────────────────────────────────────────────────────────── */}
        {currentView === "scenarios" && (
          <div className="space-y-6 animate-fade-in-slide py-2">
            <div className="flex items-center justify-between border-b border-amber-950/40 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                  CÓDICE DE MUNDOS
                </span>
                <h2 className="font-royal text-2xl font-bold text-white">
                  Os 6 Universos Disponíveis
                </h2>
              </div>
              <button
                onClick={() => navigateToView("menu")}
                onMouseEnter={() => gameAudio.playHover()}
                className="px-3 py-1.5 text-xs game-btn-subtle rounded cursor-pointer font-mono"
              >
                ◂ Voltar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {STORYLINES.map((s) => {
                const defs = STORYLINE_DEFAULTS[s.id] || STORYLINE_DEFAULTS["valoria_classic"];
                const IconComponent = defs.icon;

                return (
                  <div key={s.id} className="game-panel p-5 rounded space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                            {s.era}
                          </span>
                          <h3 className="font-royal text-base font-bold text-white">
                            {s.name}
                          </h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-amber-500/30 text-amber-300 rounded">
                        {s.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      {s.worldLorePrompt.slice(0, 240)}…
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Líder Canônico: <strong>{defs.rulerName}</strong>
                      </span>
                      <button
                        onClick={() => {
                          handleSelectStoryline(s);
                          navigateToView("new_game");
                        }}
                        onMouseEnter={() => gameAudio.playHover()}
                        className="text-xs text-amber-300 hover:text-amber-100 font-bold font-mono cursor-pointer flex items-center gap-1"
                      >
                        <span>Jogar Cenário</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VIEW 5: OPÇÕES & GUIA DO JOGO
            ───────────────────────────────────────────────────────────── */}
        {currentView === "settings" && (
          <div className="space-y-6 animate-fade-in-slide py-2">
            <div className="flex items-center justify-between border-b border-amber-950/40 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                  SISTEMA &amp; DOUTRINA
                </span>
                <h2 className="font-royal text-2xl font-bold text-white">
                  Opções &amp; Guia de Regras
                </h2>
              </div>
              <button
                onClick={() => navigateToView("menu")}
                onMouseEnter={() => gameAudio.playHover()}
                className="px-3 py-1.5 text-xs game-btn-subtle rounded cursor-pointer font-mono"
              >
                ◂ Voltar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Painel de Preferências */}
              <div className="game-panel p-5 rounded space-y-4">
                <h3 className="font-royal text-base font-bold text-amber-200 border-b border-zinc-800 pb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Preferências do Jogo</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/40 border border-zinc-800 rounded">
                    <div>
                      <span className="text-xs font-bold text-white block">Efeitos Sonoros Táteis</span>
                      <span className="text-[10px] text-zinc-400 font-sans">
                        Cliques e fanfarras sintetizados via Web Audio API
                      </span>
                    </div>
                    <button
                      onClick={handleToggleSound}
                      onMouseEnter={() => gameAudio.playHover()}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded cursor-pointer transition-colors ${
                        sfxActive
                          ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {sfxActive ? "ATIVADO" : "MUTADO"}
                    </button>
                  </div>

                  <div className="p-3 bg-black/40 border border-zinc-800 rounded space-y-1">
                    <span className="text-xs font-bold text-white block">Arquitetura de Inteligência Artificial</span>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      Groq Cloud (Llama 3.3 70B Versátil) com fallback para Google Gemini, OpenAI ou motor heurístico offline em português.
                    </p>
                  </div>

                  <div className="p-3 bg-black/40 border border-zinc-800 rounded space-y-1">
                    <span className="text-xs font-bold text-white block">Persistência Server-Side &amp; Local</span>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      Campanhas salvas em SQLite local (.data/kingdom.db) e espelhadas no navegador via LocalStorage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guia do Soberano */}
              <div className="game-panel p-5 rounded space-y-4">
                <h3 className="font-royal text-base font-bold text-amber-200 border-b border-zinc-800 pb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Doutrina de Governo</span>
                </h3>

                <div className="space-y-2.5 text-xs text-zinc-300 font-sans leading-relaxed">
                  <div className="p-2.5 bg-black/30 border border-zinc-800/80 rounded space-y-1">
                    <span className="font-bold text-amber-300 font-mono text-[11px] block">
                      1. Liberdade Total de Palavra
                    </span>
                    <p className="text-zinc-400">
                      Na sala do trono, digite qualquer ordem em português com suas próprias palavras. Você pode negociar, ameaçar, expulsar ou criar éditos inéditos.
                    </p>
                  </div>

                  <div className="p-2.5 bg-black/30 border border-zinc-800/80 rounded space-y-1">
                    <span className="font-bold text-amber-300 font-mono text-[11px] block">
                      2. O Motor de Regras é Soberano
                    </span>
                    <p className="text-zinc-400">
                      A IA interpreta seus desejos e cria a narrativa, mas os números e limites matemáticos (ouro, comida, população, lealdade) são controlados pelo engine do jogo.
                    </p>
                  </div>

                  <div className="p-2.5 bg-black/30 border border-zinc-800/80 rounded space-y-1">
                    <span className="font-bold text-amber-300 font-mono text-[11px] block">
                      3. Sucessão Dinástica
                    </span>
                    <p className="text-zinc-400">
                      Monarcas envelhecem, adoecem ou caem em batalha. Quando um líder morre, o próximo herdeiro assume a coroa e a dinastia prossegue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RODAPÉ DO MENU DE JOGO */}
      <footer className="relative z-10 px-4 sm:px-8 py-3 border-t border-amber-950/30 bg-[#06070a]/90 text-[10px] text-zinc-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-1">
        <span>AI KINGDOM SIMULATOR • ENGINE DETERMINÍSTICO</span>
        <span>APERTE OU CLIQUE NAS OPÇÕES PARA NAVEGAR</span>
      </footer>

      {/* MODAL DO CÓDICE DE FINAIS HISTÓRICOS */}
      <EndingsGalleryModal
        isOpen={isEndingsModalOpen}
        onClose={() => setIsEndingsModalOpen(false)}
      />
    </div>
  );
}
