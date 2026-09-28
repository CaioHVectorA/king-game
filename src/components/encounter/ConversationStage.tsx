"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Encounter } from "@/lib/game/encounters";
import { AnimatedProgressBar } from "@/components/ui/AnimatedProgressBar";
import { Send, Zap, ArrowRight, Sparkles, Crown, Volume2 } from "lucide-react";

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

function isActionText(text: string) {
  return text.trim().startsWith("*") || text.trim().startsWith("[");
}

function EffectCard({ text }: { text: string }) {
  const isGain = text.includes("+");
  const isLoss = text.includes("-");
  const label = isGain ? "▲" : isLoss ? "▼" : "◈";
  const level: "normal" | "danger" | "warning" | "emerald" = isGain ? "emerald" : isLoss ? "danger" : "normal";

  return (
    <div
      className={`flex items-start gap-3 p-3.5 border rounded-sm ${
        isGain
          ? "border-emerald-500/40 bg-emerald-950/20"
          : isLoss
          ? "border-red-500/40 bg-red-950/20"
          : "border-[#333952] bg-[#0c0d14]"
      }`}
    >
      <span
        className={`text-sm font-mono shrink-0 font-bold ${
          isGain ? "text-emerald-400" : isLoss ? "text-red-400" : "text-amber-300"
        }`}
      >
        {label}
      </span>
      <div className="flex-1 space-y-1.5">
        <p className="text-xs text-[#f4f4f5] font-sans leading-relaxed font-semibold">{text}</p>
        <AnimatedProgressBar
          value={isGain ? 82 : isLoss ? 25 : 55}
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

// Componente com Efeito Typewriter e Animação de Fala Oral do Personagem
function TypewriterMessage({
  text,
  speed = 18,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  const handleSkip = () => {
    setDisplayedText(text);
    setIsTyping(false);
    onComplete?.();
  };

  return (
    <div className="relative group">
      <p className="text-sm text-[#f4f4f5] font-sans leading-relaxed">
        {displayedText}
        {isTyping && <span className="inline-block w-2 h-4 ml-0.5 bg-amber-400 animate-pulse" />}
      </p>

      {isTyping && (
        <button
          onClick={handleSkip}
          className="mt-2 px-2 py-0.5 text-[9px] uppercase border border-amber-500/40 text-amber-300 bg-amber-950/30 hover:bg-amber-900/50 cursor-pointer font-mono font-bold"
        >
          [ Pular Digitação ⏩ ]
        </button>
      )}
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

  useEffect(() => {
    if (!feedback) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setTimeout(() => nextAudienceBtnRef.current?.focus(), 150);
    }
  }, [encounter.eventId, feedback]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleDirectDecree();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (feedback) {
    return (
      <div className="flex flex-col flex-1 p-5 sm:p-8 max-w-3xl w-full mx-auto space-y-6 animate-fadeIn">
        <div className="game-card p-5 border-amber-500/40 space-y-4">
          <div className="border-b border-[#333952] pb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold font-mono">
                Resolução de Audiência
              </div>
              <h2 className="text-xl font-bold text-amber-200 font-royal mt-0.5">
                {encounter.character.name}
              </h2>
            </div>
            <span className="text-[10px] uppercase px-2.5 py-1 border border-amber-500/40 text-amber-300 bg-amber-950/30 font-mono font-bold">
              {feedback.aiUsed ? "Resolução Dinâmica IA" : "Decreto Soberano"}
            </span>
          </div>

          {feedback.playerDecision && (
            <div className="border-l-2 border-amber-400 bg-[#0c0d14] p-3.5 space-y-1">
              <div className="text-[9px] uppercase tracking-wider text-amber-400 font-mono font-bold">
                Ordem Emitida
              </div>
              <p className="text-sm text-amber-100 font-serif italic leading-relaxed">
                "{feedback.playerDecision}"
              </p>
            </div>
          )}

          <div className="p-4 bg-[#08090d] border border-[#272a38] space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-400 font-bold">
              <span className="text-lg">{encounter.character.avatar}</span>
              <span>Reação do Peticionário &amp; Impacto</span>
            </div>
            <p className="text-sm text-[#e2e8f0] leading-relaxed font-sans">
              {feedback.narrative}
            </p>
          </div>

          {feedback.effects.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                Consequências no Domínio
              </div>
              {feedback.effects.map((eff, i) => (
                <EffectCard key={i} text={eff} />
              ))}
            </div>
          )}

          <div className="pt-3">
            <button
              ref={nextAudienceBtnRef}
              onClick={onNextAudience}
              className="w-full py-4 game-btn-primary cursor-pointer text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99]"
            >
              <span>Avançar para Próxima Audiência</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#06070a]">
      {/* CARD DO PETICIONÁRIO / PERSONAGEM */}
      <div className="shrink-0 game-hud-panel border-b border-amber-500/30 p-4 sm:p-5">
        <div className="max-w-3xl mx-auto flex items-start gap-4">
          <div className="text-4xl p-3.5 border-2 border-amber-500/40 bg-[#0a0b10] shrink-0 shadow-lg relative">
            {encounter.character.avatar}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0b10] animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-royal text-xl font-bold text-amber-200">
                {encounter.character.name}
              </h2>
              {encounter.character.faction ? (
                <span className="text-xs uppercase px-2 py-0.5 border border-amber-500/30 text-amber-300 bg-amber-950/20 font-mono font-bold">
                  {encounter.character.faction}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
              {encounter.character.title} · {encounter.character.role}
            </p>
            <p className="text-xs text-[#cbd5e1] mt-2 font-sans italic leading-relaxed bg-[#08090e] p-2.5 border border-[#272a38]">
              {encounter.character.appearance}
            </p>
          </div>
        </div>
      </div>

      {/* ÁREA DE MENSAGENS E DIÁLOGOS DE RPG */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, idx) => {
            const isPlayer = msg.sender === "player";
            const isCounselor = msg.sender === "counselor";
            const isLatestNpcMsg = !isPlayer && !isCounselor && idx === messages.length - 1;

            if (isCounselor) {
              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center border border-amber-500/40 text-xs bg-amber-950/40 text-amber-300 font-bold">
                    📜
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs uppercase text-amber-400 font-mono font-bold">
                      Conselheiro Real
                    </div>
                    <div className="p-3.5 game-card text-xs text-[#cbd5e1] font-sans italic leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            }

            if (isPlayer) {
              return (
                <div key={msg.id} className="flex flex-col items-end gap-1.5">
                  <div className="text-xs uppercase text-amber-300 font-mono font-bold flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{msg.senderName}</span>
                  </div>
                  <div
                    className={`max-w-[85%] p-4 border text-sm leading-relaxed font-sans shadow-md ${
                      msg.isAction
                        ? "border-amber-500/40 bg-[#141622] text-[#e2e8f0] italic"
                        : "border-amber-400 bg-amber-950/30 text-amber-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-8 flex items-center justify-center border border-amber-500/30 text-xl bg-[#0c0d14]">
                  {encounter.character.avatar}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-xs uppercase text-amber-400 font-mono font-bold flex items-center gap-2">
                    <span>{msg.senderName}</span>
                    <Volume2 className="w-3.5 h-3.5 text-amber-400/80 animate-pulse" />
                  </div>

                  {msg.actionGesture && (
                    <div className="p-3 bg-[#0d0e16] border-l-2 border-amber-400 text-xs text-[#cbd5e1] font-sans italic">
                      <span className="text-amber-400 font-bold">◈ Gesto &amp; Postura:</span> {msg.actionGesture}
                    </div>
                  )}

                  <div className="p-4 game-card text-sm text-[#f4f4f5] font-sans leading-relaxed">
                    {isLatestNpcMsg ? (
                      <TypewriterMessage text={msg.text} />
                    ) : (
                      <p className="text-sm text-[#f4f4f5] font-sans leading-relaxed">{msg.text}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isConcluded && (
            <div className="p-4 bg-amber-950/40 border border-amber-500/50 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
                  <span>{encounter.character.name} concluiu a declaração.</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold">
                  Audiência Finalizada
                </span>
              </div>
              <button
                type="button"
                onClick={handleDirectDecree}
                disabled={isLoadingTurn}
                className="w-full py-3 game-btn-primary cursor-pointer uppercase text-xs font-bold flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Assinar Decreto de Encerramento</span>
              </button>
            </div>
          )}

          {isReplying && (
            <div className="flex items-center gap-3 text-xs text-amber-400 font-mono p-3">
              <span className="animate-pulse">● {encounter.character.name} pensa e inicia a fala...</span>
            </div>
          )}

          {isLoadingTurn && (
            <div className="flex items-center gap-3 text-xs text-amber-300 font-mono p-4 game-card">
              <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
              <span>Processando ordem e aplicando consequências no domínio...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* DECK DE COMANDO & CHAT */}
      <div className="shrink-0 game-hud-panel border-t border-amber-500/30 p-3 sm:p-4">
        <div className="max-w-3xl mx-auto space-y-2">
          {!isConcluded && (
            <>
              {/* DECK DE SUGESTÕES TÁTICAS estilo Cartas de Ação */}
              {encounter.choices && encounter.choices.length > 0 && (
                <div className="space-y-1.5 pb-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono uppercase tracking-wider font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                    <span>Deck de Opções Táticas de Comando (Clique para selecionar):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {encounter.choices.map((choice, idx) => (
                      <button
                        key={choice.id || idx}
                        type="button"
                        onClick={() => {
                          setInputText(choice.speechReply || choice.label);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="px-3 py-1.5 game-btn-tactical text-xs cursor-pointer font-sans truncate max-w-[280px] text-left"
                      >
                        ⚡ {choice.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-end gap-2.5">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isReplying || isLoadingTurn}
                    placeholder={`Fale com ${encounter.character.name}, ordene expedições, faça discursos...`}
                    className="w-full bg-[#0a0b10] border border-[#333952] focus:border-amber-400 px-3.5 py-2.5 text-sm text-[#f4f4f5] focus:outline-none font-sans resize-none placeholder:text-[#52525b]"
                  />
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isReplying || isLoadingTurn}
                    className="px-4 py-2.5 game-btn-tactical text-xs cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Conversar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectDecree}
                    disabled={isLoadingTurn || isReplying}
                    className="px-4 py-2.5 game-btn-primary text-xs cursor-pointer flex items-center justify-center gap-1 font-bold"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
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
