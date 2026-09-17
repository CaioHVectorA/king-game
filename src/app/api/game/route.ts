import { NextRequest, NextResponse } from "next/server";
import { getGameRepository } from "@/lib/db";
import { createInitialKingdomState } from "@/lib/game/state";
import { selectNextEvent } from "@/lib/game/events";
import { PRNG } from "@/lib/game/rng";

export async function GET(req: NextRequest) {
  const repo = getGameRepository();
  const searchParams = req.nextUrl.searchParams;
  const gameId = searchParams.get("id");

  if (gameId) {
    const game = await repo.loadGame(gameId);
    if (!game) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
    }
    return NextResponse.json(game);
  }

  const list = await repo.listGames();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, rulerName, seed, storylineId } = body;

    const state = createInitialKingdomState({
      name: name?.trim() || "Reino de Valoria",
      rulerName: rulerName?.trim() || "Alden II",
      seed: typeof seed === "number" ? seed : undefined,
      storylineId: typeof storylineId === "string" ? storylineId : undefined,
    });

    const prng = new PRNG(state.seed);
    state.currentEvent = selectNextEvent(state, prng);

    const repo = getGameRepository();
    await repo.saveGame(state);

    return NextResponse.json(state);
  } catch (error: any) {
    console.error("Erro ao criar campanha:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao iniciar campanha" },
      { status: 500 }
    );
  }
}
