import { NextRequest, NextResponse } from "next/server";
import { getGameRepository } from "@/lib/db";

export const dynamic = "force-dynamic";

const MEDIEVAL_FALLBACKS = [
  { reply: "Compreendo vossa palavra, soberano. Aguardamos vossa ordem definitiva.", gesture: "Endireita a postura e mantém o olhar firme.", isConcluding: false },
  { reply: "Como o governante determinar, assim será feito pelos nossos homens.", gesture: "Curva a cabeça solenemente, dá meia-volta e retira-se da sala.", isConcluding: true },
  { reply: "Palavras lúcidas. A corte precisa de clareza, não de hesitação.", gesture: "Recolhe os pergaminhos da mesa e aguarda o selo real.", isConcluding: false },
  { reply: "Agradeço vossa pronta audiência. Transmitirei vosso decreto sem demora.", gesture: "Faz reverência solene, vira-se e sai a passos firmes pela porta do trono.", isConcluding: true },
];

const ZOMBIE_FALLBACKS = [
  { reply: "Compreendido, Governador. Cada minuto conta para a nossa sobrevivência.", gesture: "Ajeita o colete tático e bate continência apressada.", isConcluding: false },
  { reply: "Se essa é a ordem, vou preparar o comboio e a equipe de campo agora mesmo.", gesture: "Bate continência, recolhe a prancheta de dados e vira-se para sair imediatamente pelo portão blindado.", isConcluding: true },
  { reply: "Os soldados e a viatura estão prontos. Diga a palavra e avançamos pelo perímetro.", gesture: "Olha pelo vidro do posto de comando e verifica a trava do fuzil.", isConcluding: false },
  { reply: "Excelente. Vou embarcar na cabine do caminhão dianteiro agora. Nos vemos no retorno!", gesture: "Pega a maleta hermética de amostras, acena com a cabeça e sai apressada em direção ao pátio dos veículos.", isConcluding: true },
];

const SCIFI_FALLBACKS = [
  { reply: "Diretriz compreendida, Diretor. Parâmetros operacionais atualizados.", gesture: "Digita no terminal de pulso e aguarda confirmação de rota.", isConcluding: false },
  { reply: "Entendido. As equipes de manutenção do módulo já estão em prontidão.", gesture: "Aciona a trava da escotilha, dá meia-volta e retira-se pelo corredor pressurizado.", isConcluding: true },
];

function getThemedFallback(storylineId?: string, playerInput?: string) {
  const isZombie = storylineId === "zombie_apocalypse" || storylineId === "rio_zombie";
  const isSciFi = storylineId === "colony_exodus";

  if (isZombie) {
    if (playerInput && playerInput.toLowerCase().includes("junto")) {
      return {
        reply: "Sim, com certeza! Vou com a equipe na cabine do caminhão. Só eu conheço os códigos de acesso do laboratório e posso isolar o vírus.",
        gesture: "Ajeita a alça da mochila tática, confere o estojo de amostras e vira-se para embarcar no veículo.",
        isConcluding: true,
      };
    }
    const idx = Math.floor(Math.random() * ZOMBIE_FALLBACKS.length);
    return ZOMBIE_FALLBACKS[idx];
  }

  if (isSciFi) {
    const idx = Math.floor(Math.random() * SCIFI_FALLBACKS.length);
    return SCIFI_FALLBACKS[idx];
  }

  const idx = Math.floor(Math.random() * MEDIEVAL_FALLBACKS.length);
  return MEDIEVAL_FALLBACKS[idx];
}

export async function POST(req: NextRequest) {
  let body: Record<string, any> = {};
  try { body = await req.json(); } catch { /* ignore */ }

  const { gameId, character, situation, conversationHistory, playerInput } = body;

  let ruler = { title: "Líder", name: "" };
  let worldLore = "";
  let domainName = "o assentamento";
  let storylineId: string | undefined = undefined;

  if (gameId) {
    try {
      const repo = getGameRepository();
      const state = await repo.loadGame(gameId);
      if (state) {
        ruler = state.currentRuler;
        worldLore = state.worldLorePrompt || "";
        domainName = state.name;
        storylineId = state.storylineId;
      }
    } catch { /* continua com defaults */ }
  }

  const charName = character?.name || "Peticionário";
  const charRole = character?.role || character?.title || "Enviado";
  const charAppearance = character?.appearance || "Pessoa em prontidão operacional.";

  if (!playerInput || String(playerInput).trim().length === 0) {
    const fallback = getThemedFallback(storylineId, "");
    return NextResponse.json({
      reply: fallback.reply,
      actionGesture: fallback.gesture,
      isConcluding: fallback.isConcluding,
      characterName: charName,
    });
  }

  const formattedHistory = Array.isArray(conversationHistory)
    ? conversationHistory
        .slice(-6)
        .map((m: { sender: string; text: string }) =>
          m.sender === "player" ? `${ruler.title} ${ruler.name}: ${m.text}` : `${charName}: ${m.text}`
        )
        .join("\n")
    : "";

  const isZombie = storylineId === "zombie_apocalypse" || storylineId === "rio_zombie";
  const isSciFi = storylineId === "colony_exodus";

  let styleDirective = "Tom medieval realista de audiência de corte.";
  if (isZombie) {
    styleDirective = "APOCALIPSE ZUMBI PÓS-VIRAL (The Last of Us / The Walking Dead). PROIBIDO TERMOS MEDIEVAIS (NUNCA diga majestade, corte, arauto, trono, plebeus). Use Comandante/Governador, rádio, fuzis, infectados, quarentena, comboio.";
  } else if (isSciFi) {
    styleDirective = "FICÇÃO CIENTÍFICA ESPACIAL. PROIBIDO USAR TERMOS MEDIEVAIS. Use Diretor, módulos, engenheiros, sintéticos, sensores, terminais.";
  }

  const systemPrompt = `Você é ${charName} (${charRole}), conversando diretamente com ${ruler.title} ${ruler.name} em ${domainName}.
Aparência: ${charAppearance}
Situação atual: ${situation}
${worldLore ? `Lore do Universo: ${worldLore.slice(0, 300)}` : ""}

ESTILO OBRIGATÓRIO:
${styleDirective}

Histórico da audiência:
${formattedHistory || "(A audiência acabou de começar.)"}

INSTRUÇÕES DE DINÂMICA:
1. Responda DIRETAMENTE à última fala/pergunta de ${ruler.title} ${ruler.name}.
2. SEPARE A FALA E A AÇÃO FÍSICA:
   - "reply": APENAS o que o personagem diz oralmente (sem asteriscos).
   - "actionGesture": expressão corporal, gesto ou movimento do personagem (sem asteriscos).
3. AUTO-FIM DA CONVERSA ("isConcluding"):
   - Avalie se a conversa chegou a uma conclusão natural (o jogador deu uma ordem clara, concordou com o plano, fez uma pergunta que você respondeu satisfatoriamente, ou rejeitou a proposta).
   - Se for a 2ª ou 3ª troca de conversa, ou se o jogador deu uma diretiva clara ("vou enviar", "pode ir", "autorizo", "não", "sim", "ordem de tiro"), defina "isConcluding": true.
   - Quando "isConcluding": true, "actionGesture" DEVE OBRIGATORIAMENTE descrever o personagem se virando e saindo da sala/posto (ex: "Bate continência apressada, recolhe os mapas e vira-se para sair imediatamente pela porta blindada").
   - Caso o assunto ainda exija debate urgente ou você faça uma pergunta crucial, defina "isConcluding": false.

FORMATO JSON OBRIGATÓRIO:
{
  "reply": "Texto falado em 1-3 frases em português.",
  "actionGesture": "Gesto ou ação física do personagem (se for sair, descreva virando e saindo).",
  "isConcluding": true ou false
}
Retorne APENAS o JSON puro.`;

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

  if (apiKey) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: String(playerInput).trim() },
          ],
          temperature: 0.4,
          max_tokens: 400,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      clearTimeout(tid);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          try {
            const parsed = JSON.parse(content);
            if (parsed.reply) {
              return NextResponse.json({
                reply: String(parsed.reply).trim(),
                actionGesture: parsed.actionGesture ? String(parsed.actionGesture).trim() : undefined,
                isConcluding: Boolean(parsed.isConcluding),
                characterName: charName,
              });
            }
          } catch {
            // Se falhou o parse JSON, extrai com regex
            const gestureMatch = content.match(/\*([^*]+)\*/);
            const cleanReply = content.replace(/\*[^*]+\*/g, "").replace(/^["'\s]+|["'\s]+$/g, "").trim();
            const concluding = cleanReply.length > 20 && (
              playerInput.toLowerCase().includes("enviar") ||
              playerInput.toLowerCase().includes("autoriz") ||
              playerInput.toLowerCase().includes("pode ir") ||
              playerInput.toLowerCase().includes("ordem")
            );

            return NextResponse.json({
              reply: cleanReply,
              actionGesture: gestureMatch ? gestureMatch[1].trim() : concluding ? "Dá meia-volta e retira-se da sala a passos firmes." : undefined,
              isConcluding: concluding,
              characterName: charName,
            });
          }
        }
      }
    } catch (err: any) {
      console.warn("[DialogueRoute] Falha ao consultar LLM:", err?.message || err);
    }
  }

  // Fallback temático
  const fallback = getThemedFallback(storylineId, String(playerInput));
  return NextResponse.json({
    reply: fallback.reply,
    actionGesture: fallback.gesture,
    isConcluding: fallback.isConcluding,
    characterName: charName,
  });
}
