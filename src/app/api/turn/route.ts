import { NextRequest, NextResponse } from "next/server";
import { getGameRepository } from "@/lib/db";
import { processTurn } from "@/lib/game/engine";
import { getAIProvider } from "@/lib/ai/provider";
import { TurnInput } from "@/types/game";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TurnInput;
    const { gameId, choiceId, freeTextDecision } = body;

    if (!gameId) {
      return NextResponse.json({ error: "gameId é obrigatório" }, { status: 400 });
    }

    if (!choiceId && (!freeTextDecision || freeTextDecision.trim().length === 0)) {
      return NextResponse.json(
        { error: "Você deve fornecer uma escolha pronta ou uma decisão em texto" },
        { status: 400 }
      );
    }

    const repo = getGameRepository();
    const currentState = await repo.loadGame(gameId);

    if (!currentState) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
    }

    if (currentState.isGameOver) {
      return NextResponse.json(
        { error: "Esta campanha já chegou ao fim." },
        { status: 400 }
      );
    }

    const aiProvider = getAIProvider();
    const result = await processTurn(currentState, body, aiProvider);

    // Salva o novo estado de forma autoritativa no servidor
    await repo.saveGame(result.state);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao processar turno:", error);
    return NextResponse.json(
      { error: error?.message || "Ocorreu um erro ao processar vossa ordem régia." },
      { status: 500 }
    );
  }
}
