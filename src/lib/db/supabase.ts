import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { KingdomState } from "@/types/game";
import { GameSummary, IGameRepository } from "./repository";

export class SupabaseGameRepository implements IGameRepository {
  private client: SupabaseClient;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  async saveGame(state: KingdomState): Promise<void> {
    // Upsert na tabela games
    await this.client.from("games").upsert({
      id: state.id,
      name: state.name,
      seed: state.seed,
      turn: state.turn,
      year: state.year,
      month: state.month,
      is_game_over: state.isGameOver,
      game_over_reason: state.gameOverReason ?? null,
      updated_at: new Date().toISOString(),
    });

    // Upsert no documento JSONB de estado
    await this.client.from("kingdom_states").upsert({
      game_id: state.id,
      state: state,
      updated_at: new Date().toISOString(),
    });

    // Registra última entrada do histórico se houver
    if (state.history.length > 0) {
      const last = state.history[state.history.length - 1];
      await this.client.from("game_history").upsert({
        id: last.id,
        game_id: state.id,
        turn: last.turn,
        year: last.year,
        month: last.month,
        event_title: last.eventTitle,
        player_decision: last.playerDecision,
        narrative: last.narrative,
        effects_summary: last.effectsSummary,
        ruler_name: last.rulerName,
      });
    }
  }

  async loadGame(id: string): Promise<KingdomState | null> {
    const { data, error } = await this.client
      .from("kingdom_states")
      .select("state")
      .eq("game_id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data.state as KingdomState;
  }

  async listGames(): Promise<GameSummary[]> {
    const { data, error } = await this.client
      .from("games")
      .select("id, name, turn, year, month, is_game_over, updated_at")
      .order("updated_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((g: any) => ({
      id: g.id,
      name: g.name,
      turn: g.turn,
      year: g.year,
      month: g.month,
      rulerName: "Soberano",
      isGameOver: g.is_game_over,
      updatedAt: g.updated_at,
    }));
  }

  async deleteGame(id: string): Promise<void> {
    await this.client.from("games").delete().eq("id", id);
  }
}
