"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STORYLINES } from "@/content/storylines";
import { StorylineDefinition } from "@/content/storylines/types";
import { GameSummary } from "@/lib/db/repository";
import { getSavedSessionsIndex } from "@/lib/storage/save-manager";
import { ArrowRight, Dices } from "lucide-react";

// Defaults por storyline
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
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-mono flex flex-col">
      {/* TOPO */}
      <header className="border-b border-[#27272a] px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#52525b] block mb-0.5">
            ROLEPLAY CONVERSACIONAL POR IA
          </span>
          <h1 className="font-royal text-2xl font-bold tracking-tight text-[#f4f4f5]">
            COROA &amp; PALAVRA
          </h1>
        </div>
        {savedGames.length > 0 && (
          <div className="text-[10px] text-[#71717a]">
            <span className="text-[#f4f4f5] font-bold">{savedGames.length}</span> reinados salvos
          </div>
        )}
      </header>

      {/* CORPO PRINCIPAL — sidebar + conteúdo */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR DE LORES */}
        <aside className="w-52 shrink-0 border-r border-[#27272a] overflow-y-auto">
          <div className="p-3 border-b border-[#27272a]">
            <span className="text-[9px] uppercase tracking-widest text-[#52525b]">
              Cenários
            </span>
          </div>
          <nav className="flex flex-col">
            {STORYLINES.map((s) => {
              const isSelected = selectedStoryline.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectStoryline(s)}
                  className={`w-full text-left px-4 py-4 border-b border-[#1c1c1e] transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#1c1c1e] border-l-2 border-l-[#f4f4f5]"
                      : "hover:bg-[#111113] border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="text-[10px] text-[#52525b] uppercase mb-0.5">{s.era}</div>
                  <div
                    className={`text-xs font-bold leading-tight ${
                      isSelected ? "text-[#f4f4f5]" : "text-[#a1a1aa]"
                    }`}
                  >
                    {s.name}
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span
                      className={`text-[8px] uppercase px-1 py-0.5 border ${
                        isSelected ? "border-[#52525b] text-[#71717a]" : "border-[#27272a] text-[#3f3f46]"
                      }`}
                    >
                      {s.difficulty}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-[#18181b] border border-[#f4f4f5] text-xs text-[#f4f4f5]">
              [ ERRO: {errorMsg} ]
            </div>
          )}

          {/* PREMISSA DO CENÁRIO */}
          <section>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="text-[10px] text-[#52525b] uppercase tracking-widest mb-1">
                  {selectedStoryline.era}
                </div>
                <h2 className="font-royal text-xl font-bold text-[#f4f4f5]">
                  {selectedStoryline.name}
                </h2>
                <p className="text-xs text-[#71717a] mt-0.5">{selectedStoryline.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[9px] uppercase">
                {selectedStoryline.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 border border-[#27272a] text-[#52525b]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#111113] border border-[#27272a]">
              <p className="text-[11px] text-[#a1a1aa] leading-relaxed font-sans whitespace-pre-line">
                {selectedStoryline.worldLorePrompt.trim()}
              </p>
            </div>
          </section>

          {/* FORMULÁRIO DE CUSTOMIZAÇÃO */}
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="border-b border-[#27272a] pb-1">
              <span className="text-[9px] uppercase tracking-widest text-[#52525b]">
                {selectedStoryline.id === "rio_zombie" || selectedStoryline.id === "zombie_apocalypse"
                  ? "Defina seu Líder e Reduto"
                  : selectedStoryline.id === "colony_exodus"
                  ? "Defina seu Diretor e Estação"
                  : "Quem é você no poder"}
              </span>
            </div>

            {/* Linha 1: nome, título, domínio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-[#52525b] uppercase block mb-1.5">
                  {selectedStoryline.id === "rio_zombie" || selectedStoryline.id === "zombie_apocalypse"
                    ? "Nome do Líder"
                    : selectedStoryline.id === "colony_exodus"
                    ? "Nome do Diretor"
                    : "Nome do Governante"}
                </label>
                <input
                  type="text"
                  value={rulerName}
                  onChange={(e) => setRulerName(e.target.value)}
                  required
                  className="w-full bg-[#111113] border border-[#27272a] focus:border-[#71717a] px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#52525b] uppercase block mb-1.5">
                  {selectedStoryline.id === "rio_zombie" || selectedStoryline.id === "zombie_apocalypse"
                    ? "Posto / Patente"
                    : selectedStoryline.id === "colony_exodus"
                    ? "Cargo Oficial"
                    : "Título Oficial"}
                </label>
                <input
                  type="text"
                  value={rulerTitle}
                  onChange={(e) => setRulerTitle(e.target.value)}
                  required
                  className="w-full bg-[#111113] border border-[#27272a] focus:border-[#71717a] px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#52525b] uppercase block mb-1.5">
                  {selectedStoryline.id === "rio_zombie" || selectedStoryline.id === "zombie_apocalypse"
                    ? "Nome do Reduto / Base"
                    : selectedStoryline.id === "colony_exodus"
                    ? "Nome da Estação / Frota"
                    : "Nome do Domínio"}
                </label>
                <input
                  type="text"
                  value={realmName}
                  onChange={(e) => setRealmName(e.target.value)}
                  required
                  className="w-full bg-[#111113] border border-[#27272a] focus:border-[#71717a] px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none"
                />
              </div>
            </div>

            {/* Linha 2: arquétipo (TEXTO LIVRE), origem (TEXTO LIVRE), seed */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-[#52525b] uppercase block mb-1.5">
                  {selectedStoryline.id === "rio_zombie" || selectedStoryline.id === "zombie_apocalypse"
                    ? "Perfil de Comando"
                    : selectedStoryline.id === "colony_exodus"
                    ? "Especialidade / Perfil"
                    : "Arquétipo de Liderança"}
                </label>
                <input
                  type="text"
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  placeholder={
                    selectedStoryline.id === "rio_zombie" || selectedStoryline.id === "zombie_apocalypse"
                    ? "Ex: Atirador de Elite, Médico de Campo, Tático Furtivo..."
                    : selectedStoryline.id === "colony_exodus"
                    ? "Ex: Engenheira de Sistemas, Cientista Clínca, Pilota de Combate..."
                    : "Ex: Tirano Calculista, Monge Guerreiro..."
                  }
                  className="w-full bg-[#111113] border border-[#27272a] focus:border-[#71717a] px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none placeholder:text-[#3f3f46]"
                />
                <p className="text-[9px] text-[#3f3f46] mt-1 font-sans">
                  Qualquer descrição — guiará os diálogos da IA
                </p>
              </div>
              <div>
                <label className="text-[10px] text-[#52525b] uppercase block mb-1.5">
                  {selectedStoryline.id === "rio_zombie" || selectedStoryline.id === "zombie_apocalypse"
                    ? "Como Chegou ao Comando"
                    : selectedStoryline.id === "colony_exodus"
                    ? "Motivo da Promoção"
                    : "Origem da Ascensão"}
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder={
                    selectedStoryline.id === "rio_zombie" || selectedStoryline.id === "zombie_apocalypse"
                    ? "Ex: Sobrevivência brutal, Eleito pela comunidade, Golpe interno..."
                    : selectedStoryline.id === "colony_exodus"
                    ? "Ex: Promoção após motim, Escolha da IA central, Concurso mérito..."
                    : "Ex: Golpe de Palácio, Profecia, Herança..."
                  }
                  className="w-full bg-[#111113] border border-[#27272a] focus:border-[#71717a] px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none placeholder:text-[#3f3f46]"
                />
                <p className="text-[9px] text-[#3f3f46] mt-1 font-sans">
                  Contexto histórico da sua chegada ao poder
                </p>
              </div>
              <div>
                <label className="text-[10px] text-[#52525b] uppercase block mb-1.5 flex items-center justify-between">
                  <span>Seed Determinística</span>
                  <button
                    type="button"
                    onClick={handleRollSeed}
                    className="text-[#71717a] hover:text-[#f4f4f5] cursor-pointer flex items-center gap-1 transition-colors"
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
                  className="w-full bg-[#111113] border border-[#27272a] focus:border-[#71717a] px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none"
                />
                <p className="text-[9px] text-[#3f3f46] mt-1 font-sans">
                  Controla geração do mapa e eventos
                </p>
              </div>
            </div>

            {/* Motivação pessoal */}
            <div>
              <label className="text-[10px] text-[#52525b] uppercase block mb-1.5">
                {selectedStoryline.id === "rio_zombie" || selectedStoryline.id === "zombie_apocalypse"
                  ? "Missão Principal / Motivação Oculta"
                  : selectedStoryline.id === "colony_exodus"
                  ? "Diretriz Central / Meta de Governo"
                  : "Juramento Secreto / Motivação Pessoal"}
              </label>
              <input
                type="text"
                value={personalIntent}
                onChange={(e) => setPersonalIntent(e.target.value)}
                placeholder={
                  selectedStoryline.id === "rio_zombie" || selectedStoryline.id === "zombie_apocalypse"
                  ? "Ex: Salvar os sobreviventes, encontrar o antídoto, deter a milícia..."
                  : selectedStoryline.id === "colony_exodus"
                  ? "Ex: Preservar a espécie, chegar ao exoplaneta, derrotar os piratas cósmicos..."
                  : "Ex: Proteger os celeiros a qualquer custo, esmagar barões corruptos..."
                }
                className="w-full bg-[#111113] border border-[#27272a] focus:border-[#71717a] px-3 py-2 text-sm text-[#f4f4f5] focus:outline-none placeholder:text-[#3f3f46]"
              />
              <p className="text-[9px] text-[#3f3f46] mt-1 font-sans">
                Guia a IA e influencia os diálogos de forma permanente durante toda a campanha
              </p>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3.5 px-6 bg-[#f4f4f5] hover:bg-[#e4e4e7] disabled:opacity-40 text-[#09090b] font-mono font-bold text-xs uppercase tracking-widest transition-all cursor-pointer active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <span>GERANDO CAMPANHA E MUNDO...</span>
              ) : (
                <>
                  <span>[ INICIAR REINADO: {selectedStoryline.name.toUpperCase()} ]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* REINADOS EM ANDAMENTO */}
          {savedGames.length > 0 && (
            <section className="pt-4 border-t border-[#27272a] space-y-3">
              <span className="text-[9px] uppercase tracking-widest text-[#52525b] block">
                Campanhas em Andamento
              </span>
              <div className="space-y-2">
                {savedGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-3 bg-[#111113] border border-[#27272a] hover:border-[#3f3f46] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#f4f4f5]">{game.name}</span>
                        <span className="text-[#52525b]">({game.rulerName})</span>
                        {game.isGameOver && (
                          <span className="text-[8px] px-1 bg-[#27272a] text-red-400 uppercase">
                            Colapsado
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#52525b] mt-0.5">
                        Turno {game.turn} • Ano {game.year} • {game.storylineTitle || "Valoria"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => router.push(`/intro/${game.id}`)}
                        className="px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] text-[#71717a] hover:text-[#f4f4f5] cursor-pointer transition-colors text-[10px]"
                      >
                        [ Prólogo ]
                      </button>
                      <button
                        onClick={() => router.push(`/play/${game.id}`)}
                        className="px-3 py-1 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-[#09090b] font-bold cursor-pointer text-[10px]"
                      >
                        [ Retomar → ]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* RODAPÉ */}
      <footer className="border-t border-[#27272a] px-6 py-3 text-[9px] text-[#3f3f46] flex flex-col sm:flex-row items-center justify-between gap-1 shrink-0">
        <span>SQLITE LOCAL • GROQ CLOUD (LLAMA 3.3 70B)</span>
        <span>ESTRUTURA MULTI-PÁGINAS — APP ROUTER</span>
      </footer>
    </div>
  );
}
