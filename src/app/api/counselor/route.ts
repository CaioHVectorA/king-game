import { NextRequest, NextResponse } from "next/server";
import { getGameRepository } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { gameId, question } = await req.json();

    if (!gameId || !question || question.trim().length === 0) {
      return NextResponse.json({ error: "gameId e pergunta são obrigatórios" }, { status: 400 });
    }

    const repo = getGameRepository();
    const state = await repo.loadGame(gameId);

    if (!state) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
    }

    // Identifica o conselheiro principal
    const charList = Object.values(state.characters || {});
    const counselor =
      charList.find((c) => c.role.toLowerCase().includes("chanceler") || c.role.toLowerCase().includes("conselh")) ||
      charList[0] || {
        name: "Conselheiro Real",
        title: "Chanceler da Corte",
        role: "Conselheiro",
      };

    const aiProvider = getAIProvider();

    // Prompt conversacional direto para o conselheiro
    const systemPrompt = `Você é ${counselor.name}, ${counselor.title} de ${state.name}.
Você é o conselheiro oficial do novo líder/monarca ${state.currentRuler.name}.
Responda diretamente à pergunta feita pelo seu soberano antes do início oficial dos trabalhos na sala do trono.
Mantenha a resposta em 1 a 3 frases objetivas, imersivas e em português, respeitando a lore do cenário:
${state.worldLorePrompt || "Feudalismo e diplomacia."}

ESTADO ATUAL DO REINO:
- Tesouro: ${state.gold} | Celeiros: ${state.food} | População: ${state.population}
- Ordem/Estabilidade: ${state.stability}% | Poder Militar: ${state.military}%
- Antecessor: ${state.prologue?.predecessorName} (${state.prologue?.ascensionCircumstance})
- Boatos recentes: ${state.prologue?.courtWhisper}

Responda em tom direto de diálogo e conselho confidencial.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question.trim() },
        ],
        temperature: 0.3,
        max_tokens: 250,
      }),
    });

    let answer = "";
    if (res.ok) {
      const data = await res.json();
      answer = data.choices?.[0]?.message?.content || "";
    } else {
      // Fallback gracioso caso Groq esteja sem rede
      answer = `Meu soberano, os barões estão inquietos e as províncias aguardam vosso primeiro decreto. Devemos proteger os celeiros e evitar gastos imprudentes.`;
    }

    return NextResponse.json({
      counselorName: counselor.name,
      counselorTitle: counselor.title || counselor.role,
      counselorAvatar: (counselor as any).avatar || "👤",
      answer: answer.trim(),
    });
  } catch (error: any) {
    console.error("Erro na consulta com conselheiro:", error);
    return NextResponse.json(
      { error: error?.message || "O conselheiro não pôde responder no momento." },
      { status: 500 }
    );
  }
}
