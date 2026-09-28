"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Encounter } from "@/lib/game/encounters";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { Send, Zap, ArrowRight } from "lucide-react";

export type ChatMessage = {
  id: string;
  sender: "player" | "character" | "counselor";
  senderName: string;
  text: string;
  actionGesture?: string;
  isAction?: boolean;
};

interface ConversationStageProps {
  encounter: Encounter & { gameId?: string };
  rulerTitle: string;
  rulerName: string;
  isLoadingTurn: boolean;
  feedback: {
    narrative: string;
    effects: string[];
    aiUsed: boolean;
    playerDecision?: string;
  } | null;
  onConcludeAudience: (finalDecree: string) => void;
  onNextAudience: () => void;
}

// Detecta se a mensagem é uma ação (começa com * ou [)
function isActionText(text: string) {
  return text.trim().startsWith("*") || text.trim().startsWith("[");
}

// Componente de efeito de resultado após turno encerrado
function EffectCard({ text }: { text: string }) {
  const isGain = text.includes("+");
  const isLoss = text.includes("-");
  const label = isGain ? "▲" : isLoss ? "▼" : "◈";
  const level: "normal" | "danger" | "warning" | "emerald" = isGain ? "emerald" : isLoss ? "danger" : "normal";

  return (
    <div
      className={`flex items-start gap-3 p-3.5 border ${
        isGain
          ? "border-emerald-500/30 bg-[#0a150a]"
          : isLoss
          ? "border-red-500/30 bg-[#150a0a]"
          : "border-[#27272a] bg-[#0d0d0f]"
      }`}
    >
      <span
        className={`text-sm font-mono shrink-0 font-bold ${
          isGain ? "text-emerald-400" : isLoss ? "text-red-400" : "text-[#a1a1aa]"
        }`}
      >
        {label}
      </span>
      <div className="flex-1 space-y-1.5">
        <p className="text-xs text-[#f4f4f5] font-sans leading-relaxed">{text}</p>
        <AnimatedProgressBar
          value={isGain ? 78 : isLoss ? 28 : 55}
          min={0}
          max={100}
          level={level}
          height="xs"
          showGlowHead
          showShimmer
        />
      </div>
    </div>
  );
}

export function ConversationStage({
  encounter,
  rulerTitle,
  rulerName,
  isLoadingTurn,
  feedback,
  onConcludeAudience,
  onNextAudience,
}: ConversationStageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "initial_opening",
      sender: "character",
      senderName: encounter.character.name,
      text: encounter.dialogue,
      actionGesture: encounter.character.appearance
        ? `Diante do posto de comando: ${encounter.character.appearance}`
        : undefined,
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isConcluded, setIsConcluded] = useState(false);
  const [concludingGesture, setConcludingGesture] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextAudienceBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: `opening_${encounter.eventId}`,
        sender: "character",
        senderName: encounter.character.name,
        text: encounter.dialogue,
        actionGesture: encounter.character.appearance
          ? `Diante do posto de comando: ${encounter.character.appearance}`
          : undefined,
      },
    ]);
    setInputText("");
    setIsConcluded(false);
    setConcludingGesture(null);
  }, [encounter.eventId, encounter.dialogue, encounter.character.name, encounter.character.appearance]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isReplying, isConcluded]);

  // Foca no input ao montar
  useEffect(() => {
    if (!feedback) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setTimeout(() => nextAudienceBtnRef.current?.focus(), 150);
    }
  }, [encounter.eventId, feedback]);

  // Avançar audiência com tecla Enter ou Space na tela de feedback
  useEffect(() => {
    if (!feedback) return;

    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNextAudience();
      }
    };

    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [feedback, onNextAudience]);

  // Conversação normal com o personagem via IA
  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isReplying || isLoadingTurn) return;

    const isAction = isActionText(text);
    const playerMsg: ChatMessage = {
      id: `player_${Date.now()}`,
      sender: "player",
      senderName: `${rulerTitle} ${rulerName}`,
      text,
      isAction,
    };

    const updated = [...messages, playerMsg];
    setMessages(updated);
    setInputText("");
    setIsReplying(true);

    try {
      const res = await fetch("/api/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: encounter.gameId,
          character: encounter.character,
          situation: encounter.situation,
          conversationHistory: updated.map((m) => ({
            sender: m.sender === "counselor" ? "character" : m.sender,
            text: m.text,
          })),
          playerInput: text,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Silêncio.");

      const withNpcReply: ChatMessage[] = [
        ...updated,
        {
          id: `npc_${Date.now()}`,
          sender: "character",
          senderName: encounter.character.name,
          text: data.reply,
          actionGesture: data.actionGesture,
        },
      ];

      setMessages(withNpcReply);

      if (data.isConcluding) {
        setIsConcluded(true);
        setConcludingGesture(
          data.actionGesture ||
            "Concluiu as declarações, deu meia-volta e retirou-se a passos firmes."
        );
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err_${Date.now()}`, sender: "character", senderName: encounter.character.name, text: "…" },
      ]);
    } finally {
      setIsReplying(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputText, isReplying, isLoadingTurn, messages, encounter, rulerTitle, rulerName]);

  // Encerrar audiência e processar o turno com a ordem final do jogador
  const handleDirectDecree = useCallback(() => {
    const text = inputText.trim();
    if (text) {
      setInputText("");
      onConcludeAudience(text);
      return;
    }

    const lastPlayer = [...messages].reverse().find((m) => m.sender === "player");
    const decree = lastPlayer?.text || `Ordem definitiva para ${encounter.character.name}.`;
    onConcludeAudience(decree);
  }, [inputText, messages, encounter.character.name, onConcludeAudience]);

  // Enter envia chat; Ctrl+Enter conclui e decreta diretamente
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleDirectDecree();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ─── TELA DE FEEDBACK (após turno processado) ─────────────────────────────
  if (feedback) {
    return (
      <div className="flex flex-col flex-1 p-5 sm:p-8 max-w-2xl w-full mx-auto space-y-6 animate-fadeIn">
        {/* Cabeçalho do resultado */}
        <div className="border-b border-[#27272a] pb-4 flex items-center justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-[#71717a] font-mono">
              Resolução da Audiência
            </div>
            <h2 className="text-base font-bold text-[#f4f4f5] font-royal mt-0.5">
              {encounter.character.name}
            </h2>
          </div>
          <span className="text-[8px] uppercase tracking-wider px-2 py-0.5 border border-[#3f3f46] text-[#a1a1aa] bg-[#111114] font-mono">
            {feedback.aiUsed ? "Interpretação Dinâmica" : "Decreto de Comando"}
          </span>
        </div>

        {/* Ordem / Ação do jogador */}
        {feedback.playerDecision && (
          <div className="border-l-2 border-[#52525b] bg-[#0d0d10] p-3.5 space-y-1">
            <div className="text-[9px] uppercase tracking-wider text-[#71717a] font-mono">
              Vossa Decisão / Ordem
            </div>
            <p className="text-sm text-[#f4f4f5] font-serif italic leading-relaxed">
              "{feedback.playerDecision}"
            </p>
          </div>
        )}

        {/* Desfecho narrativo com fala e consequências */}
        <div className="p-4 border border-[#27272a] bg-[#111114] space-y-2">
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#71717a] font-mono">
            <span className="text-base">{encounter.character.avatar}</span>
            <span>Reação &amp; Desfecho em Campo</span>
          </div>
          <p className="text-sm text-[#e4e4e7] leading-relaxed font-sans">
            {feedback.narrative}
          </p>
        </div>

        {/* Efeitos visuais — retângulos de impacto */}
        {feedback.effects.length > 0 && (
          <div className="space-y-2">
            <div className="text-[9px] uppercase tracking-wider text-[#71717a] font-mono">
              Efeitos Imediatos no Domínio
            </div>
            {feedback.effects.map((eff, i) => (
              <EffectCard key={i} text={eff} />
            ))}
          </div>
        )}

        {/* Botão de continuar — com atalho visual de Enter */}
        <div className="pt-2">
          <button
            ref={nextAudienceBtnRef}
            onClick={onNextAudience}
            className="w-full py-4 bg-[#f4f4f5] hover:bg-white text-[#09090b] font-bold text-xs uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 active:scale-[0.99] border border-white"
          >
            <span>Próxima Audiência</span>
            <ArrowRight className="w-4 h-4" />
            <span className="text-[9px] font-mono opacity-60 ml-2 px-1.5 py-0.5 border border-black/20 bg-black/10">
              Enter
            </span>
          </button>
          <div className="text-center mt-2 text-[8px] text-[#52525b] font-mono">
            Pressione [Enter] ou [Espaço] para avançar imediatamente para a próxima audiência
          </div>
        </div>
      </div>
    );
  }

  // ─── TELA DE CONVERSA INTERATIVA ──────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* CABEÇALHO DO PERSONAGEM */}
      <div className="shrink-0 border-b border-[#27272a] p-4 sm:p-5 bg-[#0d0d0f]">
        <div className="max-w-2xl mx-auto flex items-start gap-4">
          <div className="text-3xl p-3 border border-[#27272a] bg-[#111113] shrink-0">
            {encounter.character.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-royal text-lg font-bold text-[#f4f4f5]">
                {encounter.character.name}
              </h2>
              {encounter.character.role.toLowerCase().includes("conselh") || encounter.character.id.includes("counselor") ? (
                <span className="text-xs uppercase px-2.5 py-0.5 border border-amber-500/40 bg-amber-950/20 text-amber-300 font-bold tracking-wider">
                  📜 CONSELHO PRIVADO
                </span>
              ) : encounter.character.faction ? (
                <span className="text-xs uppercase px-2 py-0.5 border border-[#27272a] text-[#a1a1aa] font-mono">
                  {encounter.character.faction}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">
              {encounter.character.title} · {encounter.character.role}
            </p>
            <p className="text-xs text-[#d4d4d8] mt-1.5 font-sans leading-relaxed italic">
              {encounter.character.appearance}
            </p>
          </div>
        </div>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => {
            const isPlayer = msg.sender === "player";
            const isCounselor = msg.sender === "counselor";

            if (isCounselor) {
              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="shrink-0 w-7 h-7 flex items-center justify-center border border-[#3f3f46] text-xs bg-[#18181b] text-amber-400">
                    ◈
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs uppercase text-[#a1a1aa] tracking-wider font-mono font-semibold">
                      Conselheiro — em voz baixa
                    </div>
                    <div className="p-3.5 border border-[#27272a] bg-[#0d0d0f] text-xs text-[#a1a1aa] font-sans italic leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            }

            if (isPlayer) {
              return (
                <div key={msg.id} className="flex flex-col items-end gap-1.5">
                  <div className="text-xs uppercase text-[#a1a1aa] tracking-wider pr-1 font-mono font-semibold">
                    {msg.senderName}
                  </div>
                  <div
                    className={`max-w-[85%] p-4 border text-sm leading-relaxed font-sans shadow-sm ${
                      msg.isAction
                        ? "border-[#3f3f46] bg-[#141418] text-[#d4d4d8] italic"
                        : "border-[#52525b] bg-[#1a1a20] text-[#f4f4f5]"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            }

            // Personagem / NPC
            return (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 flex items-center justify-center border border-[#27272a] text-lg bg-[#0d0d0f]">
                  {encounter.character.avatar}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-xs uppercase text-[#a1a1aa] tracking-wider font-mono font-semibold">
                    {msg.senderName}
                  </div>

                  {/* AÇÕES E GESTOS FÍSICOS FORA DO BALÃO DE FALA */}
                  {msg.actionGesture && (
                    <div className="p-3 bg-[#141419] border-l-2 border-amber-500/70 text-xs text-[#d4d4d8] font-sans italic flex items-start gap-2 shadow-sm">
                      <span className="text-amber-400 font-bold shrink-0">◈ Expressão &amp; Gesto:</span>
                      <span className="leading-relaxed">{msg.actionGesture}</span>
                    </div>
                  )}

                  {/* FALA ORAL DO PERSONAGEM */}
                  <div className="p-4 border border-[#27272a] bg-[#111114] text-sm text-[#f4f4f5] font-sans leading-relaxed shadow-sm">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* BANNER DE AUTO-FIM DA CONVERSA (NPC VIRA-SE E SAI) */}
          {isConcluded && (
            <div className="p-4 bg-[#181308] border border-amber-500/50 space-y-2.5 animate-fadeIn shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
                  <span className="text-base">🚶</span>
                  <span>{encounter.character.name} encerrou a declaração e retirou-se do posto.</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 bg-amber-500/20 text-amber-200 border border-amber-500/40 font-mono font-bold">
                  Audiência Concluída
                </span>
              </div>
              {concludingGesture && (
                <p className="text-xs text-[#d4d4d8] font-sans italic pl-6 border-l border-amber-500/30">
                  "{concludingGesture}"
                </p>
              )}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-xs text-[#a1a1aa] font-sans">
                  Pronto para transformar as deliberações em ordem definitiva de comando.
                </span>
                <button
                  type="button"
                  onClick={handleDirectDecree}
                  disabled={isLoadingTurn}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-[0.98]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Assinar Decreto de Encerramento</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading do NPC */}
          {isReplying && (
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-8 h-8 flex items-center justify-center border border-[#27272a] text-lg bg-[#0d0d0f]">
                {encounter.character.avatar}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#a1a1aa] font-mono">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#71717a] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-[#71717a] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-[#71717a] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>{encounter.character.name} responde...</span>
              </div>
            </div>
          )}

          {/* Loading do turno */}
          {isLoadingTurn && (
            <div className="flex items-center gap-3 text-xs text-[#d4d4d8] font-mono p-4 bg-[#111114] border border-[#27272a] shadow-sm">
              <div className="w-4 h-4 border-2 border-[#3f3f46] border-t-[#f4f4f5] animate-spin" />
              <span>Processando ordem e aplicando consequências no domínio...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* PAINEL DE CONTROLE DE DECISÃO & CHAT */}
      <div className="shrink-0 border-t border-[#27272a] bg-[#0d0d0f] p-3 sm:p-4">
        <div className="max-w-2xl mx-auto space-y-2">
          {isConcluded ? (
            /* ─── ESTADO CONCLUÍDO: INPUT BLOQUEADO ──────────────────────── */
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-amber-400/80 font-mono">
                <span className="text-base">🚶</span>
                <span>{encounter.character.name} retirou-se. Formalize seu decreto para avançar.</span>
              </div>
              <button
                type="button"
                onClick={handleDirectDecree}
                disabled={isLoadingTurn}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-[0.98]"
              >
                <Zap className="w-4 h-4" />
                <span>Assinar Decreto e Avançar o Turno</span>
              </button>
            </div>
          ) : (
            /* ─── ESTADO ATIVO: CHAT NORMAL ──────────────────────────────── */
            <>
              {/* Dicas de Roleplay e Ações Livres */}
              <div className="flex items-center justify-between text-xs tracking-wider text-[#a1a1aa] font-mono">
                <span>
                  Fale, pergunte, envie expedições, faça discursos ou dê ordens: <span className="text-[#f4f4f5] italic">*ação física*</span>
                </span>
                <span className="hidden sm:inline text-[#71717a]">Ctrl+Enter decreta direto</span>
              </div>

              <form onSubmit={handleSendMessage} className="flex items-end gap-2.5">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isReplying || isLoadingTurn}
                    placeholder={`Responda a ${encounter.character.name}, dê ordens, envie expedições ou tome uma atitude...`}
                    className="w-full bg-[#111113] border border-[#27272a] focus:border-[#52525b] px-3.5 py-2.5 text-sm text-[#f4f4f5] focus:outline-none font-sans resize-none placeholder:text-[#52525b] leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isReplying || isLoadingTurn}
                    className="px-4 py-2.5 bg-[#1c1c20] hover:bg-[#27272a] disabled:opacity-30 border border-[#3f3f46] text-[#f4f4f5] text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors font-medium"
                    title="Enviar fala/pergunta (Enter)"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="text-xs hidden sm:inline">Conversar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectDecree}
                    disabled={isLoadingTurn || isReplying}
                    className="px-4 py-2.5 bg-[#f4f4f5] hover:bg-white text-[#09090b] font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-30 flex items-center justify-center gap-1 transition-all shadow-md active:scale-[0.98]"
                    title="Decretar esta ordem final e avançar o turno (Ctrl+Enter)"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Decretar</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
