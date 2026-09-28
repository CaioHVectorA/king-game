import { KingdomState } from "@/types/game";
import { GameSummary, IGameRepository } from "./repository";
import path from "path";
import fs from "fs";

let BunDatabase: any = null;
try {
  if (typeof (globalThis as any).Bun !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const req = eval("require");
    BunDatabase = (globalThis as any).Bun?.Database || req("bun:sqlite")?.Database;
  }
} catch {
  BunDatabase = null;
}

export class SQLiteGameRepository implements IGameRepository {
  private db: any;
  private dbPath: string;

  constructor(customPath?: string) {
    if (!BunDatabase) {
      throw new Error("bun:sqlite não está disponível no runtime atual.");
    }

    if (customPath) {
      this.dbPath = customPath;
    } else {
      const localDataDir = path.join(process.cwd(), ".data");
      try {
        if (!fs.existsSync(localDataDir)) {
          fs.mkdirSync(localDataDir, { recursive: true });
        }
        this.dbPath = path.join(localDataDir, "kingdom.db");
      } catch {
        // Fallback para diretório temporário
        const tmpDir = path.join("/tmp", "king-game-data");
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        this.dbPath = path.join(tmpDir, "kingdom.db");
      }
    }

    this.db = new BunDatabase(this.dbPath);
    this.initSchema();
  }

  private initSchema() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        name TEXT,
        ruler_name TEXT,
        storyline_title TEXT,
        turn INTEGER,
        year INTEGER,
        month INTEGER,
        is_game_over INTEGER,
        data TEXT,
        updated_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_games_turn ON games(turn DESC);
    `);
  }

  async saveGame(state: KingdomState): Promise<void> {
    const serialized = JSON.stringify(state);
    const now = new Date().toISOString();
    const isGameOver = state.isGameOver ? 1 : 0;
    const rulerName = state.currentRuler?.name ?? "Soberano";
    const storylineTitle = state.storylineTitle ?? "Valoria";

    const stmt = this.db.prepare(`
      INSERT INTO games (id, name, ruler_name, storyline_title, turn, year, month, is_game_over, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        ruler_name = excluded.ruler_name,
        storyline_title = excluded.storyline_title,
        turn = excluded.turn,
        year = excluded.year,
        month = excluded.month,
        is_game_over = excluded.is_game_over,
        data = excluded.data,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      state.id,
      state.name,
      rulerName,
      storylineTitle,
      state.turn,
      state.year,
      state.month,
      isGameOver,
      serialized,
      now
    );
  }

  async loadGame(id: string): Promise<KingdomState | null> {
    const row = this.db.query("SELECT data FROM games WHERE id = ?").get(id) as { data: string } | null;
    if (!row || !row.data) return null;
    try {
      return JSON.parse(row.data) as KingdomState;
    } catch {
      return null;
    }
  }

  async listGames(): Promise<GameSummary[]> {
    const rows = this.db.query(`
      SELECT id, name, storyline_title, ruler_name, turn, year, month, is_game_over, updated_at
      FROM games
      ORDER BY updated_at DESC
    `).all() as Array<{
      id: string;
      name: string;
      storyline_title: string;
      ruler_name: string;
      turn: number;
      year: number;
      month: number;
      is_game_over: number;
      updated_at: string;
    }>;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      storylineTitle: r.storyline_title,
      rulerName: r.ruler_name,
      turn: r.turn,
      year: r.year,
      month: r.month,
      isGameOver: r.is_game_over === 1,
      updatedAt: r.updated_at,
    }));
  }

  async deleteGame(id: string): Promise<void> {
    this.db.query("DELETE FROM games WHERE id = ?").run(id);
  }
}
